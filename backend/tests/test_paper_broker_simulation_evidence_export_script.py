import json
import os
import subprocess
import sys
from pathlib import Path


def test_paper_broker_simulation_evidence_export_prints_safe_json() -> None:
    repo_root = Path(__file__).resolve().parents[2]

    result = run_export(repo_root)

    payload = json.loads(result.stdout)
    assert payload["evidence_type"] == "paper_broker_simulation_preview_evidence"
    assert payload["evidence_id"].startswith("paper-broker-simulation-evidence-")
    assert payload["persisted"] is False

    evidence_input = payload["input"]
    assert evidence_input["symbol"] == "TMF"
    assert evidence_input["side"] == "BUY"
    assert evidence_input["order_type"] == "MARKET"
    assert evidence_input["quantity"] == 2
    assert evidence_input["bid_price"] == 19999
    assert evidence_input["ask_price"] == 20000
    assert evidence_input["last_price"] == 19999.5
    assert evidence_input["bid_size"] == 5
    assert evidence_input["ask_size"] == 5
    assert evidence_input["quote_age_seconds"] == 0
    assert evidence_input["liquidity_score"] == 1
    assert evidence_input["paper_only"] is True

    result_payload = payload["result"]
    assert result_payload["simulation_outcome"] == "fill"
    assert result_payload["simulated_fill_quantity"] == 2
    assert result_payload["simulated_fill_price"] == 20000
    assert result_payload["remaining_quantity"] == 0

    flags = payload["safety_flags"]
    assert flags["paper_only"] is True
    assert flags["live_trading_enabled"] is False
    assert flags["broker_api_called"] is False
    assert flags["external_market_data_downloaded"] is False
    assert flags["production_execution_model"] is False
    assert flags["database_written"] is False
    assert flags["order_created"] is False
    assert flags["risk_engine_called"] is False
    assert flags["oms_called"] is False
    assert flags["broker_credentials_collected"] is False


def test_paper_broker_simulation_evidence_export_writes_explicit_json_output(
    tmp_path: Path,
) -> None:
    repo_root = Path(__file__).resolve().parents[2]
    output_path = tmp_path / "paper_broker_simulation_evidence.json"

    result = run_export(repo_root, "--output", str(output_path))

    assert "Paper broker simulation evidence exported." in result.stdout
    assert output_path.exists()
    payload = json.loads(output_path.read_text(encoding="utf-8"))
    assert payload["persisted"] is True
    assert payload["safety_flags"]["paper_only"] is True
    assert payload["safety_flags"]["live_trading_enabled"] is False


def test_paper_broker_simulation_evidence_export_requires_limit_price() -> None:
    repo_root = Path(__file__).resolve().parents[2]

    result = subprocess.run(
        [
            sys.executable,
            str(repo_root / "scripts/export-paper-broker-simulation-evidence.py"),
            "--order-type",
            "LIMIT",
        ],
        cwd=repo_root,
        env=base_env(repo_root),
        capture_output=True,
        text=True,
    )

    assert result.returncode != 0
    assert "--limit-price is required" in result.stderr


def test_paper_broker_simulation_evidence_export_refuses_live_settings() -> None:
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
        [sys.executable, str(repo_root / "scripts/export-paper-broker-simulation-evidence.py")],
        cwd=repo_root,
        env=env,
        capture_output=True,
        text=True,
    )

    assert result.returncode != 0
    assert "not paper-only" in result.stderr


def test_paper_broker_simulation_evidence_export_can_preview_partial_fill() -> None:
    repo_root = Path(__file__).resolve().parents[2]

    result = run_export(
        repo_root,
        "--quantity",
        "10",
        "--ask-size",
        "10",
        "--liquidity-score",
        "0.3",
    )

    payload = json.loads(result.stdout)
    assert payload["result"]["simulation_outcome"] == "partial_fill"
    assert payload["result"]["simulated_fill_quantity"] == 3
    assert payload["result"]["remaining_quantity"] == 7
    assert payload["safety_flags"]["broker_api_called"] is False


def run_export(repo_root: Path, *args: str) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        [
            sys.executable,
            str(repo_root / "scripts/export-paper-broker-simulation-evidence.py"),
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
