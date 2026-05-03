from fastapi.testclient import TestClient

from app.core.config import Settings
from app.domain.hosted_web_command_center import (
    get_hosted_web_command_center_readiness,
)
from app.main import app


def test_hosted_web_command_center_domain_is_read_only_contract() -> None:
    readiness = get_hosted_web_command_center_readiness(Settings())

    assert readiness.service == "hosted-web-command-center-readiness"
    assert readiness.readiness_state == "environment_aware_connection_contract_only"
    assert (
        readiness.api_base_url_contract.primary_public_env_var
        == "NEXT_PUBLIC_HOSTED_BACKEND_API_BASE_URL"
    )
    assert readiness.api_base_url_contract.local_fallback_public_env_var == (
        "NEXT_PUBLIC_BACKEND_URL"
    )
    assert readiness.api_base_url_contract.secrets_allowed_in_public_env is False
    assert (
        readiness.api_base_url_contract.broker_credentials_allowed_in_public_env
        is False
    )
    assert readiness.capabilities.environment_aware_api_base_url_supported is True
    assert readiness.capabilities.production_vercel_hosted_backend_connectivity_configurable is True
    assert readiness.capabilities.hosted_backend_runtime_enabled is False
    assert readiness.capabilities.hosted_mutations_enabled is False
    assert readiness.capabilities.real_auth_provider_enabled is False
    assert readiness.capabilities.managed_datastore_enabled is False
    assert readiness.capabilities.broker_api_enabled is False
    assert readiness.identity_display.login_status_displayed is True
    assert readiness.identity_display.tenant_displayed is True
    assert readiness.identity_display.roles_displayed is True
    assert readiness.identity_display.permissions_displayed is True
    assert readiness.identity_display.real_login_enabled is False
    assert readiness.identity_display.rbac_abac_enforced is False
    assert readiness.safety_flags.paper_only is True
    assert readiness.safety_flags.read_only_contract is True
    assert readiness.safety_flags.live_trading_enabled is False
    assert readiness.safety_flags.broker_provider == "paper"
    assert readiness.safety_flags.broker_api_called is False
    assert readiness.safety_flags.order_created is False
    assert readiness.safety_flags.credentials_collected is False
    assert readiness.safety_flags.auth_provider_enabled is False
    assert readiness.safety_flags.session_cookie_issued is False
    assert readiness.safety_flags.hosted_datastore_written is False
    assert readiness.safety_flags.production_trading_ready is False
    assert any(
        endpoint.path == "/api/hosted-paper/session"
        for endpoint in readiness.required_read_endpoints
    )


def test_hosted_web_command_center_api_contract() -> None:
    client = TestClient(app)

    response = client.get("/api/hosted-paper/web-command-center/readiness")

    assert response.status_code == 200
    payload = response.json()
    assert payload["service"] == "hosted-web-command-center-readiness"
    assert payload["readiness_state"] == "environment_aware_connection_contract_only"
    assert (
        payload["api_base_url_contract"]["primary_public_env_var"]
        == "NEXT_PUBLIC_HOSTED_BACKEND_API_BASE_URL"
    )
    assert payload["api_base_url_contract"]["mode_public_env_var"] == (
        "NEXT_PUBLIC_COMMAND_CENTER_API_MODE"
    )
    assert payload["api_base_url_contract"]["secrets_allowed_in_public_env"] is False
    assert (
        payload["api_base_url_contract"]["broker_credentials_allowed_in_public_env"]
        is False
    )
    assert payload["capabilities"]["environment_aware_api_base_url_supported"] is True
    assert (
        payload["capabilities"][
            "production_vercel_hosted_backend_connectivity_configurable"
        ]
        is True
    )
    assert payload["capabilities"]["hosted_backend_runtime_enabled"] is False
    assert payload["capabilities"]["hosted_mutations_enabled"] is False
    assert payload["capabilities"]["real_auth_provider_enabled"] is False
    assert payload["capabilities"]["managed_datastore_enabled"] is False
    assert payload["identity_display"]["login_status_displayed"] is True
    assert payload["identity_display"]["tenant_displayed"] is True
    assert payload["identity_display"]["roles_displayed"] is True
    assert payload["identity_display"]["permissions_displayed"] is True
    assert payload["identity_display"]["real_login_enabled"] is False
    assert payload["identity_display"]["tenant_isolation_enforced"] is False
    assert payload["safety_defaults"]["trading_mode"] == "paper"
    assert payload["safety_defaults"]["enable_live_trading"] is False
    assert payload["safety_defaults"]["broker_provider"] == "paper"
    assert payload["safety_flags"]["paper_only"] is True
    assert payload["safety_flags"]["read_only_contract"] is True
    assert payload["safety_flags"]["live_trading_enabled"] is False
    assert payload["safety_flags"]["broker_provider"] == "paper"
    assert payload["safety_flags"]["broker_api_called"] is False
    assert payload["safety_flags"]["order_created"] is False
    assert payload["safety_flags"]["credentials_collected"] is False
    assert payload["safety_flags"]["session_cookie_issued"] is False
    assert payload["safety_flags"]["hosted_datastore_written"] is False
    assert payload["safety_flags"]["production_trading_ready"] is False
    assert any(
        item["path"] == "/api/hosted-paper/tenants/current"
        for item in payload["required_read_endpoints"]
    )
    assert any(
        "NEXT_PUBLIC_HOSTED_BACKEND_API_BASE_URL" in item
        for item in payload["required_before_customer_hosted_use"]
    )


def test_hosted_web_command_center_does_not_enable_auth_or_mutations() -> None:
    client = TestClient(app)

    payload = client.get("/api/hosted-paper/web-command-center/readiness").json()

    assert payload["capabilities"]["hosted_backend_runtime_enabled"] is False
    assert payload["capabilities"]["hosted_paper_customer_workspace_enabled"] is False
    assert payload["capabilities"]["hosted_mutations_enabled"] is False
    assert payload["capabilities"]["real_auth_provider_enabled"] is False
    assert payload["safety_flags"]["customer_account_created"] is False
    assert payload["safety_flags"]["auth_provider_enabled"] is False
    assert payload["safety_flags"]["broker_api_called"] is False
    assert payload["safety_flags"]["order_created"] is False
    assert all(
        endpoint["read_only"] is True for endpoint in payload["required_read_endpoints"]
    )
