import json
import os
import subprocess
import sys
from pathlib import Path


def test_paper_risk_evidence_export_prints_safe_json() -> None:
    repo_root = Path(__file__).resolve().parents[2]

    result = run_export(repo_root)

    payload = json.loads(result.stdout)
    assert payload["evidence_type"] == "paper_risk_guardrail_evidence"
    assert payload["evidence_id"].startswith("paper-risk-evidence-")
    assert payload["persisted"] is False
    assert payload["intent"]["symbol"] == "TMF"
    assert payload["intent"]["paper_only"] is True
    assert payload["policy"]["trading_mode"] == "paper"
    assert payload["policy"]["live_trading_enabled"] is False
    assert payload["policy"]["broker_provider"] == "paper"
    assert payload["state"]["paper_only"] is True
    assert payload["state"]["broker_api_called"] is False
    assert payload["risk_evaluation"]["approved"] is True
    assert "PRICE_REASONABILITY" in payload["passed_checks"]
    assert "KILL_SWITCH" in payload["passed_checks"]
    assert payload["failed_checks"] == []

    flags = payload["safety_flags"]
    assert flags["paper_only"] is True
    assert flags["live_trading_enabled"] is False
    assert flags["broker_provider"] == "paper"
    assert flags["broker_api_called"] is False
    assert flags["order_created"] is False
    assert flags["risk_engine_called"] is True
    assert flags["oms_called"] is False
    assert flags["broker_gateway_called"] is False
    assert flags["database_written"] is False
    assert flags["broker_credentials_collected"] is False
    assert flags["production_risk_approval"] is False


def test_paper_risk_evidence_export_writes_explicit_json_output(
    tmp_path: Path,
) -> None:
    repo_root = Path(__file__).resolve().parents[2]
    output_path = tmp_path / "paper_risk_evidence.json"

    result = run_export(repo_root, "--output", str(output_path))

    assert "Paper risk evidence exported." in result.stdout
    assert output_path.exists()
    payload = json.loads(output_path.read_text(encoding="utf-8"))
    assert payload["persisted"] is True
    assert payload["safety_flags"]["paper_only"] is True
    assert payload["safety_flags"]["live_trading_enabled"] is False


def test_paper_risk_evidence_export_can_capture_rejection() -> None:
    repo_root = Path(__file__).resolve().parents[2]

    result = run_export(
        repo_root,
        "--order-price",
        "21000",
        "--reference-price",
        "20000",
    )

    payload = json.loads(result.stdout)
    assert payload["risk_evaluation"]["approved"] is False
    assert "PRICE_REASONABILITY" in payload["failed_checks"]
    assert payload["safety_flags"]["broker_api_called"] is False
    assert payload["safety_flags"]["order_created"] is False


def test_paper_risk_evidence_export_can_capture_duplicate_rejection() -> None:
    repo_root = Path(__file__).resolve().parents[2]

    result = run_export(
        repo_root,
        "--idempotency-key",
        "duplicate-risk-key",
        "--seen-idempotency-key",
        "duplicate-risk-key",
    )

    payload = json.loads(result.stdout)
    assert payload["risk_evaluation"]["approved"] is False
    assert "DUPLICATE_ORDER_PREVENTION" in payload["failed_checks"]


def test_paper_risk_evidence_export_refuses_live_settings() -> None:
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
        [sys.executable, str(repo_root / "scripts/export-paper-risk-evidence.py")],
        cwd=repo_root,
        env=env,
        capture_output=True,
        text=True,
    )

    assert result.returncode != 0
    assert "not paper-only" in result.stderr


def test_paper_risk_evidence_export_requires_json_output(tmp_path: Path) -> None:
    repo_root = Path(__file__).resolve().parents[2]

    result = subprocess.run(
        [
            sys.executable,
            str(repo_root / "scripts/export-paper-risk-evidence.py"),
            "--output",
            str(tmp_path / "paper_risk_evidence.txt"),
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
            str(repo_root / "scripts/export-paper-risk-evidence.py"),
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
