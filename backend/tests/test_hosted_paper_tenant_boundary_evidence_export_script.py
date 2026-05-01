import json
import os
import subprocess
import sys
from pathlib import Path


def test_hosted_paper_tenant_boundary_evidence_export_prints_safe_json() -> None:
    repo_root = Path(__file__).resolve().parents[2]

    result = run_export(repo_root)

    payload = json.loads(result.stdout)
    assert payload["evidence_type"] == "hosted_paper_tenant_boundary_evidence"
    assert payload["evidence_id"].startswith("hosted-paper-tenant-boundary-evidence-")
    assert payload["persisted"] is False
    assert payload["service"] == "hosted-paper-mock-session-contract"
    assert payload["contract_state"] == "mock_read_only"
    assert payload["session"]["authenticated"] is False
    assert payload["session"]["authentication_provider"] == "none"
    assert payload["tenant"]["tenant_id"] == "mock-tenant-paper-evaluation"
    assert payload["tenant"]["hosted_datastore_enabled"] is False
    assert payload["tenant"]["local_sqlite_access"] is False
    assert payload["tenant"]["broker_provider"] == "paper"

    flags = payload["safety_flags"]
    assert flags["paper_only"] is True
    assert flags["read_only"] is True
    assert flags["hosted_paper_enabled"] is False
    assert flags["live_trading_enabled"] is False
    assert flags["broker_provider"] == "paper"
    assert flags["broker_api_called"] is False
    assert flags["order_created"] is False
    assert flags["risk_engine_called"] is False
    assert flags["oms_called"] is False
    assert flags["broker_gateway_called"] is False
    assert flags["authenticated"] is False
    assert flags["hosted_auth_provider_enabled"] is False
    assert flags["session_cookie_issued"] is False
    assert flags["credentials_collected"] is False
    assert flags["broker_credentials_collected"] is False
    assert flags["database_written"] is False
    assert flags["hosted_datastore_enabled"] is False
    assert flags["hosted_datastore_written"] is False
    assert flags["external_db_written"] is False
    assert flags["local_sqlite_access"] is False
    assert flags["production_trading_ready"] is False

    assert payload["boundary_assertions"]["mutation_permissions_granted"] is False
    granted_permissions = {
        permission["permission"] for permission in payload["granted_permissions"]
    }
    assert granted_permissions == {
        "read_hosted_readiness",
        "read_mock_session",
        "read_current_tenant",
    }
    denied_mutations = {
        permission["permission"] for permission in payload["denied_mutation_permissions"]
    }
    assert {
        "create_paper_approval_request",
        "record_paper_reviewer_decision",
        "submit_approved_paper_workflow",
        "enable_live_trading",
        "upload_broker_credentials",
    }.issubset(denied_mutations)


def test_hosted_paper_tenant_boundary_evidence_export_writes_explicit_json_output(
    tmp_path: Path,
) -> None:
    repo_root = Path(__file__).resolve().parents[2]
    output_path = tmp_path / "hosted_paper_tenant_boundary_evidence.json"

    result = run_export(repo_root, "--output", str(output_path))

    assert "Hosted paper tenant boundary evidence exported." in result.stdout
    assert output_path.exists()
    payload = json.loads(output_path.read_text(encoding="utf-8"))
    assert payload["persisted"] is True
    assert payload["safety_flags"]["paper_only"] is True
    assert payload["safety_flags"]["live_trading_enabled"] is False
    assert payload["safety_flags"]["hosted_datastore_written"] is False


def test_hosted_paper_tenant_boundary_evidence_export_refuses_live_settings() -> None:
    repo_root = Path(__file__).resolve().parents[2]
    env = base_env(repo_root)
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
            str(repo_root / "scripts/export-hosted-paper-tenant-boundary-evidence.py"),
        ],
        cwd=repo_root,
        env=env,
        capture_output=True,
        text=True,
    )

    assert result.returncode != 0
    assert "not paper-only" in result.stderr


def test_hosted_paper_tenant_boundary_evidence_export_requires_json_output(
    tmp_path: Path,
) -> None:
    repo_root = Path(__file__).resolve().parents[2]

    result = subprocess.run(
        [
            sys.executable,
            str(repo_root / "scripts/export-hosted-paper-tenant-boundary-evidence.py"),
            "--output",
            str(tmp_path / "hosted_paper_tenant_boundary_evidence.txt"),
        ],
        cwd=repo_root,
        env=base_env(repo_root),
        capture_output=True,
        text=True,
    )

    assert result.returncode != 0
    assert "--output must be a local .json file" in result.stderr


def run_export(repo_root: Path, *args: str) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        [
            sys.executable,
            str(repo_root / "scripts/export-hosted-paper-tenant-boundary-evidence.py"),
            *args,
        ],
        cwd=repo_root,
        env=base_env(repo_root),
        check=True,
        capture_output=True,
        text=True,
    )


def base_env(repo_root: Path) -> dict[str, str]:
    return {
        **os.environ,
        "TRADING_MODE": "paper",
        "ENABLE_LIVE_TRADING": "false",
        "BROKER_PROVIDER": "paper",
        "PYTHONPATH": str(repo_root / "backend"),
    }
