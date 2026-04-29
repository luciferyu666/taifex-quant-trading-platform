from __future__ import annotations

import json
import sqlite3
from datetime import datetime
from pathlib import Path
from typing import Any

from app.domain.paper_approval import (
    PaperApprovalDecisionCreate,
    PaperApprovalDecisionRecord,
    PaperApprovalHistory,
    PaperApprovalRequestCreate,
    PaperApprovalRequestRecord,
    build_approval_history,
    build_paper_approval_decision_record,
    build_paper_approval_request_record,
)


class PaperApprovalStore:
    def __init__(self, db_path: str | Path) -> None:
        self.db_path = Path(db_path)

    def initialize(self) -> None:
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        with self._connect() as connection:
            connection.executescript(
                """
                CREATE TABLE IF NOT EXISTS paper_approval_requests (
                    approval_request_id TEXT PRIMARY KEY,
                    signal_id TEXT NOT NULL,
                    strategy_id TEXT NOT NULL,
                    strategy_version TEXT NOT NULL,
                    requested_action TEXT NOT NULL,
                    requester_id TEXT NOT NULL,
                    request_reason TEXT NOT NULL,
                    created_at TEXT NOT NULL,
                    paper_only INTEGER NOT NULL,
                    approval_for_live INTEGER NOT NULL,
                    live_execution_eligible INTEGER NOT NULL,
                    broker_api_called INTEGER NOT NULL,
                    request_hash TEXT NOT NULL,
                    payload_json TEXT NOT NULL
                );

                CREATE TABLE IF NOT EXISTS paper_approval_decisions (
                    approval_decision_id TEXT PRIMARY KEY,
                    approval_request_id TEXT NOT NULL,
                    sequence INTEGER NOT NULL,
                    decision TEXT NOT NULL,
                    reviewer_id TEXT NOT NULL,
                    reviewer_role TEXT NOT NULL,
                    decision_reason TEXT NOT NULL,
                    decided_at TEXT NOT NULL,
                    paper_only INTEGER NOT NULL,
                    approval_for_live INTEGER NOT NULL,
                    broker_api_called INTEGER NOT NULL,
                    previous_chain_hash TEXT NOT NULL,
                    decision_hash TEXT NOT NULL,
                    payload_json TEXT NOT NULL,
                    UNIQUE (approval_request_id, sequence)
                );

                CREATE INDEX IF NOT EXISTS idx_paper_approval_requests_created_at
                    ON paper_approval_requests(created_at);
                CREATE INDEX IF NOT EXISTS idx_paper_approval_decisions_request
                    ON paper_approval_decisions(approval_request_id, sequence);
                CREATE INDEX IF NOT EXISTS idx_paper_approval_decisions_reviewer
                    ON paper_approval_decisions(reviewer_id);
                """
            )

    def create_request(
        self,
        request: PaperApprovalRequestCreate,
    ) -> PaperApprovalHistory:
        self.initialize()
        record = build_paper_approval_request_record(request)
        with self._connect() as connection:
            connection.execute(
                """
                INSERT INTO paper_approval_requests (
                    approval_request_id,
                    signal_id,
                    strategy_id,
                    strategy_version,
                    requested_action,
                    requester_id,
                    request_reason,
                    created_at,
                    paper_only,
                    approval_for_live,
                    live_execution_eligible,
                    broker_api_called,
                    request_hash,
                    payload_json
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    record.approval_request_id,
                    record.signal_id,
                    record.strategy_id,
                    record.strategy_version,
                    record.requested_action,
                    record.requester_id,
                    record.request_reason,
                    record.created_at.isoformat(),
                    int(record.paper_only),
                    int(record.approval_for_live),
                    int(record.live_execution_eligible),
                    int(record.broker_api_called),
                    record.request_hash,
                    json_dumps(record.payload),
                ),
            )
        return build_approval_history(record, [])

    def record_decision(
        self,
        approval_request_id: str,
        decision: PaperApprovalDecisionCreate,
    ) -> PaperApprovalHistory:
        self.initialize()
        request = self.get_request_record(approval_request_id)
        if request is None:
            raise ValueError("paper approval request not found")
        existing_decisions = self.list_decision_records(approval_request_id)
        decision_record = build_paper_approval_decision_record(
            approval_request_id=approval_request_id,
            request_hash=request.request_hash,
            existing_decisions=existing_decisions,
            decision=decision,
        )
        with self._connect() as connection:
            connection.execute(
                """
                INSERT INTO paper_approval_decisions (
                    approval_decision_id,
                    approval_request_id,
                    sequence,
                    decision,
                    reviewer_id,
                    reviewer_role,
                    decision_reason,
                    decided_at,
                    paper_only,
                    approval_for_live,
                    broker_api_called,
                    previous_chain_hash,
                    decision_hash,
                    payload_json
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    decision_record.approval_decision_id,
                    decision_record.approval_request_id,
                    decision_record.sequence,
                    decision_record.decision,
                    decision_record.reviewer_id,
                    decision_record.reviewer_role,
                    decision_record.decision_reason,
                    decision_record.decided_at.isoformat(),
                    int(decision_record.paper_only),
                    int(decision_record.approval_for_live),
                    int(decision_record.broker_api_called),
                    decision_record.previous_chain_hash,
                    decision_record.decision_hash,
                    json_dumps(decision_record.payload),
                ),
            )
        return self.get_history(approval_request_id)

    def list_queue(self, limit: int = 50) -> list[PaperApprovalHistory]:
        histories = self.list_histories(limit=limit)
        return [
            history
            for history in histories
            if history.current_status in {"pending_review", "research_approved"}
        ]

    def list_histories(self, limit: int = 50) -> list[PaperApprovalHistory]:
        if not self.db_path.exists():
            return []
        with self._connect() as connection:
            rows = connection.execute(
                """
                SELECT * FROM paper_approval_requests
                ORDER BY created_at DESC
                LIMIT ?
                """,
                (limit,),
            ).fetchall()
        return [
            build_approval_history(
                request_record_from_row(row),
                self.list_decision_records(row["approval_request_id"]),
            )
            for row in rows
        ]

    def get_history(self, approval_request_id: str) -> PaperApprovalHistory:
        request = self.get_request_record(approval_request_id)
        if request is None:
            raise ValueError("paper approval request not found")
        return build_approval_history(
            request,
            self.list_decision_records(approval_request_id),
        )

    def get_request_record(
        self,
        approval_request_id: str,
    ) -> PaperApprovalRequestRecord | None:
        if not self.db_path.exists():
            return None
        with self._connect() as connection:
            row = connection.execute(
                """
                SELECT * FROM paper_approval_requests
                WHERE approval_request_id = ?
                """,
                (approval_request_id,),
            ).fetchone()
        return request_record_from_row(row) if row else None

    def list_decision_records(
        self,
        approval_request_id: str,
    ) -> list[PaperApprovalDecisionRecord]:
        if not self.db_path.exists():
            return []
        with self._connect() as connection:
            rows = connection.execute(
                """
                SELECT * FROM paper_approval_decisions
                WHERE approval_request_id = ?
                ORDER BY sequence
                """,
                (approval_request_id,),
            ).fetchall()
        return [decision_record_from_row(row) for row in rows]

    def _connect(self) -> sqlite3.Connection:
        connection = sqlite3.connect(self.db_path)
        connection.row_factory = sqlite3.Row
        return connection


def request_record_from_row(row: sqlite3.Row) -> PaperApprovalRequestRecord:
    return PaperApprovalRequestRecord(
        approval_request_id=row["approval_request_id"],
        signal_id=row["signal_id"],
        strategy_id=row["strategy_id"],
        strategy_version=row["strategy_version"],
        requested_action=row["requested_action"],
        requester_id=row["requester_id"],
        request_reason=row["request_reason"],
        created_at=parse_datetime(row["created_at"]),
        paper_only=bool(row["paper_only"]),
        approval_for_live=bool(row["approval_for_live"]),
        live_execution_eligible=bool(row["live_execution_eligible"]),
        broker_api_called=bool(row["broker_api_called"]),
        request_hash=row["request_hash"],
        latest_chain_hash=row["request_hash"],
        payload=json_loads(row["payload_json"]),
    )


def decision_record_from_row(row: sqlite3.Row) -> PaperApprovalDecisionRecord:
    return PaperApprovalDecisionRecord(
        approval_decision_id=row["approval_decision_id"],
        approval_request_id=row["approval_request_id"],
        sequence=row["sequence"],
        decision=row["decision"],
        reviewer_id=row["reviewer_id"],
        reviewer_role=row["reviewer_role"],
        decision_reason=row["decision_reason"],
        decided_at=parse_datetime(row["decided_at"]),
        paper_only=bool(row["paper_only"]),
        approval_for_live=bool(row["approval_for_live"]),
        broker_api_called=bool(row["broker_api_called"]),
        previous_chain_hash=row["previous_chain_hash"],
        decision_hash=row["decision_hash"],
        payload=json_loads(row["payload_json"]),
    )


def parse_datetime(value: str) -> datetime:
    return datetime.fromisoformat(value)


def json_dumps(payload: Any) -> str:
    return json.dumps(payload, sort_keys=True, separators=(",", ":"))


def json_loads(payload: str) -> Any:
    return json.loads(payload)
