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
from app.domain.paper_oms_reliability import (
    PaperDuplicateOrderCheck,
    PaperExecutionReport,
    PaperOmsOutboxItem,
    PaperOmsReliabilityStatus,
    PaperOrderTimeoutCandidate,
    build_execution_reports,
    build_outbox_item,
    is_terminal_status,
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

                CREATE TABLE IF NOT EXISTS paper_order_idempotency (
                    idempotency_key TEXT PRIMARY KEY,
                    workflow_run_id TEXT NOT NULL,
                    order_id TEXT NOT NULL,
                    source_signal_id TEXT,
                    created_at TEXT NOT NULL,
                    paper_only INTEGER NOT NULL,
                    live_trading_enabled INTEGER NOT NULL,
                    broker_api_called INTEGER NOT NULL
                );

                CREATE TABLE IF NOT EXISTS paper_execution_reports (
                    workflow_run_id TEXT NOT NULL,
                    order_id TEXT NOT NULL,
                    report_id TEXT NOT NULL,
                    idempotency_key TEXT NOT NULL,
                    execution_type TEXT NOT NULL,
                    order_status TEXT NOT NULL,
                    last_quantity INTEGER NOT NULL,
                    cumulative_filled_quantity INTEGER NOT NULL,
                    leaves_quantity INTEGER NOT NULL,
                    average_fill_price REAL,
                    event_id TEXT NOT NULL,
                    timestamp TEXT NOT NULL,
                    paper_only INTEGER NOT NULL,
                    live_trading_enabled INTEGER NOT NULL,
                    broker_api_called INTEGER NOT NULL,
                    payload_json TEXT NOT NULL,
                    PRIMARY KEY (workflow_run_id, report_id)
                );

                CREATE TABLE IF NOT EXISTS paper_oms_outbox (
                    outbox_id TEXT PRIMARY KEY,
                    workflow_run_id TEXT NOT NULL,
                    order_id TEXT NOT NULL,
                    idempotency_key TEXT NOT NULL,
                    action TEXT NOT NULL,
                    status TEXT NOT NULL,
                    attempts INTEGER NOT NULL,
                    created_at TEXT NOT NULL,
                    available_at TEXT NOT NULL,
                    processed_at TEXT,
                    paper_only INTEGER NOT NULL,
                    live_trading_enabled INTEGER NOT NULL,
                    broker_api_called INTEGER NOT NULL,
                    payload_json TEXT NOT NULL
                );

                CREATE INDEX IF NOT EXISTS idx_paper_execution_reports_order_id
                    ON paper_execution_reports(order_id);
                CREATE INDEX IF NOT EXISTS idx_paper_oms_outbox_status
                    ON paper_oms_outbox(status);
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
            self._record_idempotency_key(connection, response, persisted_at)
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
            connection.execute(
                "DELETE FROM paper_execution_reports WHERE workflow_run_id = ?",
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
            for report in self._execution_reports_from_response(response):
                connection.execute(
                    """
                    INSERT INTO paper_execution_reports (
                        workflow_run_id,
                        order_id,
                        report_id,
                        idempotency_key,
                        execution_type,
                        order_status,
                        last_quantity,
                        cumulative_filled_quantity,
                        leaves_quantity,
                        average_fill_price,
                        event_id,
                        timestamp,
                        paper_only,
                        live_trading_enabled,
                        broker_api_called,
                        payload_json
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    (
                        report.workflow_run_id,
                        report.order_id,
                        report.report_id,
                        report.idempotency_key,
                        report.execution_type,
                        report.order_status,
                        report.last_quantity,
                        report.cumulative_filled_quantity,
                        report.leaves_quantity,
                        report.average_fill_price,
                        report.event_id,
                        report.timestamp.isoformat(),
                        int(report.paper_only),
                        int(report.live_trading_enabled),
                        int(report.broker_api_called),
                        json_dumps(report.payload),
                    ),
                )
            outbox_item = self._outbox_item_from_response(response)
            if outbox_item is not None:
                connection.execute(
                    """
                    INSERT OR REPLACE INTO paper_oms_outbox (
                        outbox_id,
                        workflow_run_id,
                        order_id,
                        idempotency_key,
                        action,
                        status,
                        attempts,
                        created_at,
                        available_at,
                        processed_at,
                        paper_only,
                        live_trading_enabled,
                        broker_api_called,
                        payload_json
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    (
                        outbox_item.outbox_id,
                        outbox_item.workflow_run_id,
                        outbox_item.order_id,
                        outbox_item.idempotency_key,
                        outbox_item.action,
                        outbox_item.status,
                        outbox_item.attempts,
                        outbox_item.created_at.isoformat(),
                        outbox_item.available_at.isoformat(),
                        (
                            outbox_item.processed_at.isoformat()
                            if outbox_item.processed_at
                            else None
                        ),
                        int(outbox_item.paper_only),
                        int(outbox_item.live_trading_enabled),
                        int(outbox_item.broker_api_called),
                        json_dumps(outbox_item.payload),
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

    def list_execution_reports(
        self,
        *,
        workflow_run_id: str | None = None,
        order_id: str | None = None,
    ) -> list[PaperExecutionReport]:
        if not self.db_path.exists():
            return []
        self.initialize()
        query = "SELECT * FROM paper_execution_reports"
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
        query = f"{query} ORDER BY workflow_run_id, timestamp, report_id"
        with self._connect() as connection:
            rows = connection.execute(query, params).fetchall()
        return [execution_report_from_row(row) for row in rows]

    def list_outbox_items(
        self,
        *,
        status: str | None = None,
        limit: int = 100,
    ) -> list[PaperOmsOutboxItem]:
        if not self.db_path.exists():
            return []
        self.initialize()
        if status:
            query = """
                SELECT * FROM paper_oms_outbox
                WHERE status = ?
                ORDER BY created_at DESC, outbox_id DESC
                LIMIT ?
            """
            params: list[Any] = [status, limit]
        else:
            query = """
                SELECT * FROM paper_oms_outbox
                ORDER BY created_at DESC, outbox_id DESC
                LIMIT ?
            """
            params = [limit]
        with self._connect() as connection:
            rows = connection.execute(query, params).fetchall()
        return [outbox_item_from_row(row) for row in rows]

    def check_duplicate_order(
        self,
        *,
        idempotency_key: str,
        workflow_run_id: str | None = None,
        order_id: str | None = None,
    ) -> PaperDuplicateOrderCheck:
        if not self.db_path.exists():
            return PaperDuplicateOrderCheck(
                idempotency_key=idempotency_key,
                duplicate=False,
                requested_workflow_run_id=workflow_run_id,
                requested_order_id=order_id,
                message="No local paper OMS audit database exists yet.",
            )
        self.initialize()
        with self._connect() as connection:
            row = connection.execute(
                """
                SELECT workflow_run_id, order_id
                FROM paper_order_idempotency
                WHERE idempotency_key = ?
                """,
                (idempotency_key,),
            ).fetchone()
        return PaperDuplicateOrderCheck(
            idempotency_key=idempotency_key,
            duplicate=row is not None,
            existing_workflow_run_id=row["workflow_run_id"] if row else None,
            existing_order_id=row["order_id"] if row else None,
            requested_workflow_run_id=workflow_run_id,
            requested_order_id=order_id,
            message=(
                "Duplicate paper order idempotency key found in local SQLite."
                if row
                else "No duplicate paper order idempotency key found."
            ),
        )

    def list_timeout_candidates(
        self,
        *,
        timeout_seconds: int = 30,
        now: datetime | None = None,
    ) -> list[PaperOrderTimeoutCandidate]:
        if not self.db_path.exists():
            return []
        self.initialize()
        now = now or datetime.now(UTC)
        with self._connect() as connection:
            rows = connection.execute(
                """
                SELECT workflow_run_id, order_id, final_oms_status, persisted_at
                FROM paper_execution_runs
                WHERE order_id IS NOT NULL
                ORDER BY persisted_at ASC
                """
            ).fetchall()

        candidates: list[PaperOrderTimeoutCandidate] = []
        for row in rows:
            final_status = row["final_oms_status"]
            if is_terminal_status(final_status):
                continue
            persisted_at = datetime.fromisoformat(row["persisted_at"])
            age_seconds = max(0.0, (now - persisted_at).total_seconds())
            if age_seconds < timeout_seconds:
                continue
            candidates.append(
                PaperOrderTimeoutCandidate(
                    workflow_run_id=row["workflow_run_id"],
                    order_id=row["order_id"],
                    final_oms_status=final_status,
                    persisted_at=persisted_at,
                    age_seconds=age_seconds,
                    timeout_seconds=timeout_seconds,
                    message=(
                        "Paper-only timeout candidate. This read path does not mutate "
                        "OMS state or contact brokers."
                    ),
                )
            )
        return candidates

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
            execution_reports_count = count_table(connection, "paper_execution_reports")
            outbox_items_count = count_table(connection, "paper_oms_outbox")
            idempotency_keys_count = count_table(connection, "paper_order_idempotency")
        return PaperExecutionPersistenceStatus(
            enabled=True,
            db_path=str(self.db_path),
            runs_count=runs_count,
            oms_events_count=oms_events_count,
            audit_events_count=audit_events_count,
            execution_reports_count=execution_reports_count,
            outbox_items_count=outbox_items_count,
            idempotency_keys_count=idempotency_keys_count,
            production_oms_ready=False,
            message=(
                "Local SQLite paper execution persistence is enabled for paper-only "
                "workflow records. No real broker API is called."
            ),
        )

    def reliability_status(self) -> PaperOmsReliabilityStatus:
        if not self.db_path.exists():
            return PaperOmsReliabilityStatus(
                message=(
                    "Paper OMS reliability metadata is configured, but no local "
                    "SQLite audit database exists yet."
                ),
                known_gaps=paper_oms_known_gaps(),
            )
        self.initialize()
        timeout_candidates = self.list_timeout_candidates()
        with self._connect() as connection:
            outbox_items_count = count_table(connection, "paper_oms_outbox")
            idempotency_keys_count = count_table(connection, "paper_order_idempotency")
            execution_reports_count = count_table(connection, "paper_execution_reports")
        return PaperOmsReliabilityStatus(
            outbox_items_count=outbox_items_count,
            idempotency_keys_count=idempotency_keys_count,
            execution_reports_count=execution_reports_count,
            timeout_candidates_count=len(timeout_candidates),
            known_gaps=paper_oms_known_gaps(),
            message=(
                "Paper OMS reliability foundation is local SQLite only. It records "
                "idempotency keys, completed outbox metadata, execution reports, and "
                "timeout candidates for paper simulation review. It is not a "
                "production OMS."
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

    def _execution_reports_from_response(
        self,
        response: PaperExecutionWorkflowResponse,
    ) -> list[PaperExecutionReport]:
        if response.execution_reports:
            return response.execution_reports
        if not response.oms_state:
            return []
        return build_execution_reports(
            workflow_run_id=response.workflow_run_id,
            order_state=response.oms_state,
        )

    def _outbox_item_from_response(
        self,
        response: PaperExecutionWorkflowResponse,
    ) -> PaperOmsOutboxItem | None:
        intent = response.paper_order_intent
        if intent is None:
            return None
        return build_outbox_item(
            workflow_run_id=response.workflow_run_id,
            order_id=intent.order_id,
            idempotency_key=intent.idempotency_key,
            payload={
                "source_signal_id": intent.source_signal_id,
                "strategy_id": intent.strategy_id,
                "strategy_version": intent.strategy_version,
                "approval_id": intent.approval_id,
                "paper_only": True,
                "live_trading_enabled": False,
                "broker_api_called": False,
                "note": (
                    "Completed local outbox metadata only. No asynchronous broker "
                    "worker is enabled."
                ),
            },
        )

    def _record_idempotency_key(
        self,
        connection: sqlite3.Connection,
        response: PaperExecutionWorkflowResponse,
        persisted_at: datetime,
    ) -> None:
        intent = response.paper_order_intent
        if intent is None:
            return
        existing = connection.execute(
            """
            SELECT workflow_run_id, order_id
            FROM paper_order_idempotency
            WHERE idempotency_key = ?
            """,
            (intent.idempotency_key,),
        ).fetchone()
        if existing and (
            existing["workflow_run_id"] != response.workflow_run_id
            or existing["order_id"] != intent.order_id
        ):
            raise ValueError(
                "Duplicate paper order idempotency_key across workflow sessions"
            )
        connection.execute(
            """
            INSERT OR IGNORE INTO paper_order_idempotency (
                idempotency_key,
                workflow_run_id,
                order_id,
                source_signal_id,
                created_at,
                paper_only,
                live_trading_enabled,
                broker_api_called
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                intent.idempotency_key,
                response.workflow_run_id,
                intent.order_id,
                intent.source_signal_id,
                persisted_at.isoformat(),
                1,
                0,
                0,
            ),
        )


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


def execution_report_from_row(row: sqlite3.Row) -> PaperExecutionReport:
    return PaperExecutionReport(
        workflow_run_id=row["workflow_run_id"],
        order_id=row["order_id"],
        report_id=row["report_id"],
        idempotency_key=row["idempotency_key"],
        execution_type=row["execution_type"],
        order_status=row["order_status"],
        last_quantity=int(row["last_quantity"]),
        cumulative_filled_quantity=int(row["cumulative_filled_quantity"]),
        leaves_quantity=int(row["leaves_quantity"]),
        average_fill_price=row["average_fill_price"],
        event_id=row["event_id"],
        timestamp=datetime.fromisoformat(row["timestamp"]),
        paper_only=bool(row["paper_only"]),
        live_trading_enabled=bool(row["live_trading_enabled"]),
        broker_api_called=bool(row["broker_api_called"]),
        payload=json.loads(row["payload_json"]),
    )


def outbox_item_from_row(row: sqlite3.Row) -> PaperOmsOutboxItem:
    processed_at = row["processed_at"]
    return PaperOmsOutboxItem(
        outbox_id=row["outbox_id"],
        workflow_run_id=row["workflow_run_id"],
        order_id=row["order_id"],
        idempotency_key=row["idempotency_key"],
        action=row["action"],
        status=row["status"],
        attempts=int(row["attempts"]),
        created_at=datetime.fromisoformat(row["created_at"]),
        available_at=datetime.fromisoformat(row["available_at"]),
        processed_at=datetime.fromisoformat(processed_at) if processed_at else None,
        paper_only=bool(row["paper_only"]),
        live_trading_enabled=bool(row["live_trading_enabled"]),
        broker_api_called=bool(row["broker_api_called"]),
        payload=json.loads(row["payload_json"]),
    )


def paper_oms_known_gaps() -> list[str]:
    return [
        "No asynchronous order worker is enabled.",
        "Local outbox metadata is not a distributed durable queue.",
        "Amend/replace is not implemented.",
        "Reconciliation loop is not implemented.",
        "SQLite hash/audit records are not a production WORM ledger.",
        "Real broker execution reports are not ingested.",
    ]


def json_dumps(payload: Any) -> str:
    return json.dumps(payload, sort_keys=True, separators=(",", ":"))
