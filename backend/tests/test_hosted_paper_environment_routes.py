from fastapi.testclient import TestClient

from app.core.config import Settings
from app.domain.hosted_paper_environment import get_hosted_paper_environment
from app.main import app


def test_hosted_paper_environment_domain_marks_local_demo_primary() -> None:
    environment = get_hosted_paper_environment(Settings())

    assert environment.service == "hosted-paper-environment-contract"
    assert environment.current_customer_mode == "local_demo_mode"
    assert environment.local_demo_mode.state == "primary_local_demo"
    assert environment.local_demo_mode.can_read_actual_paper_records is True
    assert environment.local_demo_mode.local_sqlite_allowed is True
    assert environment.hosted_paper_mode.state == "not_enabled"
    assert environment.hosted_paper_mode.can_write_paper_records is False
    assert environment.hosted_paper_mode.managed_datastore_required is True
    assert environment.production_trading_platform.state == "not_ready"
    assert environment.safety_defaults.trading_mode == "paper"
    assert environment.safety_defaults.enable_live_trading is False
    assert environment.safety_defaults.broker_provider == "paper"
    assert environment.safety_flags.paper_only is True
    assert environment.safety_flags.live_trading_enabled is False
    assert environment.safety_flags.broker_api_called is False
    assert environment.safety_flags.order_created is False
    assert environment.safety_flags.database_written is False
    assert environment.safety_flags.production_trading_ready is False


def test_hosted_paper_environment_api_returns_read_only_contract() -> None:
    client = TestClient(app)

    response = client.get("/api/hosted-paper/environment")

    assert response.status_code == 200
    payload = response.json()
    assert payload["service"] == "hosted-paper-environment-contract"
    assert (
        payload["deployment_model"]
        == "local_demo_primary_hosted_paper_not_enabled_production_trading_not_ready"
    )
    assert payload["current_customer_mode"] == "local_demo_mode"
    assert payload["local_demo_mode"]["state"] == "primary_local_demo"
    assert payload["hosted_paper_mode"]["state"] == "not_enabled"
    assert payload["hosted_paper_mode"]["can_read_actual_paper_records"] is False
    assert payload["hosted_paper_mode"]["can_write_paper_records"] is False
    assert payload["production_trading_platform"]["state"] == "not_ready"
    assert payload["production_trading_platform"]["can_write_paper_records"] is False
    assert payload["safety_flags"]["broker_api_called"] is False
    assert payload["safety_flags"]["order_created"] is False
    assert payload["safety_flags"]["database_written"] is False
    assert payload["safety_flags"]["broker_credentials_collected"] is False
    assert payload["safety_flags"]["production_trading_ready"] is False
    assert len(payload["saas_foundation_path"]) == 6
    assert "hosted_paper_saas_foundation" in payload["docs"]


def test_hosted_paper_environment_api_does_not_enable_hosted_or_live_mode() -> None:
    client = TestClient(app)

    payload = client.get("/api/hosted-paper/environment").json()

    assert payload["hosted_paper_mode"]["state"] == "not_enabled"
    assert payload["safety_defaults"]["enable_live_trading"] is False
    assert payload["safety_defaults"]["broker_provider"] == "paper"
    assert any("Hosted Paper Mode is not enabled" in item for item in payload["warnings"])
    assert any(
        "Production Trading Platform remains NOT READY" in item
        for item in payload["warnings"]
    )
    assert any(step["capability"] == "Hosted backend" for step in payload["saas_foundation_path"])
