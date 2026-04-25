from typing import Annotated, Any

from fastapi import APIRouter, Depends
from pydantic import BaseModel

from app.core.config import Settings, get_settings
from app.domain.allocator import (
    CONTRACT_SPECS,
    AllocationInput,
    AllocationResult,
    allocate_tx_mtx_tmf,
)
from app.domain.risk_rules import (
    PaperOrderIntent,
    RiskEvaluation,
    RiskPolicy,
    evaluate_paper_order,
)
from app.services.paper_broker_gateway import PaperBrokerAck, PaperBrokerGateway
from app.services.reconciliation import (
    PositionSnapshot,
    ReconciliationResult,
    ReconciliationService,
)

router = APIRouter(prefix="/api/architecture", tags=["architecture"])
SettingsDep = Annotated[Settings, Depends(get_settings)]


class ArchitectureSpecResponse(BaseModel):
    platform_name: str
    architecture_version: str
    safety_mode: str
    live_trading_enabled: bool
    planes: list[str]
    core_modules: list[str]
    docs: dict[str, str]


class PaperBrokerSubmitResponse(BaseModel):
    paper_only: bool
    risk_evaluation: RiskEvaluation
    paper_ack: PaperBrokerAck | None
    message: str


class ReconciliationCompareRequest(BaseModel):
    platform: PositionSnapshot
    broker: PositionSnapshot


def _risk_policy_from_settings(settings: Settings) -> RiskPolicy:
    return RiskPolicy(
        trading_mode=settings.trading_mode,
        live_trading_enabled=settings.live_trading_enabled,
        broker_provider=settings.broker_provider,
        max_tx_equivalent_exposure=settings.max_tx_equivalent_exposure,
        max_daily_loss_twd=settings.max_daily_loss_twd,
        stale_quote_seconds=settings.stale_quote_seconds,
    )


@router.get("/spec", response_model=ArchitectureSpecResponse)
def architecture_spec(settings: SettingsDep) -> ArchitectureSpecResponse:
    return ArchitectureSpecResponse(
        platform_name="taifex-quant-trading-platform",
        architecture_version="phase-0-6-scaffold",
        safety_mode="paper-only",
        live_trading_enabled=settings.live_trading_enabled,
        planes=["control_plane", "trading_data_plane"],
        core_modules=[
            "identity_service",
            "strategy_registry",
            "market_data_service",
            "data_pipeline",
            "strategy_sdk",
            "backtest_service",
            "risk_engine",
            "oms",
            "broker_gateway",
            "position_service",
            "audit_service",
            "web_command_center",
        ],
        docs={
            "system_architecture": "docs/system-architecture-spec.md",
            "control_plane": "docs/control-plane.md",
            "trading_data_plane": "docs/trading-data-plane.md",
            "data_lakehouse": "docs/data-lakehouse-architecture.md",
            "oms": "docs/oms-state-machine.md",
            "broker_gateway": "docs/broker-gateway-adapter-pattern.md",
            "risk_engine": "docs/risk-engine-spec.md",
            "security": "docs/security-vault-asvs.md",
            "observability": "docs/observability-dr-event-sourcing.md",
        },
    )


@router.get("/contracts")
def architecture_contracts() -> dict[str, Any]:
    return {
        "symbol_group": "TAIEX_FUTURES",
        "contracts": [
            spec.model_dump(mode="json") for spec in CONTRACT_SPECS.values()
        ],
        "equivalence": {
            "1_TX": {"MTX": 4, "TMF": 20},
            "1_MTX": {"TMF": 5},
        },
        "execution_price_rule": (
            "Paper/live simulation must use real contract symbols and real-contract prices."
        ),
    }


@router.post("/allocator/preview", response_model=AllocationResult)
def allocation_preview(request: AllocationInput) -> AllocationResult:
    return allocate_tx_mtx_tmf(request)


@router.get("/risk/policy", response_model=RiskPolicy)
def architecture_risk_policy(settings: SettingsDep) -> RiskPolicy:
    return _risk_policy_from_settings(settings)


@router.post("/risk/evaluate", response_model=RiskEvaluation)
def architecture_risk_evaluate(
    intent: PaperOrderIntent,
    settings: SettingsDep,
) -> RiskEvaluation:
    return evaluate_paper_order(intent, _risk_policy_from_settings(settings))


@router.post("/paper-broker/submit", response_model=PaperBrokerSubmitResponse)
def architecture_paper_broker_submit(
    intent: PaperOrderIntent,
    settings: SettingsDep,
) -> PaperBrokerSubmitResponse:
    risk_evaluation = evaluate_paper_order(intent, _risk_policy_from_settings(settings))
    if not risk_evaluation.approved:
        return PaperBrokerSubmitResponse(
            paper_only=True,
            risk_evaluation=risk_evaluation,
            paper_ack=None,
            message="Paper order rejected by Risk Engine. No broker gateway call was made.",
        )

    ack = PaperBrokerGateway().submit_order(intent, risk_evaluation)
    return PaperBrokerSubmitResponse(
        paper_only=True,
        risk_evaluation=risk_evaluation,
        paper_ack=ack,
        message="Paper broker simulated acknowledgement only. No real order was placed.",
    )


@router.post("/reconciliation/compare", response_model=ReconciliationResult)
def architecture_reconciliation_compare(
    request: ReconciliationCompareRequest,
) -> ReconciliationResult:
    return ReconciliationService().compare(request.platform, request.broker)
