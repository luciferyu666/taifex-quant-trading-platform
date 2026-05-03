from fastapi.testclient import TestClient

from app.core.config import Settings
from app.domain.hosted_paper_sandbox_onboarding import (
    get_hosted_paper_sandbox_onboarding_readiness,
)
from app.main import app


def test_hosted_paper_sandbox_onboarding_domain_is_contract_only() -> None:
    readiness = get_hosted_paper_sandbox_onboarding_readiness(Settings())

    assert readiness.service == "hosted-paper-sandbox-onboarding-readiness"
    assert readiness.readiness_state == "contract_only_no_online_sandbox_tenant"
    assert readiness.capabilities.online_sandbox_tenant_enabled is False
    assert readiness.capabilities.browser_only_customer_onboarding_enabled is False
    assert readiness.capabilities.hosted_backend_enabled is False
    assert readiness.capabilities.managed_datastore_enabled is False
    assert readiness.capabilities.real_login_enabled is False
    assert readiness.capabilities.tenant_isolation_enforced is False
    assert readiness.capabilities.guided_demo_data_contract_defined is True
    assert readiness.capabilities.guided_demo_data_hosted is False
    assert readiness.capabilities.paper_only_boundary_visible is True
    assert readiness.capabilities.live_trading_controls_visible is False
    assert readiness.safety_defaults.trading_mode == "paper"
    assert readiness.safety_defaults.enable_live_trading is False
    assert readiness.safety_defaults.broker_provider == "paper"
    assert readiness.safety_flags.paper_only is True
    assert readiness.safety_flags.read_only is True
    assert readiness.safety_flags.online_sandbox_tenant_created is False
    assert readiness.safety_flags.customer_account_created is False
    assert readiness.safety_flags.login_enabled is False
    assert readiness.safety_flags.tenant_record_created is False
    assert readiness.safety_flags.hosted_datastore_written is False
    assert readiness.safety_flags.broker_api_called is False
    assert readiness.safety_flags.order_created is False
    assert readiness.safety_flags.production_customer_onboarding_ready is False
    assert readiness.safety_flags.production_trading_ready is False


def test_hosted_paper_sandbox_onboarding_lists_required_steps() -> None:
    readiness = get_hosted_paper_sandbox_onboarding_readiness(Settings())
    steps = {step.step: step for step in readiness.required_onboarding_steps}

    assert {
        "hosted_backend_staging",
        "managed_tenant_datastore",
        "customer_login_session",
        "sandbox_tenant_provisioning",
        "guided_demo_data",
        "customer_browser_demo_flow",
        "security_operations_gate",
    } == set(steps)
    assert all(step.required_before_customer_self_service for step in steps.values())
    assert steps["guided_demo_data"].current_status == "contract_only"
    assert steps["customer_browser_demo_flow"].current_status == (
        "local_demo_required_today"
    )


def test_hosted_paper_sandbox_onboarding_api_returns_safe_contract() -> None:
    client = TestClient(app)

    response = client.get("/api/hosted-paper/sandbox-tenant/onboarding-readiness")

    assert response.status_code == 200
    payload = response.json()
    assert payload["service"] == "hosted-paper-sandbox-onboarding-readiness"
    assert payload["readiness_state"] == "contract_only_no_online_sandbox_tenant"
    assert payload["capabilities"]["online_sandbox_tenant_enabled"] is False
    assert payload["capabilities"]["guided_demo_data_contract_defined"] is True
    assert payload["capabilities"]["guided_demo_data_hosted"] is False
    assert payload["safety_flags"]["paper_only"] is True
    assert payload["safety_flags"]["live_trading_enabled"] is False
    assert payload["safety_flags"]["online_sandbox_tenant_created"] is False
    assert payload["safety_flags"]["customer_account_created"] is False
    assert payload["safety_flags"]["hosted_datastore_written"] is False
    assert payload["safety_flags"]["broker_api_called"] is False
    assert payload["safety_flags"]["order_created"] is False
    assert payload["guided_demo_dataset_contract"]["dataset_status"] == (
        "contract_only_not_hosted"
    )
    assert "Live trading remains disabled by default." in payload["warnings"]
