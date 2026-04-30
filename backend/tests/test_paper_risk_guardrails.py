from fastapi.testclient import TestClient

from app.domain.paper_risk_state import PaperRiskState
from app.domain.risk_rules import (
    PaperOrderIntent,
    RiskPolicy,
    RiskRuleName,
    evaluate_paper_order,
)
from app.main import app


def _intent(**overrides: object) -> PaperOrderIntent:
    payload = {
        "order_id": "paper-risk-order",
        "idempotency_key": "paper-risk-idempotency",
        "symbol": "TMF",
        "side": "BUY",
        "quantity": 1,
        "tx_equivalent_exposure": 0.05,
        "quote_age_seconds": 0,
        "order_price": 20000,
        "reference_price": 20000,
        "paper_only": True,
    }
    payload.update(overrides)
    return PaperOrderIntent(**payload)


def _failed_check_names(result) -> set[str]:
    return {check.name.value for check in result.checks if not check.passed}


def test_paper_risk_approves_safe_paper_order() -> None:
    result = evaluate_paper_order(_intent(), RiskPolicy(), PaperRiskState())

    assert result.approved is True
    assert result.reason == "Approved for paper-only order simulation."


def test_paper_risk_rejects_exposure_over_max() -> None:
    result = evaluate_paper_order(
        _intent(tx_equivalent_exposure=0.5),
        RiskPolicy(max_tx_equivalent_exposure=0.25),
    )

    assert result.approved is False
    assert RiskRuleName.MAX_EXPOSURE.value in _failed_check_names(result)


def test_paper_risk_rejects_stale_quote() -> None:
    result = evaluate_paper_order(_intent(quote_age_seconds=5), RiskPolicy())

    assert result.approved is False
    assert RiskRuleName.STALE_QUOTE.value in _failed_check_names(result)


def test_paper_risk_rejects_price_outside_reasonability_band() -> None:
    result = evaluate_paper_order(
        _intent(order_price=21000, reference_price=20000),
        RiskPolicy(price_reasonability_band_pct=0.02),
    )

    assert result.approved is False
    assert RiskRuleName.PRICE_REASONABILITY.value in _failed_check_names(result)


def test_paper_risk_rejects_contract_size_over_limit() -> None:
    result = evaluate_paper_order(
        _intent(symbol="TX", quantity=2, tx_equivalent_exposure=0.1),
        RiskPolicy(max_order_size_by_contract={"TX": 1, "MTX": 4, "TMF": 20}),
    )

    assert result.approved is False
    assert RiskRuleName.MAX_ORDER_SIZE_BY_CONTRACT.value in _failed_check_names(result)


def test_paper_risk_rejects_margin_proxy_over_limit() -> None:
    result = evaluate_paper_order(
        _intent(tx_equivalent_exposure=0.2),
        RiskPolicy(max_margin_proxy_twd=10_000),
    )

    assert result.approved is False
    assert RiskRuleName.MARGIN_PROXY.value in _failed_check_names(result)


def test_paper_risk_rejects_duplicate_idempotency_key() -> None:
    state = PaperRiskState(seen_idempotency_keys={"paper-risk-idempotency"})
    result = evaluate_paper_order(_intent(), RiskPolicy(), state)

    assert result.approved is False
    assert RiskRuleName.DUPLICATE_ORDER_PREVENTION.value in _failed_check_names(result)


def test_paper_risk_rejects_daily_loss_limit() -> None:
    state = PaperRiskState(daily_realized_loss_twd=5000)
    result = evaluate_paper_order(_intent(), RiskPolicy(max_daily_loss_twd=5000), state)

    assert result.approved is False
    assert RiskRuleName.DAILY_LOSS_LIMIT.value in _failed_check_names(result)


def test_paper_risk_rejects_position_limit() -> None:
    state = PaperRiskState(current_position_tx_equivalent=0.24)
    result = evaluate_paper_order(
        _intent(tx_equivalent_exposure=0.05),
        RiskPolicy(max_position_tx_equivalent=0.25),
        state,
    )

    assert result.approved is False
    assert RiskRuleName.POSITION_LIMIT.value in _failed_check_names(result)


def test_paper_risk_rejects_kill_switch_active() -> None:
    result = evaluate_paper_order(
        _intent(),
        RiskPolicy(),
        PaperRiskState(kill_switch_active=True),
    )

    assert result.approved is False
    assert RiskRuleName.KILL_SWITCH.value in _failed_check_names(result)


def test_paper_risk_rejects_unhealthy_broker_heartbeat() -> None:
    result = evaluate_paper_order(
        _intent(),
        RiskPolicy(),
        PaperRiskState(broker_heartbeat_healthy=False),
    )

    assert result.approved is False
    assert RiskRuleName.BROKER_HEARTBEAT.value in _failed_check_names(result)


def test_paper_risk_status_endpoint_is_paper_only() -> None:
    client = TestClient(app)
    response = client.get("/api/paper-risk/status")

    assert response.status_code == 200
    payload = response.json()
    assert payload["trading_mode"] == "paper"
    assert payload["live_trading_enabled"] is False
    assert payload["broker_provider"] == "paper"
    assert payload["paper_only"] is True
    assert payload["broker_api_called"] is False
    assert "PRICE_REASONABILITY" in payload["supported_checks"]
    assert "KILL_SWITCH" in payload["supported_checks"]


def test_paper_risk_evaluate_endpoint_returns_check_details() -> None:
    client = TestClient(app)
    response = client.post(
        "/api/paper-risk/evaluate",
        json={
            "intent": _intent(tx_equivalent_exposure=0.5).model_dump(mode="json"),
            "state": PaperRiskState().model_dump(mode="json"),
            "paper_only": True,
        },
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["approved"] is False
    failed = {check["name"] for check in payload["checks"] if not check["passed"]}
    assert "MAX_EXPOSURE" in failed
