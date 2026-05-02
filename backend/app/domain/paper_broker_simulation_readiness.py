from __future__ import annotations

from pydantic import BaseModel, Field

from app.core.config import Settings
from app.domain.hosted_paper_readiness import HostedPaperSafetyDefaults


class PaperBrokerSimulationReadinessCapabilities(BaseModel):
    deterministic_broker_simulation_enabled: bool = True
    local_quote_snapshot_preview_enabled: bool = True
    paper_ack_reject_partial_fill_fill_cancel_enabled: bool = True
    caller_provided_quote_only: bool = True
    real_market_matching_engine_enabled: bool = False
    exchange_order_book_replay_enabled: bool = False
    broker_execution_report_model_enabled: bool = False
    latency_queue_position_model_enabled: bool = False
    slippage_liquidity_calibration_enabled: bool = False
    real_account_reconciliation_enabled: bool = False
    production_execution_model: bool = False


class PaperBrokerSimulationReadinessSafetyFlags(BaseModel):
    paper_only: bool
    read_only: bool = True
    live_trading_enabled: bool
    broker_provider: str
    broker_api_called: bool = False
    external_market_data_downloaded: bool = False
    real_order_created: bool = False
    order_created: bool = False
    credentials_collected: bool = False
    database_written: bool = False
    external_db_written: bool = False
    production_execution_model: bool = False
    production_trading_ready: bool = False


class PaperBrokerSimulationReadinessResponse(BaseModel):
    service: str = "paper-broker-simulation-readiness"
    readiness_state: str = (
        "local_paper_simulation_not_market_matching_or_broker_execution"
    )
    summary: str
    capabilities: PaperBrokerSimulationReadinessCapabilities = Field(
        default_factory=PaperBrokerSimulationReadinessCapabilities
    )
    safety_defaults: HostedPaperSafetyDefaults
    safety_flags: PaperBrokerSimulationReadinessSafetyFlags
    current_scope: list[str]
    missing_for_production_execution_model: list[str]
    required_before_production_execution_model: list[str]
    docs: dict[str, str]
    warnings: list[str]


CURRENT_SCOPE = [
    "Deterministic broker_simulation outcomes for paper workflow tests.",
    "Caller-provided local quote snapshot preview.",
    "Paper-only simulated ack/reject/partial_fill/fill/cancel outcomes.",
    "Evidence export and local JSON evidence viewer for paper simulation previews.",
]


MISSING_FOR_PRODUCTION_EXECUTION_MODEL = [
    "Real market matching engine.",
    "Exchange order book replay.",
    "Broker execution report ingestion and normalization.",
    "Latency and queue position model.",
    "Slippage and liquidity calibration against historical/market data.",
    "Real account, order, fill, and position reconciliation.",
    "Broker-specific rejection, cancel, amend, and replace semantics.",
    "Operational monitoring and incident runbooks for execution simulation.",
]


REQUIRED_BEFORE_PRODUCTION_EXECUTION_MODEL = [
    "Define broker execution report schema behind broker-gateway.",
    "Define market data and order book replay sources with data licensing review.",
    "Design latency, queue position, slippage, and liquidity model assumptions.",
    "Add reconciliation loop between platform orders, simulated reports, and account state.",
    "Add failure, replay, duplicate, and recovery tests.",
    "Complete security, operations, legal, and compliance review before live use.",
]


def get_paper_broker_simulation_readiness(
    settings: Settings,
) -> PaperBrokerSimulationReadinessResponse:
    paper_only = (
        settings.trading_mode == "paper"
        and settings.broker_provider == "paper"
        and not settings.live_trading_enabled
    )
    return PaperBrokerSimulationReadinessResponse(
        summary=(
            "The current Paper Broker Gateway simulation is deterministic and "
            "can optionally use a caller-provided local quote snapshot. It is "
            "useful for Paper Only demos and review, but it is not real market "
            "matching, a broker execution report model, or a production execution model."
        ),
        safety_defaults=HostedPaperSafetyDefaults(
            trading_mode=settings.trading_mode,
            enable_live_trading=settings.enable_live_trading,
            broker_provider=settings.broker_provider,
        ),
        safety_flags=PaperBrokerSimulationReadinessSafetyFlags(
            paper_only=paper_only,
            live_trading_enabled=settings.live_trading_enabled,
            broker_provider=settings.broker_provider,
        ),
        current_scope=CURRENT_SCOPE,
        missing_for_production_execution_model=(
            MISSING_FOR_PRODUCTION_EXECUTION_MODEL
        ),
        required_before_production_execution_model=(
            REQUIRED_BEFORE_PRODUCTION_EXECUTION_MODEL
        ),
        docs={
            "broker_gateway_adapter_pattern": "docs/broker-gateway-adapter-pattern.md",
            "phase_4_risk_oms_broker_gateway": (
                "docs/phase-4-risk-oms-broker-gateway.md"
            ),
            "phase_5_command_center": (
                "docs/phase-5-command-center-shadow-trading.md"
            ),
            "paper_shadow_live_boundary": "docs/paper-shadow-live-boundary.md",
        },
        warnings=[
            "This endpoint is read-only broker simulation readiness metadata only.",
            "Paper fills are simulated metadata, not real market fills.",
            (
                "Local quote-based preview uses caller-provided values only and "
                "does not download market data."
            ),
            (
                "The current model is not a production matching engine, broker "
                "execution report model, or live liquidity model."
            ),
            "Production Trading Platform remains NOT READY.",
        ],
    )
