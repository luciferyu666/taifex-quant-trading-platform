import pytest

from app.domain.paper_broker_simulation import (
    PaperBrokerSimulationModelInput,
    PaperMarketSnapshot,
    simulate_paper_broker_outcome,
)
from app.domain.risk_rules import PaperOrderIntent


def _intent(
    *,
    side: str = "BUY",
    quantity: int = 2,
    symbol: str = "TMF",
) -> PaperOrderIntent:
    return PaperOrderIntent(
        order_id="paper-order-simulation-model",
        idempotency_key="paper-idem-simulation-model",
        symbol=symbol,  # type: ignore[arg-type]
        side=side,  # type: ignore[arg-type]
        quantity=quantity,
        tx_equivalent_exposure=0.05,
        paper_only=True,
    )


def _snapshot(
    *,
    bid_size: int = 5,
    ask_size: int = 5,
    liquidity_score: float = 1.0,
    quote_age_seconds: float = 0,
) -> PaperMarketSnapshot:
    return PaperMarketSnapshot(
        symbol="TMF",
        bid_price=19999,
        ask_price=20000,
        last_price=19999.5,
        bid_size=bid_size,
        ask_size=ask_size,
        liquidity_score=liquidity_score,
        quote_age_seconds=quote_age_seconds,
    )


def test_market_buy_fills_against_local_ask_liquidity() -> None:
    result = simulate_paper_broker_outcome(
        _intent(side="BUY", quantity=2),
        PaperBrokerSimulationModelInput(market_snapshot=_snapshot(ask_size=3)),
    )

    assert result.simulation_outcome == "fill"
    assert result.reference_price == 20000
    assert result.simulated_fill_price == 20000
    assert result.simulated_fill_quantity == 2
    assert result.remaining_quantity == 0
    assert result.paper_only is True
    assert result.broker_api_called is False
    assert result.production_execution_model is False


def test_limit_buy_acknowledges_without_fill_when_not_marketable() -> None:
    result = simulate_paper_broker_outcome(
        _intent(side="BUY", quantity=2),
        PaperBrokerSimulationModelInput(
            market_snapshot=_snapshot(ask_size=3),
            order_type="LIMIT",
            limit_price=19998,
        ),
    )

    assert result.simulation_outcome == "acknowledge"
    assert result.simulated_fill_price is None
    assert result.simulated_fill_quantity == 0
    assert result.remaining_quantity == 2
    assert result.checks["limit_marketable"] is False


def test_low_liquidity_score_produces_partial_fill() -> None:
    result = simulate_paper_broker_outcome(
        _intent(side="BUY", quantity=10),
        PaperBrokerSimulationModelInput(
            market_snapshot=_snapshot(ask_size=10, liquidity_score=0.3),
        ),
    )

    assert result.simulation_outcome == "partial_fill"
    assert result.simulated_fill_quantity == 3
    assert result.remaining_quantity == 7


def test_stale_quote_rejects_paper_simulation() -> None:
    result = simulate_paper_broker_outcome(
        _intent(side="SELL", quantity=1),
        PaperBrokerSimulationModelInput(
            market_snapshot=_snapshot(quote_age_seconds=10),
            stale_quote_seconds=3,
        ),
    )

    assert result.simulation_outcome == "reject"
    assert result.checks["quote_fresh"] is False
    assert result.broker_api_called is False


def test_symbol_mismatch_is_rejected_before_simulation_result() -> None:
    with pytest.raises(ValueError, match="symbol must match"):
        simulate_paper_broker_outcome(
            _intent(symbol="TX"),
            PaperBrokerSimulationModelInput(market_snapshot=_snapshot()),
        )
