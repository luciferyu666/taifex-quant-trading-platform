import json
import subprocess
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
VALIDATION_SCRIPT = (
    REPO_ROOT / "data-pipeline" / "validation" / "validate_rollover_event_fixtures.py"
)
VALID_FIXTURE = REPO_ROOT / "data-pipeline" / "fixtures" / "rollover_events_valid.csv"
INVALID_FIXTURE = REPO_ROOT / "data-pipeline" / "fixtures" / "rollover_events_invalid.csv"
REPORT_DIR = REPO_ROOT / "data-pipeline" / "reports"


def test_rollover_fixture_script_default_validates_expected_pass_and_fail() -> None:
    result = subprocess.run(
        [sys.executable, str(VALIDATION_SCRIPT)],
        cwd=REPO_ROOT,
        check=False,
        capture_output=True,
        text=True,
    )

    assert result.returncode == 0
    assert "rollover_events_valid.csv: total=3 valid=3 invalid=0" in result.stdout
    assert "rollover_events_invalid.csv: total=6 valid=0 invalid=6" in result.stdout
    assert "No external data was downloaded" in result.stdout


def test_rollover_fixture_script_can_write_json_report() -> None:
    output = REPORT_DIR / "pytest-rollover.report.json"
    try:
        result = subprocess.run(
            [
                sys.executable,
                str(VALIDATION_SCRIPT),
                "--input",
                str(VALID_FIXTURE.relative_to(REPO_ROOT)),
                "--expect-pass",
                "--output",
                str(output.relative_to(REPO_ROOT)),
            ],
            cwd=REPO_ROOT,
            check=False,
            capture_output=True,
            text=True,
        )

        assert result.returncode == 0
        payload = json.loads(output.read_text(encoding="utf-8"))
        assert payload["artifact_type"] == "phase_2_rollover_event_fixture_validation"
        assert payload["paper_only"] is True
        assert payload["external_data_downloaded"] is False
        assert payload["broker_api_called"] is False
        assert payload["fixtures"][0]["report"]["passed"] is True
    finally:
        output.unlink(missing_ok=True)


def test_rollover_fixture_script_fails_when_expectation_is_wrong() -> None:
    result = subprocess.run(
        [
            sys.executable,
            str(VALIDATION_SCRIPT),
            "--input",
            str(INVALID_FIXTURE.relative_to(REPO_ROOT)),
            "--expect-pass",
        ],
        cwd=REPO_ROOT,
        check=False,
        capture_output=True,
        text=True,
    )

    assert result.returncode == 1
    assert "Expected rollover_events_invalid.csv to pass" in result.stderr
