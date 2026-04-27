import json
import subprocess
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
SCRIPT = REPO_ROOT / "data-pipeline" / "validation" / "validate_market_bar_fixtures.py"
VALID_FIXTURE = REPO_ROOT / "data-pipeline" / "fixtures" / "market_bars_valid.csv"
INVALID_FIXTURE = REPO_ROOT / "data-pipeline" / "fixtures" / "market_bars_invalid.csv"


def test_validation_script_writes_json_report_for_valid_fixture(tmp_path: Path) -> None:
    output = tmp_path / "market_bars_valid.report.json"

    result = subprocess.run(
        [
            sys.executable,
            str(SCRIPT),
            "--input",
            str(VALID_FIXTURE),
            "--expect-pass",
            "--output",
            str(output),
        ],
        cwd=REPO_ROOT,
        check=False,
        capture_output=True,
        text=True,
    )

    assert result.returncode == 0
    payload = json.loads(output.read_text(encoding="utf-8"))
    assert payload["artifact_type"] == "phase_2_market_bar_fixture_validation"
    assert payload["paper_only"] is True
    assert payload["external_data_downloaded"] is False
    assert payload["broker_api_called"] is False
    assert payload["all_expectations_met"] is True
    assert payload["fixtures"][0]["report"]["passed"] is True


def test_validation_script_supports_expected_failure_fixture(tmp_path: Path) -> None:
    output = tmp_path / "market_bars_invalid.report.json"

    result = subprocess.run(
        [
            sys.executable,
            str(SCRIPT),
            "--input",
            str(INVALID_FIXTURE),
            "--expect-fail",
            "--output",
            str(output),
        ],
        cwd=REPO_ROOT,
        check=False,
        capture_output=True,
        text=True,
    )

    assert result.returncode == 0
    payload = json.loads(output.read_text(encoding="utf-8"))
    assert payload["all_expectations_met"] is True
    assert payload["fixtures"][0]["report"]["passed"] is False
    assert payload["fixtures"][0]["report"]["invalid_rows"] == 4


def test_validation_script_fails_when_expectation_is_wrong(tmp_path: Path) -> None:
    output = tmp_path / "market_bars_invalid_unexpected.report.json"

    result = subprocess.run(
        [
            sys.executable,
            str(SCRIPT),
            "--input",
            str(INVALID_FIXTURE),
            "--expect-pass",
            "--output",
            str(output),
        ],
        cwd=REPO_ROOT,
        check=False,
        capture_output=True,
        text=True,
    )

    assert result.returncode == 1
    payload = json.loads(output.read_text(encoding="utf-8"))
    assert payload["all_expectations_met"] is False
    assert "Expected market_bars_invalid.csv to pass" in result.stderr
