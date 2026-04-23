from fastapi.testclient import TestClient

from app.main import app


def test_health_defaults_to_paper_trading() -> None:
    client = TestClient(app)

    response = client.get("/health")

    assert response.status_code == 200
    payload = response.json()
    assert payload == {
        "status": "ok",
        "service": "taifex-quant-trading-platform-backend",
        "trading_mode": "paper",
        "live_trading_enabled": False,
    }
    assert payload["trading_mode"] == "paper"
    assert payload["live_trading_enabled"] is False


def test_risk_config_defaults_are_paper_safe() -> None:
    client = TestClient(app)

    response = client.get("/api/risk/config")

    assert response.status_code == 200
    payload = response.json()
    assert payload["trading_mode"] == "paper"
    assert payload["live_trading_enabled"] is False
    assert payload["max_tx_equivalent_exposure"] == 0.25
    assert payload["max_daily_loss_twd"] == 5000
    assert payload["stale_quote_seconds"] == 3
