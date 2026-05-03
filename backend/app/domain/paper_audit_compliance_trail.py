from __future__ import annotations

from pydantic import BaseModel, Field

from app.core.config import Settings
from app.domain.hosted_paper_readiness import HostedPaperSafetyDefaults


class PaperAuditComplianceTrailCapabilities(BaseModel):
    local_sqlite_audit_enabled: bool = True
    local_hash_chain_preview_enabled: bool = True
    append_only_audit_service_enabled: bool = False
    immutable_audit_log_enabled: bool = False
    worm_storage_enabled: bool = False
    reviewer_identity_enforced: bool = False
    rbac_abac_enforced: bool = False
    decision_history_immutable: bool = False
    retention_policy_enforced: bool = False
    legal_hold_enabled: bool = False
    export_policy_enforced: bool = False
    export_approval_workflow_enabled: bool = False
    tenant_scoped_audit_access_enabled: bool = False
    audit_access_monitoring_enabled: bool = False
    production_compliance_trail_ready: bool = False


class PaperAuditComplianceTrailSafetyFlags(BaseModel):
    paper_only: bool
    read_only: bool = True
    live_trading_enabled: bool
    broker_provider: str
    broker_api_called: bool = False
    order_created: bool = False
    credentials_collected: bool = False
    auth_provider_enabled: bool = False
    reviewer_login_created: bool = False
    database_written: bool = False
    external_db_written: bool = False
    append_only_audit_service_enabled: bool = False
    immutable_log_claim: bool = False
    compliance_claim: bool = False
    production_trading_ready: bool = False


class PaperAuditComplianceRequirement(BaseModel):
    area_id: str
    title: str
    current_release_status: str = "not_enabled"
    current_state: str
    production_gap: str
    required_controls: list[str]
    acceptance_criteria: list[str]


class PaperAuditComplianceTrailReadinessResponse(BaseModel):
    service: str = "paper-audit-compliance-trail-readiness"
    readiness_state: str = "local_sqlite_hash_chain_not_formal_compliance_trail"
    summary: str
    capabilities: PaperAuditComplianceTrailCapabilities = Field(
        default_factory=PaperAuditComplianceTrailCapabilities
    )
    safety_defaults: HostedPaperSafetyDefaults
    safety_flags: PaperAuditComplianceTrailSafetyFlags
    requirements: list[PaperAuditComplianceRequirement]
    required_before_compliance_claim: list[str]
    docs: dict[str, str]
    warnings: list[str]


REQUIREMENTS = [
    PaperAuditComplianceRequirement(
        area_id="append_only_audit_service",
        title="Append-only audit service",
        current_state=(
            "Paper audit events are persisted in local SQLite for demos and "
            "engineering review."
        ),
        production_gap=(
            "No centralized append-only audit ingestion service, sequence "
            "authority, write-once boundary, or service-level access control exists."
        ),
        required_controls=[
            "centralized append-only audit ingestion API",
            "monotonic sequence and tenant-scoped correlation identifiers",
            "append-only storage enforcement and operator runbook",
            "audit service health, alerting, backup, and recovery monitoring",
        ],
        acceptance_criteria=[
            "audit writers cannot update or delete accepted events",
            "audit event sequence is tenant-scoped and replayable",
            "append failures are observable and block unsafe workflow progression",
        ],
    ),
    PaperAuditComplianceRequirement(
        area_id="immutable_audit_log_or_worm",
        title="Immutable audit log or WORM storage",
        current_state="Local hash-chain metadata provides tamper-evidence preview only.",
        production_gap=(
            "No WORM storage, object lock, immutable ledger, external timestamping, "
            "or signed audit record pipeline exists."
        ),
        required_controls=[
            "reviewed WORM-capable storage architecture",
            "cryptographic signing and key-management review",
            "external timestamping or equivalent audit timestamp authority",
            "legal hold and retention controls",
        ],
        acceptance_criteria=[
            "accepted audit records cannot be modified by application operators",
            "record integrity can be independently verified",
            "retention and legal hold rules are enforceable",
        ],
    ),
    PaperAuditComplianceRequirement(
        area_id="reviewer_identity_rbac_abac",
        title="Reviewer identity, RBAC, and ABAC",
        current_state=(
            "Reviewer IDs are local placeholders in paper approval and demo flows."
        ),
        production_gap=(
            "No real reviewer login, MFA, session, RBAC, ABAC, tenant isolation, "
            "or privileged action approval exists."
        ),
        required_controls=[
            "real identity provider integration",
            "MFA for reviewer/operator/admin roles",
            "tenant-scoped RBAC and ABAC enforcement",
            "privileged action audit and session binding",
        ],
        acceptance_criteria=[
            "every decision is bound to a verified reviewer identity",
            "reviewers cannot approve outside their tenant or role scope",
            "session and permission context is captured in audit events",
        ],
    ),
    PaperAuditComplianceRequirement(
        area_id="decision_history",
        title="Reviewer decision history",
        current_state=(
            "Local paper approval decisions are stored in local SQLite with "
            "hash-chain references."
        ),
        production_gap=(
            "Decision history is not immutable, centrally retained, export-reviewed, "
            "or tied to verified reviewer sessions."
        ),
        required_controls=[
            "decision event schema with reviewer/session/tenant claims",
            "immutable decision history storage",
            "decision correction and supersession policy",
            "dual-review and segregation-of-duty controls where required",
        ],
        acceptance_criteria=[
            "decision history is complete and append-only",
            "decision corrections preserve original events",
            "decision exports include reviewer identity and sequence references",
        ],
    ),
    PaperAuditComplianceRequirement(
        area_id="retention_policy",
        title="Retention policy",
        current_state="No production retention schedule is enforced for local SQLite demos.",
        production_gap=(
            "No tenant-aware retention schedule, legal hold, disposal approval, "
            "or restore drill exists."
        ),
        required_controls=[
            "retention schedule by event type and tenant",
            "legal hold and deletion-block workflow",
            "backup, restore, and disposal procedures",
            "retention policy review cadence",
        ],
        acceptance_criteria=[
            "records are retained for the configured period",
            "legal hold prevents deletion or expiry",
            "restore drills prove audit continuity",
        ],
    ),
    PaperAuditComplianceRequirement(
        area_id="export_policy",
        title="Audit export policy",
        current_state=(
            "Local JSON evidence exports are explicit and reviewer-operated for demos."
        ),
        production_gap=(
            "No formal export approval workflow, redaction policy, access logging, "
            "or customer-facing export boundary exists."
        ),
        required_controls=[
            "export request and approval workflow",
            "redaction and sensitive-field classification",
            "export checksum and chain-of-custody metadata",
            "export access logs and retention controls",
        ],
        acceptance_criteria=[
            "exports require authorized reviewer/operator approval",
            "exports contain checksums and chain-of-custody references",
            "export access is audit-visible",
        ],
    ),
]


REQUIRED_BEFORE_COMPLIANCE_CLAIM = [
    "Select and review append-only audit service architecture.",
    "Select and review immutable audit log or WORM-capable storage.",
    "Integrate verified reviewer identity, session, RBAC, ABAC, and tenant isolation.",
    "Define immutable decision history schema and correction/supersession policy.",
    "Define retention, legal hold, backup, restore, and disposal policies.",
    "Define audit export approval, redaction, checksum, and access logging policy.",
    "Complete security, legal, compliance, operations, and disaster-recovery review.",
]


def get_paper_audit_compliance_trail_readiness(
    settings: Settings,
) -> PaperAuditComplianceTrailReadinessResponse:
    paper_only = (
        settings.trading_mode == "paper"
        and settings.broker_provider == "paper"
        and not settings.live_trading_enabled
    )
    return PaperAuditComplianceTrailReadinessResponse(
        summary=(
            "The current audit trail is local SQLite plus paper-only hash-chain "
            "preview metadata. It is useful for demos and engineering review, "
            "but it is not a formal append-only audit service, WORM ledger, or "
            "production compliance trail."
        ),
        safety_defaults=HostedPaperSafetyDefaults(
            trading_mode=settings.trading_mode,
            enable_live_trading=settings.enable_live_trading,
            broker_provider=settings.broker_provider,
        ),
        safety_flags=PaperAuditComplianceTrailSafetyFlags(
            paper_only=paper_only,
            live_trading_enabled=settings.live_trading_enabled,
            broker_provider=settings.broker_provider,
        ),
        requirements=REQUIREMENTS,
        required_before_compliance_claim=REQUIRED_BEFORE_COMPLIANCE_CLAIM,
        docs={
            "paper_audit_integrity_preview": "docs/paper-audit-integrity-preview.md",
            "paper_audit_worm_readiness": "docs/paper-audit-worm-readiness.md",
            "paper_audit_compliance_trail_readiness": (
                "docs/paper-audit-compliance-trail-readiness.md"
            ),
            "security_vault_asvs": "docs/security-vault-asvs.md",
            "paper_shadow_live_boundary": "docs/paper-shadow-live-boundary.md",
        },
        warnings=[
            "This endpoint is read-only compliance-trail readiness metadata only.",
            "Local SQLite hash-chain metadata is not WORM storage.",
            "No append-only audit service is enabled.",
            "No verified reviewer login, RBAC, ABAC, or tenant isolation is enforced.",
            "No formal retention or export policy is enforced.",
            "Production Trading Platform remains NOT READY.",
        ],
    )
