from __future__ import annotations

from pydantic import BaseModel, Field

from app.core.config import Settings
from app.domain.hosted_paper_readiness import HostedPaperSafetyDefaults


class PaperComplianceApprovalScaffoldingStatus(BaseModel):
    local_paper_approval_queue_enabled: bool = True
    local_sqlite_persistence_enabled: bool = True
    paper_only_decisions_supported: list[str] = Field(
        default_factory=lambda: [
            "research_approved",
            "approved_for_paper_simulation",
            "rejected",
            "needs_data_review",
        ]
    )
    local_dual_review_rule_enabled: bool = True
    formal_compliance_approval_enabled: bool = False
    production_approval_authority: bool = False
    reviewer_identity_verified: bool = False
    rbac_abac_enforced: bool = False
    segregation_of_duties_enforced: bool = False
    compliance_policy_engine_enabled: bool = False
    approval_policy_versioning_enabled: bool = False
    tenant_scoped_approval_records_enabled: bool = False
    legal_retention_policy_enforced: bool = False


class PaperComplianceApprovalAuditStatus(BaseModel):
    local_hash_chain_enabled: bool = True
    worm_ledger_enabled: bool = False
    immutable_audit_log_enabled: bool = False
    centralized_audit_service_enabled: bool = False
    signed_approval_records_enabled: bool = False
    external_timestamping_enabled: bool = False
    retention_policy_enforced: bool = False
    production_compliance_archive_enabled: bool = False


class PaperComplianceApprovalSafetyFlags(BaseModel):
    paper_only: bool
    read_only: bool = True
    live_trading_enabled: bool
    broker_provider: str
    broker_api_called: bool = False
    order_created: bool = False
    credentials_collected: bool = False
    broker_credentials_collected: bool = False
    database_written: bool = False
    external_db_written: bool = False
    production_compliance_approval: bool = False
    live_approval_granted: bool = False
    paper_execution_approval_granted: bool = False
    production_trading_ready: bool = False


class PaperComplianceApprovalReadinessResponse(BaseModel):
    service: str = "paper-compliance-approval-readiness"
    readiness_state: str = "local_paper_scaffolding_not_formal_compliance_system"
    summary: str
    scaffolding: PaperComplianceApprovalScaffoldingStatus = Field(
        default_factory=PaperComplianceApprovalScaffoldingStatus
    )
    audit: PaperComplianceApprovalAuditStatus = Field(
        default_factory=PaperComplianceApprovalAuditStatus
    )
    safety_defaults: HostedPaperSafetyDefaults
    safety_flags: PaperComplianceApprovalSafetyFlags
    current_scope: list[str]
    missing_for_formal_compliance: list[str]
    required_before_formal_approval: list[str]
    docs: dict[str, str]
    warnings: list[str]


CURRENT_SCOPE = [
    "Local Paper Only approval queue and history for demos and technical testing.",
    "Local SQLite persistence with hash-chain references for paper approval decisions.",
    "Controlled Paper Submit can reference a persisted approval_request_id.",
    "Web Command Center can create local paper requests and decisions for paper simulation only.",
]


MISSING_FOR_FORMAL_COMPLIANCE = [
    "Real reviewer login and verified reviewer identity.",
    "Formal RBAC/ABAC enforcement for approval authority.",
    "Tenant-scoped customer accounts and hosted approval records.",
    "Compliance policy engine with versioned approval rules.",
    "Segregation of duties enforced by identity and authorization controls.",
    "Immutable WORM ledger or centralized compliance audit service.",
    "Signed approval records, external timestamping, and retention policy enforcement.",
    "Legal, regulatory, security, and operations review for customer-facing approval workflows.",
]


REQUIRED_BEFORE_FORMAL_APPROVAL = [
    "Select and review an authentication provider.",
    "Implement reviewer identity, session lifecycle, MFA, and logout behavior.",
    "Implement tenant-scoped customer accounts and membership records.",
    "Enforce RBAC/ABAC for reviewer, risk, compliance, and paper operator roles.",
    "Define and version compliance approval policies.",
    "Implement WORM or centralized immutable audit storage.",
    "Implement signed approval records and tamper-evident export.",
    (
        "Complete legal/regulatory review before presenting any approval as "
        "formal compliance approval."
    ),
]


def get_paper_compliance_approval_readiness(
    settings: Settings,
) -> PaperComplianceApprovalReadinessResponse:
    paper_only = (
        settings.trading_mode == "paper"
        and settings.broker_provider == "paper"
        and not settings.live_trading_enabled
    )
    return PaperComplianceApprovalReadinessResponse(
        summary=(
            "The current approval workflow is local Paper Only scaffolding for "
            "technical demos. It is not a formal compliance approval system, "
            "does not verify reviewer identity, and does not grant live or "
            "production trading approval."
        ),
        safety_defaults=HostedPaperSafetyDefaults(
            trading_mode=settings.trading_mode,
            enable_live_trading=settings.enable_live_trading,
            broker_provider=settings.broker_provider,
        ),
        safety_flags=PaperComplianceApprovalSafetyFlags(
            paper_only=paper_only,
            live_trading_enabled=settings.live_trading_enabled,
            broker_provider=settings.broker_provider,
        ),
        current_scope=CURRENT_SCOPE,
        missing_for_formal_compliance=MISSING_FOR_FORMAL_COMPLIANCE,
        required_before_formal_approval=REQUIRED_BEFORE_FORMAL_APPROVAL,
        docs={
            "paper_approval_workflow": "docs/paper-approval-workflow.md",
            "hosted_paper_identity": (
                "docs/hosted-paper-identity-rbac-tenant-readiness.md"
            ),
            "paper_shadow_live_boundary": "docs/paper-shadow-live-boundary.md",
            "compliance_boundary": "docs/compliance-boundary.md",
        },
        warnings=[
            "This endpoint is read-only compliance approval readiness metadata only.",
            (
                "The local paper approval workflow is not formal compliance "
                "approval, not legal approval, and not live trading approval."
            ),
            (
                "It does not enable live trading, write databases, collect "
                "credentials, call brokers, or create orders."
            ),
            "Production Trading Platform remains NOT READY.",
        ],
    )
