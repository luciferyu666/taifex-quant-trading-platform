from __future__ import annotations

from pydantic import BaseModel, Field

from app.core.config import Settings
from app.domain.hosted_paper_readiness import HostedPaperSafetyDefaults


class PaperAuditWormStorageStatus(BaseModel):
    local_sqlite_audit_enabled: bool = True
    local_hash_chain_enabled: bool = True
    worm_storage_enabled: bool = False
    immutable_ledger_enabled: bool = False
    append_only_enforced_by_storage: bool = False
    centralized_audit_service_enabled: bool = False
    object_lock_enabled: bool = False
    external_timestamping_enabled: bool = False
    cryptographic_signing_enabled: bool = False
    retention_policy_enforced: bool = False
    legal_hold_enabled: bool = False
    audit_export_reviewed: bool = False
    production_audit_compliance: bool = False


class PaperAuditWormSafetyFlags(BaseModel):
    paper_only: bool
    read_only: bool = True
    live_trading_enabled: bool
    broker_provider: str
    broker_api_called: bool = False
    order_created: bool = False
    credentials_collected: bool = False
    database_written: bool = False
    external_db_written: bool = False
    worm_compliance_claim: bool = False
    production_audit_compliance: bool = False
    production_trading_ready: bool = False


class PaperAuditWormReadinessResponse(BaseModel):
    service: str = "paper-audit-worm-readiness"
    readiness_state: str = "local_sqlite_not_production_worm_ledger"
    summary: str
    storage: PaperAuditWormStorageStatus = Field(
        default_factory=PaperAuditWormStorageStatus
    )
    safety_defaults: HostedPaperSafetyDefaults
    safety_flags: PaperAuditWormSafetyFlags
    current_scope: list[str]
    missing_for_production_worm: list[str]
    required_before_worm_claim: list[str]
    docs: dict[str, str]
    warnings: list[str]


CURRENT_SCOPE = [
    "Local SQLite paper audit records for demos and engineering review.",
    "Local hash-chain metadata for paper audit integrity preview.",
    "Read-only API and Web Command Center surfaces for local audit posture.",
    "Local JSON evidence export for paper-only audit verification.",
]


MISSING_FOR_PRODUCTION_WORM = [
    "Storage-level WORM controls such as object lock or append-only ledger storage.",
    "Centralized audit service with controlled ingestion and review workflows.",
    "Cryptographic signing and external timestamping for audit records.",
    "Retention policy enforcement, legal hold, and deletion controls.",
    "Production RBAC/ABAC around audit access, export, and administrative actions.",
    "Operational monitoring, incident response, and audit service recovery runbooks.",
    "Independent security, legal, and compliance review before WORM claims.",
]


REQUIRED_BEFORE_WORM_CLAIM = [
    "Select a reviewed WORM-capable storage architecture.",
    "Define immutable audit schemas, retention periods, and legal hold rules.",
    "Implement append-only ingestion with immutable sequence guarantees.",
    "Add cryptographic signing, external timestamping, and key-management review.",
    "Add tenant-scoped audit access controls and reviewer identity enforcement.",
    "Create audited export workflows and operational review procedures.",
    "Complete security, legal, compliance, and disaster-recovery review.",
]


def get_paper_audit_worm_readiness(
    settings: Settings,
) -> PaperAuditWormReadinessResponse:
    paper_only = (
        settings.trading_mode == "paper"
        and settings.broker_provider == "paper"
        and not settings.live_trading_enabled
    )
    return PaperAuditWormReadinessResponse(
        summary=(
            "The current audit persistence is local SQLite with paper-only "
            "hash-chain metadata. It is useful for demos and tamper-evidence "
            "preview, but it is not a production WORM or immutable audit ledger."
        ),
        safety_defaults=HostedPaperSafetyDefaults(
            trading_mode=settings.trading_mode,
            enable_live_trading=settings.enable_live_trading,
            broker_provider=settings.broker_provider,
        ),
        safety_flags=PaperAuditWormSafetyFlags(
            paper_only=paper_only,
            live_trading_enabled=settings.live_trading_enabled,
            broker_provider=settings.broker_provider,
        ),
        current_scope=CURRENT_SCOPE,
        missing_for_production_worm=MISSING_FOR_PRODUCTION_WORM,
        required_before_worm_claim=REQUIRED_BEFORE_WORM_CLAIM,
        docs={
            "paper_audit_integrity_preview": "docs/paper-audit-integrity-preview.md",
            "paper_audit_worm_readiness": "docs/paper-audit-worm-readiness.md",
            "paper_shadow_live_boundary": "docs/paper-shadow-live-boundary.md",
            "security_vault_asvs": "docs/security-vault-asvs.md",
        },
        warnings=[
            "This endpoint is read-only WORM readiness metadata only.",
            "Local SQLite audit persistence is not production WORM storage.",
            (
                "Local hash-chain verification is not immutable ledger "
                "compliance, external signing, or regulated audit certification."
            ),
            (
                "It does not write databases, create orders, call brokers, "
                "collect credentials, or enable live trading."
            ),
            "Production Trading Platform remains NOT READY.",
        ],
    )
