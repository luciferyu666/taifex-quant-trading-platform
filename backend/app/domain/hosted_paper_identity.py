from __future__ import annotations

from pydantic import BaseModel, Field

from app.core.config import Settings
from app.domain.hosted_paper_readiness import HostedPaperSafetyDefaults


class HostedPaperIdentityStatus(BaseModel):
    reviewer_login_enabled: bool = False
    customer_accounts_enabled: bool = False
    authentication_provider: str = "none"
    session_issuance_enabled: bool = False
    session_cookie_issued: bool = False
    mfa_enabled: bool = False


class HostedPaperAccessControlStatus(BaseModel):
    rbac_enabled: bool = False
    abac_enabled: bool = False
    roles_defined: list[str] = Field(
        default_factory=lambda: [
            "viewer",
            "research_reviewer",
            "risk_reviewer",
            "paper_operator",
            "tenant_admin",
        ]
    )
    permissions_defined: list[str] = Field(
        default_factory=lambda: [
            "read_hosted_readiness",
            "read_mock_session",
            "read_current_tenant",
            "read_tenant_paper_records",
            "create_paper_approval_request",
            "record_paper_reviewer_decision",
            "submit_approved_paper_workflow",
            "enable_live_trading",
            "upload_broker_credentials",
        ]
    )
    mutation_permissions_granted: bool = False
    live_permissions_granted: bool = False
    dual_review_required_for_future: bool = True


class HostedPaperTenantIsolationStatus(BaseModel):
    tenant_isolation_required: bool = True
    tenant_isolation_enforced: bool = False
    hosted_tenant_datastore_enabled: bool = False
    hosted_tenant_records_enabled: bool = False
    tenant_created: bool = False
    local_sqlite_access_from_production_vercel: bool = False


class HostedPaperIdentitySafetyFlags(BaseModel):
    paper_only: bool
    read_only: bool = True
    live_trading_enabled: bool
    broker_provider: str
    broker_api_called: bool = False
    order_created: bool = False
    credentials_collected: bool = False
    broker_credentials_collected: bool = False
    hosted_auth_provider_enabled: bool = False
    reviewer_login_created: bool = False
    customer_account_created: bool = False
    session_cookie_issued: bool = False
    hosted_datastore_written: bool = False
    external_db_written: bool = False
    rbac_abac_enforced: bool = False
    tenant_isolation_enforced: bool = False
    production_trading_ready: bool = False


class HostedPaperIdentityReadinessResponse(BaseModel):
    service: str = "hosted-paper-identity-rbac-tenant-readiness"
    readiness_state: str = "schema_only_not_enabled"
    summary: str
    identity: HostedPaperIdentityStatus = Field(default_factory=HostedPaperIdentityStatus)
    access_control: HostedPaperAccessControlStatus = Field(
        default_factory=HostedPaperAccessControlStatus
    )
    tenant_isolation: HostedPaperTenantIsolationStatus = Field(
        default_factory=HostedPaperTenantIsolationStatus
    )
    safety_defaults: HostedPaperSafetyDefaults
    safety_flags: HostedPaperIdentitySafetyFlags
    current_customer_path: list[str]
    blocked_until_identity_layer: list[str]
    future_requirements: list[str]
    docs: dict[str, str]
    warnings: list[str]


CURRENT_CUSTOMER_PATH = [
    "Use Production Vercel for read-only UI, fallback samples, and local JSON evidence viewers.",
    "Use local backend + local SQLite for actual paper approval, OMS, and audit records.",
    "Use exported evidence files for reviewer/customer handoff until hosted identity exists.",
]


BLOCKED_UNTIL_IDENTITY_LAYER = [
    "Real reviewer login.",
    "Customer account onboarding.",
    "Tenant-scoped hosted paper workspace.",
    "Hosted approval queue mutations.",
    "Hosted paper workflow submission.",
    "Hosted tenant paper record queries backed by a managed datastore.",
]


FUTURE_REQUIREMENTS = [
    "Choose and review a hosted authentication provider.",
    "Define session issuance, expiry, rotation, and logout behavior.",
    "Implement tenant-scoped account and membership records.",
    "Enforce RBAC for reviewer and paper operator actions.",
    "Enforce ABAC for paper-only mode, tenant scope, environment, and approval state.",
    "Add dual-review rules before any hosted paper workflow submission.",
    "Add audit trail for identity, authorization, and tenant-boundary decisions.",
    "Complete security and operations review before customer pilot.",
]


def get_hosted_paper_identity_readiness(
    settings: Settings,
) -> HostedPaperIdentityReadinessResponse:
    paper_only = (
        settings.trading_mode == "paper"
        and settings.broker_provider == "paper"
        and not settings.live_trading_enabled
    )
    return HostedPaperIdentityReadinessResponse(
        summary=(
            "Hosted paper identity, reviewer login, customer accounts, formal "
            "RBAC/ABAC, and tenant isolation are schema-only readiness metadata. "
            "They are not enabled and do not create hosted sessions or tenant records."
        ),
        safety_defaults=HostedPaperSafetyDefaults(
            trading_mode=settings.trading_mode,
            enable_live_trading=settings.enable_live_trading,
            broker_provider=settings.broker_provider,
        ),
        safety_flags=HostedPaperIdentitySafetyFlags(
            paper_only=paper_only,
            live_trading_enabled=settings.live_trading_enabled,
            broker_provider=settings.broker_provider,
        ),
        current_customer_path=CURRENT_CUSTOMER_PATH,
        blocked_until_identity_layer=BLOCKED_UNTIL_IDENTITY_LAYER,
        future_requirements=FUTURE_REQUIREMENTS,
        docs={
            "hosted_paper_auth_boundary": "docs/hosted-paper-auth-boundary-spec.md",
            "hosted_paper_mock_session": "docs/hosted-paper-mock-session-contract.md",
            "hosted_paper_readiness": "docs/hosted-paper-backend-api-readiness.md",
            "paper_shadow_live_boundary": "docs/paper-shadow-live-boundary.md",
        },
        warnings=[
            "This endpoint is read-only identity readiness metadata only.",
            (
                "It does not create reviewer login, customer accounts, sessions, "
                "tenant records, or RBAC/ABAC enforcement."
            ),
            (
                "It does not enable live trading, write databases, collect "
                "credentials, call brokers, or create orders."
            ),
            "Production Trading Platform remains NOT READY.",
        ],
    )
