from __future__ import annotations

import hashlib
import json
from datetime import UTC, datetime
from typing import Any

from pydantic import BaseModel, Field

from app.domain.paper_execution_records import PaperAuditEventRecord

PAPER_AUDIT_GENESIS_HASH = "0" * 64


class PaperAuditIntegrityEventCheck(BaseModel):
    workflow_run_id: str
    audit_id: str
    sequence: int
    timestamp: datetime
    stored_previous_hash: str | None = None
    expected_previous_hash: str
    stored_event_hash: str | None = None
    expected_event_hash: str
    previous_hash_valid: bool
    event_hash_valid: bool
    workflow_continuity_valid: bool
    duplicate_audit_id: bool
    paper_only: bool
    verified: bool
    message: str


class PaperAuditIntegrityVerification(BaseModel):
    verified: bool
    workflow_run_id: str | None = None
    generated_at: datetime = Field(default_factory=lambda: datetime.now(UTC))
    db_path: str
    audit_events_count: int
    workflows_checked: int
    missing_hash_count: int
    broken_chain_count: int
    duplicate_audit_ids_count: int
    paper_only: bool = True
    live_trading_enabled: bool = False
    broker_api_called: bool = False
    local_sqlite_only: bool = True
    worm_ledger: bool = False
    immutable_audit_log: bool = False
    centralized_audit_service: bool = False
    production_audit_compliance: bool = False
    checks: list[PaperAuditIntegrityEventCheck] = Field(default_factory=list)
    warnings: list[str] = Field(default_factory=list)
    message: str


class PaperAuditIntegrityStatus(BaseModel):
    enabled: bool = True
    db_path: str
    local_sqlite_only: bool = True
    paper_only: bool = True
    live_trading_enabled: bool = False
    broker_api_called: bool = False
    worm_ledger: bool = False
    immutable_audit_log: bool = False
    centralized_audit_service: bool = False
    production_audit_compliance: bool = False
    audit_events_count: int = 0
    workflows_checked: int = 0
    latest_verification: PaperAuditIntegrityVerification | None = None
    known_gaps: list[str] = Field(default_factory=list)
    message: str


def compute_paper_audit_event_hash(
    event: PaperAuditEventRecord,
    previous_hash: str,
) -> str:
    return sha256_json(
        {
            "workflow_run_id": event.workflow_run_id,
            "audit_id": event.audit_id,
            "actor": event.actor,
            "action": event.action,
            "resource": event.resource,
            "timestamp": event.timestamp.isoformat(),
            "paper_only": event.paper_only,
            "metadata": event.metadata,
            "previous_hash": previous_hash,
        }
    )


def paper_audit_integrity_known_gaps() -> list[str]:
    return [
        "Local SQLite is not WORM storage.",
        "No centralized audit service is enabled.",
        "No external timestamping, signing, or notarization is enabled.",
        "No retention policy enforcement is enabled.",
        "No production RBAC/ABAC reviewer identity is enforced by this integrity preview.",
    ]


def sha256_json(payload: dict[str, Any]) -> str:
    encoded = json.dumps(
        payload,
        sort_keys=True,
        separators=(",", ":"),
    ).encode("utf-8")
    return hashlib.sha256(encoded).hexdigest()
