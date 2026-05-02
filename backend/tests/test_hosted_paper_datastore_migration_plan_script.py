from __future__ import annotations

import json
import os
import subprocess
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
SCRIPT = REPO_ROOT / "scripts" / "hosted-paper-datastore-migration-plan.py"
DATABASE_URL_SECRET = "postgresql://secret-user:secret-pass@example.invalid/secret-db"


def run_script(*args: str) -> subprocess.CompletedProcess[str]:
    env = os.environ.copy()
    env["DATABASE_URL"] = DATABASE_URL_SECRET
    env["PYTHONPATH"] = f"{REPO_ROOT / 'backend'}:{env.get('PYTHONPATH', '')}"
    return subprocess.run(
        [sys.executable, str(SCRIPT), *args],
        cwd=REPO_ROOT,
        env=env,
        text=True,
        capture_output=True,
        check=False,
    )


def test_migration_plan_stdout_is_dry_run_and_does_not_expose_database_url() -> None:
    result = run_script()

    assert result.returncode == 0, result.stderr
    assert DATABASE_URL_SECRET not in result.stdout
    assert DATABASE_URL_SECRET not in result.stderr

    payload = json.loads(result.stdout)
    assert payload["plan_type"] == "hosted_paper_managed_datastore_migration_plan"
    assert payload["source_contract"] == "GET /api/hosted-paper/datastore-readiness"
    assert payload["dry_run_only"] is True
    assert payload["migration_apply_enabled"] is False
    assert payload["connection_attempted"] is False
    assert payload["database_url_read"] is False
    assert payload["hosted_records_written"] is False
    assert payload["customer_account_created"] is False
    assert payload["tenant_created"] is False
    assert payload["reviewer_login_created"] is False
    assert payload["broker_api_called"] is False
    assert payload["order_created"] is False
    assert payload["safety_flags"]["paper_only"] is True
    assert payload["safety_flags"]["live_trading_enabled"] is False
    assert payload["safety_flags"]["broker_provider"] == "paper"
    assert payload["safety_flags"]["local_artifact_written"] is False

    table_names = {table["table_name"] for table in payload["tables"]}
    assert table_names == {
        "hosted_paper_approval_requests",
        "hosted_paper_approval_decisions",
        "hosted_paper_workflow_runs",
        "hosted_paper_oms_events",
        "hosted_paper_audit_events",
    }
    for table in payload["tables"]:
        assert table["tenant_key"] == "tenant_id"
        assert table["tenant_key_required"] is True
        assert "tenant_id" in table["primary_key_draft"]
        assert table["index_drafts"]
        assert table["audit_requirements"]


def test_migration_plan_can_write_explicit_local_json_output(tmp_path: Path) -> None:
    output_path = tmp_path / "hosted-paper-migration-plan.json"

    result = run_script("--output", str(output_path))

    assert result.returncode == 0, result.stderr
    assert output_path.exists()
    assert "migration_apply_enabled=false" in result.stdout
    assert "connection_attempted=false" in result.stdout
    assert "database_url_read=false" in result.stdout
    assert DATABASE_URL_SECRET not in result.stdout
    assert DATABASE_URL_SECRET not in result.stderr

    payload = json.loads(output_path.read_text(encoding="utf-8"))
    assert payload["safety_flags"]["local_artifact_written"] is True
    assert payload["migration_apply_enabled"] is False
    assert payload["connection_attempted"] is False


def test_migration_plan_rejects_non_json_output(tmp_path: Path) -> None:
    output_path = tmp_path / "hosted-paper-migration-plan.txt"

    result = run_script("--output", str(output_path))

    assert result.returncode == 2
    assert not output_path.exists()
    assert "--output must be a local .json file" in result.stderr
