from __future__ import annotations

from pydantic import BaseModel, Field

from app.core.config import Settings
from app.domain.hosted_paper_readiness import HostedPaperSafetyDefaults


class HostedPaperSandboxOnboardingCapabilities(BaseModel):
    online_sandbox_tenant_enabled: bool = False
    browser_only_customer_onboarding_enabled: bool = False
    hosted_backend_enabled: bool = False
    managed_datastore_enabled: bool = False
    real_login_enabled: bool = False
    tenant_isolation_enforced: bool = False
    guided_demo_data_contract_defined: bool = True
    guided_demo_data_hosted: bool = False
    paper_only_boundary_visible: bool = True
    live_trading_controls_visible: bool = False


class HostedPaperSandboxOnboardingStep(BaseModel):
    sequence: int
    step: str
    current_status: str
    required_before_customer_self_service: bool = True
    notes: list[str] = Field(default_factory=list)


class HostedPaperGuidedDemoDatasetContract(BaseModel):
    dataset_id: str
    dataset_status: str
    intended_use: str
    records_included: list[str]
    hosted_persistence_enabled: bool = False
    generated_from_real_account: bool = False
    external_market_data_downloaded: bool = False
    warnings: list[str]


class HostedPaperSandboxOnboardingSafetyFlags(BaseModel):
    paper_only: bool
    read_only: bool = True
    live_trading_enabled: bool
    broker_provider: str
    online_sandbox_tenant_created: bool = False
    customer_account_created: bool = False
    login_enabled: bool = False
    session_cookie_issued: bool = False
    tenant_record_created: bool = False
    hosted_datastore_written: bool = False
    external_db_written: bool = False
    broker_api_called: bool = False
    broker_credentials_collected: bool = False
    order_created: bool = False
    real_money_visible: bool = False
    production_customer_onboarding_ready: bool = False
    production_trading_ready: bool = False


class HostedPaperSandboxOnboardingReadinessResponse(BaseModel):
    service: str = "hosted-paper-sandbox-onboarding-readiness"
    readiness_state: str = "contract_only_no_online_sandbox_tenant"
    summary: str
    customer_onboarding_goal: str
    current_blockers: list[str]
    capabilities: HostedPaperSandboxOnboardingCapabilities = Field(
        default_factory=HostedPaperSandboxOnboardingCapabilities
    )
    guided_demo_dataset_contract: HostedPaperGuidedDemoDatasetContract
    required_onboarding_steps: list[HostedPaperSandboxOnboardingStep]
    safety_defaults: HostedPaperSafetyDefaults
    safety_flags: HostedPaperSandboxOnboardingSafetyFlags
    docs: dict[str, str]
    warnings: list[str]


def get_hosted_paper_sandbox_onboarding_readiness(
    settings: Settings,
) -> HostedPaperSandboxOnboardingReadinessResponse:
    paper_only = (
        settings.trading_mode == "paper"
        and settings.broker_provider == "paper"
        and not settings.live_trading_enabled
    )
    return HostedPaperSandboxOnboardingReadinessResponse(
        summary=(
            "Customer self-service onboarding should move from engineering-run "
            "local backend/frontend setup to a browser-only hosted sandbox tenant. "
            "This endpoint is a read-only readiness contract only: no sandbox "
            "tenant, login, customer account, hosted datastore, broker call, or "
            "live trading path is enabled."
        ),
        customer_onboarding_goal=(
            "Provide an online Paper Only sandbox tenant with guided demo data, "
            "visible safety boundaries, and no live-trading controls."
        ),
        current_blockers=[
            "No hosted sandbox tenant provisioning exists.",
            "No customer login or session provider is enabled.",
            "No tenant-isolated managed datastore is connected.",
            "No hosted paper approval, OMS, audit, or evidence records are written.",
            (
                "Production Vercel remains a read-only UI surface unless connected "
                "to a reviewed hosted backend."
            ),
        ],
        guided_demo_dataset_contract=HostedPaperGuidedDemoDatasetContract(
            dataset_id="hosted-paper-guided-demo-contract-v1",
            dataset_status="contract_only_not_hosted",
            intended_use=(
                "Future guided customer demo data for paper approval requests, "
                "paper-only reviewer decisions, controlled paper submit, OMS "
                "timeline, audit timeline, risk evidence, and broker simulation evidence."
            ),
            records_included=[
                "sample_paper_approval_request",
                "sample_reviewer_decisions",
                "sample_paper_workflow_run",
                "sample_oms_events",
                "sample_audit_events",
                "sample_risk_evaluation",
                "sample_broker_simulation_preview",
                "sample_readiness_evidence",
            ],
            warnings=[
                "Guided demo data is a contract only and is not hosted by this release.",
                "Future demo records must remain simulated, Paper Only, and clearly labeled.",
                (
                    "Future demo records must not contain broker credentials, real "
                    "account data, or investment advice."
                ),
            ],
        ),
        required_onboarding_steps=build_required_onboarding_steps(),
        safety_defaults=HostedPaperSafetyDefaults(
            trading_mode=settings.trading_mode,
            enable_live_trading=settings.enable_live_trading,
            broker_provider=settings.broker_provider,
        ),
        safety_flags=HostedPaperSandboxOnboardingSafetyFlags(
            paper_only=paper_only,
            live_trading_enabled=settings.live_trading_enabled,
            broker_provider=settings.broker_provider,
        ),
        docs={
            "sandbox_onboarding_readiness": (
                "docs/hosted-paper-sandbox-tenant-onboarding-readiness.md"
            ),
            "hosted_paper_saas_foundation": (
                "docs/hosted-paper-saas-foundation-roadmap.md"
            ),
            "hosted_paper_environment": (
                "docs/hosted-backend-api-deployment-foundation.md"
            ),
            "customer_self_service_demo": "docs/customer-self-service-demo.md",
            "paper_shadow_live_boundary": "docs/paper-shadow-live-boundary.md",
        },
        warnings=[
            "This endpoint is read-only onboarding readiness metadata only.",
            "No online sandbox tenant is created.",
            "No customer account, reviewer account, login, or session is created.",
            "No hosted datastore is written.",
            "No broker API is called and no broker credentials are collected.",
            "No order is created and no live trading approval exists.",
            "Production Trading Platform remains NOT READY.",
            "Live trading remains disabled by default.",
        ],
    )


def build_required_onboarding_steps() -> list[HostedPaperSandboxOnboardingStep]:
    return [
        HostedPaperSandboxOnboardingStep(
            sequence=1,
            step="hosted_backend_staging",
            current_status="contract_only",
            notes=[
                "Deploy a reviewed paper-only hosted backend in staging.",
                "Production Vercel must not read local SQLite.",
            ],
        ),
        HostedPaperSandboxOnboardingStep(
            sequence=2,
            step="managed_tenant_datastore",
            current_status="migration_plan_only",
            notes=[
                "Use tenant_id on every hosted paper record.",
                "Local SQLite remains demo/dev only.",
            ],
        ),
        HostedPaperSandboxOnboardingStep(
            sequence=3,
            step="customer_login_session",
            current_status="provider_not_selected",
            notes=[
                "Use real auth/session only after provider and RBAC review.",
                "Do not collect broker credentials during sandbox onboarding.",
            ],
        ),
        HostedPaperSandboxOnboardingStep(
            sequence=4,
            step="sandbox_tenant_provisioning",
            current_status="not_enabled",
            notes=[
                "Provision a Paper Only tenant with explicit safety flags.",
                "Do not grant live approval or production trading access.",
            ],
        ),
        HostedPaperSandboxOnboardingStep(
            sequence=5,
            step="guided_demo_data",
            current_status="contract_only",
            notes=[
                "Seed simulated paper approval, OMS, audit, risk, and broker preview data.",
                "Clearly label all records as simulated and Paper Only.",
            ],
        ),
        HostedPaperSandboxOnboardingStep(
            sequence=6,
            step="customer_browser_demo_flow",
            current_status="local_demo_required_today",
            notes=[
                "Customer should eventually use only the browser.",
                "Current actual records still require local backend or future hosted backend.",
            ],
        ),
        HostedPaperSandboxOnboardingStep(
            sequence=7,
            step="security_operations_gate",
            current_status="readiness_contract_only",
            notes=[
                "Add rate limits, audit monitoring, observability, and staging smoke tests.",
                "Keep all sandbox actions Paper Only.",
            ],
        ),
    ]
