from fastapi.testclient import TestClient

from app.core.config import Settings
from app.domain.hosted_paper_auth_provider_selection import (
    get_hosted_paper_auth_provider_selection,
)
from app.main import app


def test_hosted_paper_auth_provider_selection_domain_is_read_only() -> None:
    selection = get_hosted_paper_auth_provider_selection(Settings())

    assert selection.service == "hosted-paper-auth-provider-selection"
    assert selection.selection_state == "selection_matrix_only"
    assert selection.safety_defaults.trading_mode == "paper"
    assert selection.safety_defaults.enable_live_trading is False
    assert selection.safety_defaults.broker_provider == "paper"
    assert selection.safety_flags.paper_only is True
    assert selection.safety_flags.read_only is True
    assert selection.safety_flags.live_trading_enabled is False
    assert selection.safety_flags.provider_selected is False
    assert selection.safety_flags.integration_enabled is False
    assert selection.safety_flags.auth_provider_enabled is False
    assert selection.safety_flags.customer_account_created is False
    assert selection.safety_flags.session_cookie_issued is False
    assert selection.safety_flags.credentials_collected is False
    assert selection.safety_flags.secrets_added is False
    assert selection.safety_flags.hosted_datastore_written is False
    assert selection.safety_flags.broker_api_called is False
    assert selection.safety_flags.order_created is False
    assert selection.safety_flags.production_trading_ready is False


def test_hosted_paper_auth_provider_selection_compares_expected_candidates() -> None:
    selection = get_hosted_paper_auth_provider_selection(Settings())

    candidates = {candidate.provider: candidate for candidate in selection.candidates}

    assert set(candidates) == {
        "Clerk",
        "Auth0",
        "Descope",
        "Vercel OIDC / Sign in with Vercel",
    }
    assert candidates["Clerk"].paper_saas_fit == "strong_pilot_candidate"
    assert candidates["Auth0"].paper_saas_fit == "strong_enterprise_candidate"
    assert candidates["Descope"].paper_saas_fit == "pilot_candidate"
    assert (
        candidates["Vercel OIDC / Sign in with Vercel"].paper_saas_fit
        == "internal_operator_candidate"
    )
    assert all(candidate.integration_enabled is False for candidate in candidates.values())
    assert all(candidate.credentials_required_now is False for candidate in candidates.values())
    assert all(candidate.secrets_added is False for candidate in candidates.values())
    assert all(
        candidate.customer_accounts_created is False for candidate in candidates.values()
    )


def test_hosted_paper_auth_provider_selection_api_returns_safe_matrix() -> None:
    client = TestClient(app)

    response = client.get("/api/hosted-paper/auth-provider-selection")

    assert response.status_code == 200
    payload = response.json()
    assert payload["service"] == "hosted-paper-auth-provider-selection"
    assert payload["selection_state"] == "selection_matrix_only"
    assert payload["safety_flags"]["provider_selected"] is False
    assert payload["safety_flags"]["integration_enabled"] is False
    assert payload["safety_flags"]["auth_provider_enabled"] is False
    assert payload["safety_flags"]["customer_account_created"] is False
    assert payload["safety_flags"]["reviewer_login_created"] is False
    assert payload["safety_flags"]["session_cookie_issued"] is False
    assert payload["safety_flags"]["credentials_collected"] is False
    assert payload["safety_flags"]["secrets_added"] is False
    assert payload["safety_flags"]["broker_api_called"] is False
    assert payload["safety_flags"]["order_created"] is False
    assert payload["safety_flags"]["production_trading_ready"] is False
    assert {candidate["provider"] for candidate in payload["candidates"]} == {
        "Clerk",
        "Auth0",
        "Descope",
        "Vercel OIDC / Sign in with Vercel",
    }
    assert any(
        criterion["criterion"] == "tenant_boundary"
        for criterion in payload["criteria"]
    )
    assert "Do not install provider SDKs in this slice." in payload["non_goals"]
    assert "Live trading remains disabled by default." in payload["warnings"]
