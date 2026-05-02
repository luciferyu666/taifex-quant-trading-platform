from __future__ import annotations

from pydantic import BaseModel, Field

from app.core.config import Settings
from app.domain.hosted_paper_readiness import HostedPaperSafetyDefaults


class PaperRiskCrossAccountReadinessCapabilities(BaseModel):
    local_paper_guardrails_enabled: bool = True
    local_paper_state_enabled: bool = True
    single_account_demo_state_enabled: bool = True
    risk_evaluation_detail_enabled: bool = True
    duplicate_idempotency_local_check_enabled: bool = True
    cross_account_aggregation_enabled: bool = False
    account_hierarchy_enabled: bool = False
    tenant_isolated_risk_state_enabled: bool = False
    real_account_margin_feed_enabled: bool = False
    broker_position_feed_enabled: bool = False
    centralized_risk_limits_enabled: bool = False
    distributed_kill_switch_enabled: bool = False
    durable_risk_state_store_enabled: bool = False
    real_time_equity_pnl_tracking_enabled: bool = False
    production_cross_account_risk_system: bool = False


class PaperRiskCrossAccountReadinessSafetyFlags(BaseModel):
    paper_only: bool
    read_only: bool = True
    live_trading_enabled: bool
    broker_provider: str
    broker_api_called: bool = False
    external_account_data_loaded: bool = False
    real_account_data_loaded: bool = False
    order_created: bool = False
    credentials_collected: bool = False
    database_written: bool = False
    hosted_datastore_written: bool = False
    production_risk_approval: bool = False
    production_cross_account_risk: bool = False
    production_trading_ready: bool = False


class PaperRiskCrossAccountReadinessResponse(BaseModel):
    service: str = "paper-risk-cross-account-readiness"
    readiness_state: str = "local_paper_risk_state_not_cross_account_risk_system"
    summary: str
    capabilities: PaperRiskCrossAccountReadinessCapabilities = Field(
        default_factory=PaperRiskCrossAccountReadinessCapabilities
    )
    safety_defaults: HostedPaperSafetyDefaults
    safety_flags: PaperRiskCrossAccountReadinessSafetyFlags
    current_scope: list[str]
    missing_for_cross_account_risk: list[str]
    required_before_cross_account_risk: list[str]
    docs: dict[str, str]
    warnings: list[str]


CURRENT_SCOPE = [
    "Paper-only guardrail evaluation for local simulation workflows.",
    "Local in-memory paper risk state for demo and engineering checks.",
    "Single-account style paper state snapshot in the current Web Command Center.",
    "RiskEvaluation detail output for explainable paper-only checks.",
    "Local duplicate idempotency key checks inside paper evaluation state.",
]


MISSING_FOR_CROSS_ACCOUNT_RISK = [
    "Tenant and account hierarchy with enforced isolation.",
    "Cross-account exposure aggregation by customer, strategy, symbol, and contract.",
    "Per-account and group-level risk limit registry.",
    "Real account margin, equity, cash, PnL, order, fill, and position feeds.",
    "Broker-side position and order reconciliation per account.",
    "Centralized durable risk state store with replay and recovery.",
    "Distributed kill switch propagation across accounts and strategy runners.",
    "Formal RBAC/ABAC policy for risk administrators and reviewers.",
    "Operational monitoring, alerting, escalation, and incident runbooks.",
]


REQUIRED_BEFORE_CROSS_ACCOUNT_RISK = [
    "Define tenant, account, portfolio, strategy, and reviewer identity model.",
    "Design account-scoped and group-scoped risk limit schemas.",
    "Select reviewed durable storage for cross-account risk state.",
    "Integrate broker/account feeds behind broker-gateway with credential isolation.",
    "Implement reconciliation between platform state, broker state, and risk state.",
    "Implement audited risk-limit change workflow with reviewer roles.",
    "Add failure, replay, stale-state, duplicate, and concurrency tests.",
    "Complete security, operations, legal, and compliance review before hosted use.",
]


def get_paper_risk_cross_account_readiness(
    settings: Settings,
) -> PaperRiskCrossAccountReadinessResponse:
    paper_only = (
        settings.trading_mode == "paper"
        and settings.broker_provider == "paper"
        and not settings.live_trading_enabled
    )
    return PaperRiskCrossAccountReadinessResponse(
        summary=(
            "The current Risk Engine guardrails are paper-only and use local "
            "state for demo and engineering review. They are useful for Paper "
            "Only simulation checks, but they are not a formal cross-account "
            "risk system."
        ),
        safety_defaults=HostedPaperSafetyDefaults(
            trading_mode=settings.trading_mode,
            enable_live_trading=settings.enable_live_trading,
            broker_provider=settings.broker_provider,
        ),
        safety_flags=PaperRiskCrossAccountReadinessSafetyFlags(
            paper_only=paper_only,
            live_trading_enabled=settings.live_trading_enabled,
            broker_provider=settings.broker_provider,
        ),
        current_scope=CURRENT_SCOPE,
        missing_for_cross_account_risk=MISSING_FOR_CROSS_ACCOUNT_RISK,
        required_before_cross_account_risk=REQUIRED_BEFORE_CROSS_ACCOUNT_RISK,
        docs={
            "risk_engine_spec": "docs/risk-engine-spec.md",
            "phase_4_risk_oms_broker_gateway": (
                "docs/phase-4-risk-oms-broker-gateway.md"
            ),
            "phase_5_command_center": (
                "docs/phase-5-command-center-shadow-trading.md"
            ),
            "paper_shadow_live_boundary": "docs/paper-shadow-live-boundary.md",
        },
        warnings=[
            "This endpoint is read-only cross-account risk readiness metadata only.",
            "Local paper risk state is not a hosted or cross-account risk store.",
            "No real account margin, position, order, fill, equity, or PnL feeds are loaded.",
            "Risk results are not production risk approval.",
            "Production Trading Platform remains NOT READY.",
        ],
    )
