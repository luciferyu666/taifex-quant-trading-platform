from pathlib import Path

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
    assert store.list_runs() == []
    assert store.get_run("missing") is None
    assert store.list_oms_events(workflow_run_id="missing") == []
    assert store.list_audit_events(workflow_run_id="missing") == []
    assert db_path.exists() is False


def test_paper_execution_store_persists_run_oms_events_and_audit_events(
    tmp_path: Path,
) -> None:
    db_path = tmp_path / "paper_execution_audit.sqlite"
    response = PaperExecutionWorkflow(RiskPolicy()).preview(
        _request(broker_simulation="partial_fill")
    )
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


def test_paper_execution_store_persists_non_order_decision(tmp_path: Path) -> None:
    response = PaperExecutionWorkflow(RiskPolicy()).preview(
        _request(approval_decision="needs_data_review")
    )
    persisted_response = response.model_copy(
        update={"persisted": True, "persistence_backend": "sqlite"}
    )
    store = PaperExecutionStore(tmp_path / "paper_execution_audit.sqlite")

    run = store.persist_workflow(persisted_response)

    assert run.order_id is None
    assert run.final_oms_status is None
    assert run.approval_decision == "needs_data_review"
    assert store.list_oms_events(workflow_run_id=response.workflow_run_id) == []
    assert len(store.list_audit_events(workflow_run_id=response.workflow_run_id)) == 2
