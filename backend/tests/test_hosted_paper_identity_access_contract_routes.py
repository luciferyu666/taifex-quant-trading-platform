from fastapi.testclient import TestClient

from app.core.config import Settings
from app.domain.hosted_paper_identity_access import (
    get_hosted_paper_identity_access_contract,
)
from app.main import app


def test_hosted_paper_identity_access_contract_domain_is_read_only() -> None:
    contract = get_hosted_paper_identity_access_contract(Settings())

    assert contract.service == "hosted-paper-identity-access-contract"
    assert contract.contract_state == "contract_only_not_implemented"
    assert contract.identity_provider.provider_required is True
    assert contract.identity_provider.provider_selected is False
    assert contract.identity_provider.real_login_enabled is False
    assert contract.identity_provider.customer_signup_enabled is False
    assert contract.identity_provider.reviewer_login_enabled is False
    assert contract.identity_provider.session_cookie_issued is False
    assert contract.session_boundary.session_validation_enabled is False
    assert contract.tenant_boundary.tenant_id_required_on_every_request is True
    assert contract.tenant_boundary.cross_tenant_access_allowed is False
    assert contract.tenant_boundary.tenant_isolation_enforced is False
    assert contract.tenant_boundary.local_sqlite_allowed_for_hosted_tenant_records is False
    assert contract.safety_defaults.trading_mode == "paper"
    assert contract.safety_defaults.enable_live_trading is False
    assert contract.safety_defaults.broker_provider == "paper"
    assert contract.safety_flags.paper_only is True
    assert contract.safety_flags.read_only is True
    assert contract.safety_flags.live_trading_enabled is False
    assert contract.safety_flags.auth_provider_enabled is False
    assert contract.safety_flags.real_login_enabled is False
    assert contract.safety_flags.customer_account_created is False
    assert contract.safety_flags.session_cookie_issued is False
    assert contract.safety_flags.rbac_enforced is False
    assert contract.safety_flags.abac_enforced is False
    assert contract.safety_flags.tenant_isolation_enforced is False
    assert contract.safety_flags.broker_api_called is False
    assert contract.safety_flags.order_created is False
    assert contract.safety_flags.production_trading_ready is False


def test_hosted_paper_identity_access_contract_defines_role_separation() -> None:
    contract = get_hosted_paper_identity_access_contract(Settings())

    roles = {role.role: role for role in contract.role_permission_matrix}

    assert set(roles) == {"customer", "reviewer", "operator", "admin"}
    assert "read_own_paper_records" in roles["customer"].allowed_read_permissions
    assert "record_research_review_decision" in roles["reviewer"].allowed_future_mutations
    assert "submit_approved_paper_workflow" in roles["operator"].allowed_future_mutations
    assert "manage_tenant_members" in roles["admin"].allowed_future_mutations
    assert roles["reviewer"].requires_mfa is True
    assert roles["operator"].requires_dual_review is True
    assert all(role.can_enable_live_trading is False for role in roles.values())
    assert all(role.can_upload_broker_credentials is False for role in roles.values())
    assert all("enable_live_trading" in role.denied_permissions for role in roles.values())
    assert all("upload_broker_credentials" in role.denied_permissions for role in roles.values())


def test_hosted_paper_identity_access_contract_api_returns_safe_contract() -> None:
    client = TestClient(app)

    response = client.get("/api/hosted-paper/identity-access-contract")

    assert response.status_code == 200
    payload = response.json()
    assert payload["service"] == "hosted-paper-identity-access-contract"
    assert payload["contract_state"] == "contract_only_not_implemented"
    assert payload["identity_provider"]["provider_selected"] is False
    assert payload["identity_provider"]["real_login_enabled"] is False
    assert payload["identity_provider"]["session_cookie_issued"] is False
    assert payload["session_boundary"]["session_validation_enabled"] is False
    assert payload["tenant_boundary"]["tenant_id_required_on_every_record"] is True
    assert payload["tenant_boundary"]["cross_tenant_access_allowed"] is False
    assert payload["tenant_boundary"]["tenant_isolation_enforced"] is False
    assert payload["safety_flags"]["paper_only"] is True
    assert payload["safety_flags"]["live_trading_enabled"] is False
    assert payload["safety_flags"]["credentials_collected"] is False
    assert payload["safety_flags"]["broker_credentials_collected"] is False
    assert payload["safety_flags"]["broker_api_called"] is False
    assert payload["safety_flags"]["order_created"] is False
    assert payload["safety_flags"]["production_trading_ready"] is False
    assert any(
        role["role"] == "operator"
        and "submit_approved_paper_workflow" in role["allowed_future_mutations"]
        for role in payload["role_permission_matrix"]
    )
    assert any(
        policy["policy"] == "paper_only_mode" and policy["enabled"] is False
        for policy in payload["abac_policies"]
    )
    assert "Live trading remains disabled by default." in payload["warnings"]
