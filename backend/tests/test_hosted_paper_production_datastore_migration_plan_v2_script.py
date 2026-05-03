from __future__ import annotations

import json
import os
import subprocess
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
SCRIPT = REPO_ROOT / "scripts" / "hosted-paper-production-datastore-migration-plan-v2.py"
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


def test_production_datastore_migration_blueprint_stdout_is_dry_run() -> None:
    result = run_script()

    assert result.returncode == 0, result.stderr
    assert DATABASE_URL_SECRET not in result.stdout
    assert DATABASE_URL_SECRET not in result.stderr

    payload = json.loads(result.stdout)
    assert payload["blueprint_type"] == (
        "hosted_paper_production_datastore_migration_plan_v2"
    )
    assert payload["blueprint_version"] == "v2"
    assert payload["source_contract"] == (
        "GET /api/hosted-paper/production-datastore/readiness"
    )
    assert payload["readiness_state"] == "contract_only_no_production_datastore"
    assert payload["dry_run_only"] is True
    assert payload["migration_apply_enabled"] is False
    assert payload["automatic_apply_enabled"] is False
    assert payload["database_url_read"] is False
    assert payload["connection_attempted"] is False
    assert payload["database_written"] is False
    assert payload["external_db_written"] is False
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
        "hosted_paper_orders",
        "hosted_paper_risk_evaluations",
        "hosted_paper_oms_events",
        "hosted_paper_execution_reports",
        "hosted_paper_outbox_events",
        "hosted_paper_audit_events",
        "hosted_paper_audit_integrity_snapshots",
        "hosted_paper_evidence_exports",
    }
    for table in payload["tables"]:
        assert table["tenant_key"] == "tenant_id"
        assert table["tenant_key_required"] is True
        assert "tenant_id" in table["primary_key_draft"]
        assert table["index_drafts"]
        assert table["constraint_drafts"]
        assert table["backup_required"] is True
        assert table["retention_required"] is True
        assert table["restore_required"] is True
        assert table["local_sqlite_allowed"] is False


def test_production_datastore_migration_blueprint_can_write_local_json(
    tmp_path: Path,
) -> None:
    output_path = tmp_path / "production-datastore-migration-plan-v2.json"

    result = run_script("--output", str(output_path))

    assert result.returncode == 0, result.stderr
    assert output_path.exists()
    assert "migration_apply_enabled=false" in result.stdout
    assert "connection_attempted=false" in result.stdout
    assert "database_url_read=false" in result.stdout
    assert "hosted_records_written=false" in result.stdout
    assert DATABASE_URL_SECRET not in result.stdout
    assert DATABASE_URL_SECRET not in result.stderr

    payload = json.loads(output_path.read_text(encoding="utf-8"))
    assert payload["safety_flags"]["local_artifact_written"] is True
    assert payload["migration_apply_enabled"] is False
    assert payload["connection_attempted"] is False
    assert payload["database_url_read"] is False


def test_production_datastore_migration_blueprint_rejects_non_json_output(
    tmp_path: Path,
) -> None:
    output_path = tmp_path / "production-datastore-migration-plan-v2.txt"

    result = run_script("--output", str(output_path))

    assert result.returncode == 2
    assert not output_path.exists()
    assert "--output must be a local .json file" in result.stderr
