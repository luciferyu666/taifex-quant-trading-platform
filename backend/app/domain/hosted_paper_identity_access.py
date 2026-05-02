from __future__ import annotations

from pydantic import BaseModel, Field

from app.core.config import Settings
from app.domain.hosted_paper_readiness import HostedPaperSafetyDefaults


class HostedPaperIdentityProviderContract(BaseModel):
    provider_required: bool = True
    provider_selected: bool = False
    provider_name: str = "none"
    real_login_enabled: bool = False
    customer_signup_enabled: bool = False
    reviewer_login_enabled: bool = False
    session_issuance_enabled: bool = False
    session_cookie_issued: bool = False
    mfa_required_for_privileged_roles: bool = True
    mfa_enabled: bool = False


class HostedPaperSessionBoundary(BaseModel):
    required_claims: list[str] = Field(
        default_factory=lambda: [
            "user_id",
            "tenant_id",
            "session_id",
            "roles",
            "permissions",
            "paper_only",
            "environment",
        ]
    )
    session_lifecycle_required: list[str] = Field(
        default_factory=lambda: [
            "issue",
            "expire",
            "rotate",
            "revoke",
            "logout",
        ]
    )
    session_storage: str = "future_secure_http_only_cookie_or_token"
    session_validation_enabled: bool = False
    session_audit_required: bool = True


class HostedPaperTenantBoundaryContract(BaseModel):
    tenant_id_required_on_every_request: bool = True
    tenant_id_required_on_every_record: bool = True
    membership_required: bool = True
    cross_tenant_access_allowed: bool = False
    tenant_isolation_enforced: bool = False
    tenant_admin_role_required_for_membership_changes: bool = True
    local_sqlite_allowed_for_hosted_tenant_records: bool = False


class HostedPaperRolePermissionContract(BaseModel):
    role: str
    purpose: str
    allowed_read_permissions: list[str]
    allowed_future_mutations: list[str] = Field(default_factory=list)
    denied_permissions: list[str]
    requires_mfa: bool = False
    requires_dual_review: bool = False
    can_enable_live_trading: bool = False
    can_upload_broker_credentials: bool = False


class HostedPaperAbacPolicyContract(BaseModel):
    policy: str
    required_attributes: list[str]
    enforcement_target: str
    enabled: bool = False


class HostedPaperIdentityAccessSafetyFlags(BaseModel):
    paper_only: bool
    read_only: bool = True
    live_trading_enabled: bool
    broker_provider: str
    auth_provider_enabled: bool = False
    real_login_enabled: bool = False
    customer_account_created: bool = False
    reviewer_login_created: bool = False
    admin_login_created: bool = False
    operator_login_created: bool = False
    session_cookie_issued: bool = False
    rbac_enforced: bool = False
    abac_enforced: bool = False
    tenant_isolation_enforced: bool = False
    hosted_datastore_written: bool = False
    external_db_written: bool = False
    credentials_collected: bool = False
    broker_credentials_collected: bool = False
    broker_api_called: bool = False
    order_created: bool = False
    production_trading_ready: bool = False


class HostedPaperIdentityAccessContractResponse(BaseModel):
    service: str = "hosted-paper-identity-access-contract"
    contract_state: str = "contract_only_not_implemented"
    summary: str
    identity_provider: HostedPaperIdentityProviderContract = Field(
        default_factory=HostedPaperIdentityProviderContract
    )
    session_boundary: HostedPaperSessionBoundary = Field(
        default_factory=HostedPaperSessionBoundary
    )
    tenant_boundary: HostedPaperTenantBoundaryContract = Field(
        default_factory=HostedPaperTenantBoundaryContract
    )
    role_permission_matrix: list[HostedPaperRolePermissionContract]
    abac_policies: list[HostedPaperAbacPolicyContract]
    blocked_until_real_identity: list[str]
    implementation_sequence: list[str]
    safety_defaults: HostedPaperSafetyDefaults
    safety_flags: HostedPaperIdentityAccessSafetyFlags
    docs: dict[str, str]
    warnings: list[str]


COMMON_DENIED_PERMISSIONS = [
    "enable_live_trading",
    "upload_broker_credentials",
    "create_real_order",
    "connect_real_broker",
    "cross_tenant_access",
]


ROLE_PERMISSION_MATRIX = [
    HostedPaperRolePermissionContract(
        role="customer",
        purpose=(
            "Future tenant member who can read the customer's own paper workspace, "
            "paper evidence, and demo status."
        ),
        allowed_read_permissions=[
            "read_own_tenant_readiness",
            "read_own_paper_records",
            "read_own_evidence",
        ],
        denied_permissions=[
            "record_reviewer_decision",
            "submit_approved_paper_workflow",
            "manage_tenant_members",
            *COMMON_DENIED_PERMISSIONS,
        ],
    ),
    HostedPaperRolePermissionContract(
        role="reviewer",
        purpose=(
            "Future paper-only reviewer for research and risk decisions inside "
            "one tenant boundary."
        ),
        allowed_read_permissions=[
            "read_tenant_readiness",
            "read_tenant_approval_queue",
            "read_tenant_paper_records",
            "read_tenant_evidence",
        ],
        allowed_future_mutations=[
            "record_research_review_decision",
            "record_risk_review_decision",
        ],
        denied_permissions=[
            "submit_approved_paper_workflow",
            "manage_tenant_members",
            *COMMON_DENIED_PERMISSIONS,
        ],
        requires_mfa=True,
    ),
    HostedPaperRolePermissionContract(
        role="operator",
        purpose=(
            "Future paper-only operator who can submit a paper workflow only "
            "after completed approval sequence."
        ),
        allowed_read_permissions=[
            "read_tenant_readiness",
            "read_completed_approval_requests",
            "read_tenant_paper_records",
        ],
        allowed_future_mutations=["submit_approved_paper_workflow"],
        denied_permissions=[
            "record_reviewer_decision",
            "manage_tenant_members",
            *COMMON_DENIED_PERMISSIONS,
        ],
        requires_mfa=True,
        requires_dual_review=True,
    ),
    HostedPaperRolePermissionContract(
        role="admin",
        purpose=(
            "Future tenant administrator for paper-only tenant membership and "
            "configuration review."
        ),
        allowed_read_permissions=[
            "read_tenant_readiness",
            "read_tenant_members",
            "read_tenant_paper_records",
            "read_tenant_audit_events",
        ],
        allowed_future_mutations=[
            "manage_tenant_members",
            "rotate_tenant_reviewers",
        ],
        denied_permissions=[
            "submit_approved_paper_workflow_without_review",
            *COMMON_DENIED_PERMISSIONS,
        ],
        requires_mfa=True,
    ),
]


ABAC_POLICIES = [
    HostedPaperAbacPolicyContract(
        policy="paper_only_mode",
        required_attributes=["paper_only=true", "live_trading_enabled=false"],
        enforcement_target="all hosted paper requests",
    ),
    HostedPaperAbacPolicyContract(
        policy="tenant_scope",
        required_attributes=["tenant_id", "membership_status=active"],
        enforcement_target="all tenant record reads and future writes",
    ),
    HostedPaperAbacPolicyContract(
        policy="environment_scope",
        required_attributes=["environment in dev|staging", "production_trading_ready=false"],
        enforcement_target="hosted paper API routing",
    ),
    HostedPaperAbacPolicyContract(
        policy="approval_state",
        required_attributes=[
            "approval_request_id",
            "required_review_sequence=complete",
            "approval_for_live=false",
        ],
        enforcement_target="future paper workflow submission",
    ),
]


BLOCKED_UNTIL_REAL_IDENTITY = [
    "Hosted customer account login.",
    "Reviewer login and session issuance.",
    "Tenant membership management.",
    "RBAC enforcement for reviewer, admin, customer, and operator roles.",
    "ABAC enforcement for paper-only mode, tenant scope, environment, and approval state.",
    "Hosted paper approval mutations.",
    "Hosted paper workflow submission.",
    "Hosted tenant paper record queries backed by managed datastore.",
]


IMPLEMENTATION_SEQUENCE = [
    "Select and security-review an authentication provider.",
    "Implement tenant and membership datastore models.",
    "Implement real login, logout, session issue, session rotation, and session expiry.",
    "Attach tenant_id, roles, permissions, and attributes to every hosted request.",
    "Enforce RBAC for reviewer, admin, customer, and operator permissions.",
    "Enforce ABAC for paper-only mode, tenant scope, environment, and approval state.",
    "Add identity and authorization audit events.",
    "Run security review before hosted customer pilot.",
]


def get_hosted_paper_identity_access_contract(
    settings: Settings,
) -> HostedPaperIdentityAccessContractResponse:
    paper_only = (
        settings.trading_mode == "paper"
        and settings.broker_provider == "paper"
        and not settings.live_trading_enabled
    )
    return HostedPaperIdentityAccessContractResponse(
        summary=(
            "Read-only contract for the future hosted paper identity layer. "
            "It separates customer, reviewer, operator, and admin roles, but "
            "does not enable real login, sessions, RBAC/ABAC enforcement, "
            "tenant writes, credentials, broker access, or live trading."
        ),
        role_permission_matrix=ROLE_PERMISSION_MATRIX,
        abac_policies=ABAC_POLICIES,
        blocked_until_real_identity=BLOCKED_UNTIL_REAL_IDENTITY,
        implementation_sequence=IMPLEMENTATION_SEQUENCE,
        safety_defaults=HostedPaperSafetyDefaults(
            trading_mode=settings.trading_mode,
            enable_live_trading=settings.enable_live_trading,
            broker_provider=settings.broker_provider,
        ),
        safety_flags=HostedPaperIdentityAccessSafetyFlags(
            paper_only=paper_only,
            live_trading_enabled=settings.live_trading_enabled,
            broker_provider=settings.broker_provider,
        ),
        docs={
            "identity_access_contract": "docs/hosted-paper-identity-access-contract.md",
            "auth_boundary": "docs/hosted-paper-auth-boundary-spec.md",
            "identity_readiness": "docs/hosted-paper-identity-rbac-tenant-readiness.md",
            "saas_roadmap": "docs/hosted-paper-saas-foundation-roadmap.md",
        },
        warnings=[
            "This is a read-only identity access contract, not a login system.",
            (
                "No customer account, reviewer login, admin login, operator login, "
                "or session is created."
            ),
            "RBAC and ABAC are required for hosted SaaS but are not enforced by this slice.",
            (
                "No credentials are collected, no hosted datastore is written, "
                "no broker is called, and no order is created."
            ),
            "Production Trading Platform remains NOT READY.",
            "Live trading remains disabled by default.",
        ],
    )
