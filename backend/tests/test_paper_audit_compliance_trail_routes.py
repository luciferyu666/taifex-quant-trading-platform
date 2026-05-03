from fastapi.testclient import TestClient

from app.core.config import Settings
from app.domain.paper_audit_compliance_trail import (
    get_paper_audit_compliance_trail_readiness,
)
from app.main import app

EXPECTED_REQUIREMENTS = {
    "append_only_audit_service",
    "immutable_audit_log_or_worm",
    "reviewer_identity_rbac_abac",
    "decision_history",
    "retention_policy",
    "export_policy",
}


def test_paper_audit_compliance_trail_domain_is_read_only() -> None:
    readiness = get_paper_audit_compliance_trail_readiness(Settings())

    assert readiness.service == "paper-audit-compliance-trail-readiness"
    assert (
        readiness.readiness_state
        == "local_sqlite_hash_chain_not_formal_compliance_trail"
    )
    assert readiness.capabilities.local_sqlite_audit_enabled is True
    assert readiness.capabilities.local_hash_chain_preview_enabled is True
    assert readiness.capabilities.append_only_audit_service_enabled is False
    assert readiness.capabilities.immutable_audit_log_enabled is False
    assert readiness.capabilities.worm_storage_enabled is False
    assert readiness.capabilities.reviewer_identity_enforced is False
    assert readiness.capabilities.rbac_abac_enforced is False
    assert readiness.capabilities.decision_history_immutable is False
    assert readiness.capabilities.retention_policy_enforced is False
    assert readiness.capabilities.export_policy_enforced is False
    assert readiness.capabilities.production_compliance_trail_ready is False
    assert readiness.safety_flags.paper_only is True
    assert readiness.safety_flags.read_only is True
    assert readiness.safety_flags.live_trading_enabled is False
    assert readiness.safety_flags.broker_api_called is False
    assert readiness.safety_flags.order_created is False
    assert readiness.safety_flags.auth_provider_enabled is False
    assert readiness.safety_flags.reviewer_login_created is False
    assert readiness.safety_flags.database_written is False
    assert readiness.safety_flags.external_db_written is False
    assert readiness.safety_flags.append_only_audit_service_enabled is False
    assert readiness.safety_flags.immutable_log_claim is False
    assert readiness.safety_flags.compliance_claim is False
    assert readiness.safety_flags.production_trading_ready is False

    assert {item.area_id for item in readiness.requirements} == EXPECTED_REQUIREMENTS
    assert all(
        item.current_release_status == "not_enabled"
        for item in readiness.requirements
    )


def test_paper_audit_compliance_trail_api_contract() -> None:
    client = TestClient(app)

    response = client.get(
        "/api/paper-execution/audit-integrity/compliance-trail-readiness"
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["service"] == "paper-audit-compliance-trail-readiness"
    assert (
        payload["readiness_state"]
        == "local_sqlite_hash_chain_not_formal_compliance_trail"
    )
    assert payload["safety_defaults"]["trading_mode"] == "paper"
    assert payload["safety_defaults"]["enable_live_trading"] is False
    assert payload["safety_defaults"]["broker_provider"] == "paper"

    capabilities = payload["capabilities"]
    assert capabilities["local_sqlite_audit_enabled"] is True
    assert capabilities["local_hash_chain_preview_enabled"] is True
    assert capabilities["append_only_audit_service_enabled"] is False
    assert capabilities["immutable_audit_log_enabled"] is False
    assert capabilities["worm_storage_enabled"] is False
    assert capabilities["reviewer_identity_enforced"] is False
    assert capabilities["rbac_abac_enforced"] is False
    assert capabilities["decision_history_immutable"] is False
    assert capabilities["retention_policy_enforced"] is False
    assert capabilities["export_policy_enforced"] is False
    assert capabilities["production_compliance_trail_ready"] is False

    flags = payload["safety_flags"]
    assert flags["paper_only"] is True
    assert flags["read_only"] is True
    assert flags["live_trading_enabled"] is False
    assert flags["broker_provider"] == "paper"
    assert flags["broker_api_called"] is False
    assert flags["order_created"] is False
    assert flags["credentials_collected"] is False
    assert flags["auth_provider_enabled"] is False
    assert flags["reviewer_login_created"] is False
    assert flags["database_written"] is False
    assert flags["external_db_written"] is False
    assert flags["append_only_audit_service_enabled"] is False
    assert flags["immutable_log_claim"] is False
    assert flags["compliance_claim"] is False
    assert flags["production_trading_ready"] is False

    requirement_ids = {item["area_id"] for item in payload["requirements"]}
    assert requirement_ids == EXPECTED_REQUIREMENTS
    assert any(
        "retention" in item.lower()
        for item in payload["required_before_compliance_claim"]
    )
    assert "No append-only audit service is enabled." in payload["warnings"]


def test_paper_audit_compliance_trail_does_not_claim_compliance() -> None:
    client = TestClient(app)

    payload = client.get(
        "/api/paper-execution/audit-integrity/compliance-trail-readiness"
    ).json()

    assert payload["capabilities"]["append_only_audit_service_enabled"] is False
    assert payload["capabilities"]["production_compliance_trail_ready"] is False
    assert payload["safety_flags"]["database_written"] is False
    assert payload["safety_flags"]["broker_api_called"] is False
    assert payload["safety_flags"]["order_created"] is False
    assert payload["safety_flags"]["immutable_log_claim"] is False
    assert payload["safety_flags"]["compliance_claim"] is False
