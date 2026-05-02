from fastapi.testclient import TestClient

from app.core.config import Settings
from app.domain.paper_audit_worm_readiness import get_paper_audit_worm_readiness
from app.main import app


def test_paper_audit_worm_readiness_domain_is_not_production_worm() -> None:
    readiness = get_paper_audit_worm_readiness(Settings())

    assert readiness.service == "paper-audit-worm-readiness"
    assert readiness.readiness_state == "local_sqlite_not_production_worm_ledger"
    assert readiness.storage.local_sqlite_audit_enabled is True
    assert readiness.storage.local_hash_chain_enabled is True
    assert readiness.storage.worm_storage_enabled is False
    assert readiness.storage.immutable_ledger_enabled is False
    assert readiness.storage.centralized_audit_service_enabled is False
    assert readiness.storage.external_timestamping_enabled is False
    assert readiness.storage.cryptographic_signing_enabled is False
    assert readiness.storage.retention_policy_enforced is False
    assert readiness.storage.production_audit_compliance is False
    assert readiness.safety_flags.paper_only is True
    assert readiness.safety_flags.read_only is True
    assert readiness.safety_flags.live_trading_enabled is False
    assert readiness.safety_flags.broker_api_called is False
    assert readiness.safety_flags.database_written is False
    assert readiness.safety_flags.worm_compliance_claim is False
    assert readiness.safety_flags.production_trading_ready is False


def test_paper_audit_worm_readiness_api_is_read_only_boundary() -> None:
    client = TestClient(app)

    response = client.get("/api/paper-execution/audit-integrity/worm-readiness")

    assert response.status_code == 200
    payload = response.json()
    assert payload["service"] == "paper-audit-worm-readiness"
    assert payload["readiness_state"] == "local_sqlite_not_production_worm_ledger"
    assert payload["storage"]["local_sqlite_audit_enabled"] is True
    assert payload["storage"]["local_hash_chain_enabled"] is True
    assert payload["storage"]["worm_storage_enabled"] is False
    assert payload["storage"]["immutable_ledger_enabled"] is False
    assert payload["storage"]["centralized_audit_service_enabled"] is False
    assert payload["storage"]["object_lock_enabled"] is False
    assert payload["storage"]["retention_policy_enforced"] is False
    assert payload["storage"]["production_audit_compliance"] is False
    assert payload["safety_defaults"]["trading_mode"] == "paper"
    assert payload["safety_defaults"]["enable_live_trading"] is False
    assert payload["safety_defaults"]["broker_provider"] == "paper"
    assert payload["safety_flags"]["paper_only"] is True
    assert payload["safety_flags"]["read_only"] is True
    assert payload["safety_flags"]["live_trading_enabled"] is False
    assert payload["safety_flags"]["broker_provider"] == "paper"
    assert payload["safety_flags"]["broker_api_called"] is False
    assert payload["safety_flags"]["order_created"] is False
    assert payload["safety_flags"]["credentials_collected"] is False
    assert payload["safety_flags"]["database_written"] is False
    assert payload["safety_flags"]["external_db_written"] is False
    assert payload["safety_flags"]["worm_compliance_claim"] is False
    assert payload["safety_flags"]["production_audit_compliance"] is False
    assert payload["safety_flags"]["production_trading_ready"] is False
    assert any("WORM-capable" in item for item in payload["required_before_worm_claim"])
    assert "Local SQLite audit persistence is not production WORM storage." in payload[
        "warnings"
    ]


def test_paper_audit_worm_readiness_does_not_claim_immutability() -> None:
    client = TestClient(app)

    payload = client.get("/api/paper-execution/audit-integrity/worm-readiness").json()

    assert payload["storage"]["worm_storage_enabled"] is False
    assert payload["storage"]["immutable_ledger_enabled"] is False
    assert payload["storage"]["production_audit_compliance"] is False
    assert payload["safety_flags"]["worm_compliance_claim"] is False
    assert payload["safety_flags"]["production_audit_compliance"] is False
    assert payload["safety_flags"]["order_created"] is False
    assert payload["safety_flags"]["broker_api_called"] is False
