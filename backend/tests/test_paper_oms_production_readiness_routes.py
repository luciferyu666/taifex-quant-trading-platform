from fastapi.testclient import TestClient

from app.core.config import Settings
from app.domain.paper_oms_production_readiness import (
    get_paper_oms_production_readiness,
)
from app.main import app


def test_paper_oms_production_readiness_domain_is_not_production_oms() -> None:
    readiness = get_paper_oms_production_readiness(Settings())

    assert readiness.service == "paper-oms-production-readiness"
    assert readiness.readiness_state == "local_paper_oms_scaffolding_not_production_oms"
    assert readiness.capabilities.order_state_machine_enabled is True
    assert readiness.capabilities.local_sqlite_persistence_enabled is True
    assert readiness.capabilities.local_outbox_metadata_enabled is True
    assert readiness.capabilities.duplicate_idempotency_metadata_enabled is True
    assert readiness.capabilities.execution_report_metadata_enabled is True
    assert readiness.capabilities.timeout_candidate_scan_enabled is True
    assert readiness.capabilities.asynchronous_order_processing_enabled is False
    assert readiness.capabilities.distributed_durable_queue_enabled is False
    assert readiness.capabilities.outbox_worker_enabled is False
    assert readiness.capabilities.full_timeout_worker_enabled is False
    assert readiness.capabilities.amend_replace_enabled is False
    assert readiness.capabilities.formal_reconciliation_loop_enabled is False
    assert readiness.capabilities.production_oms_ready is False
    assert readiness.safety_flags.paper_only is True
    assert readiness.safety_flags.read_only is True
    assert readiness.safety_flags.live_trading_enabled is False
    assert readiness.safety_flags.broker_api_called is False
    assert readiness.safety_flags.order_created is False
    assert readiness.safety_flags.production_oms_ready is False


def test_paper_oms_production_readiness_api_is_read_only_boundary() -> None:
    client = TestClient(app)

    response = client.get("/api/paper-execution/reliability/production-readiness")

    assert response.status_code == 200
    payload = response.json()
    assert payload["service"] == "paper-oms-production-readiness"
    assert payload["readiness_state"] == "local_paper_oms_scaffolding_not_production_oms"
    assert payload["capabilities"]["order_state_machine_enabled"] is True
    assert payload["capabilities"]["local_sqlite_persistence_enabled"] is True
    assert payload["capabilities"]["local_outbox_metadata_enabled"] is True
    assert payload["capabilities"]["asynchronous_order_processing_enabled"] is False
    assert payload["capabilities"]["distributed_durable_queue_enabled"] is False
    assert payload["capabilities"]["outbox_worker_enabled"] is False
    assert payload["capabilities"]["full_timeout_worker_enabled"] is False
    assert payload["capabilities"]["amend_replace_enabled"] is False
    assert payload["capabilities"]["broker_execution_report_ingestion_enabled"] is False
    assert payload["capabilities"]["formal_reconciliation_loop_enabled"] is False
    assert payload["capabilities"]["production_oms_ready"] is False
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
    assert payload["safety_flags"]["production_oms_ready"] is False
    assert payload["safety_flags"]["live_approval_granted"] is False
    assert payload["safety_flags"]["production_trading_ready"] is False
    assert any(
        "Asynchronous order processing" in item
        for item in payload["missing_for_production_oms"]
    )
    assert any(
        "durable queue" in item.lower()
        for item in payload["required_before_production_oms"]
    )
    assert "Production Trading Platform remains NOT READY." in payload["warnings"]


def test_paper_oms_production_readiness_does_not_create_orders() -> None:
    client = TestClient(app)

    payload = client.get("/api/paper-execution/reliability/production-readiness").json()

    assert payload["safety_flags"]["order_created"] is False
    assert payload["safety_flags"]["database_written"] is False
    assert payload["safety_flags"]["broker_api_called"] is False
    assert payload["safety_flags"]["production_oms_ready"] is False
    assert payload["capabilities"]["production_oms_ready"] is False
