from app.domain.risk_rules import PaperOrderIntent, RiskPolicy, evaluate_paper_order


def _intent(**overrides: object) -> PaperOrderIntent:
    payload = {
        "order_id": "order-risk-test",
        "idempotency_key": "idem-risk-test",
        "symbol": "TMF",
        "side": "BUY",
        "quantity": 1,
        "tx_equivalent_exposure": 0.05,
        "quote_age_seconds": 0,
    }
    payload.update(overrides)
    return PaperOrderIntent(**payload)


def test_risk_rejects_live_trading_enabled() -> None:
    result = evaluate_paper_order(
        _intent(),
        RiskPolicy(live_trading_enabled=True, trading_mode="paper"),
    )

    assert result.approved is False


def test_risk_rejects_non_paper_mode() -> None:
    result = evaluate_paper_order(_intent(), RiskPolicy(trading_mode="shadow"))

    assert result.approved is False


def test_risk_rejects_exposure_over_max() -> None:
    result = evaluate_paper_order(
        _intent(tx_equivalent_exposure=1.0),
        RiskPolicy(max_tx_equivalent_exposure=0.25),
    )

    assert result.approved is False


def test_risk_rejects_stale_quote() -> None:
    result = evaluate_paper_order(
        _intent(quote_age_seconds=10),
        RiskPolicy(stale_quote_seconds=3),
    )

    assert result.approved is False


def test_risk_approves_safe_paper_order() -> None:
    result = evaluate_paper_order(_intent(), RiskPolicy())

    assert result.approved is True
