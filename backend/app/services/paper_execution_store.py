from __future__ import annotations

import json
import sqlite3
from datetime import UTC, datetime
from pathlib import Path
from typing import Any

from app.domain.order_state_machine import OrderEvent, OrderStatus
from app.domain.paper_execution import PaperExecutionWorkflowResponse
from app.domain.paper_execution_records import (
    PaperAuditEventRecord,
    PaperExecutionPersistenceStatus,
    PaperExecutionRunRecord,
    PaperOmsEventRecord,
)


class PaperExecutionStore:
    def __init__(self, db_path: str | Path) -> None:
        self.db_path = Path(db_path)

    def initialize(self) -> None:
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        with self._connect() as connection:
            connection.executescript(
                """
                CREATE TABLE IF NOT EXISTS paper_execution_runs (
                    workflow_run_id TEXT PRIMARY KEY,
                    approval_id TEXT NOT NULL,
                    approval_decision TEXT NOT NULL,
                    order_id TEXT,
                    source_signal_id TEXT,
                    strategy_id TEXT,
                    strategy_version TEXT,
                    final_oms_status TEXT,
                    paper_only INTEGER NOT NULL,
                    live_trading_enabled INTEGER NOT NULL,
                    broker_api_called INTEGER NOT NULL,
                    paper_broker_gateway_called INTEGER NOT NULL,
                    persisted_at TEXT NOT NULL,
                    payload_json TEXT NOT NULL
                );

                CREATE TABLE IF NOT EXISTS paper_oms_events (
                    workflow_run_id TEXT NOT NULL,
                    order_id TEXT NOT NULL,
                    event_id TEXT NOT NULL,
                    sequence INTEGER NOT NULL,
                    event_type TEXT NOT NULL,
                    status_after TEXT NOT NULL,
                    timestamp TEXT NOT NULL,
                    reason TEXT,
                    payload_json TEXT NOT NULL,
                    PRIMARY KEY (workflow_run_id, event_id)
                );

                CREATE TABLE IF NOT EXISTS paper_audit_events (
                    workflow_run_id TEXT NOT NULL,
                    audit_id TEXT NOT NULL,
                    actor TEXT NOT NULL,
                    action TEXT NOT NULL,
                    resource TEXT NOT NULL,
                    timestamp TEXT NOT NULL,
                    paper_only INTEGER NOT NULL,
                    metadata_json TEXT NOT NULL,
                    PRIMARY KEY (workflow_run_id, audit_id)
                );

                CREATE INDEX IF NOT EXISTS idx_paper_oms_events_order_id
                    ON paper_oms_events(order_id);
                CREATE INDEX IF NOT EXISTS idx_paper_audit_events_action
                    ON paper_audit_events(action);
                """
            )

    def persist_workflow(
        self,
        response: PaperExecutionWorkflowResponse,
    ) -> PaperExecutionRunRecord:
        self.initialize()
        persisted_at = datetime.now(UTC)
        run_record = self._run_record_from_response(response, persisted_at)
        payload_json = json_dumps(response.model_dump(mode="json"))

        with self._connect() as connection:
            connection.execute(
                """
                INSERT OR REPLACE INTO paper_execution_runs (
                    workflow_run_id,
                    approval_id,
                    approval_decision,
                    order_id,
                    source_signal_id,
                    strategy_id,
                    strategy_version,
                    final_oms_status,
                    paper_only,
                    live_trading_enabled,
                    broker_api_called,
                    paper_broker_gateway_called,
                    persisted_at,
                    payload_json
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    run_record.workflow_run_id,
                    run_record.approval_id,
                    run_record.approval_decision,
                    run_record.order_id,
                    run_record.source_signal_id,
                    run_record.strategy_id,
                    run_record.strategy_version,
                    run_record.final_oms_status,
                    int(run_record.paper_only),
                    int(run_record.live_trading_enabled),
                    int(run_record.broker_api_called),
                    int(run_record.paper_broker_gateway_called),
                    run_record.persisted_at.isoformat(),
                    payload_json,
                ),
            )
            connection.execute(
                "DELETE FROM paper_oms_events WHERE workflow_run_id = ?",
                (response.workflow_run_id,),
            )
            connection.execute(
                "DELETE FROM paper_audit_events WHERE workflow_run_id = ?",
                (response.workflow_run_id,),
            )
            for record in self._oms_event_records_from_response(response):
                connection.execute(
                    """
                    INSERT INTO paper_oms_events (
                        workflow_run_id,
                        order_id,
                        event_id,
                        sequence,
                        event_type,
                        status_after,
                        timestamp,
                        reason,
                        payload_json
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    (
                        record.workflow_run_id,
                        record.order_id,
                        record.event_id,
                        record.sequence,
                        record.event_type,
                        record.status_after,
                        record.timestamp.isoformat(),
                        record.reason,
                        json_dumps(record.payload),
                    ),
                )
            for record in self._audit_event_records_from_response(response):
                connection.execute(
                    """
                    INSERT INTO paper_audit_events (
                        workflow_run_id,
                        audit_id,
                        actor,
                        action,
                        resource,
                        timestamp,
                        paper_only,
                        metadata_json
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    (
                        record.workflow_run_id,
                        record.audit_id,
                        record.actor,
                        record.action,
                        record.resource,
                        record.timestamp.isoformat(),
                        int(record.paper_only),
                        json_dumps(record.metadata),
                    ),
                )
        return run_record

    def list_runs(self, limit: int = 50) -> list[PaperExecutionRunRecord]:
        if not self.db_path.exists():
            return []
        self.initialize()
        with self._connect() as connection:
            rows = connection.execute(
                """
                SELECT * FROM paper_execution_runs
                ORDER BY persisted_at DESC
                LIMIT ?
                """,
                (limit,),
            ).fetchall()
        return [run_record_from_row(row) for row in rows]

    def get_run(self, workflow_run_id: str) -> PaperExecutionRunRecord | None:
        if not self.db_path.exists():
            return None
        self.initialize()
        with self._connect() as connection:
            row = connection.execute(
                "SELECT * FROM paper_execution_runs WHERE workflow_run_id = ?",
                (workflow_run_id,),
            ).fetchone()
        return run_record_from_row(row) if row else None

    def list_oms_events(
        self,
        *,
        workflow_run_id: str | None = None,
        order_id: str | None = None,
    ) -> list[PaperOmsEventRecord]:
        if not self.db_path.exists():
            return []
        self.initialize()
        query = "SELECT * FROM paper_oms_events"
        params: list[str] = []
        clauses = []
        if workflow_run_id:
            clauses.append("workflow_run_id = ?")
            params.append(workflow_run_id)
        if order_id:
            clauses.append("order_id = ?")
            params.append(order_id)
        if clauses:
            query = f"{query} WHERE {' AND '.join(clauses)}"
        query = f"{query} ORDER BY workflow_run_id, sequence"

        with self._connect() as connection:
            rows = connection.execute(query, params).fetchall()
        return [oms_record_from_row(row) for row in rows]

    def list_audit_events(
        self,
        *,
        workflow_run_id: str | None = None,
        limit: int = 100,
    ) -> list[PaperAuditEventRecord]:
        if not self.db_path.exists():
            return []
        self.initialize()
        if workflow_run_id:
            query = """
                SELECT * FROM paper_audit_events
                WHERE workflow_run_id = ?
                ORDER BY timestamp, audit_id
                LIMIT ?
            """
            params: list[Any] = [workflow_run_id, limit]
        else:
            query = """
                SELECT * FROM paper_audit_events
                ORDER BY timestamp DESC, audit_id DESC
                LIMIT ?
            """
            params = [limit]
        with self._connect() as connection:
            rows = connection.execute(query, params).fetchall()
        return [audit_record_from_row(row) for row in rows]

    def status(self) -> PaperExecutionPersistenceStatus:
        if not self.db_path.exists():
            return PaperExecutionPersistenceStatus(
                enabled=True,
                db_path=str(self.db_path),
                message=(
                    "Local SQLite paper execution persistence is configured, but no "
                    "local audit database exists yet. The database is created only "
                    "when /api/paper-execution/workflow/record is called."
                ),
            )
        self.initialize()
        with self._connect() as connection:
            runs_count = count_table(connection, "paper_execution_runs")
            oms_events_count = count_table(connection, "paper_oms_events")
            audit_events_count = count_table(connection, "paper_audit_events")
        return PaperExecutionPersistenceStatus(
            enabled=True,
            db_path=str(self.db_path),
            runs_count=runs_count,
            oms_events_count=oms_events_count,
            audit_events_count=audit_events_count,
            message=(
                "Local SQLite paper execution persistence is enabled for paper-only "
                "workflow records. No real broker API is called."
            ),
        )

    def _connect(self) -> sqlite3.Connection:
        connection = sqlite3.connect(self.db_path)
        connection.row_factory = sqlite3.Row
        return connection

    def _run_record_from_response(
        self,
        response: PaperExecutionWorkflowResponse,
        persisted_at: datetime,
    ) -> PaperExecutionRunRecord:
        intent = response.paper_order_intent
        return PaperExecutionRunRecord(
            workflow_run_id=response.workflow_run_id,
            approval_id=response.approval.approval_id,
            approval_decision=response.approval.decision,
            order_id=intent.order_id if intent else None,
            source_signal_id=intent.source_signal_id if intent else None,
            strategy_id=intent.strategy_id if intent else None,
            strategy_version=intent.strategy_version if intent else None,
            final_oms_status=str(response.oms_state.status) if response.oms_state else None,
            paper_only=response.paper_only,
            live_trading_enabled=response.live_trading_enabled,
            broker_api_called=response.broker_api_called,
            paper_broker_gateway_called=response.paper_broker_gateway_called,
            persisted_at=persisted_at,
        )

    def _oms_event_records_from_response(
        self,
        response: PaperExecutionWorkflowResponse,
    ) -> list[PaperOmsEventRecord]:
        if not response.oms_state:
            return []
        status_after = OrderStatus.PENDING
        records = []
        for index, event in enumerate(response.oms_state.history, start=1):
            status_after = status_after_for_event(status_after, event)
            records.append(
                PaperOmsEventRecord(
                    workflow_run_id=response.workflow_run_id,
                    order_id=event.order_id,
                    event_id=event.event_id,
                    sequence=index,
                    event_type=event.event_type,
                    status_after=str(status_after),
                    timestamp=event.timestamp,
                    reason=event.reason,
                    payload=event.payload,
                )
            )
        return records

    def _audit_event_records_from_response(
        self,
        response: PaperExecutionWorkflowResponse,
    ) -> list[PaperAuditEventRecord]:
        return [
            PaperAuditEventRecord(
                workflow_run_id=response.workflow_run_id,
                audit_id=event.audit_id,
                actor=event.actor,
                action=event.action,
                resource=event.resource,
                timestamp=event.timestamp,
                paper_only=event.paper_only,
                metadata=event.metadata,
            )
            for event in response.audit_events
        ]


def status_after_for_event(current_status: OrderStatus, event: OrderEvent) -> OrderStatus:
    from app.domain.order_state_machine import EVENT_TARGET_STATUS, OrderEventType

    if event.event_type == OrderEventType.MARK_UNKNOWN:
        return OrderStatus.UNKNOWN_NEEDS_RECONCILIATION
    return EVENT_TARGET_STATUS[event.event_type]


def count_table(connection: sqlite3.Connection, table: str) -> int:
    return int(connection.execute(f"SELECT COUNT(*) FROM {table}").fetchone()[0])


def run_record_from_row(row: sqlite3.Row) -> PaperExecutionRunRecord:
    return PaperExecutionRunRecord(
        workflow_run_id=row["workflow_run_id"],
        approval_id=row["approval_id"],
        approval_decision=row["approval_decision"],
        order_id=row["order_id"],
        source_signal_id=row["source_signal_id"],
        strategy_id=row["strategy_id"],
        strategy_version=row["strategy_version"],
        final_oms_status=row["final_oms_status"],
        paper_only=bool(row["paper_only"]),
        live_trading_enabled=bool(row["live_trading_enabled"]),
        broker_api_called=bool(row["broker_api_called"]),
        paper_broker_gateway_called=bool(row["paper_broker_gateway_called"]),
        persisted_at=datetime.fromisoformat(row["persisted_at"]),
    )


def oms_record_from_row(row: sqlite3.Row) -> PaperOmsEventRecord:
    return PaperOmsEventRecord(
        workflow_run_id=row["workflow_run_id"],
        order_id=row["order_id"],
        event_id=row["event_id"],
        sequence=int(row["sequence"]),
        event_type=row["event_type"],
        status_after=row["status_after"],
        timestamp=datetime.fromisoformat(row["timestamp"]),
        reason=row["reason"],
        payload=json.loads(row["payload_json"]),
    )


def audit_record_from_row(row: sqlite3.Row) -> PaperAuditEventRecord:
    return PaperAuditEventRecord(
        workflow_run_id=row["workflow_run_id"],
        audit_id=row["audit_id"],
        actor=row["actor"],
        action=row["action"],
        resource=row["resource"],
        timestamp=datetime.fromisoformat(row["timestamp"]),
        paper_only=bool(row["paper_only"]),
        metadata=json.loads(row["metadata_json"]),
    )


def json_dumps(payload: Any) -> str:
    return json.dumps(payload, sort_keys=True, separators=(",", ":"))
