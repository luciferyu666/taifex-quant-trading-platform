from fastapi.testclient import TestClient

from app.core.config import Settings
from app.domain.paper_compliance_approval import (
    get_paper_compliance_approval_readiness,
)
from app.main import app


def test_paper_compliance_approval_readiness_domain_is_local_scaffolding() -> None:
    readiness = get_paper_compliance_approval_readiness(Settings())

    assert readiness.service == "paper-compliance-approval-readiness"
    assert readiness.readiness_state == (
        "local_paper_scaffolding_not_formal_compliance_system"
    )
    assert readiness.scaffolding.local_paper_approval_queue_enabled is True
    assert readiness.scaffolding.local_sqlite_persistence_enabled is True
    assert readiness.scaffolding.local_dual_review_rule_enabled is True
    assert readiness.scaffolding.formal_compliance_approval_enabled is False
    assert readiness.scaffolding.production_approval_authority is False
    assert readiness.scaffolding.reviewer_identity_verified is False
    assert readiness.scaffolding.rbac_abac_enforced is False
    assert readiness.scaffolding.compliance_policy_engine_enabled is False
    assert readiness.audit.local_hash_chain_enabled is True
    assert readiness.audit.worm_ledger_enabled is False
    assert readiness.audit.centralized_audit_service_enabled is False
    assert readiness.safety_flags.paper_only is True
    assert readiness.safety_flags.read_only is True
    assert readiness.safety_flags.live_trading_enabled is False
    assert readiness.safety_flags.production_compliance_approval is False
    assert readiness.safety_flags.live_approval_granted is False
    assert readiness.safety_flags.order_created is False
    assert readiness.safety_flags.database_written is False


def test_paper_compliance_approval_readiness_api_is_read_only_boundary() -> None:
    client = TestClient(app)

    response = client.get("/api/paper-execution/approvals/compliance-readiness")

    assert response.status_code == 200
    payload = response.json()
    assert payload["service"] == "paper-compliance-approval-readiness"
    assert (
        payload["readiness_state"]
        == "local_paper_scaffolding_not_formal_compliance_system"
    )
    assert payload["scaffolding"]["formal_compliance_approval_enabled"] is False
    assert payload["scaffolding"]["production_approval_authority"] is False
    assert payload["scaffolding"]["reviewer_identity_verified"] is False
    assert payload["scaffolding"]["rbac_abac_enforced"] is False
    assert payload["scaffolding"]["tenant_scoped_approval_records_enabled"] is False
    assert payload["audit"]["worm_ledger_enabled"] is False
    assert payload["audit"]["immutable_audit_log_enabled"] is False
    assert payload["audit"]["centralized_audit_service_enabled"] is False
    assert payload["safety_defaults"]["trading_mode"] == "paper"
    assert payload["safety_defaults"]["enable_live_trading"] is False
    assert payload["safety_defaults"]["broker_provider"] == "paper"
    assert payload["safety_flags"]["paper_only"] is True
    assert payload["safety_flags"]["read_only"] is True
    assert payload["safety_flags"]["live_trading_enabled"] is False
    assert payload["safety_flags"]["broker_provider"] == "paper"
    assert payload["safety_flags"]["broker_api_called"] is False
    assert payload["safety_flags"]["credentials_collected"] is False
    assert payload["safety_flags"]["database_written"] is False
    assert payload["safety_flags"]["external_db_written"] is False
    assert payload["safety_flags"]["production_compliance_approval"] is False
    assert payload["safety_flags"]["paper_execution_approval_granted"] is False
    assert payload["safety_flags"]["production_trading_ready"] is False
    assert any("Real reviewer login" in item for item in payload["missing_for_formal_compliance"])
    assert any("WORM" in item for item in payload["required_before_formal_approval"])
    assert "Production Trading Platform remains NOT READY." in payload["warnings"]


def test_paper_compliance_approval_readiness_does_not_grant_execution() -> None:
    client = TestClient(app)

    payload = client.get("/api/paper-execution/approvals/compliance-readiness").json()

    assert payload["safety_flags"]["order_created"] is False
    assert payload["safety_flags"]["paper_execution_approval_granted"] is False
    assert payload["safety_flags"]["live_approval_granted"] is False
    assert payload["safety_flags"]["broker_api_called"] is False
    assert payload["safety_flags"]["production_compliance_approval"] is False
