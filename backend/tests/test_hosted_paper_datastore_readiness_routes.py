from fastapi.testclient import TestClient

from app.core.config import Settings
from app.domain.hosted_paper_datastore import (
    get_hosted_paper_datastore_readiness,
)
from app.main import app


def test_hosted_paper_datastore_readiness_domain_is_schema_only() -> None:
    readiness = get_hosted_paper_datastore_readiness(Settings())

    assert readiness.service == "hosted-paper-managed-datastore-readiness"
    assert readiness.readiness_state == "schema_only_no_hosted_datastore"
    assert readiness.tenant_key == "tenant_id"
    assert readiness.capabilities.managed_datastore_enabled is False
    assert readiness.capabilities.hosted_records_writable is False
    assert readiness.capabilities.hosted_records_readable is False
    assert readiness.capabilities.tenant_key_enforced is False
    assert readiness.capabilities.local_sqlite_replacement_required is True
    assert readiness.migration_boundary.dry_run_only is True
    assert readiness.migration_boundary.apply_enabled is False
    assert readiness.migration_boundary.connection_attempted is False
    assert len(readiness.record_models) >= 5
    assert all(model.tenant_key == "tenant_id" for model in readiness.record_models)
    assert all(model.tenant_key_required for model in readiness.record_models)
    assert readiness.safety_defaults.trading_mode == "paper"
    assert readiness.safety_defaults.enable_live_trading is False
    assert readiness.safety_defaults.broker_provider == "paper"
    assert readiness.safety_flags.paper_only is True
    assert readiness.safety_flags.database_written is False
    assert readiness.safety_flags.external_db_written is False
    assert readiness.safety_flags.broker_api_called is False
    assert readiness.safety_flags.production_trading_ready is False


def test_hosted_paper_datastore_readiness_api_returns_record_models() -> None:
    client = TestClient(app)

    response = client.get("/api/hosted-paper/datastore-readiness")

    assert response.status_code == 200
    payload = response.json()
    assert payload["service"] == "hosted-paper-managed-datastore-readiness"
    assert payload["readiness_state"] == "schema_only_no_hosted_datastore"
    assert payload["tenant_key"] == "tenant_id"
    assert payload["capabilities"]["managed_datastore_enabled"] is False
    assert payload["capabilities"]["hosted_records_writable"] is False
    assert payload["capabilities"]["tenant_key_enforced"] is False
    assert payload["migration_boundary"]["dry_run_only"] is True
    assert payload["migration_boundary"]["apply_enabled"] is False
    assert payload["migration_boundary"]["connection_attempted"] is False
    assert payload["safety_flags"]["database_written"] is False
    assert payload["safety_flags"]["external_db_written"] is False
    assert payload["safety_flags"]["broker_credentials_collected"] is False
    table_names = {model["table_name"] for model in payload["record_models"]}
    assert "hosted_paper_approval_requests" in table_names
    assert "hosted_paper_approval_decisions" in table_names
    assert "hosted_paper_workflow_runs" in table_names
    assert "hosted_paper_oms_events" in table_names
    assert "hosted_paper_audit_events" in table_names
    assert "hosted_paper_datastore" in payload["docs"]


def test_hosted_paper_datastore_readiness_api_does_not_enable_hosted_writes() -> None:
    client = TestClient(app)

    payload = client.get("/api/hosted-paper/datastore-readiness").json()

    assert payload["capabilities"]["hosted_records_writable"] is False
    assert payload["capabilities"]["migrations_apply_enabled"] is False
    assert payload["safety_flags"]["order_created"] is False
    assert payload["safety_flags"]["live_trading_enabled"] is False
    assert any("No hosted records are read or written" in item for item in payload["warnings"])
    assert any(
        "No hosted database connection is configured or attempted" in item
        for item in payload["warnings"]
    )
