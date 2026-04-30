from __future__ import annotations

import json
import os
import sqlite3
import subprocess
import sys
from pathlib import Path

from fastapi.testclient import TestClient

from app.core.config import get_settings
from app.domain.audit_integrity import PAPER_AUDIT_GENESIS_HASH
from app.domain.risk_rules import RiskPolicy
from app.main import app
from app.services.audit_integrity_service import PaperAuditIntegrityService
from app.services.paper_execution_store import PaperExecutionStore
from app.services.paper_execution_workflow import PaperExecutionWorkflow
from tests.test_paper_execution_workflow import _request

REPO_ROOT = Path(__file__).resolve().parents[2]
SCRIPT = REPO_ROOT / "scripts" / "verify-paper-audit-integrity.py"


def seed_paper_workflow(db_path: Path) -> str:
    request, history = _request(broker_simulation="fill")
    response = PaperExecutionWorkflow(RiskPolicy()).preview(request, history)
    PaperExecutionStore(db_path).persist_workflow(
        response.model_copy(update={"persisted": True, "persistence_backend": "sqlite"})
    )
    return response.workflow_run_id


def test_paper_audit_integrity_verifies_new_hash_chain(tmp_path: Path) -> None:
    db_path = tmp_path / "paper_audit.sqlite"
    workflow_run_id = seed_paper_workflow(db_path)

    verification = PaperAuditIntegrityService(db_path).verify(workflow_run_id)

    assert verification.verified is True
    assert verification.paper_only is True
    assert verification.local_sqlite_only is True
    assert verification.worm_ledger is False
    assert verification.immutable_audit_log is False
    assert verification.centralized_audit_service is False
    assert verification.production_audit_compliance is False
    assert verification.audit_events_count >= 4
    assert verification.broken_chain_count == 0
    assert verification.missing_hash_count == 0
    assert verification.checks[0].stored_previous_hash == PAPER_AUDIT_GENESIS_HASH
    assert all(check.verified for check in verification.checks)

    status = PaperAuditIntegrityService(db_path).status()
    assert status.latest_verification is not None
    assert status.latest_verification.verified is True
    assert status.known_gaps


def test_paper_audit_integrity_detects_broken_event_hash(tmp_path: Path) -> None:
    db_path = tmp_path / "paper_audit.sqlite"
    workflow_run_id = seed_paper_workflow(db_path)
    with sqlite3.connect(db_path) as connection:
        row = connection.execute(
            """
            SELECT audit_id
            FROM paper_audit_events
            WHERE workflow_run_id = ?
            ORDER BY timestamp, audit_id
            LIMIT 1
            """,
            (workflow_run_id,),
        ).fetchone()
        assert row is not None
        connection.execute(
            """
            UPDATE paper_audit_events
            SET event_hash = ?
            WHERE workflow_run_id = ? AND audit_id = ?
            """,
            ("bad-hash", workflow_run_id, row[0]),
        )

    verification = PaperAuditIntegrityService(db_path).verify(workflow_run_id)

    assert verification.verified is False
    assert verification.broken_chain_count >= 1
    assert any(not check.event_hash_valid for check in verification.checks)


def test_paper_audit_integrity_detects_missing_middle_event(tmp_path: Path) -> None:
    db_path = tmp_path / "paper_audit.sqlite"
    workflow_run_id = seed_paper_workflow(db_path)
    with sqlite3.connect(db_path) as connection:
        row = connection.execute(
            """
            SELECT audit_id
            FROM paper_audit_events
            WHERE workflow_run_id = ?
            ORDER BY timestamp, audit_id
            LIMIT 1 OFFSET 1
            """,
            (workflow_run_id,),
        ).fetchone()
        assert row is not None
        connection.execute(
            """
            DELETE FROM paper_audit_events
            WHERE workflow_run_id = ? AND audit_id = ?
            """,
            (workflow_run_id, row[0]),
        )

    verification = PaperAuditIntegrityService(db_path).verify(workflow_run_id)

    assert verification.verified is False
    assert verification.broken_chain_count >= 1
    assert any(not check.previous_hash_valid for check in verification.checks)


def test_paper_audit_integrity_detects_duplicate_audit_id_scope(
    tmp_path: Path,
) -> None:
    db_path = tmp_path / "paper_audit.sqlite"
    seed_paper_workflow(db_path)
    with sqlite3.connect(db_path) as connection:
        row = connection.execute(
            """
            SELECT *
            FROM paper_audit_events
            ORDER BY timestamp, audit_id
            LIMIT 1
            """
        ).fetchone()
        assert row is not None
        connection.execute(
            """
            INSERT INTO paper_audit_events (
                workflow_run_id,
                audit_id,
                actor,
                action,
                resource,
                timestamp,
                paper_only,
                metadata_json,
                previous_hash,
                event_hash
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                "paper-workflow-duplicate-audit-id",
                row[1],
                row[2],
                row[3],
                row[4],
                row[5],
                row[6],
                row[7],
                row[8],
                row[9],
            ),
        )

    verification = PaperAuditIntegrityService(db_path).verify()

    assert verification.verified is False
    assert verification.duplicate_audit_ids_count >= 2
    assert any(check.duplicate_audit_id for check in verification.checks)


def test_paper_audit_integrity_routes_are_read_only(
    tmp_path: Path,
    monkeypatch,
) -> None:
    db_path = tmp_path / "paper_audit.sqlite"
    workflow_run_id = seed_paper_workflow(db_path)
    monkeypatch.setenv("PAPER_EXECUTION_AUDIT_DB_PATH", str(db_path))
    get_settings.cache_clear()
    client = TestClient(app)
    try:
        status = client.get("/api/paper-execution/audit-integrity/status")
        assert status.status_code == 200
        status_payload = status.json()
        assert status_payload["local_sqlite_only"] is True
        assert status_payload["worm_ledger"] is False
        assert status_payload["centralized_audit_service"] is False
        assert status_payload["latest_verification"]["verified"] is True

        verify_all = client.get("/api/paper-execution/audit-integrity/verify")
        assert verify_all.status_code == 200
        assert verify_all.json()["verified"] is True

        verify_run = client.get(
            f"/api/paper-execution/runs/{workflow_run_id}/audit-integrity"
        )
        assert verify_run.status_code == 200
        assert verify_run.json()["workflow_run_id"] == workflow_run_id
        assert verify_run.json()["verified"] is True
    finally:
        get_settings.cache_clear()


def test_verify_paper_audit_integrity_script_stdout_and_output(
    tmp_path: Path,
) -> None:
    db_path = tmp_path / "paper_audit.sqlite"
    seed_paper_workflow(db_path)
    env = os.environ.copy()
    env.update(
        {
            "PAPER_EXECUTION_AUDIT_DB_PATH": str(db_path),
            "TRADING_MODE": "paper",
            "ENABLE_LIVE_TRADING": "false",
            "BROKER_PROVIDER": "paper",
        }
    )

    stdout_result = subprocess.run(
        [sys.executable, str(SCRIPT)],
        cwd=REPO_ROOT,
        env=env,
        text=True,
        capture_output=True,
        check=True,
    )
    payload = json.loads(stdout_result.stdout)
    assert payload["evidence_type"] == "paper_audit_integrity_verification"
    assert payload["verified"] is True
    assert payload["safety_flags"]["database_written"] is False
    assert payload["safety_flags"]["worm_ledger"] is False

    output_path = tmp_path / "paper_audit_integrity.json"
    output_result = subprocess.run(
        [sys.executable, str(SCRIPT), "--output", str(output_path)],
        cwd=REPO_ROOT,
        env=env,
        text=True,
        capture_output=True,
        check=True,
    )
    assert "verified=True" in output_result.stdout
    assert output_path.exists()
    written = json.loads(output_path.read_text(encoding="utf-8"))
    assert written["verified"] is True


def test_verify_paper_audit_integrity_script_rejects_unsafe_env(
    tmp_path: Path,
) -> None:
    env = os.environ.copy()
    env.update(
        {
            "PAPER_EXECUTION_AUDIT_DB_PATH": str(tmp_path / "paper_audit.sqlite"),
            "TRADING_MODE": "paper",
            "ENABLE_LIVE_TRADING": "true",
            "BROKER_PROVIDER": "paper",
        }
    )

    result = subprocess.run(
        [sys.executable, str(SCRIPT)],
        cwd=REPO_ROOT,
        env=env,
        text=True,
        capture_output=True,
        check=False,
    )

    assert result.returncode == 2
    assert "ENABLE_LIVE_TRADING must remain false" in result.stderr
