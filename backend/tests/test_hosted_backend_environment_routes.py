from fastapi.testclient import TestClient

from app.core.config import Settings
from app.domain.hosted_backend_environment import (
    get_hosted_backend_environment,
    get_hosted_backend_readiness,
    normalize_environment,
)
from app.main import app


def test_hosted_backend_environment_domain_is_foundation_contract_only() -> None:
    environment = get_hosted_backend_environment(Settings())

    assert environment.service == "hosted-backend-api-environment"
    assert environment.current_environment == "local"
    assert environment.hosted_backend_state == "not_enabled"
    assert environment.capabilities.hosted_backend_enabled is False
    assert environment.capabilities.managed_datastore_enabled is False
    assert environment.capabilities.local_sqlite_allowed_for_hosted is False
    assert environment.capabilities.tenant_isolation_required is True
    assert environment.capabilities.customer_accounts_enabled is False
    assert environment.capabilities.reviewer_login_enabled is False
    assert environment.capabilities.hosted_records_writable is False
    assert environment.capabilities.hosted_records_readable is False
    assert environment.capabilities.broker_api_enabled is False
    assert environment.capabilities.credential_collection_enabled is False
    assert environment.capabilities.production_trading_ready is False
    assert environment.safety_defaults.trading_mode == "paper"
    assert environment.safety_defaults.enable_live_trading is False
    assert environment.safety_defaults.broker_provider == "paper"
    assert environment.safety_flags.paper_only is True
    assert environment.safety_flags.live_trading_enabled is False
    assert environment.safety_flags.broker_api_called is False
    assert environment.safety_flags.order_created is False
    assert environment.safety_flags.database_written is False
    assert environment.safety_flags.external_db_written is False
    assert environment.safety_flags.broker_credentials_collected is False
    assert environment.safety_flags.production_trading_ready is False
    assert {boundary.environment for boundary in environment.environment_boundaries} == {
        "dev",
        "staging",
        "production",
    }


def test_hosted_backend_environment_api_returns_read_only_boundary() -> None:
    client = TestClient(app)

    response = client.get("/api/hosted-backend/environment")

    assert response.status_code == 200
    payload = response.json()
    assert payload["service"] == "hosted-backend-api-environment"
    assert payload["current_environment"] == "local"
    assert payload["hosted_backend_state"] == "not_enabled"
    assert payload["capabilities"]["hosted_backend_enabled"] is False
    assert payload["capabilities"]["managed_datastore_enabled"] is False
    assert payload["capabilities"]["local_sqlite_allowed_for_hosted"] is False
    assert payload["capabilities"]["tenant_isolation_required"] is True
    assert payload["capabilities"]["hosted_records_writable"] is False
    assert payload["capabilities"]["hosted_records_readable"] is False
    assert payload["capabilities"]["broker_api_enabled"] is False
    assert payload["capabilities"]["credential_collection_enabled"] is False
    assert payload["capabilities"]["production_trading_ready"] is False
    assert payload["safety_flags"]["live_trading_enabled"] is False
    assert payload["safety_flags"]["broker_api_called"] is False
    assert payload["safety_flags"]["order_created"] is False
    assert payload["safety_flags"]["database_written"] is False
    assert "hosted_backend_foundation" in payload["docs"]


def test_hosted_backend_readiness_api_does_not_enable_saas_or_trading() -> None:
    client = TestClient(app)

    response = client.get("/api/hosted-backend/readiness")

    assert response.status_code == 200
    payload = response.json()
    assert payload["service"] == "hosted-backend-api-readiness"
    assert payload["readiness_state"] == "foundation_contract_only"
    assert payload["current_environment"] == "local"
    assert payload["hosted_backend_enabled"] is False
    assert payload["managed_datastore_enabled"] is False
    assert payload["local_sqlite_allowed_for_hosted"] is False
    assert payload["tenant_isolation_required"] is True
    assert payload["live_trading_enabled"] is False
    assert payload["broker_provider"] == "paper"
    assert payload["production_trading_ready"] is False
    assert any("Managed datastore" in item for item in payload["required_next_slices"])
    assert any(
        "customer login" in item.lower()
        for item in payload["unavailable_until_foundation_complete"]
    )
    assert payload["safety_flags"]["broker_credentials_collected"] is False


def test_hosted_backend_readiness_domain_matches_environment_contract() -> None:
    readiness = get_hosted_backend_readiness(Settings())

    assert readiness.current_environment == "local"
    assert readiness.hosted_backend_enabled is False
    assert readiness.managed_datastore_enabled is False
    assert readiness.local_sqlite_allowed_for_hosted is False
    assert readiness.tenant_isolation_required is True
    assert readiness.live_trading_enabled is False
    assert readiness.broker_provider == "paper"
    assert readiness.production_trading_ready is False


def test_hosted_backend_environment_normalization() -> None:
    assert normalize_environment("development") == "local"
    assert normalize_environment("local") == "local"
    assert normalize_environment("dev") == "dev"
    assert normalize_environment("stage") == "staging"
    assert normalize_environment("production") == "production"
