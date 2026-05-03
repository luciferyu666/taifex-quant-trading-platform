from __future__ import annotations

from pydantic import BaseModel, Field

from app.core.config import Settings
from app.domain.hosted_paper_readiness import HostedPaperSafetyDefaults


class HostedWebCommandCenterApiBaseContract(BaseModel):
    primary_public_env_var: str = "NEXT_PUBLIC_HOSTED_BACKEND_API_BASE_URL"
    local_fallback_public_env_var: str = "NEXT_PUBLIC_BACKEND_URL"
    mode_public_env_var: str = "NEXT_PUBLIC_COMMAND_CENTER_API_MODE"
    default_local_base_url: str = "http://localhost:8000"
    server_side_fetch_supported: bool = True
    browser_fetch_supported_for_read_only_panels: bool = True
    hosted_backend_requires_https: bool = True
    secrets_allowed_in_public_env: bool = False
    broker_credentials_allowed_in_public_env: bool = False


class HostedWebCommandCenterEndpointContract(BaseModel):
    path: str
    purpose: str
    read_only: bool = True
    requires_real_login_before_customer_use: bool = True
    requires_tenant_isolation_before_customer_use: bool = True
    mutation: bool = False


class HostedWebCommandCenterIdentityDisplay(BaseModel):
    login_status_displayed: bool = True
    tenant_displayed: bool = True
    roles_displayed: bool = True
    permissions_displayed: bool = True
    current_identity_source: str = "mock_session_contract_only"
    real_login_enabled: bool = False
    customer_account_enabled: bool = False
    reviewer_login_enabled: bool = False
    rbac_abac_enforced: bool = False
    tenant_isolation_enforced: bool = False


class HostedWebCommandCenterCapabilityFlags(BaseModel):
    environment_aware_api_base_url_supported: bool = True
    production_vercel_hosted_backend_connectivity_configurable: bool = True
    local_backend_fallback_supported: bool = True
    fallback_sample_mode_supported: bool = True
    hosted_backend_runtime_enabled: bool = False
    hosted_paper_customer_workspace_enabled: bool = False
    hosted_mutations_enabled: bool = False
    real_auth_provider_enabled: bool = False
    managed_datastore_enabled: bool = False
    broker_api_enabled: bool = False
    credential_collection_enabled: bool = False
    production_trading_ready: bool = False


class HostedWebCommandCenterSafetyFlags(BaseModel):
    paper_only: bool
    read_only_contract: bool = True
    live_trading_enabled: bool
    broker_provider: str
    broker_api_called: bool = False
    order_created: bool = False
    credentials_collected: bool = False
    broker_credentials_collected: bool = False
    auth_provider_enabled: bool = False
    session_cookie_issued: bool = False
    customer_account_created: bool = False
    hosted_datastore_written: bool = False
    external_db_written: bool = False
    live_approval_granted: bool = False
    production_trading_ready: bool = False


class HostedWebCommandCenterReadinessResponse(BaseModel):
    service: str = "hosted-web-command-center-readiness"
    readiness_state: str = "environment_aware_connection_contract_only"
    summary: str
    api_base_url_contract: HostedWebCommandCenterApiBaseContract = Field(
        default_factory=HostedWebCommandCenterApiBaseContract
    )
    identity_display: HostedWebCommandCenterIdentityDisplay = Field(
        default_factory=HostedWebCommandCenterIdentityDisplay
    )
    capabilities: HostedWebCommandCenterCapabilityFlags = Field(
        default_factory=HostedWebCommandCenterCapabilityFlags
    )
    required_read_endpoints: list[HostedWebCommandCenterEndpointContract]
    safety_defaults: HostedPaperSafetyDefaults
    safety_flags: HostedWebCommandCenterSafetyFlags
    required_before_customer_hosted_use: list[str]
    docs: dict[str, str]
    warnings: list[str]


REQUIRED_READ_ENDPOINTS = [
    HostedWebCommandCenterEndpointContract(
        path="/health",
        purpose="Backend health and paper-safe runtime status.",
        requires_real_login_before_customer_use=False,
        requires_tenant_isolation_before_customer_use=False,
    ),
    HostedWebCommandCenterEndpointContract(
        path="/api/hosted-backend/environment",
        purpose="Hosted backend dev/staging/production environment boundary.",
    ),
    HostedWebCommandCenterEndpointContract(
        path="/api/hosted-backend/readiness",
        purpose="Hosted backend readiness and missing SaaS capabilities.",
    ),
    HostedWebCommandCenterEndpointContract(
        path="/api/hosted-paper/readiness",
        purpose="Hosted paper API readiness boundary.",
    ),
    HostedWebCommandCenterEndpointContract(
        path="/api/hosted-paper/session",
        purpose="Mock session contract for login status, role, and permission display.",
    ),
    HostedWebCommandCenterEndpointContract(
        path="/api/hosted-paper/tenants/current",
        purpose="Mock tenant context for tenant boundary display.",
    ),
    HostedWebCommandCenterEndpointContract(
        path="/api/hosted-paper/web-command-center/readiness",
        purpose="Web Command Center hosted backend connectivity contract.",
    ),
]


REQUIRED_BEFORE_CUSTOMER_HOSTED_USE = [
    "Deploy a reviewed hosted backend runtime for paper-only staging.",
    "Configure NEXT_PUBLIC_HOSTED_BACKEND_API_BASE_URL for the frontend deployment.",
    "Keep public API base URL values non-secret and HTTPS-only for hosted environments.",
    "Add real login, logout, session validation, and reviewer/customer identity.",
    "Enforce tenant isolation on every hosted request and hosted record.",
    "Enforce RBAC/ABAC before any hosted mutation or paper workflow submit.",
    "Connect a managed datastore only after migration, backup, retention, and restore review.",
    "Complete security and operations review before customer-hosted paper use.",
]


def get_hosted_web_command_center_readiness(
    settings: Settings,
) -> HostedWebCommandCenterReadinessResponse:
    paper_only = (
        settings.trading_mode == "paper"
        and settings.broker_provider == "paper"
        and not settings.live_trading_enabled
    )
    return HostedWebCommandCenterReadinessResponse(
        summary=(
            "The Web Command Center now has an environment-aware hosted backend "
            "API base URL contract. Production Vercel can be pointed at a future "
            "hosted paper backend with NEXT_PUBLIC_HOSTED_BACKEND_API_BASE_URL, "
            "while local demo mode can keep using NEXT_PUBLIC_BACKEND_URL or the "
            "localhost default. This slice displays mock login, tenant, role, "
            "and permission context only; it does not enable real login, hosted "
            "mutations, managed datastore writes, broker access, or live trading."
        ),
        required_read_endpoints=REQUIRED_READ_ENDPOINTS,
        safety_defaults=HostedPaperSafetyDefaults(
            trading_mode=settings.trading_mode,
            enable_live_trading=settings.enable_live_trading,
            broker_provider=settings.broker_provider,
        ),
        safety_flags=HostedWebCommandCenterSafetyFlags(
            paper_only=paper_only,
            live_trading_enabled=settings.live_trading_enabled,
            broker_provider=settings.broker_provider,
        ),
        required_before_customer_hosted_use=REQUIRED_BEFORE_CUSTOMER_HOSTED_USE,
        docs={
            "hosted_web_command_center": "docs/hosted-web-command-center.md",
            "hosted_backend_foundation": "docs/hosted-backend-api-deployment-foundation.md",
            "hosted_paper_saas_foundation": "docs/hosted-paper-saas-foundation-roadmap.md",
            "hosted_paper_mock_session": "docs/hosted-paper-mock-session-contract.md",
            "hosted_paper_identity_access": "docs/hosted-paper-identity-access-contract.md",
        },
        warnings=[
            "This endpoint is read-only hosted Web Command Center metadata only.",
            "A public API base URL is configuration, not authentication.",
            "No real login, session cookie, customer account, or tenant record is created.",
            "No hosted datastore is written and no broker API is called.",
            "Production Trading Platform remains NOT READY.",
            "Live trading remains disabled by default.",
        ],
    )
