from typing import Annotated

from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field

from app.core.config import Settings, get_settings
from app.domain.exposure import ContractAllocation, allocate_tx_mtx_tmf
from app.domain.orders import OrderEvent, OrderStatus
from app.domain.risk import OrderIntent, RiskConfig, RiskDecision
from app.services.broker_gateway import PaperBrokerGateway
from app.services.market_data import MarketDataService
from app.services.oms import OMS
from app.services.risk_engine import RiskEngine

router = APIRouter(prefix="/api", tags=["roadmap"])
SettingsDep = Annotated[Settings, Depends(get_settings)]

_market_data = MarketDataService()
_oms = OMS()
_paper_broker_gateway = PaperBrokerGateway()


class PhaseStatus(BaseModel):
    phase: int
    name: str
    status: str
    safety_mode: str


class ExposureAllocationRequest(BaseModel):
    target_tx_equivalent: float = Field(ge=0)


class PaperStatusResponse(BaseModel):
    trading_mode: str
    live_trading_enabled: bool
    broker_provider: str
    max_tx_equivalent_exposure: float
    max_daily_loss_twd: int
    stale_quote_seconds: int
    message: str


def _risk_config_from_settings(settings: Settings) -> RiskConfig:
    return RiskConfig(
        max_tx_equivalent_exposure=settings.max_tx_equivalent_exposure,
        max_daily_loss_twd=settings.max_daily_loss_twd,
        stale_quote_seconds=settings.stale_quote_seconds,
        live_trading_enabled=settings.live_trading_enabled,
        trading_mode=settings.trading_mode,
        broker_provider=settings.broker_provider,
    )


@router.get("/roadmap", response_model=list[PhaseStatus])
def roadmap_status() -> list[PhaseStatus]:
    return [
        PhaseStatus(phase=0, name="Compliance Boundary", status="scaffolded", safety_mode="paper"),
        PhaseStatus(
            phase=1,
            name="Infrastructure Foundation",
            status="scaffolded",
            safety_mode="paper",
        ),
        PhaseStatus(phase=2, name="Data Platform", status="scaffolded", safety_mode="paper"),
        PhaseStatus(
            phase=3,
            name="Strategy SDK and Backtest",
            status="scaffolded",
            safety_mode="paper",
        ),
        PhaseStatus(
            phase=4,
            name="Risk / OMS / Broker Gateway",
            status="scaffolded",
            safety_mode="paper",
        ),
        PhaseStatus(
            phase=5,
            name="Command Center and Shadow Trading",
            status="scaffolded",
            safety_mode="paper/shadow",
        ),
        PhaseStatus(
            phase=6,
            name="Reliability and Go-Live Readiness",
            status="planning",
            safety_mode="readiness-only",
        ),
    ]


@router.get("/contracts")
def contracts() -> dict[str, object]:
    return {
        "symbol_group": "TAIEX_FUTURES",
        "contracts": [spec.model_dump(mode="json") for spec in _market_data.list_contract_specs()],
        "equivalence": {
            "1_TX": {"MTX": 4, "TMF": 20},
            "1_MTX": {"TMF": 5},
        },
    }


@router.post("/exposure/allocate", response_model=ContractAllocation)
def allocate_exposure(request: ExposureAllocationRequest) -> ContractAllocation:
    return allocate_tx_mtx_tmf(request.target_tx_equivalent)


@router.get("/risk/paper-status", response_model=PaperStatusResponse)
def paper_risk_status(settings: SettingsDep) -> PaperStatusResponse:
    return PaperStatusResponse(
        trading_mode=settings.trading_mode,
        live_trading_enabled=settings.live_trading_enabled,
        broker_provider=settings.broker_provider,
        max_tx_equivalent_exposure=settings.max_tx_equivalent_exposure,
        max_daily_loss_twd=settings.max_daily_loss_twd,
        stale_quote_seconds=settings.stale_quote_seconds,
        message="Paper-only roadmap implementation. Live trading is disabled by default.",
    )


@router.post("/risk/evaluate-paper-order", response_model=RiskDecision)
def evaluate_paper_order(order_intent: OrderIntent, settings: SettingsDep) -> RiskDecision:
    risk_engine = RiskEngine(_risk_config_from_settings(settings))
    return risk_engine.evaluate_order_intent(order_intent)


@router.post("/paper/orders")
def create_paper_order(order_intent: OrderIntent, settings: SettingsDep) -> dict[str, object]:
    risk_engine = RiskEngine(_risk_config_from_settings(settings))
    decision = risk_engine.evaluate_order_intent(order_intent)
    if not decision.approved:
        return {
            "paper_only": True,
            "accepted": False,
            "risk_decision": decision.model_dump(),
            "broker_acknowledgement": None,
            "message": "Paper order rejected by Risk Engine. No broker call was made.",
        }

    order = _oms.create_order_intent(order_intent)
    _oms.apply_event(
        OrderEvent(
            order_id=order.order_id,
            status=OrderStatus.RISK_CHECKED,
            message="Risk Engine approved paper order intent.",
        )
    )
    acknowledgement = _paper_broker_gateway.submit_order(order_intent)
    _oms.apply_event(
        OrderEvent(
            order_id=order.order_id,
            status=OrderStatus.ACKNOWLEDGED,
            message="Paper broker acknowledged simulated order.",
            details=acknowledgement,
        )
    )

    return {
        "paper_only": True,
        "accepted": True,
        "order_id": order.order_id,
        "oms_status": _oms.current_status(order.order_id),
        "risk_decision": decision.model_dump(),
        "broker_acknowledgement": acknowledgement,
        "events": [
            event.model_dump(mode="json") for event in _oms.events_for_order(order.order_id)
        ],
        "message": "Paper order simulated. No real order was placed.",
    }
