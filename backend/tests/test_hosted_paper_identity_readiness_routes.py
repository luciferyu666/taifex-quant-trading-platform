from fastapi.testclient import TestClient

from app.core.config import Settings
from app.domain.hosted_paper_identity import get_hosted_paper_identity_readiness
from app.main import app


def test_hosted_paper_identity_readiness_domain_is_schema_only() -> None:
    readiness = get_hosted_paper_identity_readiness(Settings())

    assert readiness.service == "hosted-paper-identity-rbac-tenant-readiness"
    assert readiness.readiness_state == "schema_only_not_enabled"
    assert readiness.identity.reviewer_login_enabled is False
    assert readiness.identity.customer_accounts_enabled is False
    assert readiness.identity.authentication_provider == "none"
    assert readiness.identity.session_issuance_enabled is False
    assert readiness.identity.session_cookie_issued is False
    assert readiness.access_control.rbac_enabled is False
    assert readiness.access_control.abac_enabled is False
    assert readiness.access_control.mutation_permissions_granted is False
    assert readiness.access_control.live_permissions_granted is False
    assert readiness.tenant_isolation.tenant_isolation_required is True
    assert readiness.tenant_isolation.tenant_isolation_enforced is False
    assert readiness.tenant_isolation.hosted_tenant_datastore_enabled is False
    assert readiness.tenant_isolation.local_sqlite_access_from_production_vercel is False
    assert readiness.safety_defaults.trading_mode == "paper"
    assert readiness.safety_defaults.enable_live_trading is False
    assert readiness.safety_defaults.broker_provider == "paper"
    assert readiness.safety_flags.paper_only is True
    assert readiness.safety_flags.read_only is True
    assert readiness.safety_flags.live_trading_enabled is False
    assert readiness.safety_flags.broker_provider == "paper"
    assert readiness.safety_flags.reviewer_login_created is False
    assert readiness.safety_flags.customer_account_created is False
    assert readiness.safety_flags.rbac_abac_enforced is False
    assert readiness.safety_flags.tenant_isolation_enforced is False
    assert readiness.safety_flags.production_trading_ready is False


def test_hosted_paper_identity_readiness_api_returns_no_auth_or_tenant_runtime() -> None:
    client = TestClient(app)

    response = client.get("/api/hosted-paper/identity-readiness")

    assert response.status_code == 200
    payload = response.json()
    assert payload["service"] == "hosted-paper-identity-rbac-tenant-readiness"
    assert payload["readiness_state"] == "schema_only_not_enabled"
    assert payload["identity"]["reviewer_login_enabled"] is False
    assert payload["identity"]["customer_accounts_enabled"] is False
    assert payload["identity"]["authentication_provider"] == "none"
    assert payload["identity"]["session_cookie_issued"] is False
    assert payload["access_control"]["rbac_enabled"] is False
    assert payload["access_control"]["abac_enabled"] is False
    assert payload["access_control"]["mutation_permissions_granted"] is False
    assert payload["access_control"]["live_permissions_granted"] is False
    assert payload["tenant_isolation"]["tenant_isolation_required"] is True
    assert payload["tenant_isolation"]["tenant_isolation_enforced"] is False
    assert payload["tenant_isolation"]["hosted_tenant_records_enabled"] is False
    assert (
        payload["tenant_isolation"]["local_sqlite_access_from_production_vercel"]
        is False
    )
    assert payload["safety_flags"]["broker_api_called"] is False
    assert payload["safety_flags"]["credentials_collected"] is False
    assert payload["safety_flags"]["broker_credentials_collected"] is False
    assert payload["safety_flags"]["hosted_datastore_written"] is False
    assert payload["safety_flags"]["external_db_written"] is False
    assert payload["safety_flags"]["order_created"] is False
    assert payload["safety_flags"]["production_trading_ready"] is False
    assert any("Real reviewer login" in item for item in payload["blocked_until_identity_layer"])
    assert any("RBAC" in item for item in payload["future_requirements"])


def test_hosted_paper_identity_readiness_api_preserves_live_disabled_defaults() -> None:
    client = TestClient(app)

    payload = client.get("/api/hosted-paper/identity-readiness").json()

    assert payload["safety_defaults"]["trading_mode"] == "paper"
    assert payload["safety_defaults"]["enable_live_trading"] is False
    assert payload["safety_defaults"]["broker_provider"] == "paper"
    assert payload["safety_flags"]["paper_only"] is True
    assert payload["safety_flags"]["live_trading_enabled"] is False
    assert "Production Trading Platform remains NOT READY." in payload["warnings"]
