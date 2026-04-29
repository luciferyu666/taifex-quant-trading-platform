import os
import subprocess
import sys
from pathlib import Path

from app.services.paper_execution_store import PaperExecutionStore


def test_paper_simulation_submit_check_script_verifies_api_trace(
    tmp_path: Path,
) -> None:
    repo_root = Path(__file__).resolve().parents[2]
    db_path = tmp_path / "paper_submit_check.sqlite"
    env = {
        **os.environ,
        "TRADING_MODE": "paper",
        "ENABLE_LIVE_TRADING": "false",
        "BROKER_PROVIDER": "paper",
        "PYTHONPATH": str(repo_root / "backend"),
    }

    result = subprocess.run(
        [
            sys.executable,
            str(repo_root / "scripts/paper-simulation-submit-check.py"),
            "--db-path",
            str(db_path),
        ],
        cwd=repo_root,
        env=env,
        check=True,
        capture_output=True,
        text=True,
    )

    assert "Paper simulation submit UX audit trace drill passed." in result.stdout
    assert "workflow_run_id=paper-workflow-" in result.stdout
    assert "order_id=paper-order-" in result.stdout
    assert "final_oms_status=FILLED" in result.stdout
    assert "oms_events_count=5" in result.stdout
    assert "audit_events_count=" in result.stdout
    assert "paper_only=True" in result.stdout
    assert "live_trading_enabled=False" in result.stdout
    assert "broker_api_called=False" in result.stdout
    assert db_path.exists()

    store = PaperExecutionStore(db_path)
    runs = store.list_runs()
    assert len(runs) == 1
    run = runs[0]
    assert run.approval_decision == "approved_for_paper_simulation"
    assert run.final_oms_status == "FILLED"
    assert run.paper_only is True
    assert run.live_trading_enabled is False
    assert run.broker_api_called is False
    assert run.paper_broker_gateway_called is True
    assert run.order_id is not None

    oms_events = store.list_oms_events(order_id=run.order_id)
    assert [event.event_type for event in oms_events] == [
        "CREATE",
        "RISK_APPROVE",
        "SUBMIT",
        "ACKNOWLEDGE",
        "FILL",
    ]
    audit_events = store.list_audit_events(workflow_run_id=run.workflow_run_id)
    assert any(
        event.action == "paper_execution.paper_broker_simulated"
        for event in audit_events
    )
    assert all(event.paper_only for event in audit_events)
