import sqlite3
from datetime import UTC, datetime, timedelta
from pathlib import Path

import pytest

from app.domain.order_state_machine import OrderStatus
from app.domain.risk_rules import RiskPolicy
from app.services.paper_execution_store import PaperExecutionStore
from app.services.paper_execution_workflow import PaperExecutionWorkflow
from tests.test_paper_execution_workflow import _request


def test_paper_execution_store_read_paths_do_not_create_db(tmp_path: Path) -> None:
    db_path = tmp_path / "paper_execution_audit.sqlite"
    store = PaperExecutionStore(db_path)

    status = store.status()

    assert db_path.exists() is False
    assert status.enabled is True
    assert status.local_only is True
    assert status.runs_count == 0
    assert status.oms_events_count == 0
    assert status.audit_events_count == 0
    assert status.execution_reports_count == 0
    assert status.outbox_items_count == 0
    assert status.idempotency_keys_count == 0
    assert status.production_oms_ready is False
    assert store.list_runs() == []
    assert store.get_run("missing") is None
    assert store.list_oms_events(workflow_run_id="missing") == []
    assert store.list_audit_events(workflow_run_id="missing") == []
    assert store.list_execution_reports(workflow_run_id="missing") == []
    assert store.list_outbox_items() == []
    assert store.list_timeout_candidates() == []
    assert db_path.exists() is False


def test_paper_execution_store_persists_run_oms_events_and_audit_events(
    tmp_path: Path,
) -> None:
    db_path = tmp_path / "paper_execution_audit.sqlite"
    request, history = _request(broker_simulation="partial_fill")
    response = PaperExecutionWorkflow(RiskPolicy()).preview(request, history)
    persisted_response = response.model_copy(
        update={"persisted": True, "persistence_backend": "sqlite"}
    )

    store = PaperExecutionStore(db_path)
    run = store.persist_workflow(persisted_response)

    assert db_path.exists()
    assert run.workflow_run_id == response.workflow_run_id
    assert run.paper_only is True
    assert run.live_trading_enabled is False
    assert run.broker_api_called is False
    assert run.paper_broker_gateway_called is True
    assert run.final_oms_status == OrderStatus.PARTIALLY_FILLED

    runs = store.list_runs()
    assert [item.workflow_run_id for item in runs] == [response.workflow_run_id]

    assert response.paper_order_intent is not None
    oms_events = store.list_oms_events(order_id=response.paper_order_intent.order_id)
    assert [event.event_type for event in oms_events] == [
        "CREATE",
        "RISK_APPROVE",
        "SUBMIT",
        "ACKNOWLEDGE",
        "PARTIAL_FILL",
    ]
    assert oms_events[-1].status_after == OrderStatus.PARTIALLY_FILLED

    audit_events = store.list_audit_events(workflow_run_id=response.workflow_run_id)
    assert len(audit_events) >= 4
    assert any(event.action == "paper_execution.intent_created" for event in audit_events)

    status = store.status()
    assert status.enabled is True
    assert status.local_only is True
    assert status.live_trading_enabled is False
    assert status.broker_api_called is False
    assert status.runs_count == 1
    assert status.oms_events_count == 5
    assert status.audit_events_count == len(audit_events)
    assert status.execution_reports_count == 2
    assert status.outbox_items_count == 1
    assert status.idempotency_keys_count == 1
    assert status.production_oms_ready is False

    assert response.paper_order_intent is not None
    execution_reports = store.list_execution_reports(
        order_id=response.paper_order_intent.order_id
    )
    assert [report.execution_type for report in execution_reports] == [
        "ACKNOWLEDGED",
        "PARTIAL_FILL",
    ]
    assert execution_reports[-1].paper_only is True
    assert execution_reports[-1].live_trading_enabled is False
    assert execution_reports[-1].broker_api_called is False

    outbox_items = store.list_outbox_items()
    assert len(outbox_items) == 1
    assert outbox_items[0].status == "completed"
    assert outbox_items[0].paper_only is True
    assert outbox_items[0].broker_api_called is False

    duplicate_check = store.check_duplicate_order(
        idempotency_key=response.paper_order_intent.idempotency_key
    )
    assert duplicate_check.duplicate is True
    assert duplicate_check.existing_order_id == response.paper_order_intent.order_id

    reliability = store.reliability_status()
    assert reliability.production_oms_ready is False
    assert reliability.durable_outbox_metadata_enabled is True
    assert reliability.duplicate_order_prevention_enabled is True
    assert reliability.execution_report_model_enabled is True
    assert reliability.async_order_processing_enabled is False
    assert reliability.outbox_items_count == 1
    assert reliability.execution_reports_count == 2
    assert reliability.idempotency_keys_count == 1


def test_paper_execution_store_does_not_create_records_on_read_paths(
    tmp_path: Path,
) -> None:
    store = PaperExecutionStore(tmp_path / "paper_execution_audit.sqlite")

    assert store.list_runs() == []
    assert store.list_oms_events(workflow_run_id="missing") == []
    assert store.list_audit_events(workflow_run_id="missing") == []


def test_paper_execution_store_rejects_duplicate_idempotency_across_sessions(
    tmp_path: Path,
) -> None:
    db_path = tmp_path / "paper_execution_audit.sqlite"
    request, history = _request(broker_simulation="fill")
    workflow = PaperExecutionWorkflow(RiskPolicy())
    first_response = workflow.preview(request, history).model_copy(
        update={"persisted": True, "persistence_backend": "sqlite"}
    )
    duplicate_request = request.model_copy(update={"broker_simulation": "cancel"})
    duplicate_response = workflow.preview(duplicate_request, history).model_copy(
        update={"persisted": True, "persistence_backend": "sqlite"}
    )
    assert first_response.workflow_run_id != duplicate_response.workflow_run_id
    assert first_response.paper_order_intent is not None
    assert duplicate_response.paper_order_intent is not None
    assert (
        first_response.paper_order_intent.idempotency_key
        == duplicate_response.paper_order_intent.idempotency_key
    )

    store = PaperExecutionStore(db_path)
    store.persist_workflow(first_response)

    with pytest.raises(ValueError, match="Duplicate paper order idempotency_key"):
        store.persist_workflow(duplicate_response)


def test_paper_execution_store_lists_timeout_candidates_for_nonterminal_orders(
    tmp_path: Path,
) -> None:
    db_path = tmp_path / "paper_execution_audit.sqlite"
    request, history = _request(broker_simulation="partial_fill")
    response = PaperExecutionWorkflow(RiskPolicy()).preview(request, history)
    persisted_response = response.model_copy(
        update={"persisted": True, "persistence_backend": "sqlite"}
    )

    store = PaperExecutionStore(db_path)
    store.persist_workflow(persisted_response)
    old_persisted_at = datetime.now(UTC) - timedelta(seconds=120)
    with sqlite3.connect(db_path) as connection:
        connection.execute(
            """
            UPDATE paper_execution_runs
            SET persisted_at = ?
            WHERE workflow_run_id = ?
            """,
            (old_persisted_at.isoformat(), response.workflow_run_id),
        )

    candidates = store.list_timeout_candidates(
        timeout_seconds=30,
        now=datetime.now(UTC),
    )

    assert len(candidates) == 1
    assert candidates[0].workflow_run_id == response.workflow_run_id
    assert candidates[0].final_oms_status == OrderStatus.PARTIALLY_FILLED
    assert candidates[0].paper_only is True
    assert candidates[0].live_trading_enabled is False
