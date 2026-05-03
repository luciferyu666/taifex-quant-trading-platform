from fastapi.testclient import TestClient

from app.core.config import Settings
from app.domain.hosted_paper_security_operations import (
    get_hosted_paper_security_operations_readiness,
)
from app.main import app


def test_hosted_paper_security_operations_domain_is_read_only() -> None:
    readiness = get_hosted_paper_security_operations_readiness(Settings())

    assert readiness.service == "hosted-paper-security-operations-readiness"
    assert readiness.readiness_state == "readiness_contract_only_not_operational"
    assert readiness.capabilities.static_secret_scan_gate_enabled is True
    assert readiness.capabilities.ci_release_readiness_gate_enabled is True
    assert readiness.capabilities.production_smoke_gate_enabled is True
    assert readiness.capabilities.secrets_management_enabled is False
    assert readiness.capabilities.rate_limiting_enabled is False
    assert readiness.capabilities.audit_monitoring_enabled is False
    assert readiness.capabilities.observability_pipeline_enabled is False
    assert readiness.capabilities.staging_smoke_gate_enabled is False
    assert readiness.capabilities.load_test_gate_enabled is False
    assert readiness.capabilities.abuse_test_gate_enabled is False
    assert readiness.capabilities.auth_boundary_test_gate_enabled is False
    assert readiness.capabilities.production_operations_ready is False
    assert readiness.safety_defaults.trading_mode == "paper"
    assert readiness.safety_defaults.enable_live_trading is False
    assert readiness.safety_defaults.broker_provider == "paper"
    assert readiness.safety_flags.paper_only is True
    assert readiness.safety_flags.read_only is True
    assert readiness.safety_flags.live_trading_enabled is False
    assert readiness.safety_flags.secrets_stored is False
    assert readiness.safety_flags.credentials_collected is False
    assert readiness.safety_flags.broker_api_called is False
    assert readiness.safety_flags.order_created is False
    assert readiness.safety_flags.load_test_executed is False
    assert readiness.safety_flags.abuse_test_executed is False
    assert readiness.safety_flags.production_security_approval is False
    assert readiness.safety_flags.production_trading_ready is False


def test_hosted_paper_security_operations_lists_required_controls() -> None:
    readiness = get_hosted_paper_security_operations_readiness(Settings())
    controls = {control.control: control for control in readiness.controls}

    assert {
        "secrets_management",
        "rate_limiting",
        "audit_monitoring",
        "observability",
        "ci_cd_deployment_gates",
        "staging_smoke_test",
        "basic_load_abuse_testing",
        "auth_boundary_testing",
    } == set(controls)
    assert controls["ci_cd_deployment_gates"].enabled is True
    assert controls["rate_limiting"].enabled is False
    assert controls["basic_load_abuse_testing"].enabled is False
    assert controls["auth_boundary_testing"].required_before_hosted_customer_use is True


def test_hosted_paper_security_operations_api_returns_safe_contract() -> None:
    client = TestClient(app)

    response = client.get("/api/hosted-paper/security-operations/readiness")

    assert response.status_code == 200
    payload = response.json()
    assert payload["service"] == "hosted-paper-security-operations-readiness"
    assert payload["readiness_state"] == "readiness_contract_only_not_operational"
    assert payload["capabilities"]["ci_release_readiness_gate_enabled"] is True
    assert payload["capabilities"]["production_smoke_gate_enabled"] is True
    assert payload["capabilities"]["secrets_management_enabled"] is False
    assert payload["capabilities"]["rate_limiting_enabled"] is False
    assert payload["capabilities"]["staging_smoke_gate_enabled"] is False
    assert payload["capabilities"]["load_test_gate_enabled"] is False
    assert payload["capabilities"]["abuse_test_gate_enabled"] is False
    assert payload["capabilities"]["auth_boundary_test_gate_enabled"] is False
    assert payload["safety_flags"]["paper_only"] is True
    assert payload["safety_flags"]["live_trading_enabled"] is False
    assert payload["safety_flags"]["secrets_stored"] is False
    assert payload["safety_flags"]["credentials_collected"] is False
    assert payload["safety_flags"]["broker_api_called"] is False
    assert payload["safety_flags"]["order_created"] is False
    assert payload["safety_flags"]["production_security_approval"] is False
    assert payload["safety_flags"]["production_trading_ready"] is False
    assert any(
        control["control"] == "secrets_management" for control in payload["controls"]
    )
    assert any(
        control["control"] == "rate_limiting" for control in payload["controls"]
    )
    assert "Live trading remains disabled by default." in payload["warnings"]
