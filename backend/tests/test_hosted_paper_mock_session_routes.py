from fastapi.testclient import TestClient

from app.core.config import Settings
from app.domain.hosted_paper_session import get_hosted_paper_mock_session
from app.main import app


def test_hosted_paper_mock_session_domain_is_read_only_contract() -> None:
    session = get_hosted_paper_mock_session(Settings())

    assert session.service == "hosted-paper-mock-session-contract"
    assert session.contract_state == "mock_read_only"
    assert session.session.authenticated is False
    assert session.session.authentication_provider == "none"
    assert session.session.session_id == "mock-session-read-only"
    assert session.tenant.tenant_id == "mock-tenant-paper-evaluation"
    assert session.tenant.hosted_datastore_enabled is False
    assert session.tenant.local_sqlite_access is False
    assert session.safety_defaults.trading_mode == "paper"
    assert session.safety_defaults.enable_live_trading is False
    assert session.safety_defaults.broker_provider == "paper"
    assert session.safety_flags.paper_only is True
    assert session.safety_flags.read_only is True
    assert session.safety_flags.live_trading_enabled is False
    assert session.safety_flags.broker_api_called is False
    assert session.safety_flags.credentials_collected is False
    assert session.safety_flags.hosted_auth_provider_enabled is False
    assert session.safety_flags.session_cookie_issued is False
    assert session.safety_flags.hosted_datastore_written is False
    assert session.safety_flags.production_trading_ready is False


def test_hosted_paper_mock_session_defines_roles_and_permissions() -> None:
    session = get_hosted_paper_mock_session(Settings())

    roles = {role.role: role for role in session.role_schema}
    assert set(roles) == {
        "viewer",
        "research_reviewer",
        "risk_reviewer",
        "paper_operator",
        "tenant_admin",
    }
    assert all(role.paper_only for role in roles.values())
    assert all(role.can_enable_live_trading is False for role in roles.values())
    assert all(role.can_upload_broker_credentials is False for role in roles.values())

    permissions = {
        permission.permission: permission for permission in session.permission_schema
    }
    assert permissions["read_hosted_readiness"].granted_in_mock_session is True
    assert permissions["read_mock_session"].granted_in_mock_session is True
    assert permissions["read_current_tenant"].granted_in_mock_session is True
    assert permissions["create_paper_approval_request"].granted_in_mock_session is False
    assert permissions["record_paper_reviewer_decision"].granted_in_mock_session is False
    assert permissions["submit_approved_paper_workflow"].granted_in_mock_session is False
    assert (
        permissions["submit_approved_paper_workflow"].requires_completed_approval_request
        is True
    )
    assert permissions["enable_live_trading"].granted_in_mock_session is False
    assert permissions["upload_broker_credentials"].granted_in_mock_session is False


def test_hosted_paper_mock_session_api_returns_read_only_contract() -> None:
    client = TestClient(app)

    response = client.get("/api/hosted-paper/session")

    assert response.status_code == 200
    payload = response.json()
    assert payload["service"] == "hosted-paper-mock-session-contract"
    assert payload["contract_state"] == "mock_read_only"
    assert payload["session"]["authenticated"] is False
    assert payload["session"]["authentication_provider"] == "none"
    assert payload["tenant"]["tenant_id"] == "mock-tenant-paper-evaluation"
    assert payload["tenant"]["hosted_datastore_enabled"] is False
    assert payload["safety_flags"]["paper_only"] is True
    assert payload["safety_flags"]["read_only"] is True
    assert payload["safety_flags"]["live_trading_enabled"] is False
    assert payload["safety_flags"]["broker_api_called"] is False
    assert payload["safety_flags"]["credentials_collected"] is False
    assert payload["safety_flags"]["session_cookie_issued"] is False
    assert payload["safety_flags"]["hosted_datastore_written"] is False
    assert any(item["role"] == "viewer" for item in payload["role_schema"])
    assert any(
        item["permission"] == "submit_approved_paper_workflow"
        and item["granted_in_mock_session"] is False
        for item in payload["permission_schema"]
    )


def test_hosted_paper_current_tenant_api_returns_mock_tenant_only() -> None:
    client = TestClient(app)

    response = client.get("/api/hosted-paper/tenants/current")

    assert response.status_code == 200
    payload = response.json()
    assert payload["tenant_id"] == "mock-tenant-paper-evaluation"
    assert payload["tenant_mode"] == "paper_only_mock"
    assert payload["tenant_isolation_required"] is True
    assert payload["hosted_datastore_enabled"] is False
    assert payload["local_sqlite_access"] is False
    assert payload["live_trading_enabled"] is False
    assert payload["broker_provider"] == "paper"
