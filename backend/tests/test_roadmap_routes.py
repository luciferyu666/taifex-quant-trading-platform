from fastapi.testclient import TestClient

from app.main import app


def _paper_order_payload(exposure: float = 0.05) -> dict[str, object]:
    return {
        "intent_id": "intent-api-test",
        "strategy_id": "strategy-api-test",
        "symbol": "TMF",
        "side": "BUY",
        "quantity": 1,
        "tx_equivalent_exposure": exposure,
        "order_type": "MARKET",
        "trading_mode": "paper",
        "paper_only": True,
    }


def test_roadmap_returns_phase_status() -> None:
    client = TestClient(app)

    response = client.get("/api/roadmap")

    assert response.status_code == 200
    payload = response.json()
    assert len(payload) == 7
    assert payload[0]["phase"] == 0
    assert payload[-1]["safety_mode"] == "readiness-only"


def test_contracts_route_returns_contract_specs() -> None:
    client = TestClient(app)

    response = client.get("/api/contracts")

    assert response.status_code == 200
    payload = response.json()
    symbols = {contract["symbol"] for contract in payload["contracts"]}
    assert symbols == {"TX", "MTX", "TMF"}


def test_paper_status_returns_live_trading_disabled() -> None:
    client = TestClient(app)

    response = client.get("/api/risk/paper-status")

    assert response.status_code == 200
    payload = response.json()
    assert payload["trading_mode"] == "paper"
    assert payload["live_trading_enabled"] is False
    assert payload["broker_provider"] == "paper"


def test_evaluate_paper_order_rejects_over_limit() -> None:
    client = TestClient(app)

    response = client.post("/api/risk/evaluate-paper-order", json=_paper_order_payload(1.0))

    assert response.status_code == 200
    payload = response.json()
    assert payload["approved"] is False
    assert payload["checks"]["within_max_tx_equivalent_exposure"] is False


def test_paper_orders_returns_paper_only_acknowledgement() -> None:
    client = TestClient(app)

    response = client.post("/api/paper/orders", json=_paper_order_payload(0.05))

    assert response.status_code == 200
    payload = response.json()
    assert payload["paper_only"] is True
    assert payload["accepted"] is True
    assert payload["broker_acknowledgement"]["paper_only"] is True
    assert "No real order was placed" in payload["message"]
