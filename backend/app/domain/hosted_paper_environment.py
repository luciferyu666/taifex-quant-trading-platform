from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field

from app.core.config import Settings
from app.domain.hosted_paper_readiness import (
    HostedPaperSafetyDefaults,
    HostedPaperSafetyFlags,
)

HostedPaperModeState = Literal[
    "primary_local_demo",
    "not_enabled",
    "staging_only_future",
    "ready_future",
    "not_ready",
]


class HostedPaperEnvironmentMode(BaseModel):
    mode: str
    label: str
    state: HostedPaperModeState
    can_read_actual_paper_records: bool
    can_write_paper_records: bool
    auth_required: bool
    tenant_isolation_required: bool
    managed_datastore_required: bool
    local_sqlite_allowed: bool
    description: str
    limitations: list[str] = Field(default_factory=list)


class HostedPaperSaasRoadmapStep(BaseModel):
    sequence: int
    capability: str
    current_status: str
    required_before_customer_saas: bool
    notes: str


class HostedPaperEnvironmentResponse(BaseModel):
    service: str = "hosted-paper-environment-contract"
    contract_version: str = "2026-05-02"
    deployment_model: str
    current_customer_mode: str
    local_demo_mode: HostedPaperEnvironmentMode
    hosted_paper_mode: HostedPaperEnvironmentMode
    production_trading_platform: HostedPaperEnvironmentMode
    saas_foundation_path: list[HostedPaperSaasRoadmapStep]
    safety_defaults: HostedPaperSafetyDefaults
    safety_flags: HostedPaperSafetyFlags
    docs: dict[str, str]
    warnings: list[str]


def get_hosted_paper_environment(settings: Settings) -> HostedPaperEnvironmentResponse:
    paper_only = (
        settings.trading_mode == "paper"
        and settings.broker_provider == "paper"
        and not settings.live_trading_enabled
    )
    return HostedPaperEnvironmentResponse(
        deployment_model=(
            "local_demo_primary_hosted_paper_not_enabled_production_trading_not_ready"
        ),
        current_customer_mode="local_demo_mode",
        local_demo_mode=HostedPaperEnvironmentMode(
            mode="local_demo",
            label="Local Demo Mode",
            state="primary_local_demo",
            can_read_actual_paper_records=True,
            can_write_paper_records=True,
            auth_required=False,
            tenant_isolation_required=False,
            managed_datastore_required=False,
            local_sqlite_allowed=True,
            description=(
                "Primary customer evaluation path for actual paper workflow records. "
                "Runs on the reviewer's machine with local backend and local SQLite."
            ),
            limitations=[
                "Engineering-style local setup is still required.",
                "Records are not available from Production Vercel.",
                "Local SQLite is not a hosted tenant datastore.",
                "No hosted customer account or reviewer login is available.",
            ],
        ),
        hosted_paper_mode=HostedPaperEnvironmentMode(
            mode="hosted_paper",
            label="Hosted Paper Mode",
            state="not_enabled",
            can_read_actual_paper_records=False,
            can_write_paper_records=False,
            auth_required=True,
            tenant_isolation_required=True,
            managed_datastore_required=True,
            local_sqlite_allowed=False,
            description=(
                "Future SaaS paper workflow path with authenticated sessions, "
                "tenant-scoped records, RBAC/ABAC, and managed datastore."
            ),
            limitations=[
                "Hosted backend/API is not deployed as a customer paper workspace.",
                "Managed paper datastore is not connected.",
                "Customer login, reviewer identity, and tenant isolation are not enabled.",
                "Hosted paper workflow persistence is not enabled.",
            ],
        ),
        production_trading_platform=HostedPaperEnvironmentMode(
            mode="production_trading_platform",
            label="Production Trading Platform",
            state="not_ready",
            can_read_actual_paper_records=False,
            can_write_paper_records=False,
            auth_required=True,
            tenant_isolation_required=True,
            managed_datastore_required=True,
            local_sqlite_allowed=False,
            description=(
                "Production trading platform remains NOT READY. This contract does "
                "not enable live trading, broker connectivity, or real order routing."
            ),
            limitations=[
                "No live trading approval exists.",
                "No broker SDK path is enabled.",
                "No broker credentials are collected.",
                "No production OMS, WORM audit ledger, or cross-account risk system exists.",
            ],
        ),
        saas_foundation_path=[
            HostedPaperSaasRoadmapStep(
                sequence=1,
                capability="Hosted backend",
                current_status="not_enabled",
                required_before_customer_saas=True,
                notes="Deploy controlled backend/API for paper-only hosted workspace.",
            ),
            HostedPaperSaasRoadmapStep(
                sequence=2,
                capability="Managed database",
                current_status="not_enabled",
                required_before_customer_saas=True,
                notes="Replace local SQLite with tenant-scoped managed datastore.",
            ),
            HostedPaperSaasRoadmapStep(
                sequence=3,
                capability="Auth/session",
                current_status="schema_only",
                required_before_customer_saas=True,
                notes="Introduce real customer login and reviewer identity.",
            ),
            HostedPaperSaasRoadmapStep(
                sequence=4,
                capability="Tenant isolation",
                current_status="schema_only",
                required_before_customer_saas=True,
                notes="Require tenant id on every hosted paper record and API read/write.",
            ),
            HostedPaperSaasRoadmapStep(
                sequence=5,
                capability="Paper workflow persistence",
                current_status="local_only",
                required_before_customer_saas=True,
                notes=(
                    "Move approval, paper OMS, risk, broker simulation, and audit "
                    "records into hosted datastore."
                ),
            ),
            HostedPaperSaasRoadmapStep(
                sequence=6,
                capability="Hosted customer demo tenant",
                current_status="not_enabled",
                required_before_customer_saas=True,
                notes=(
                    "Provision a paper-only tenant with sample records after auth, "
                    "data, audit, and security gates pass."
                ),
            ),
        ],
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
        docs={
            "hosted_paper_saas_foundation": "docs/hosted-paper-saas-foundation-roadmap.md",
            "hosted_paper_readiness": "docs/hosted-paper-backend-api-readiness.md",
            "auth_boundary": "docs/hosted-paper-auth-boundary-spec.md",
            "identity_readiness": "docs/hosted-paper-identity-rbac-tenant-readiness.md",
            "local_demo": "docs/customer-self-service-demo.md",
            "production_local_data_boundary": "docs/production-local-data-boundary.md",
        },
        warnings=[
            "This endpoint is read-only environment contract metadata only.",
            "Hosted Paper Mode is not enabled for customer SaaS operation.",
            "Production Vercel cannot read local SQLite paper records.",
            "Production Trading Platform remains NOT READY.",
            "Live trading remains disabled by default.",
        ],
    )
