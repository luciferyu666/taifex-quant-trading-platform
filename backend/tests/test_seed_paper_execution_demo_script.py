import os
import subprocess
import sys
from pathlib import Path

from app.services.paper_execution_store import PaperExecutionStore


def test_seed_paper_execution_demo_script_creates_local_sqlite_record(
    tmp_path: Path,
) -> None:
    repo_root = Path(__file__).resolve().parents[2]
    db_path = tmp_path / "paper_execution_audit.sqlite"
    env = {
        **os.environ,
        "PAPER_EXECUTION_AUDIT_DB_PATH": str(db_path),
        "TRADING_MODE": "paper",
        "ENABLE_LIVE_TRADING": "false",
        "BROKER_PROVIDER": "paper",
        "PYTHONPATH": str(repo_root / "backend"),
    }

    result = subprocess.run(
        [sys.executable, str(repo_root / "scripts/seed-paper-execution-demo.py")],
        cwd=repo_root,
        env=env,
        check=True,
        capture_output=True,
        text=True,
    )

    assert "workflow_run_id=" in result.stdout
    assert "approval_request_id=paper-approval-request-" in result.stdout
    assert "order_id=paper-order-" in result.stdout
    assert "final_oms_status=PARTIALLY_FILLED" in result.stdout
    assert "broker_api_called=False" in result.stdout
    assert db_path.exists()

    store = PaperExecutionStore(db_path)
    runs = store.list_runs()
    assert len(runs) == 1
    run = runs[0]
    assert run.approval_decision == "approved_for_paper_simulation"
    assert run.final_oms_status == "PARTIALLY_FILLED"
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
        "PARTIAL_FILL",
    ]
    audit_events = store.list_audit_events(workflow_run_id=run.workflow_run_id)
    assert any(
        event.action == "paper_execution.approval_request_verified"
        for event in audit_events
    )
    assert any(event.action == "paper_execution.intent_created" for event in audit_events)
    assert any(
        event.action == "paper_execution.paper_broker_simulated"
        for event in audit_events
    )


def test_seed_paper_execution_demo_script_refuses_live_settings(tmp_path: Path) -> None:
    repo_root = Path(__file__).resolve().parents[2]
    env = {
        **os.environ,
        "PAPER_EXECUTION_AUDIT_DB_PATH": str(tmp_path / "paper_execution_audit.sqlite"),
        "TRADING_MODE": "live",
        "ENABLE_LIVE_TRADING": "true",
        "BROKER_PROVIDER": "not-paper",
        "PYTHONPATH": str(repo_root / "backend"),
    }

    result = subprocess.run(
        [sys.executable, str(repo_root / "scripts/seed-paper-execution-demo.py")],
        cwd=repo_root,
        env=env,
        capture_output=True,
        text=True,
    )

    assert result.returncode != 0
    assert "not paper-only" in result.stderr
