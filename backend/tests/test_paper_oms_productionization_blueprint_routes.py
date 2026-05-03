from fastapi.testclient import TestClient

from app.core.config import Settings
from app.domain.paper_oms_productionization_blueprint import (
    get_paper_oms_productionization_blueprint,
)
from app.main import app

EXPECTED_AREA_IDS = {
    "durable_queue_outbox",
    "async_order_processing",
    "duplicate_prevention_across_sessions",
    "timeout_handling_productionization",
    "execution_report_model",
    "reconciliation_loop",
    "amend_replace_cancel_lifecycle",
    "partial_fill_quantity_accounting",
}


def test_paper_oms_productionization_blueprint_domain_is_read_only() -> None:
    blueprint = get_paper_oms_productionization_blueprint(Settings())

    assert blueprint.service == "paper-oms-productionization-blueprint"
    assert blueprint.blueprint_version == "v1"
    assert blueprint.readiness_state == "blueprint_only_no_production_oms"
    assert blueprint.safety_flags.paper_only is True
    assert blueprint.safety_flags.read_only is True
    assert blueprint.safety_flags.live_trading_enabled is False
    assert blueprint.safety_flags.broker_provider == "paper"
    assert blueprint.safety_flags.broker_api_called is False
    assert blueprint.safety_flags.order_created is False
    assert blueprint.safety_flags.queue_worker_started is False
    assert blueprint.safety_flags.async_processing_enabled is False
    assert blueprint.safety_flags.hosted_database_connected is False
    assert blueprint.safety_flags.database_written is False
    assert blueprint.safety_flags.external_db_written is False
    assert blueprint.safety_flags.credentials_collected is False
    assert blueprint.safety_flags.production_oms_enabled is False
    assert blueprint.safety_flags.production_trading_ready is False

    assert {area.area_id for area in blueprint.productionization_areas} == EXPECTED_AREA_IDS
    assert all(
        area.status == "contract_only" and area.disabled_in_current_release
        for area in blueprint.productionization_areas
    )
    assert any("Durable queue" in area.title for area in blueprint.productionization_areas)
    assert any(
        "Reconciliation" in area.title for area in blueprint.productionization_areas
    )
    assert any(
        "Production Trading Platform remains NOT READY." == warning
        for warning in blueprint.warnings
    )


def test_paper_oms_productionization_blueprint_api_contract() -> None:
    client = TestClient(app)

    response = client.get("/api/paper-execution/reliability/productionization-blueprint")

    assert response.status_code == 200
    payload = response.json()
    assert payload["service"] == "paper-oms-productionization-blueprint"
    assert payload["readiness_state"] == "blueprint_only_no_production_oms"
    assert payload["safety_defaults"]["trading_mode"] == "paper"
    assert payload["safety_defaults"]["enable_live_trading"] is False
    assert payload["safety_defaults"]["broker_provider"] == "paper"

    flags = payload["safety_flags"]
    assert flags["paper_only"] is True
    assert flags["read_only"] is True
    assert flags["live_trading_enabled"] is False
    assert flags["broker_provider"] == "paper"
    assert flags["broker_api_called"] is False
    assert flags["order_created"] is False
    assert flags["queue_worker_started"] is False
    assert flags["async_processing_enabled"] is False
    assert flags["hosted_database_connected"] is False
    assert flags["database_written"] is False
    assert flags["external_db_written"] is False
    assert flags["credentials_collected"] is False
    assert flags["production_oms_enabled"] is False
    assert flags["production_trading_ready"] is False

    area_ids = {area["area_id"] for area in payload["productionization_areas"]}
    assert area_ids == EXPECTED_AREA_IDS
    assert all(
        area["status"] == "contract_only"
        and area["disabled_in_current_release"] is True
        for area in payload["productionization_areas"]
    )
    assert any("OMS worker" in step for step in payload["proposed_processing_flow"])
    assert any(
        "reconciliation" in step.lower() for step in payload["staged_delivery_order"]
    )


def test_paper_oms_productionization_blueprint_does_not_mutate_runtime() -> None:
    client = TestClient(app)

    payload = client.get(
        "/api/paper-execution/reliability/productionization-blueprint"
    ).json()

    assert payload["safety_flags"]["order_created"] is False
    assert payload["safety_flags"]["queue_worker_started"] is False
    assert payload["safety_flags"]["async_processing_enabled"] is False
    assert payload["safety_flags"]["database_written"] is False
    assert payload["safety_flags"]["broker_api_called"] is False
    assert payload["safety_flags"]["production_oms_enabled"] is False
    assert payload["safety_flags"]["production_trading_ready"] is False
