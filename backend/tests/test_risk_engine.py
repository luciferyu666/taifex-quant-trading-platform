from app.domain.risk import OrderIntent, RiskConfig
from app.services.risk_engine import RiskEngine


def _intent(exposure: float) -> OrderIntent:
    return OrderIntent(
        intent_id="intent-test",
        strategy_id="strategy-test",
        symbol="TX",
        side="BUY",
        quantity=1,
        tx_equivalent_exposure=exposure,
    )


def test_risk_engine_approves_within_paper_limit() -> None:
    engine = RiskEngine(RiskConfig(max_tx_equivalent_exposure=0.25))

    decision = engine.evaluate_order_intent(_intent(0.25))

    assert decision.approved is True
    assert decision.checks["within_max_tx_equivalent_exposure"] is True


def test_risk_engine_rejects_over_limit() -> None:
    engine = RiskEngine(RiskConfig(max_tx_equivalent_exposure=0.25))

    decision = engine.evaluate_order_intent(_intent(1.0))

    assert decision.approved is False
    assert "exceeds" in decision.reason


def test_risk_engine_rejects_live_trading_enabled() -> None:
    engine = RiskEngine(RiskConfig(live_trading_enabled=True, trading_mode="live"))

    decision = engine.evaluate_order_intent(_intent(0.01))

    assert decision.approved is False
    assert decision.reason == "Live trading is disabled in this roadmap implementation."
