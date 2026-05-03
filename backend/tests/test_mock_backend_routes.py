from fastapi.testclient import TestClient

from app.core.config import Settings
from app.domain.mock_backend import (
    MockOrderSimulationRequest,
    MockStrategyRunRequest,
    market_data_preview,
    mock_backend_status,
    run_mock_strategy,
    simulate_mock_order,
)
from app.main import app


def test_mock_backend_status_is_paper_only_and_not_production() -> None:
    status = mock_backend_status(Settings())

    assert status.service == "mock-backend-demo-mvp"
    assert status.trading_mode == "paper"
    assert status.broker_provider == "paper"
    assert status.safety_flags.paper_only is True
    assert status.safety_flags.mock_backend is True
    assert status.safety_flags.live_trading_enabled is False
    assert status.safety_flags.broker_api_called is False
    assert status.safety_flags.real_order_created is False
    assert status.safety_flags.credentials_collected is False
    assert status.safety_flags.production_trading_ready is False


def test_market_data_preview_is_deterministic_local_data() -> None:
    first = market_data_preview(2)
    second = market_data_preview(2)

    assert first == second
    assert first.tick == 2
    assert {snapshot.symbol for snapshot in first.snapshots} == {"TX", "MTX", "TMF"}
    assert all(snapshot.paper_only for snapshot in first.snapshots)
    assert all(not snapshot.external_market_data_downloaded for snapshot in first.snapshots)
    assert first.safety_flags.external_market_data_downloaded is False


def test_strategy_run_emits_signal_only() -> None:
    response = run_mock_strategy(MockStrategyRunRequest(symbol="TMF", tick=2), Settings())

    assert response.signal.direction == "LONG"
    assert response.signal.target_tx_equivalent == 0.05
    assert response.signal.reason["signals_only"] is True
    assert response.signal.reason["order_created"] is False
    assert response.signal.reason["broker_api_called"] is False
    assert response.signal.reason["risk_engine_called"] is False
    assert response.signal.reason["oms_called"] is False
    assert response.safety_flags.real_order_created is False


def test_order_simulation_uses_risk_oms_and_paper_gateway_only() -> None:
    response = simulate_mock_order(
        MockOrderSimulationRequest(symbol="TMF", tick=2, quantity=1, direction="LONG"),
        Settings(),
    )

    assert response.workflow_run_id.startswith("mock-workflow-")
    assert response.paper_order_intent.paper_only is True
    assert response.risk_evaluation.approved is True
    assert response.oms_state.status in {"ACCEPTED", "PARTIALLY_FILLED", "FILLED"}
    assert response.paper_broker_ack is not None
    assert response.paper_broker_ack.broker_provider == "paper"
    assert response.paper_broker_simulation_result is not None
    assert response.paper_broker_simulation_result.broker_api_called is False
    assert response.portfolio.paper_only is True
    assert response.portfolio.real_money is False
    assert response.safety_flags.real_order_created is False
    assert response.safety_flags.broker_api_called is False


def test_mock_backend_api_flow_returns_safe_demo_session() -> None:
    client = TestClient(app)

    status = client.get("/api/mock-backend/status")
    market = client.get("/api/mock-backend/market-data/preview?tick=2")
    signal = client.post(
        "/api/mock-backend/strategy/run",
        json={"symbol": "TMF", "tick": 2, "paper_only": True},
    )
    order = client.post(
        "/api/mock-backend/order/simulate",
        json={
            "symbol": "TMF",
            "tick": 2,
            "quantity": 1,
            "direction": "LONG",
            "paper_only": True,
        },
    )
    session = client.get("/api/mock-backend/demo-session")
    reset = client.post("/api/mock-backend/demo-session/reset")

    assert status.status_code == 200
    assert status.json()["safety_flags"]["live_trading_enabled"] is False
    assert market.status_code == 200
    assert market.json()["safety_flags"]["external_market_data_downloaded"] is False
    assert signal.status_code == 200
    assert signal.json()["signal"]["reason"]["signals_only"] is True
    assert order.status_code == 200
    assert order.json()["risk_evaluation"]["approved"] is True
    assert order.json()["safety_flags"]["real_order_created"] is False
    assert session.status_code == 200
    assert session.json()["latest_order"]["workflow_run_id"].startswith("mock-workflow-")
    assert reset.status_code == 200
    assert reset.json()["current_tick"] == 0
    assert reset.json()["latest_order"] is None


def test_mock_backend_rejects_non_paper_payloads() -> None:
    client = TestClient(app)

    response = client.post(
        "/api/mock-backend/order/simulate",
        json={"symbol": "TMF", "tick": 2, "paper_only": False},
    )

    assert response.status_code == 422
