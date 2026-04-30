from __future__ import annotations

import math
from typing import Literal

from pydantic import BaseModel, Field, field_validator, model_validator

from app.domain.risk_rules import PaperOrderIntent

PaperBrokerSimulationOutcome = Literal[
    "acknowledge",
    "partial_fill",
    "fill",
    "reject",
    "cancel",
]

PaperOrderType = Literal["MARKET", "LIMIT"]


class PaperMarketSnapshot(BaseModel):
    symbol: Literal["TX", "MTX", "TMF"]
    bid_price: float = Field(gt=0)
    ask_price: float = Field(gt=0)
    last_price: float = Field(gt=0)
    bid_size: int = Field(default=0, ge=0)
    ask_size: int = Field(default=0, ge=0)
    quote_age_seconds: float = Field(default=0, ge=0)
    liquidity_score: float = Field(default=1.0, ge=0, le=1)
    paper_only: bool = True

    @field_validator("paper_only")
    @classmethod
    def require_paper_only(cls, value: bool) -> bool:
        if value is not True:
            raise ValueError("paper market snapshot must remain paper_only=true")
        return value


class PaperBrokerSimulationModelInput(BaseModel):
    market_snapshot: PaperMarketSnapshot
    order_type: PaperOrderType = "MARKET"
    limit_price: float | None = Field(default=None, gt=0)
    stale_quote_seconds: int = Field(default=3, gt=0)
    max_spread_points: float = Field(default=5.0, gt=0)
    model_version: str = "paper-broker-sim-v0.1"
    paper_only: bool = True

    @field_validator("paper_only")
    @classmethod
    def require_paper_only(cls, value: bool) -> bool:
        if value is not True:
            raise ValueError("paper broker simulation must remain paper_only=true")
        return value

    @model_validator(mode="after")
    def require_limit_price_for_limit_orders(
        self,
    ) -> PaperBrokerSimulationModelInput:
        if self.order_type == "LIMIT" and self.limit_price is None:
            raise ValueError("limit_price is required for LIMIT paper simulation")
        return self


class PaperBrokerSimulationPreviewRequest(BaseModel):
    intent: PaperOrderIntent
    simulation: PaperBrokerSimulationModelInput
    paper_only: bool = True

    @field_validator("paper_only")
    @classmethod
    def require_paper_only(cls, value: bool) -> bool:
        if value is not True:
            raise ValueError("broker simulation preview must remain paper_only=true")
        return value


class PaperBrokerSimulationModelResult(BaseModel):
    model_version: str
    simulation_outcome: PaperBrokerSimulationOutcome
    reason: str
    symbol: str
    side: Literal["BUY", "SELL"]
    order_type: PaperOrderType
    limit_price: float | None
    reference_price: float | None
    simulated_fill_price: float | None
    requested_quantity: int
    simulated_fill_quantity: int
    remaining_quantity: int
    bid_price: float
    ask_price: float
    spread_points: float
    available_size: int
    liquidity_score: float
    checks: dict[str, bool]
    warnings: list[str] = Field(default_factory=list)
    paper_only: bool = True
    live_trading_enabled: bool = False
    broker_api_called: bool = False
    external_market_data_downloaded: bool = False
    production_execution_model: bool = False

    @field_validator("paper_only")
    @classmethod
    def require_paper_only(cls, value: bool) -> bool:
        if value is not True:
            raise ValueError("paper broker simulation result must remain paper_only=true")
        return value

    @field_validator("live_trading_enabled", "broker_api_called")
    @classmethod
    def require_false_safety_flags(cls, value: bool) -> bool:
        if value is not False:
            raise ValueError("paper broker simulation safety flags must remain false")
        return value


def simulate_paper_broker_outcome(
    intent: PaperOrderIntent,
    simulation: PaperBrokerSimulationModelInput,
) -> PaperBrokerSimulationModelResult:
    snapshot = simulation.market_snapshot
    if intent.symbol != snapshot.symbol:
        raise ValueError("paper broker simulation symbol must match order intent")
    if not intent.paper_only:
        raise ValueError("paper broker simulation accepts paper_only intents only")

    requested_quantity = max(0, intent.quantity)
    spread_points = round(snapshot.ask_price - snapshot.bid_price, 6)
    checks = {
        "paper_only": True,
        "symbol_matches": intent.symbol == snapshot.symbol,
        "quote_fresh": snapshot.quote_age_seconds <= simulation.stale_quote_seconds,
        "valid_spread": 0 <= spread_points <= simulation.max_spread_points,
        "has_liquidity": _available_size(intent.side, snapshot) > 0,
        "limit_marketable": True,
    }
    warnings = [
        "Paper broker simulation model uses caller-provided local snapshot only.",
        "This is not a production matching engine, broker execution report, or "
        "live liquidity model.",
    ]

    if spread_points < 0:
        checks["valid_spread"] = False
        return _result(
            intent=intent,
            simulation=simulation,
            outcome="reject",
            reason="Invalid paper market snapshot: ask_price is below bid_price.",
            reference_price=None,
            fill_price=None,
            fill_quantity=0,
            remaining_quantity=requested_quantity,
            checks=checks,
            warnings=warnings,
        )

    reference_price = snapshot.ask_price if intent.side == "BUY" else snapshot.bid_price
    available_size = _available_size(intent.side, snapshot)

    if not checks["quote_fresh"]:
        return _result(
            intent=intent,
            simulation=simulation,
            outcome="reject",
            reason="Paper broker simulation rejected stale local quote.",
            reference_price=reference_price,
            fill_price=None,
            fill_quantity=0,
            remaining_quantity=requested_quantity,
            checks=checks,
            warnings=warnings,
        )

    if not checks["valid_spread"]:
        return _result(
            intent=intent,
            simulation=simulation,
            outcome="acknowledge",
            reason="Paper order acknowledged but not filled because spread exceeds model limit.",
            reference_price=reference_price,
            fill_price=None,
            fill_quantity=0,
            remaining_quantity=requested_quantity,
            checks=checks,
            warnings=warnings,
        )

    if simulation.order_type == "LIMIT":
        checks["limit_marketable"] = _is_limit_marketable(
            side=intent.side,
            limit_price=simulation.limit_price,
            reference_price=reference_price,
        )
        if not checks["limit_marketable"]:
            return _result(
                intent=intent,
                simulation=simulation,
                outcome="acknowledge",
                reason="Paper limit order acknowledged but not marketable.",
                reference_price=reference_price,
                fill_price=None,
                fill_quantity=0,
                remaining_quantity=requested_quantity,
                checks=checks,
                warnings=warnings,
            )

    if available_size <= 0 or snapshot.liquidity_score <= 0:
        checks["has_liquidity"] = False
        return _result(
            intent=intent,
            simulation=simulation,
            outcome="acknowledge",
            reason="Paper order acknowledged but no local simulated liquidity is available.",
            reference_price=reference_price,
            fill_price=None,
            fill_quantity=0,
            remaining_quantity=requested_quantity,
            checks=checks,
            warnings=warnings,
        )

    liquidity_capacity = _liquidity_capacity(
        requested_quantity=requested_quantity,
        available_size=available_size,
        liquidity_score=snapshot.liquidity_score,
    )
    fill_quantity = min(requested_quantity, liquidity_capacity)
    if fill_quantity <= 0:
        return _result(
            intent=intent,
            simulation=simulation,
            outcome="acknowledge",
            reason="Paper order acknowledged but simulated fill quantity is zero.",
            reference_price=reference_price,
            fill_price=None,
            fill_quantity=0,
            remaining_quantity=requested_quantity,
            checks=checks,
            warnings=warnings,
        )

    outcome: PaperBrokerSimulationOutcome = (
        "fill" if fill_quantity >= requested_quantity else "partial_fill"
    )
    fill_price = _fill_price(
        side=intent.side,
        order_type=simulation.order_type,
        reference_price=reference_price,
        limit_price=simulation.limit_price,
    )
    return _result(
        intent=intent,
        simulation=simulation,
        outcome=outcome,
        reason=(
            "Paper broker simulation derived outcome from local quote, order type, "
            "available size, and liquidity score."
        ),
        reference_price=reference_price,
        fill_price=fill_price,
        fill_quantity=fill_quantity,
        remaining_quantity=max(0, requested_quantity - fill_quantity),
        checks=checks,
        warnings=warnings,
    )


def _available_size(side: str, snapshot: PaperMarketSnapshot) -> int:
    return snapshot.ask_size if side == "BUY" else snapshot.bid_size


def _is_limit_marketable(
    *,
    side: str,
    limit_price: float | None,
    reference_price: float,
) -> bool:
    if limit_price is None:
        return False
    if side == "BUY":
        return limit_price >= reference_price
    return limit_price <= reference_price


def _liquidity_capacity(
    *,
    requested_quantity: int,
    available_size: int,
    liquidity_score: float,
) -> int:
    if requested_quantity <= 0 or available_size <= 0 or liquidity_score <= 0:
        return 0
    if liquidity_score >= 0.5:
        return available_size
    return max(1, min(available_size, math.floor(requested_quantity * liquidity_score)))


def _fill_price(
    *,
    side: str,
    order_type: PaperOrderType,
    reference_price: float,
    limit_price: float | None,
) -> float:
    if order_type == "MARKET" or limit_price is None:
        return reference_price
    if side == "BUY":
        return min(reference_price, limit_price)
    return max(reference_price, limit_price)


def _result(
    *,
    intent: PaperOrderIntent,
    simulation: PaperBrokerSimulationModelInput,
    outcome: PaperBrokerSimulationOutcome,
    reason: str,
    reference_price: float | None,
    fill_price: float | None,
    fill_quantity: int,
    remaining_quantity: int,
    checks: dict[str, bool],
    warnings: list[str],
) -> PaperBrokerSimulationModelResult:
    snapshot = simulation.market_snapshot
    return PaperBrokerSimulationModelResult(
        model_version=simulation.model_version,
        simulation_outcome=outcome,
        reason=reason,
        symbol=intent.symbol,
        side=intent.side,
        order_type=simulation.order_type,
        limit_price=simulation.limit_price,
        reference_price=reference_price,
        simulated_fill_price=fill_price,
        requested_quantity=intent.quantity,
        simulated_fill_quantity=fill_quantity,
        remaining_quantity=remaining_quantity,
        bid_price=snapshot.bid_price,
        ask_price=snapshot.ask_price,
        spread_points=round(snapshot.ask_price - snapshot.bid_price, 6),
        available_size=_available_size(intent.side, snapshot),
        liquidity_score=snapshot.liquidity_score,
        checks=checks,
        warnings=warnings,
    )
