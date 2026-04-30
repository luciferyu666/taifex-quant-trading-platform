from __future__ import annotations

import sqlite3
from collections import Counter, defaultdict
from datetime import datetime
from pathlib import Path
from typing import Any

from app.domain.audit_integrity import (
    PAPER_AUDIT_GENESIS_HASH,
    PaperAuditIntegrityEventCheck,
    PaperAuditIntegrityStatus,
    PaperAuditIntegrityVerification,
    compute_paper_audit_event_hash,
    paper_audit_integrity_known_gaps,
)
from app.domain.paper_execution_records import PaperAuditEventRecord


class PaperAuditIntegrityService:
    def __init__(self, db_path: str | Path) -> None:
        self.db_path = Path(db_path)

    def status(self) -> PaperAuditIntegrityStatus:
        if not self.db_path.exists():
            return PaperAuditIntegrityStatus(
                db_path=str(self.db_path),
                known_gaps=paper_audit_integrity_known_gaps(),
                message=(
                    "Paper audit integrity verification is configured, but no local "
                    "SQLite paper audit database exists yet."
                ),
            )

        verification = self.verify()
        return PaperAuditIntegrityStatus(
            db_path=str(self.db_path),
            audit_events_count=verification.audit_events_count,
            workflows_checked=verification.workflows_checked,
            latest_verification=verification,
            known_gaps=paper_audit_integrity_known_gaps(),
            message=(
                "Paper audit integrity preview verified local SQLite hash-chain "
                "metadata. This is not WORM storage or production audit compliance."
                if verification.verified
                else "Paper audit integrity preview found local hash-chain issues."
            ),
        )

    def verify(self, workflow_run_id: str | None = None) -> PaperAuditIntegrityVerification:
        if not self.db_path.exists():
            return PaperAuditIntegrityVerification(
                verified=True,
                workflow_run_id=workflow_run_id,
                db_path=str(self.db_path),
                audit_events_count=0,
                workflows_checked=0,
                missing_hash_count=0,
                broken_chain_count=0,
                duplicate_audit_ids_count=0,
                warnings=[
                    "No local SQLite paper audit database exists yet.",
                    "This is a paper-only integrity preview, not a production WORM ledger.",
                ],
                message="No local paper audit events are available to verify.",
            )

        rows = self._select_audit_event_rows(workflow_run_id)
        records = [audit_record_from_mapping(row) for row in rows]
        checks = build_integrity_checks(records, workflow_run_id=workflow_run_id)
        missing_hash_count = sum(
            1
            for check in checks
            if check.stored_previous_hash is None or check.stored_event_hash is None
        )
        broken_chain_count = sum(1 for check in checks if not check.verified)
        duplicate_audit_ids_count = sum(1 for check in checks if check.duplicate_audit_id)
        workflows_checked = len({record.workflow_run_id for record in records})
        verified = broken_chain_count == 0
        warnings = [
            "Paper audit integrity preview uses local SQLite hash metadata only.",
            (
                "This is not WORM storage, external signing, centralized audit, "
                "or production compliance."
            ),
        ]
        if missing_hash_count:
            warnings.append(
                "Some audit events are legacy rows without stored hash-chain metadata."
            )
        if duplicate_audit_ids_count:
            warnings.append("Duplicate audit_id values were detected in the selected scope.")
        if workflow_run_id and not records:
            warnings.append("No audit events were found for the requested workflow_run_id.")

        return PaperAuditIntegrityVerification(
            verified=verified,
            workflow_run_id=workflow_run_id,
            db_path=str(self.db_path),
            audit_events_count=len(records),
            workflows_checked=workflows_checked,
            missing_hash_count=missing_hash_count,
            broken_chain_count=broken_chain_count,
            duplicate_audit_ids_count=duplicate_audit_ids_count,
            checks=checks,
            warnings=warnings,
            message=(
                "Paper audit hash-chain verification passed for local SQLite records."
                if verified
                else "Paper audit hash-chain verification found local integrity issues."
            ),
        )

    def _select_audit_event_rows(
        self,
        workflow_run_id: str | None,
    ) -> list[dict[str, Any]]:
        with sqlite3.connect(f"file:{self.db_path}?mode=ro", uri=True) as connection:
            connection.row_factory = sqlite3.Row
            columns = {
                row["name"]
                for row in connection.execute(
                    "PRAGMA table_info(paper_audit_events)"
                ).fetchall()
            }
            if not columns:
                return []
            previous_hash_select = (
                "previous_hash" if "previous_hash" in columns else "NULL AS previous_hash"
            )
            event_hash_select = (
                "event_hash" if "event_hash" in columns else "NULL AS event_hash"
            )
            if workflow_run_id:
                rows = connection.execute(
                    f"""
                    SELECT
                        workflow_run_id,
                        audit_id,
                        actor,
                        action,
                        resource,
                        timestamp,
                        paper_only,
                        metadata_json,
                        {previous_hash_select},
                        {event_hash_select}
                    FROM paper_audit_events
                    WHERE workflow_run_id = ?
                    ORDER BY workflow_run_id, timestamp, audit_id
                    """,
                    (workflow_run_id,),
                ).fetchall()
            else:
                rows = connection.execute(
                    f"""
                    SELECT
                        workflow_run_id,
                        audit_id,
                        actor,
                        action,
                        resource,
                        timestamp,
                        paper_only,
                        metadata_json,
                        {previous_hash_select},
                        {event_hash_select}
                    FROM paper_audit_events
                    ORDER BY workflow_run_id, timestamp, audit_id
                    """
                ).fetchall()
        return [dict(row) for row in rows]


def build_integrity_checks(
    records: list[PaperAuditEventRecord],
    *,
    workflow_run_id: str | None = None,
) -> list[PaperAuditIntegrityEventCheck]:
    audit_id_counts = Counter(record.audit_id for record in records)
    records_by_workflow: dict[str, list[PaperAuditEventRecord]] = defaultdict(list)
    for record in records:
        records_by_workflow[record.workflow_run_id].append(record)

    checks: list[PaperAuditIntegrityEventCheck] = []
    for _record_workflow_id, workflow_records in sorted(records_by_workflow.items()):
        previous_hash = PAPER_AUDIT_GENESIS_HASH
        for sequence, record in enumerate(workflow_records, start=1):
            expected_event_hash = compute_paper_audit_event_hash(record, previous_hash)
            previous_hash_valid = record.previous_hash == previous_hash
            event_hash_valid = record.event_hash == expected_event_hash
            workflow_continuity_valid = (
                workflow_run_id is None or record.workflow_run_id == workflow_run_id
            )
            duplicate_audit_id = audit_id_counts[record.audit_id] > 1
            verified = (
                previous_hash_valid
                and event_hash_valid
                and workflow_continuity_valid
                and not duplicate_audit_id
                and record.paper_only
            )
            checks.append(
                PaperAuditIntegrityEventCheck(
                    workflow_run_id=record.workflow_run_id,
                    audit_id=record.audit_id,
                    sequence=sequence,
                    timestamp=record.timestamp,
                    stored_previous_hash=record.previous_hash,
                    expected_previous_hash=previous_hash,
                    stored_event_hash=record.event_hash,
                    expected_event_hash=expected_event_hash,
                    previous_hash_valid=previous_hash_valid,
                    event_hash_valid=event_hash_valid,
                    workflow_continuity_valid=workflow_continuity_valid,
                    duplicate_audit_id=duplicate_audit_id,
                    paper_only=record.paper_only,
                    verified=verified,
                    message=(
                        "Audit event hash-chain check passed."
                        if verified
                        else "Audit event hash-chain check failed."
                    ),
                )
            )
            previous_hash = record.event_hash or expected_event_hash
    return checks


def audit_record_from_mapping(row: dict[str, Any]) -> PaperAuditEventRecord:
    import json

    return PaperAuditEventRecord(
        workflow_run_id=str(row["workflow_run_id"]),
        audit_id=str(row["audit_id"]),
        actor=str(row["actor"]),
        action=str(row["action"]),
        resource=str(row["resource"]),
        timestamp=datetime.fromisoformat(str(row["timestamp"])),
        paper_only=bool(row["paper_only"]),
        metadata=json.loads(str(row["metadata_json"])),
        previous_hash=row.get("previous_hash"),
        event_hash=row.get("event_hash"),
    )
