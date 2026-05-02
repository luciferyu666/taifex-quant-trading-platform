from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field

from app.core.config import Settings
from app.domain.hosted_paper_readiness import (
    HostedPaperSafetyDefaults,
    HostedPaperSafetyFlags,
)

HostedBackendEnvironmentName = Literal["local", "dev", "staging", "production"]
HostedBackendState = Literal["not_enabled", "staging_only", "not_ready"]


class HostedBackendCapabilityFlags(BaseModel):
    hosted_backend_enabled: bool | Literal["staging_only"] = False
    managed_datastore_enabled: bool = False
    local_sqlite_allowed_for_hosted: bool = False
    tenant_isolation_required: bool = True
    auth_session_required: bool = True
    customer_accounts_enabled: bool = False
    reviewer_login_enabled: bool = False
    hosted_records_writable: bool = False
    hosted_records_readable: bool = False
    broker_api_enabled: bool = False
    credential_collection_enabled: bool = False
    production_trading_ready: bool = False


class HostedBackendEnvironmentBoundary(BaseModel):
    environment: HostedBackendEnvironmentName
    purpose: str
    hosted_backend_state: HostedBackendState
    managed_datastore_state: str
    local_sqlite_policy: str
    customer_access_policy: str
    live_trading_policy: str
    broker_policy: str
    notes: list[str] = Field(default_factory=list)


class HostedBackendDeploymentRequirement(BaseModel):
    sequence: int
    capability: str
    current_status: str
    required_before_hosted_customer_use: bool
    notes: str


class HostedBackendEnvironmentResponse(BaseModel):
    service: str = "hosted-backend-api-environment"
    contract_version: str = "2026-05-02"
    current_environment: HostedBackendEnvironmentName
    deployment_model: str
    hosted_backend_state: HostedBackendState
    capabilities: HostedBackendCapabilityFlags = Field(
        default_factory=HostedBackendCapabilityFlags
    )
    environment_boundaries: list[HostedBackendEnvironmentBoundary]
    deployment_requirements: list[HostedBackendDeploymentRequirement]
    safety_defaults: HostedPaperSafetyDefaults
    safety_flags: HostedPaperSafetyFlags
    docs: dict[str, str]
    warnings: list[str]


class HostedBackendReadinessResponse(BaseModel):
    service: str = "hosted-backend-api-readiness"
    readiness_state: str = "foundation_contract_only"
    current_environment: HostedBackendEnvironmentName
    hosted_backend_enabled: bool | Literal["staging_only"]
    managed_datastore_enabled: bool
    local_sqlite_allowed_for_hosted: bool
    tenant_isolation_required: bool
    live_trading_enabled: bool
    broker_provider: str
    production_trading_ready: bool
    summary: str
    unavailable_until_foundation_complete: list[str]
    required_next_slices: list[str]
    safety_defaults: HostedPaperSafetyDefaults
    safety_flags: HostedPaperSafetyFlags
    docs: dict[str, str]
    warnings: list[str]


def get_hosted_backend_environment(settings: Settings) -> HostedBackendEnvironmentResponse:
    current_environment = normalize_environment(settings.app_env)
    capabilities = build_capabilities(current_environment)
    paper_only = is_paper_only(settings)
    return HostedBackendEnvironmentResponse(
        current_environment=current_environment,
        deployment_model=(
            "hosted_backend_foundation_contract_only_dev_staging_production_separated"
        ),
        hosted_backend_state=resolve_hosted_backend_state(current_environment),
        capabilities=capabilities,
        environment_boundaries=build_environment_boundaries(),
        deployment_requirements=build_deployment_requirements(),
        safety_defaults=HostedPaperSafetyDefaults(
            trading_mode=settings.trading_mode,
            enable_live_trading=settings.enable_live_trading,
            broker_provider=settings.broker_provider,
        ),
        safety_flags=HostedPaperSafetyFlags(
            paper_only=paper_only,
            live_trading_enabled=settings.live_trading_enabled,
            broker_api_called=False,
            order_created=False,
            database_written=False,
            external_db_written=False,
            broker_credentials_collected=False,
            production_trading_ready=False,
        ),
        docs=hosted_backend_docs(),
        warnings=[
            "This endpoint is read-only hosted backend foundation metadata only.",
            "Hosted Paper customer SaaS operation is not enabled by this contract.",
            "Managed datastore connection and hosted record writes are not enabled.",
            "Local SQLite is forbidden as a hosted datastore.",
            "Production Trading Platform remains NOT READY.",
            "Live trading remains disabled by default.",
        ],
    )


def get_hosted_backend_readiness(settings: Settings) -> HostedBackendReadinessResponse:
    environment = get_hosted_backend_environment(settings)
    capabilities = environment.capabilities
    return HostedBackendReadinessResponse(
        current_environment=environment.current_environment,
        hosted_backend_enabled=capabilities.hosted_backend_enabled,
        managed_datastore_enabled=capabilities.managed_datastore_enabled,
        local_sqlite_allowed_for_hosted=capabilities.local_sqlite_allowed_for_hosted,
        tenant_isolation_required=capabilities.tenant_isolation_required,
        live_trading_enabled=settings.live_trading_enabled,
        broker_provider=settings.broker_provider,
        production_trading_ready=capabilities.production_trading_ready,
        summary=(
            "Hosted backend/API foundation is a read-only deployment boundary "
            "contract. It documents dev, staging, and production separation for "
            "future hosted paper SaaS, but does not enable customer accounts, "
            "hosted records, managed datastore writes, broker calls, or live trading."
        ),
        unavailable_until_foundation_complete=[
            "Hosted customer login and reviewer login.",
            "Tenant-scoped hosted paper records.",
            "Managed datastore adapter and migration apply path.",
            "Hosted approval queue and decision persistence.",
            "Hosted paper OMS/audit records.",
            "Hosted customer demo tenant.",
        ],
        required_next_slices=[
            "Managed datastore staging adapter with dry-run write guard.",
            "Auth/session provider selection and non-production tenant context.",
            "RBAC/ABAC policy enforcement for paper approval actions.",
            "Tenant-scoped hosted audit retention and export contract.",
            "Staging-only hosted paper workflow pilot gate.",
        ],
        safety_defaults=environment.safety_defaults,
        safety_flags=environment.safety_flags,
        docs=environment.docs,
        warnings=environment.warnings,
    )


def normalize_environment(app_env: str) -> HostedBackendEnvironmentName:
    normalized = app_env.strip().lower()
    if normalized in {"prod", "production"}:
        return "production"
    if normalized in {"stage", "staging"}:
        return "staging"
    if normalized in {"dev"}:
        return "dev"
    return "local"


def resolve_hosted_backend_state(
    current_environment: HostedBackendEnvironmentName,
) -> HostedBackendState:
    if current_environment == "staging":
        return "staging_only"
    if current_environment == "production":
        return "not_ready"
    return "not_enabled"


def build_capabilities(
    current_environment: HostedBackendEnvironmentName,
) -> HostedBackendCapabilityFlags:
    return HostedBackendCapabilityFlags(
        hosted_backend_enabled=(
            "staging_only" if current_environment == "staging" else False
        ),
        managed_datastore_enabled=False,
        local_sqlite_allowed_for_hosted=False,
        tenant_isolation_required=True,
        auth_session_required=True,
        customer_accounts_enabled=False,
        reviewer_login_enabled=False,
        hosted_records_writable=False,
        hosted_records_readable=False,
        broker_api_enabled=False,
        credential_collection_enabled=False,
        production_trading_ready=False,
    )


def build_environment_boundaries() -> list[HostedBackendEnvironmentBoundary]:
    return [
        HostedBackendEnvironmentBoundary(
            environment="dev",
            purpose="Developer-only hosted backend rehearsal boundary.",
            hosted_backend_state="not_enabled",
            managed_datastore_state="not_connected",
            local_sqlite_policy="allowed only for local demo, never as hosted datastore",
            customer_access_policy="no customer accounts or reviewer login",
            live_trading_policy="disabled",
            broker_policy="paper provider only; no real broker SDK",
            notes=[
                "Use local backend and local SQLite for engineering demo records.",
                "Do not expose dev records as a customer SaaS workspace.",
            ],
        ),
        HostedBackendEnvironmentBoundary(
            environment="staging",
            purpose="Future staging-only hosted paper API rehearsal boundary.",
            hosted_backend_state="staging_only",
            managed_datastore_state="future controlled staging datastore",
            local_sqlite_policy="forbidden for hosted paper records",
            customer_access_policy="future test tenants only after auth and RBAC review",
            live_trading_policy="disabled",
            broker_policy="paper provider only; no real broker SDK",
            notes=[
                "Staging can test managed datastore wiring after dry-run gates pass.",
                "Staging must not route real orders or collect broker credentials.",
            ],
        ),
        HostedBackendEnvironmentBoundary(
            environment="production",
            purpose="Production boundary for future hosted paper SaaS only.",
            hosted_backend_state="not_ready",
            managed_datastore_state="not_connected",
            local_sqlite_policy="forbidden for hosted paper records",
            customer_access_policy="not enabled until auth, tenancy, audit, and security pass",
            live_trading_policy="disabled by default",
            broker_policy="no broker SDK, no credentials, no real order route",
            notes=[
                "Production Trading Platform remains NOT READY.",
                (
                    "Hosted paper SaaS requires auth, tenant isolation, "
                    "managed datastore, and audit controls."
                ),
            ],
        ),
    ]


def build_deployment_requirements() -> list[HostedBackendDeploymentRequirement]:
    return [
        HostedBackendDeploymentRequirement(
            sequence=1,
            capability="Hosted backend deployment target",
            current_status="foundation_contract_only",
            required_before_hosted_customer_use=True,
            notes="Define runtime, env vars, CORS, health, readiness, and staging/prod separation.",
        ),
        HostedBackendDeploymentRequirement(
            sequence=2,
            capability="Managed datastore",
            current_status="readiness_contract_only",
            required_before_hosted_customer_use=True,
            notes=(
                "Use tenant-scoped managed datastore; local SQLite is not "
                "allowed for hosted records."
            ),
        ),
        HostedBackendDeploymentRequirement(
            sequence=3,
            capability="Auth/session",
            current_status="mock_contract_only",
            required_before_hosted_customer_use=True,
            notes="Introduce customer and reviewer identity before any hosted mutations.",
        ),
        HostedBackendDeploymentRequirement(
            sequence=4,
            capability="Tenant isolation",
            current_status="schema_contract_only",
            required_before_hosted_customer_use=True,
            notes="Require tenant_id across every hosted paper API path and record.",
        ),
        HostedBackendDeploymentRequirement(
            sequence=5,
            capability="Paper workflow persistence",
            current_status="local_only",
            required_before_hosted_customer_use=True,
            notes=(
                "Move paper approvals, OMS events, audit events, and evidence "
                "into hosted datastore."
            ),
        ),
        HostedBackendDeploymentRequirement(
            sequence=6,
            capability="Security and operations gate",
            current_status="not_started",
            required_before_hosted_customer_use=True,
            notes="Run staging, retention, audit, monitoring, and incident-response review.",
        ),
    ]


def hosted_backend_docs() -> dict[str, str]:
    return {
        "hosted_backend_foundation": "docs/hosted-backend-api-deployment-foundation.md",
        "hosted_paper_saas_foundation": "docs/hosted-paper-saas-foundation-roadmap.md",
        "managed_datastore_readiness": "docs/hosted-paper-managed-datastore-readiness.md",
        "managed_datastore_migration_plan": (
            "docs/hosted-paper-managed-datastore-migration-plan.md"
        ),
        "infra_boundary": "infra/hosted-backend/env-boundary.placeholder.md",
        "local_demo": "docs/customer-self-service-demo.md",
    }


def is_paper_only(settings: Settings) -> bool:
    return (
        settings.trading_mode == "paper"
        and settings.broker_provider == "paper"
        and not settings.live_trading_enabled
    )
