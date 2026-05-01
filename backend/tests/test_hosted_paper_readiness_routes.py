from fastapi.testclient import TestClient

from app.core.config import Settings
from app.domain.hosted_paper_readiness import get_hosted_paper_readiness
from app.main import app


def test_hosted_paper_readiness_domain_is_paper_only_not_enabled() -> None:
    readiness = get_hosted_paper_readiness(Settings())

    assert readiness.service == "hosted-paper-api-readiness"
    assert readiness.readiness_state == "not_enabled"
    assert readiness.capabilities.hosted_backend_enabled is False
    assert readiness.capabilities.hosted_datastore_enabled is False
    assert readiness.capabilities.customer_login_enabled is False
    assert readiness.capabilities.local_demo_mode_primary is True
    assert readiness.safety_defaults.trading_mode == "paper"
    assert readiness.safety_defaults.enable_live_trading is False
    assert readiness.safety_defaults.broker_provider == "paper"
    assert readiness.safety_flags.paper_only is True
    assert readiness.safety_flags.live_trading_enabled is False
    assert readiness.safety_flags.broker_api_called is False
    assert readiness.safety_flags.order_created is False
    assert readiness.safety_flags.database_written is False
    assert readiness.safety_flags.production_trading_ready is False


def test_hosted_paper_readiness_api_returns_read_only_status() -> None:
    client = TestClient(app)

    response = client.get("/api/hosted-paper/readiness")

    assert response.status_code == 200
    payload = response.json()
    assert payload["service"] == "hosted-paper-api-readiness"
    assert payload["readiness_state"] == "not_enabled"
    assert payload["capabilities"]["hosted_backend_enabled"] is False
    assert payload["capabilities"]["hosted_datastore_enabled"] is False
    assert payload["capabilities"]["paper_workflow_online_enabled"] is False
    assert payload["capabilities"]["local_demo_mode_primary"] is True
    assert payload["safety_defaults"]["trading_mode"] == "paper"
    assert payload["safety_defaults"]["enable_live_trading"] is False
    assert payload["safety_defaults"]["broker_provider"] == "paper"
    assert payload["safety_flags"]["paper_only"] is True
    assert payload["safety_flags"]["live_trading_enabled"] is False
    assert payload["safety_flags"]["broker_api_called"] is False
    assert payload["safety_flags"]["order_created"] is False
    assert payload["safety_flags"]["database_written"] is False
    assert payload["safety_flags"]["production_trading_ready"] is False
    assert "local backend + local SQLite" in payload["summary"]
    assert "hosted_paper_readiness" in payload["docs"]


def test_hosted_paper_readiness_api_does_not_expose_execution_capability() -> None:
    client = TestClient(app)

    payload = client.get("/api/hosted-paper/readiness").json()

    assert payload["readiness_state"] == "not_enabled"
    assert "not a hosted paper backend" in payload["warnings"][0]
    assert any("Customer login" in item for item in payload["unavailable_until_hosted_backend"])
    assert any("Tenant-scoped" in item for item in payload["future_requirements"])
    assert payload["safety_flags"]["broker_credentials_collected"] is False
