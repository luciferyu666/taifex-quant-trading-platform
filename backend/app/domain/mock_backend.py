from __future__ import annotations

import hashlib
import json
from datetime import UTC, datetime, timedelta
from typing import Any, Literal

from pydantic import BaseModel, Field, field_validator

from app.core.config import Settings
from app.domain.order_state_machine import (
    OrderEvent,
    OrderEventType,
    OrderState,
    apply_order_event,
    new_order_state,
)
from app.domain.paper_broker_simulation import (
    PaperBrokerSimulationModelInput,
    PaperBrokerSimulationModelResult,
    PaperMarketSnapshot,
    simulate_paper_broker_outcome,
)
from app.domain.risk_rules import (
    PaperOrderIntent,
    RiskEvaluation,
    RiskPolicy,
    evaluate_paper_order,
)
from app.domain.signals import StrategySignal
from app.services.paper_broker_gateway import PaperBrokerAck, PaperBrokerGateway

MockSymbol = Literal["TX", "MTX", "TMF"]
MockDirection = Literal["LONG", "SHORT", "FLAT"]
MockSide = Literal["BUY", "SELL"]


POINT_VALUE_TWD: dict[str, int] = {"TX": 200, "MTX": 50, "TMF": 10}
TX_EQUIVALENT_RATIO: dict[str, float] = {"TX": 1.0, "MTX": 0.25, "TMF": 0.05}


class MockBackendSafetyFlags(BaseModel):
    paper_only: bool = True
    mock_backend: bool = True
    deterministic_data: bool = True
    live_trading_enabled: bool = False
    broker_api_called: bool = False
    external_market_data_downloaded: bool = False
    real_order_created: bool = False
    credentials_collected: bool = False
    production_trading_ready: bool = False
    investment_advice: bool = False


class MockBackendStatus(BaseModel):
    service: str = "mock-backend-demo-mvp"
    status: str = "enabled_local_deterministic_mock"
    trading_mode: str
    broker_provider: str
    capabilities: list[str]
    safety_flags: MockBackendSafetyFlags
    warnings: list[str]


class MockMarketDataPoint(BaseModel):
    symbol: MockSymbol
    tick: int = Field(ge=0)
    bid: float = Field(gt=0)
    ask: float = Field(gt=0)
    last: float = Field(gt=0)
    previous_last: float = Field(gt=0)
    change_points: float
    bid_size: int = Field(ge=0)
    ask_size: int = Field(ge=0)
    quote_age_seconds: float = Field(ge=0)
    liquidity_score: float = Field(ge=0, le=1)
    paper_only: bool = True
    external_market_data_downloaded: bool = False


class MockMarketDataPreview(BaseModel):
    generated_at: datetime = Field(default_factory=lambda: datetime.now(UTC))
    tick: int = Field(ge=0)
    price_path: str = "deterministic_local_mock"
    snapshots: list[MockMarketDataPoint]
    safety_flags: MockBackendSafetyFlags = Field(default_factory=MockBackendSafetyFlags)
    warnings: list[str]


class MockStrategyRunRequest(BaseModel):
    symbol: MockSymbol = "TMF"
    tick: int = Field(default=1, ge=0)
    strategy_id: str = "mock-momentum-demo"
    strategy_version: str = "0.1.0"
    paper_only: bool = True

    @field_validator("paper_only")
    @classmethod
    def require_paper_only(cls, value: bool) -> bool:
        if value is not True:
            raise ValueError("mock strategy run must remain paper_only=true")
        return value


class MockStrategyRunResponse(BaseModel):
    signal: StrategySignal
    market_snapshot: MockMarketDataPoint
    safety_flags: MockBackendSafetyFlags = Field(default_factory=MockBackendSafetyFlags)
    warnings: list[str]


class MockOrderSimulationRequest(BaseModel):
    symbol: MockSymbol = "TMF"
    tick: int = Field(default=1, ge=0)
    quantity: int = Field(default=1, gt=0, le=20)
    direction: MockDirection = "LONG"
    strategy_signal: StrategySignal | None = None
    paper_only: bool = True

    @field_validator("paper_only")
    @classmethod
    def require_paper_only(cls, value: bool) -> bool:
        if value is not True:
            raise ValueError("mock order simulation must remain paper_only=true")
        return value


class MockPortfolioState(BaseModel):
    account_id: str = "mock-paper-account"
    symbol: str | None = None
    position_contracts: int = 0
    tx_equivalent_position: float = 0
    average_price: float | None = None
    mark_price: float | None = None
    unrealized_pnl_twd: float = 0
    realized_pnl_twd: float = 0
    cash_twd: float = 1_000_000
    equity_twd: float = 1_000_000
    paper_only: bool = True
    real_money: bool = False


class MockOrderSimulationResponse(BaseModel):
    workflow_run_id: str
    signal: StrategySignal
    market_snapshot: MockMarketDataPoint
    paper_order_intent: PaperOrderIntent
    risk_evaluation: RiskEvaluation
    oms_state: OrderState
    paper_broker_ack: PaperBrokerAck | None = None
    paper_broker_simulation_result: PaperBrokerSimulationModelResult | None = None
    portfolio: MockPortfolioState
    safety_flags: MockBackendSafetyFlags = Field(default_factory=MockBackendSafetyFlags)
    warnings: list[str]


class MockDemoSession(BaseModel):
    session_id: str = "mock-demo-session-local"
    current_tick: int = 0
    market_data: MockMarketDataPreview
    latest_signal: StrategySignal | None = None
    latest_order: MockOrderSimulationResponse | None = None
    portfolio: MockPortfolioState = Field(default_factory=MockPortfolioState)
    safety_flags: MockBackendSafetyFlags = Field(default_factory=MockBackendSafetyFlags)
    warnings: list[str]


def mock_backend_status(settings: Settings) -> MockBackendStatus:
    return MockBackendStatus(
        trading_mode=settings.trading_mode,
        broker_provider=settings.broker_provider,
        capabilities=[
            "deterministic TX/MTX/TMF market data",
            "signal-only mock strategy run",
            "paper-only order simulation through Risk Engine, OMS, and Paper Gateway",
            "paper-only portfolio summary",
            "in-memory demo session reset",
        ],
        safety_flags=_safety_flags(settings),
        warnings=_warnings(),
    )


def market_data_preview(tick: int = 0) -> MockMarketDataPreview:
    safe_tick = max(0, tick)
    return MockMarketDataPreview(
        generated_at=datetime(2026, 1, 1, tzinfo=UTC) + timedelta(seconds=safe_tick),
        tick=safe_tick,
        snapshots=[
            _market_snapshot("TX", safe_tick),
            _market_snapshot("MTX", safe_tick),
            _market_snapshot("TMF", safe_tick),
        ],
        warnings=_warnings(),
    )


def run_mock_strategy(
    request: MockStrategyRunRequest,
    settings: Settings,
) -> MockStrategyRunResponse:
    snapshot = _market_snapshot(request.symbol, request.tick)
    direction = _direction_from_snapshot(snapshot)
    target_tx_equivalent = 0.0 if direction == "FLAT" else min(
        TX_EQUIVALENT_RATIO[request.symbol] * 1,
        settings.max_tx_equivalent_exposure,
    )
    signal = StrategySignal(
        signal_id=f"mock-signal-{_digest(snapshot.model_dump(mode='json'))[:16]}",
        strategy_id=request.strategy_id,
        strategy_version=request.strategy_version,
        timestamp=datetime.now(UTC),
        direction=direction,
        target_tx_equivalent=target_tx_equivalent,
        confidence=0.65 if direction != "FLAT" else 0.2,
        reason={
            "source": "mock_backend_deterministic_price_path",
            "signals_only": True,
            "order_created": False,
            "broker_api_called": False,
            "risk_engine_called": False,
            "oms_called": False,
            "external_market_data_downloaded": False,
            "not_investment_advice": True,
        },
    )
    return MockStrategyRunResponse(
        signal=signal,
        market_snapshot=snapshot,
        safety_flags=_safety_flags(settings),
        warnings=[
            *_warnings(),
            "Mock strategy output is a demo signal only and is not investment advice.",
        ],
    )


def simulate_mock_order(
    request: MockOrderSimulationRequest,
    settings: Settings,
) -> MockOrderSimulationResponse:
    signal = request.strategy_signal or run_mock_strategy(
        MockStrategyRunRequest(symbol=request.symbol, tick=request.tick),
        settings,
    ).signal
    if request.direction != "FLAT":
        signal = signal.model_copy(update={"direction": request.direction})
    if signal.direction == "FLAT":
        raise ValueError("Mock order simulation requires LONG or SHORT signal direction")

    snapshot = _market_snapshot(request.symbol, request.tick)
    side: MockSide = "BUY" if signal.direction == "LONG" else "SELL"
    tx_exposure = TX_EQUIVALENT_RATIO[request.symbol] * request.quantity
    reference_price = snapshot.ask if side == "BUY" else snapshot.bid
    intent_core = {
        "symbol": request.symbol,
        "tick": request.tick,
        "side": side,
        "quantity": request.quantity,
        "signal_id": signal.signal_id,
        "paper_only": True,
    }
    digest = _digest(intent_core)
    intent = PaperOrderIntent(
        order_id=f"mock-paper-order-{digest[:16]}",
        idempotency_key=f"mock-paper-idem-{digest[16:32]}",
        symbol=request.symbol,
        side=side,
        quantity=request.quantity,
        tx_equivalent_exposure=tx_exposure,
        quote_age_seconds=snapshot.quote_age_seconds,
        order_price=reference_price,
        reference_price=reference_price,
        paper_only=True,
        source_signal_id=signal.signal_id,
        strategy_id=signal.strategy_id,
        strategy_version=signal.strategy_version,
        approval_id="mock-demo-paper-approval",
    )
    risk_policy = RiskPolicy(
        trading_mode=settings.trading_mode,
        live_trading_enabled=settings.live_trading_enabled,
        broker_provider=settings.broker_provider,
        max_tx_equivalent_exposure=settings.max_tx_equivalent_exposure,
        max_daily_loss_twd=settings.max_daily_loss_twd,
        stale_quote_seconds=settings.stale_quote_seconds,
    )
    risk_evaluation = evaluate_paper_order(intent, risk_policy)
    oms_state = new_order_state(intent.order_id, intent.idempotency_key)
    oms_state = _apply_event(oms_state, OrderEventType.CREATE)
    paper_ack = None
    simulation_result = None
    if not risk_evaluation.approved:
        oms_state = _apply_event(
            oms_state,
            OrderEventType.RISK_REJECT,
            reason=risk_evaluation.reason,
        )
    else:
        oms_state = _apply_event(oms_state, OrderEventType.RISK_APPROVE)
        oms_state = _apply_event(oms_state, OrderEventType.SUBMIT)
        simulation_input = PaperBrokerSimulationModelInput(
            market_snapshot=PaperMarketSnapshot(
                symbol=request.symbol,
                bid_price=snapshot.bid,
                ask_price=snapshot.ask,
                last_price=snapshot.last,
                bid_size=snapshot.bid_size,
                ask_size=snapshot.ask_size,
                quote_age_seconds=snapshot.quote_age_seconds,
                liquidity_score=snapshot.liquidity_score,
            ),
            order_type="MARKET",
        )
        simulation_result = simulate_paper_broker_outcome(intent, simulation_input)
        paper_ack = PaperBrokerGateway().submit_order(
            intent,
            risk_evaluation,
            simulation=simulation_result.simulation_outcome,
            simulation_model_payload=simulation_result.model_dump(mode="json"),
        )
        oms_state = _apply_broker_result(
            oms_state,
            simulation_result,
            reason=paper_ack.message,
        )

    portfolio = _portfolio_from_order(
        symbol=request.symbol,
        side=side,
        snapshot=snapshot,
        simulation_result=simulation_result,
    )
    return MockOrderSimulationResponse(
        workflow_run_id=f"mock-workflow-{digest[:16]}",
        signal=signal,
        market_snapshot=snapshot,
        paper_order_intent=intent,
        risk_evaluation=risk_evaluation,
        oms_state=oms_state,
        paper_broker_ack=paper_ack,
        paper_broker_simulation_result=simulation_result,
        portfolio=portfolio,
        safety_flags=_safety_flags(settings),
        warnings=_warnings(),
    )


class MockBackendDemoSessionStore:
    def __init__(self) -> None:
        self._session = self.reset()

    def get(self) -> MockDemoSession:
        return self._session

    def next_tick(self) -> MockDemoSession:
        next_tick = self._session.current_tick + 1
        self._session = self._session.model_copy(
            update={
                "current_tick": next_tick,
                "market_data": market_data_preview(next_tick),
            }
        )
        return self._session

    def set_signal(self, response: MockStrategyRunResponse) -> MockDemoSession:
        self._session = self._session.model_copy(
            update={
                "current_tick": response.market_snapshot.tick,
                "market_data": market_data_preview(response.market_snapshot.tick),
                "latest_signal": response.signal,
            }
        )
        return self._session

    def set_order(self, response: MockOrderSimulationResponse) -> MockDemoSession:
        self._session = self._session.model_copy(
            update={
                "current_tick": response.market_snapshot.tick,
                "market_data": market_data_preview(response.market_snapshot.tick),
                "latest_signal": response.signal,
                "latest_order": response,
                "portfolio": response.portfolio,
            }
        )
        return self._session

    def reset(self) -> MockDemoSession:
        self._session = MockDemoSession(
            current_tick=0,
            market_data=market_data_preview(0),
            warnings=_warnings(),
        )
        return self._session


def _market_snapshot(symbol: MockSymbol, tick: int) -> MockMarketDataPoint:
    base = 20_000.0
    drift = (tick // 6) * 1.5
    wave = [0.0, 4.0, 7.5, 3.0, -2.5, -5.0][tick % 6]
    symbol_offset = {"TX": 0.0, "MTX": -1.0, "TMF": -1.5}[symbol]
    last = round(base + drift + wave + symbol_offset, 2)
    previous_wave = [0.0, 4.0, 7.5, 3.0, -2.5, -5.0][max(0, tick - 1) % 6]
    previous_drift = (max(0, tick - 1) // 6) * 1.5
    previous_last = round(base + previous_drift + previous_wave + symbol_offset, 2)
    spread = {"TX": 1.0, "MTX": 0.5, "TMF": 0.2}[symbol]
    bid_size = 2 + (tick % 4)
    ask_size = 2 + ((tick + 1) % 4)
    return MockMarketDataPoint(
        symbol=symbol,
        tick=tick,
        bid=round(last - spread / 2, 2),
        ask=round(last + spread / 2, 2),
        last=last,
        previous_last=previous_last,
        change_points=round(last - previous_last, 2),
        bid_size=bid_size,
        ask_size=ask_size,
        quote_age_seconds=float(tick % 3),
        liquidity_score=round(0.35 + ((tick % 5) * 0.15), 2),
    )


def _direction_from_snapshot(snapshot: MockMarketDataPoint) -> MockDirection:
    if snapshot.change_points > 0:
        return "LONG"
    if snapshot.change_points < 0:
        return "SHORT"
    return "FLAT"


def _apply_event(
    state: OrderState,
    event_type: OrderEventType,
    reason: str | None = None,
) -> OrderState:
    return apply_order_event(
        state,
        OrderEvent(
            event_id=f"{state.order_id}-{len(state.history) + 1}-{event_type.value}",
            order_id=state.order_id,
            event_type=event_type,
            reason=reason,
            payload={"paper_only": True, "mock_backend": True},
        ),
    )


def _apply_broker_result(
    state: OrderState,
    result: PaperBrokerSimulationModelResult,
    reason: str,
) -> OrderState:
    if result.simulation_outcome == "reject":
        return _apply_event(state, OrderEventType.REJECT, reason=reason)

    state = _apply_event(state, OrderEventType.ACKNOWLEDGE, reason=reason)
    if result.simulation_outcome == "partial_fill":
        return _apply_event(state, OrderEventType.PARTIAL_FILL, reason=reason)
    if result.simulation_outcome == "fill":
        return _apply_event(state, OrderEventType.FILL, reason=reason)
    if result.simulation_outcome == "cancel":
        state = _apply_event(state, OrderEventType.CANCEL_REQUEST, reason=reason)
        return _apply_event(state, OrderEventType.CANCEL, reason=reason)
    return state


def _portfolio_from_order(
    *,
    symbol: MockSymbol,
    side: MockSide,
    snapshot: MockMarketDataPoint,
    simulation_result: PaperBrokerSimulationModelResult | None,
) -> MockPortfolioState:
    if simulation_result is None or simulation_result.simulated_fill_quantity <= 0:
        return MockPortfolioState(symbol=symbol, mark_price=snapshot.last)
    signed_contracts = (
        simulation_result.simulated_fill_quantity
        if side == "BUY"
        else -simulation_result.simulated_fill_quantity
    )
    average_price = simulation_result.simulated_fill_price or snapshot.last
    point_value = POINT_VALUE_TWD[symbol]
    unrealized = round((snapshot.last - average_price) * signed_contracts * point_value, 2)
    equity = round(1_000_000 + unrealized, 2)
    return MockPortfolioState(
        symbol=symbol,
        position_contracts=signed_contracts,
        tx_equivalent_position=round(
            signed_contracts * TX_EQUIVALENT_RATIO[symbol],
            4,
        ),
        average_price=average_price,
        mark_price=snapshot.last,
        unrealized_pnl_twd=unrealized,
        realized_pnl_twd=0,
        equity_twd=equity,
    )


def _safety_flags(settings: Settings) -> MockBackendSafetyFlags:
    return MockBackendSafetyFlags(
        live_trading_enabled=settings.live_trading_enabled,
        broker_api_called=False,
        external_market_data_downloaded=False,
        real_order_created=False,
        credentials_collected=False,
        production_trading_ready=False,
        investment_advice=False,
    )


def _warnings() -> list[str]:
    return [
        "Mock Backend uses deterministic local demo data only.",
        "No real broker, external market data, real money, or live trading path is used.",
        "Simulation output is for product demonstration only and is not investment advice.",
    ]


def _digest(payload: dict[str, Any]) -> str:
    encoded = json.dumps(payload, sort_keys=True, separators=(",", ":")).encode("utf-8")
    return hashlib.sha256(encoded).hexdigest()
