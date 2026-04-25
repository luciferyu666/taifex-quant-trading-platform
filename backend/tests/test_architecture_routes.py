from fastapi.testclient import TestClient

from app.main import app


def _paper_intent(exposure: float = 0.05) -> dict[str, object]:
    return {
        "order_id": "order-api-architecture",
        "idempotency_key": "idem-api-architecture",
        "symbol": "TMF",
        "side": "BUY",
        "quantity": 1,
        "tx_equivalent_exposure": exposure,
        "quote_age_seconds": 0,
    }


def test_architecture_spec_returns_live_trading_disabled() -> None:
    client = TestClient(app)

    response = client.get("/api/architecture/spec")

    assert response.status_code == 200
    payload = response.json()
    assert payload["live_trading_enabled"] is False
    assert payload["safety_mode"] == "paper-only"


def test_architecture_allocator_preview_returns_200() -> None:
    client = TestClient(app)

    response = client.post(
        "/api/architecture/allocator/preview",
        json={"target_tx_equivalent": 1.15},
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["actual_tx_equivalent"] == 1.15


def test_architecture_risk_policy_returns_paper_broker() -> None:
    client = TestClient(app)

    response = client.get("/api/architecture/risk/policy")

    assert response.status_code == 200
    payload = response.json()
    assert payload["trading_mode"] == "paper"
    assert payload["live_trading_enabled"] is False
    assert payload["broker_provider"] == "paper"


def test_architecture_paper_broker_submit_never_enables_live_trading() -> None:
    client = TestClient(app)

    response = client.post("/api/architecture/paper-broker/submit", json=_paper_intent())

    assert response.status_code == 200
    payload = response.json()
    assert payload["paper_only"] is True
    assert payload["risk_evaluation"]["approved"] is True
    assert payload["paper_ack"]["broker_provider"] == "paper"
    assert "No real order was placed" in payload["message"]


def test_architecture_reconciliation_compare_locks_on_mismatch() -> None:
    client = TestClient(app)

    response = client.post(
        "/api/architecture/reconciliation/compare",
        json={
            "platform": {"source": "platform", "positions": {"TMF": 1}},
            "broker": {"source": "broker", "positions": {"TMF": 0}},
        },
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["matched"] is False
    assert payload["locked"] is True
