import json
import os
import subprocess
import sys
from pathlib import Path


def test_paper_demo_evidence_export_script_prints_safe_json(tmp_path: Path) -> None:
    repo_root = Path(__file__).resolve().parents[2]
    db_path = seed_demo_record(repo_root, tmp_path)

    result = run_export(repo_root, db_path)

    payload = json.loads(result.stdout)
    assert payload["evidence_type"] == "paper_demo_evidence"
    assert payload["workflow_run_id"].startswith("paper-workflow-")
    assert payload["approval_request_id"].startswith("paper-approval-request-")
    assert payload["order_id"].startswith("paper-order-")
    assert payload["final_oms_status"] == "PARTIALLY_FILLED"
    assert payload["oms_event_count"] == 5
    assert payload["audit_event_count"] >= 3
    assert len(payload["reviewer_decisions"]) == 2
    assert [item["decision"] for item in payload["reviewer_decisions"]] == [
        "research_approved",
        "approved_for_paper_simulation",
    ]
    assert payload["local_sqlite_path"] == str(db_path)
    assert payload["export_persisted"] is False

    flags = payload["safety_flags"]
    assert flags["paper_only"] is True
    assert flags["live_trading_enabled"] is False
    assert flags["broker_api_called"] is False
    assert flags["local_sqlite_only"] is True
    assert flags["external_db_written"] is False
    assert flags["broker_credentials_collected"] is False
    assert flags["real_order_created"] is False
    assert flags["approval_for_live"] is False
    assert flags["investment_advice"] is False


def test_paper_demo_evidence_export_script_writes_explicit_json_output(
    tmp_path: Path,
) -> None:
    repo_root = Path(__file__).resolve().parents[2]
    db_path = seed_demo_record(repo_root, tmp_path)
    output_path = tmp_path / "paper_demo_evidence.json"

    result = run_export(repo_root, db_path, "--output", str(output_path))

    assert "Paper demo evidence exported." in result.stdout
    assert output_path.exists()
    payload = json.loads(output_path.read_text(encoding="utf-8"))
    assert payload["export_persisted"] is True
    assert payload["safety_flags"]["paper_only"] is True
    assert payload["safety_flags"]["live_trading_enabled"] is False


def test_paper_demo_evidence_export_script_prints_markdown(tmp_path: Path) -> None:
    repo_root = Path(__file__).resolve().parents[2]
    db_path = seed_demo_record(repo_root, tmp_path)

    result = run_export(repo_root, db_path, "--format", "markdown")

    assert "# Paper Demo Evidence" in result.stdout
    assert "Workflow run ID: paper-workflow-" in result.stdout
    assert "Approval request ID: paper-approval-request-" in result.stdout
    assert "Final OMS status: PARTIALLY_FILLED" in result.stdout
    assert "live_trading_enabled: False" in result.stdout


def test_paper_demo_evidence_export_script_refuses_live_settings(
    tmp_path: Path,
) -> None:
    repo_root = Path(__file__).resolve().parents[2]
    db_path = seed_demo_record(repo_root, tmp_path)
    env = base_env(repo_root, db_path)
    env.update(
        {
            "TRADING_MODE": "live",
            "ENABLE_LIVE_TRADING": "true",
            "BROKER_PROVIDER": "test-broker",
        }
    )

    result = subprocess.run(
        [
            sys.executable,
            str(repo_root / "scripts/export-paper-demo-evidence.py"),
            "--db-path",
            str(db_path),
        ],
        cwd=repo_root,
        env=env,
        capture_output=True,
        text=True,
    )

    assert result.returncode != 0
    assert "not paper-only" in result.stderr


def test_paper_demo_evidence_export_script_reports_missing_records(
    tmp_path: Path,
) -> None:
    repo_root = Path(__file__).resolve().parents[2]
    db_path = tmp_path / "missing.sqlite"

    result = subprocess.run(
        [
            sys.executable,
            str(repo_root / "scripts/export-paper-demo-evidence.py"),
            "--db-path",
            str(db_path),
        ],
        cwd=repo_root,
        env=base_env(repo_root, db_path),
        capture_output=True,
        text=True,
    )

    assert result.returncode != 0
    assert "No paper workflow records found" in result.stderr
    assert "make seed-paper-execution-demo" in result.stderr


def seed_demo_record(repo_root: Path, tmp_path: Path) -> Path:
    db_path = tmp_path / "paper_execution_audit.sqlite"
    subprocess.run(
        [sys.executable, str(repo_root / "scripts/seed-paper-execution-demo.py")],
        cwd=repo_root,
        env=base_env(repo_root, db_path),
        check=True,
        capture_output=True,
        text=True,
    )
    return db_path


def run_export(repo_root: Path, db_path: Path, *args: str) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        [
            sys.executable,
            str(repo_root / "scripts/export-paper-demo-evidence.py"),
            "--db-path",
            str(db_path),
            *args,
        ],
        cwd=repo_root,
        env=base_env(repo_root, db_path),
        check=True,
        capture_output=True,
        text=True,
    )


def base_env(repo_root: Path, db_path: Path) -> dict[str, str]:
    return {
        **os.environ,
        "PAPER_EXECUTION_AUDIT_DB_PATH": str(db_path),
        "TRADING_MODE": "paper",
        "ENABLE_LIVE_TRADING": "false",
        "BROKER_PROVIDER": "paper",
        "PYTHONPATH": str(repo_root / "backend"),
    }
