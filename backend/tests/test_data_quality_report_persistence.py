import json
import subprocess
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
VALIDATION_SCRIPT = (
    REPO_ROOT / "data-pipeline" / "validation" / "validate_market_bar_fixtures.py"
)
PERSIST_SCRIPT = REPO_ROOT / "data-pipeline" / "validation" / "persist_quality_report.py"
VALID_FIXTURE = REPO_ROOT / "data-pipeline" / "fixtures" / "market_bars_valid.csv"


def _write_valid_report(tmp_path: Path) -> Path:
    output = tmp_path / "market_bars_valid.report.json"
    result = subprocess.run(
        [
            sys.executable,
            str(VALIDATION_SCRIPT),
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
    return output


def test_persistence_script_dry_run_reads_report_without_database(tmp_path: Path) -> None:
    report = _write_valid_report(tmp_path)

    result = subprocess.run(
        [sys.executable, str(PERSIST_SCRIPT), "--input", str(report)],
        cwd=REPO_ROOT,
        check=False,
        capture_output=True,
        text=True,
    )

    assert result.returncode == 0
    assert "Reports: 1" in result.stdout
    assert "Quality records: 12" in result.stdout
    assert "Dry-run only. No database connection was attempted." in result.stdout


def test_persistence_script_rejects_unsafe_report_schema(tmp_path: Path) -> None:
    report = _write_valid_report(tmp_path)
    payload = json.loads(report.read_text(encoding="utf-8"))
    payload["broker_api_called"] = True
    report.write_text(json.dumps(payload), encoding="utf-8")

    result = subprocess.run(
        [sys.executable, str(PERSIST_SCRIPT), "--input", str(report)],
        cwd=REPO_ROOT,
        check=False,
        capture_output=True,
        text=True,
    )

    assert result.returncode == 1
    assert "broker_api_called must be false" in result.stderr


def test_persistence_script_apply_requires_database_url(tmp_path: Path) -> None:
    report = _write_valid_report(tmp_path)

    result = subprocess.run(
        [sys.executable, str(PERSIST_SCRIPT), "--input", str(report), "--apply"],
        cwd=REPO_ROOT,
        check=False,
        capture_output=True,
        text=True,
        env={"PATH": ""},
    )

    assert result.returncode == 2
    assert "DATABASE_URL is required when --apply is used." in result.stderr


def test_persistence_script_default_glob_allows_no_reports() -> None:
    result = subprocess.run(
        [sys.executable, str(PERSIST_SCRIPT), "--input", "data-pipeline/reports/*.json"],
        cwd=REPO_ROOT,
        check=False,
        capture_output=True,
        text=True,
    )

    assert result.returncode == 0
    assert "No report artifacts matched" in result.stdout
