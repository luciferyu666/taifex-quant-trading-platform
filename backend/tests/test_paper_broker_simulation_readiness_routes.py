from fastapi.testclient import TestClient

from app.core.config import Settings
from app.domain.paper_broker_simulation_readiness import (
    get_paper_broker_simulation_readiness,
)
from app.main import app


def test_paper_broker_simulation_readiness_domain_is_not_production_model() -> None:
    readiness = get_paper_broker_simulation_readiness(Settings())

    assert readiness.service == "paper-broker-simulation-readiness"
    assert (
        readiness.readiness_state
        == "local_paper_simulation_not_market_matching_or_broker_execution"
    )
    assert readiness.capabilities.deterministic_broker_simulation_enabled is True
    assert readiness.capabilities.local_quote_snapshot_preview_enabled is True
    assert readiness.capabilities.caller_provided_quote_only is True
    assert readiness.capabilities.real_market_matching_engine_enabled is False
    assert readiness.capabilities.exchange_order_book_replay_enabled is False
    assert readiness.capabilities.broker_execution_report_model_enabled is False
    assert readiness.capabilities.latency_queue_position_model_enabled is False
    assert readiness.capabilities.slippage_liquidity_calibration_enabled is False
    assert readiness.capabilities.real_account_reconciliation_enabled is False
    assert readiness.capabilities.production_execution_model is False
    assert readiness.safety_flags.paper_only is True
    assert readiness.safety_flags.read_only is True
    assert readiness.safety_flags.live_trading_enabled is False
    assert readiness.safety_flags.broker_api_called is False
    assert readiness.safety_flags.external_market_data_downloaded is False
    assert readiness.safety_flags.real_order_created is False
    assert readiness.safety_flags.production_execution_model is False


def test_paper_broker_simulation_readiness_api_is_read_only_boundary() -> None:
    client = TestClient(app)

    response = client.get("/api/paper-execution/broker-simulation/readiness")

    assert response.status_code == 200
    payload = response.json()
    assert payload["service"] == "paper-broker-simulation-readiness"
    assert (
        payload["readiness_state"]
        == "local_paper_simulation_not_market_matching_or_broker_execution"
    )
    assert payload["capabilities"]["deterministic_broker_simulation_enabled"] is True
    assert payload["capabilities"]["local_quote_snapshot_preview_enabled"] is True
    assert payload["capabilities"]["caller_provided_quote_only"] is True
    assert payload["capabilities"]["real_market_matching_engine_enabled"] is False
    assert payload["capabilities"]["exchange_order_book_replay_enabled"] is False
    assert payload["capabilities"]["broker_execution_report_model_enabled"] is False
    assert payload["capabilities"]["latency_queue_position_model_enabled"] is False
    assert (
        payload["capabilities"]["slippage_liquidity_calibration_enabled"] is False
    )
    assert payload["capabilities"]["real_account_reconciliation_enabled"] is False
    assert payload["capabilities"]["production_execution_model"] is False
    assert payload["safety_defaults"]["trading_mode"] == "paper"
    assert payload["safety_defaults"]["enable_live_trading"] is False
    assert payload["safety_defaults"]["broker_provider"] == "paper"
    assert payload["safety_flags"]["paper_only"] is True
    assert payload["safety_flags"]["read_only"] is True
    assert payload["safety_flags"]["live_trading_enabled"] is False
    assert payload["safety_flags"]["broker_provider"] == "paper"
    assert payload["safety_flags"]["broker_api_called"] is False
    assert payload["safety_flags"]["external_market_data_downloaded"] is False
    assert payload["safety_flags"]["real_order_created"] is False
    assert payload["safety_flags"]["order_created"] is False
    assert payload["safety_flags"]["credentials_collected"] is False
    assert payload["safety_flags"]["database_written"] is False
    assert payload["safety_flags"]["external_db_written"] is False
    assert payload["safety_flags"]["production_execution_model"] is False
    assert payload["safety_flags"]["production_trading_ready"] is False
    assert any(
        "Real market matching engine" in item
        for item in payload["missing_for_production_execution_model"]
    )
    assert any(
        "execution report schema" in item
        for item in payload["required_before_production_execution_model"]
    )


def test_paper_broker_simulation_readiness_does_not_create_orders() -> None:
    client = TestClient(app)

    payload = client.get("/api/paper-execution/broker-simulation/readiness").json()

    assert payload["safety_flags"]["order_created"] is False
    assert payload["safety_flags"]["real_order_created"] is False
    assert payload["safety_flags"]["database_written"] is False
    assert payload["safety_flags"]["broker_api_called"] is False
    assert payload["safety_flags"]["production_execution_model"] is False
    assert payload["capabilities"]["production_execution_model"] is False
