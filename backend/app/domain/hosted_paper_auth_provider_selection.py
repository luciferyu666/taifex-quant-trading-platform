from __future__ import annotations

from pydantic import BaseModel

from app.core.config import Settings
from app.domain.hosted_paper_readiness import HostedPaperSafetyDefaults


class HostedPaperAuthProviderCandidate(BaseModel):
    provider: str
    category: str
    fit_summary: str
    strengths: list[str]
    watch_items: list[str]
    paper_saas_fit: str
    recommended_use: str
    integration_enabled: bool = False
    credentials_required_now: bool = False
    secrets_added: bool = False
    customer_accounts_created: bool = False


class HostedPaperAuthSelectionCriterion(BaseModel):
    criterion: str
    why_it_matters: str
    required_before_customer_pilot: bool = True


class HostedPaperAuthProviderSelectionSafetyFlags(BaseModel):
    paper_only: bool
    read_only: bool = True
    live_trading_enabled: bool
    broker_provider: str
    provider_selected: bool = False
    integration_enabled: bool = False
    auth_provider_enabled: bool = False
    customer_account_created: bool = False
    reviewer_login_created: bool = False
    session_cookie_issued: bool = False
    credentials_collected: bool = False
    secrets_added: bool = False
    hosted_datastore_written: bool = False
    broker_api_called: bool = False
    order_created: bool = False
    production_trading_ready: bool = False


class HostedPaperAuthProviderSelectionResponse(BaseModel):
    service: str = "hosted-paper-auth-provider-selection"
    selection_state: str = "selection_matrix_only"
    summary: str
    candidates: list[HostedPaperAuthProviderCandidate]
    criteria: list[HostedPaperAuthSelectionCriterion]
    non_goals: list[str]
    recommended_next_steps: list[str]
    safety_defaults: HostedPaperSafetyDefaults
    safety_flags: HostedPaperAuthProviderSelectionSafetyFlags
    docs: dict[str, str]
    warnings: list[str]


AUTH_PROVIDER_CANDIDATES = [
    HostedPaperAuthProviderCandidate(
        provider="Clerk",
        category="Vercel Marketplace auth platform",
        fit_summary=(
            "Strong candidate for a fast hosted paper SaaS pilot on Vercel when "
            "prebuilt UI, session management, and lower integration overhead are "
            "more important than deep enterprise identity customization."
        ),
        strengths=[
            "Vercel Marketplace integration path.",
            "Prebuilt Next.js sign-in and user UI patterns.",
            "Good fit for early customer account and reviewer login pilot.",
            "Can support future role/permission mapping through application policy.",
        ],
        watch_items=[
            "Confirm enterprise SSO, audit export, and tenant membership needs before selection.",
            "Map provider user IDs to internal tenant_id and role records.",
            "Review pricing and data residency before customer pilot.",
        ],
        paper_saas_fit="strong_pilot_candidate",
        recommended_use="Shortlist for first hosted paper customer pilot evaluation.",
    ),
    HostedPaperAuthProviderCandidate(
        provider="Auth0",
        category="Enterprise identity platform",
        fit_summary=(
            "Strong candidate when enterprise SSO, mature identity governance, "
            "custom claims, and large organization requirements dominate."
        ),
        strengths=[
            "Mature enterprise SSO and identity provider ecosystem.",
            "Flexible custom claims and organization modeling.",
            "Good fit for broker/enterprise partner pilots that require stricter identity review.",
        ],
        watch_items=[
            "Higher setup and operations complexity than lightweight pilot choices.",
            "Requires careful tenant and claim mapping for paper-only authorization.",
            "Review cost model and operational ownership before adoption.",
        ],
        paper_saas_fit="strong_enterprise_candidate",
        recommended_use="Shortlist for enterprise or broker-partner paper SaaS pilots.",
    ),
    HostedPaperAuthProviderCandidate(
        provider="Descope",
        category="Passwordless and workflow-oriented auth platform",
        fit_summary=(
            "Candidate for passwordless customer onboarding and guided identity "
            "flows where visual flow configuration is useful."
        ),
        strengths=[
            "Passwordless and flow-oriented onboarding patterns.",
            "Vercel Marketplace integration path.",
            "Potential fit for customer demo onboarding with minimal password handling.",
        ],
        watch_items=[
            "Validate RBAC/ABAC and tenant membership modeling depth.",
            "Confirm audit, compliance, and enterprise SSO needs before selection.",
            "Review operational support model for regulated financial demos.",
        ],
        paper_saas_fit="pilot_candidate",
        recommended_use="Evaluate if passwordless onboarding is a product priority.",
    ),
    HostedPaperAuthProviderCandidate(
        provider="Vercel OIDC / Sign in with Vercel",
        category="Developer-facing OAuth/OIDC identity",
        fit_summary=(
            "Useful for developer/operator tooling where users already have "
            "Vercel accounts, but not a default fit for general customer SaaS login."
        ),
        strengths=[
            "Good fit for developer-facing or internal operator workflows.",
            "Avoids building password handling for Vercel-account users.",
            "Can support internal deployment/admin tooling review flows.",
        ],
        watch_items=[
            "Not appropriate as the default customer account system.",
            "Most customers should not be required to own Vercel accounts.",
            "Use only if the user population is explicitly Vercel-account based.",
        ],
        paper_saas_fit="internal_operator_candidate",
        recommended_use="Keep as an internal/admin tooling option, not customer default.",
    ),
]


SELECTION_CRITERIA = [
    HostedPaperAuthSelectionCriterion(
        criterion="tenant_boundary",
        why_it_matters="Every hosted paper record and request must be scoped by tenant_id.",
    ),
    HostedPaperAuthSelectionCriterion(
        criterion="role_mapping",
        why_it_matters="Customer, reviewer, operator, and admin permissions must remain separate.",
    ),
    HostedPaperAuthSelectionCriterion(
        criterion="session_security",
        why_it_matters="Sessions need expiry, rotation, revocation, logout, and audit events.",
    ),
    HostedPaperAuthSelectionCriterion(
        criterion="mfa_for_privileged_roles",
        why_it_matters="Reviewer, operator, and admin roles should require stronger assurance.",
    ),
    HostedPaperAuthSelectionCriterion(
        criterion="auditability",
        why_it_matters="Identity and authorization decisions must be traceable for review.",
    ),
    HostedPaperAuthSelectionCriterion(
        criterion="paper_only_policy_enforcement",
        why_it_matters="Auth must carry attributes needed to enforce paper-only mode.",
    ),
    HostedPaperAuthSelectionCriterion(
        criterion="vercel_deployment_fit",
        why_it_matters=(
            "The provider should fit the planned hosted frontend/backend deployment path."
        ),
        required_before_customer_pilot=False,
    ),
]


NON_GOALS = [
    "Do not install provider SDKs in this slice.",
    "Do not create login or signup pages.",
    "Do not create customer accounts.",
    "Do not issue session cookies.",
    "Do not add secrets or environment variables.",
    "Do not write hosted datastore records.",
    "Do not collect broker credentials.",
    "Do not call brokers or create orders.",
    "Do not enable live trading.",
]


RECOMMENDED_NEXT_STEPS = [
    "Review product requirements for customer, reviewer, operator, and admin roles.",
    "Confirm tenant membership and audit requirements before choosing a provider.",
    "Run a security review of shortlisted provider data handling and session behavior.",
    "Select one provider for a staging-only proof of concept in a future slice.",
    (
        "Keep production hosted paper customer access disabled until auth, tenant "
        "datastore, RBAC, ABAC, and audit controls are implemented."
    ),
]


def get_hosted_paper_auth_provider_selection(
    settings: Settings,
) -> HostedPaperAuthProviderSelectionResponse:
    paper_only = (
        settings.trading_mode == "paper"
        and settings.broker_provider == "paper"
        and not settings.live_trading_enabled
    )
    return HostedPaperAuthProviderSelectionResponse(
        summary=(
            "Read-only provider selection matrix for future hosted paper identity. "
            "It compares Clerk, Auth0, Descope, and Vercel OIDC / Sign in with "
            "Vercel against paper-only SaaS needs without selecting, installing, "
            "or enabling any provider."
        ),
        candidates=AUTH_PROVIDER_CANDIDATES,
        criteria=SELECTION_CRITERIA,
        non_goals=NON_GOALS,
        recommended_next_steps=RECOMMENDED_NEXT_STEPS,
        safety_defaults=HostedPaperSafetyDefaults(
            trading_mode=settings.trading_mode,
            enable_live_trading=settings.enable_live_trading,
            broker_provider=settings.broker_provider,
        ),
        safety_flags=HostedPaperAuthProviderSelectionSafetyFlags(
            paper_only=paper_only,
            live_trading_enabled=settings.live_trading_enabled,
            broker_provider=settings.broker_provider,
        ),
        docs={
            "auth_provider_selection": "docs/hosted-paper-auth-provider-selection-matrix.md",
            "identity_access_contract": "docs/hosted-paper-identity-access-contract.md",
            "auth_boundary": "docs/hosted-paper-auth-boundary-spec.md",
            "saas_roadmap": "docs/hosted-paper-saas-foundation-roadmap.md",
        },
        warnings=[
            "This is a read-only selection matrix, not an authentication integration.",
            "No provider is selected or enabled by this slice.",
            (
                "No credentials, secrets, customer accounts, sessions, hosted records, "
                "broker calls, or orders are created."
            ),
            "Production Trading Platform remains NOT READY.",
            "Live trading remains disabled by default.",
        ],
    )
