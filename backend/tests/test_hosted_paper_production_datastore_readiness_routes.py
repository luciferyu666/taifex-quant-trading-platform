from fastapi.testclient import TestClient

from app.core.config import Settings
from app.domain.hosted_paper_production_datastore import (
    get_hosted_paper_production_datastore_readiness,
)
from app.main import app


def test_hosted_paper_production_datastore_readiness_is_contract_only() -> None:
    readiness = get_hosted_paper_production_datastore_readiness(Settings())

    assert readiness.service == "hosted-paper-production-datastore-readiness"
    assert readiness.readiness_state == "contract_only_no_production_datastore"
    assert readiness.recommended_datastore_pattern == (
        "managed_postgres_via_marketplace_candidate"
    )
    assert readiness.tenant_key == "tenant_id"
    assert readiness.capabilities.production_datastore_enabled is False
    assert readiness.capabilities.managed_postgres_selected is False
    assert readiness.capabilities.marketplace_provisioning_enabled is False
    assert readiness.capabilities.hosted_records_writable is False
    assert readiness.capabilities.hosted_records_readable is False
    assert readiness.capabilities.migrations_apply_enabled is False
    assert readiness.capabilities.backup_policy_configured is False
    assert readiness.capabilities.point_in_time_recovery_required is True
    assert readiness.capabilities.restore_drill_verified is False
    assert readiness.capabilities.retention_policy_enforced is False
    assert readiness.capabilities.local_sqlite_allowed_for_production is False
    assert readiness.migration_boundary.database_url_read is False
    assert readiness.migration_boundary.connection_attempted is False
    assert readiness.migration_boundary.apply_enabled is False
    assert readiness.safety_defaults.trading_mode == "paper"
    assert readiness.safety_defaults.enable_live_trading is False
    assert readiness.safety_defaults.broker_provider == "paper"
    assert readiness.safety_flags.paper_only is True
    assert readiness.safety_flags.database_written is False
    assert readiness.safety_flags.external_db_written is False
    assert readiness.safety_flags.broker_api_called is False
    assert readiness.safety_flags.order_created is False
    assert readiness.safety_flags.production_trading_ready is False


def test_hosted_paper_production_datastore_readiness_api_returns_scope() -> None:
    client = TestClient(app)

    response = client.get("/api/hosted-paper/production-datastore/readiness")

    assert response.status_code == 200
    payload = response.json()
    assert payload["service"] == "hosted-paper-production-datastore-readiness"
    assert payload["readiness_state"] == "contract_only_no_production_datastore"
    assert payload["capabilities"]["production_datastore_enabled"] is False
    assert payload["capabilities"]["managed_postgres_selected"] is False
    assert payload["capabilities"]["hosted_records_writable"] is False
    assert payload["capabilities"]["local_sqlite_allowed_for_production"] is False
    assert payload["migration_boundary"]["database_url_read"] is False
    assert payload["migration_boundary"]["connection_attempted"] is False
    assert payload["migration_boundary"]["apply_enabled"] is False
    assert payload["safety_flags"]["database_written"] is False
    assert payload["safety_flags"]["external_db_written"] is False
    assert payload["safety_flags"]["broker_api_called"] is False
    assert payload["safety_flags"]["order_created"] is False

    record_groups = {group["record_group"] for group in payload["record_groups"]}
    assert record_groups == {
        "paper_approval",
        "paper_order",
        "oms_event",
        "audit_event",
    }
    table_names = {
        table_name
        for group in payload["record_groups"]
        for table_name in group["table_names"]
    }
    assert "hosted_paper_approval_requests" in table_names
    assert "hosted_paper_orders" in table_names
    assert "hosted_paper_oms_events" in table_names
    assert "hosted_paper_audit_events" in table_names
    assert "production_datastore" in payload["docs"]


def test_hosted_paper_production_datastore_readiness_keeps_local_sqlite_demo_only() -> None:
    client = TestClient(app)

    payload = client.get("/api/hosted-paper/production-datastore/readiness").json()

    assert payload["capabilities"]["local_sqlite_allowed_for_production"] is False
    assert payload["local_sqlite_boundary"].startswith("Local SQLite remains allowed")
    assert any("No DATABASE_URL is read" in warning for warning in payload["warnings"])
    assert any("Local SQLite remains for demo" in warning for warning in payload["warnings"])
    assert any(
        "Backup, retention, and restore controls are required" in warning
        for warning in payload["warnings"]
    )
