from __future__ import annotations

from pydantic import BaseModel, Field

from app.core.config import Settings


class HostedPaperSafetyDefaults(BaseModel):
    trading_mode: str
    enable_live_trading: bool
    broker_provider: str


class HostedPaperSafetyFlags(BaseModel):
    paper_only: bool
    live_trading_enabled: bool
    broker_api_called: bool = False
    order_created: bool = False
    database_written: bool = False
    external_db_written: bool = False
    broker_credentials_collected: bool = False
    production_trading_ready: bool = False


class HostedPaperCapabilityStatus(BaseModel):
    customer_login_enabled: bool = False
    hosted_backend_enabled: bool = False
    hosted_datastore_enabled: bool = False
    rbac_abac_enabled: bool = False
    paper_workflow_online_enabled: bool = False
    local_demo_mode_primary: bool = True


class HostedPaperReadinessResponse(BaseModel):
    service: str = "hosted-paper-api-readiness"
    readiness_state: str = "not_enabled"
    summary: str
    safety_defaults: HostedPaperSafetyDefaults
    safety_flags: HostedPaperSafetyFlags
    capabilities: HostedPaperCapabilityStatus = Field(default_factory=HostedPaperCapabilityStatus)
    current_customer_path: list[str]
    unavailable_until_hosted_backend: list[str]
    future_requirements: list[str]
    docs: dict[str, str]
    warnings: list[str]


CURRENT_CUSTOMER_PATH = [
    "Use the Production Vercel Web Command Center for read-only UI and fallback samples.",
    "Use local backend + local SQLite to create and inspect actual paper workflow records.",
    "Use explicit local evidence export/import for customer review artifacts.",
]


UNAVAILABLE_UNTIL_HOSTED_BACKEND = [
    "Customer login to an online paper workspace.",
    "Tenant-scoped hosted paper records.",
    "Hosted approval queue and decision persistence.",
    "Hosted paper OMS/audit query APIs backed by a managed datastore.",
]


FUTURE_REQUIREMENTS = [
    "Authenticated session context.",
    "Tenant-scoped managed hosted datastore.",
    "RBAC/ABAC checks for reviewer and operator actions.",
    "Paper-only approval workflow backed by hosted persistence.",
    "Paper-only workflow submit that references a persisted approval_request_id.",
    "Append-only hosted paper audit events with integrity verification.",
    "Security and operations review before any customer pilot.",
]


def get_hosted_paper_readiness(settings: Settings) -> HostedPaperReadinessResponse:
    paper_only = (
        settings.trading_mode == "paper"
        and settings.broker_provider == "paper"
        and not settings.live_trading_enabled
    )
    return HostedPaperReadinessResponse(
        summary=(
            "Hosted paper backend/API is not enabled. The local backend + local SQLite "
            "path remains primary for actual paper workflow records; Production Vercel "
            "remains read-only for UI, fallback samples, and explicit local "
            "JSON evidence."
        ),
        safety_defaults=HostedPaperSafetyDefaults(
            trading_mode=settings.trading_mode,
            enable_live_trading=settings.enable_live_trading,
            broker_provider=settings.broker_provider,
        ),
        safety_flags=HostedPaperSafetyFlags(
            paper_only=paper_only,
            live_trading_enabled=settings.live_trading_enabled,
        ),
        current_customer_path=CURRENT_CUSTOMER_PATH,
        unavailable_until_hosted_backend=UNAVAILABLE_UNTIL_HOSTED_BACKEND,
        future_requirements=FUTURE_REQUIREMENTS,
        docs={
            "hosted_paper_readiness": "docs/hosted-paper-backend-api-readiness.md",
            "local_backend_demo": "docs/frontend-local-backend-demo-mode.md",
            "production_local_data_boundary": "docs/production-local-data-boundary.md",
            "self_service_demo": "docs/customer-self-service-paper-demo-roadmap.md",
        },
        warnings=[
            "This endpoint is read-only readiness metadata, not a hosted paper backend.",
            (
                "It does not authenticate users, write records, call brokers, "
                "create orders, or turn live trading on."
            ),
            "Production Trading Platform remains NOT READY.",
        ],
    )
