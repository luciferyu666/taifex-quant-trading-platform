import json
import subprocess
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
REGISTER_SCRIPT = REPO_ROOT / "data-pipeline" / "validation" / "register_data_version.py"
REPORT_DIR = REPO_ROOT / "data-pipeline" / "reports"


def _write_report(path: Path, broker_api_called: bool = False) -> Path:
    path.write_text(
        json.dumps(
            {
                "artifact_type": "phase_2_market_bar_fixture_validation",
                "paper_only": True,
                "external_data_downloaded": False,
                "broker_api_called": broker_api_called,
                "fixtures": [],
            }
        ),
        encoding="utf-8",
    )
    return path


def test_register_data_version_dry_run_without_database() -> None:
    result = subprocess.run(
        [
            sys.executable,
            str(REGISTER_SCRIPT),
            "--version-id",
            "pytest-registry-v1",
        ],
        cwd=REPO_ROOT,
        check=False,
        capture_output=True,
        text=True,
    )

    assert result.returncode == 0
    assert "version_id: pytest-registry-v1" in result.stdout
    assert "Dry-run only. No database connection was attempted." in result.stdout


def test_register_data_version_validates_report_and_prints_checksum() -> None:
    report = _write_report(REPORT_DIR / "pytest-safe.report.json")
    try:
        result = subprocess.run(
            [
                sys.executable,
                str(REGISTER_SCRIPT),
                "--version-id",
                "pytest-report-v1",
                "--data-quality-report",
                str(report.relative_to(REPO_ROOT)),
            ],
            cwd=REPO_ROOT,
            check=False,
            capture_output=True,
            text=True,
        )

        assert result.returncode == 0
        assert "data_quality_report_checksum:" in result.stdout
    finally:
        report.unlink(missing_ok=True)


def test_register_data_version_rejects_unsafe_report_schema() -> None:
    report = _write_report(REPORT_DIR / "pytest-unsafe.report.json", broker_api_called=True)
    try:
        result = subprocess.run(
            [
                sys.executable,
                str(REGISTER_SCRIPT),
                "--version-id",
                "pytest-unsafe-v1",
                "--data-quality-report",
                str(report.relative_to(REPO_ROOT)),
            ],
            cwd=REPO_ROOT,
            check=False,
            capture_output=True,
            text=True,
        )

        assert result.returncode == 1
        assert "broker_api_called must be false" in result.stderr
    finally:
        report.unlink(missing_ok=True)


def test_register_data_version_apply_requires_database_url() -> None:
    result = subprocess.run(
        [sys.executable, str(REGISTER_SCRIPT), "--apply"],
        cwd=REPO_ROOT,
        check=False,
        capture_output=True,
        text=True,
        env={"PATH": ""},
    )

    assert result.returncode == 2
    assert "DATABASE_URL is required when --apply is used." in result.stderr
