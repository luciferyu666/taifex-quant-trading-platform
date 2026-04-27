import json
import subprocess
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
PREVIEW_SCRIPT = REPO_ROOT / "data-pipeline" / "validation" / "preview_continuous_futures.py"
REPORT_DIR = REPO_ROOT / "data-pipeline" / "reports"


def test_continuous_futures_preview_script_default_dry_run() -> None:
    result = subprocess.run(
        [sys.executable, str(PREVIEW_SCRIPT)],
        cwd=REPO_ROOT,
        check=False,
        capture_output=True,
        text=True,
    )

    assert result.returncode == 0
    assert "Continuous futures preview:" in result.stdout
    assert "research_only: True" in result.stdout
    assert "execution_eligible: False" in result.stdout
    assert "Dry-run only" in result.stdout


def test_continuous_futures_preview_script_can_write_json() -> None:
    output = REPORT_DIR / "pytest-continuous-preview.report.json"
    try:
        result = subprocess.run(
            [
                sys.executable,
                str(PREVIEW_SCRIPT),
                "--adjustment-method",
                "ratio_adjusted",
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
        assert payload["artifact_type"] == "phase_2_continuous_futures_preview"
        assert payload["paper_only"] is True
        assert payload["research_only"] is True
        assert payload["execution_eligible"] is False
        assert payload["preview"]["summary"]["rollover_event_count"] == 1
    finally:
        output.unlink(missing_ok=True)


def test_continuous_futures_preview_script_rejects_missing_fixture() -> None:
    result = subprocess.run(
        [
            sys.executable,
            str(PREVIEW_SCRIPT),
            "--market-bars",
            "data-pipeline/fixtures/missing.csv",
        ],
        cwd=REPO_ROOT,
        check=False,
        capture_output=True,
        text=True,
    )

    assert result.returncode == 1
    assert "Missing fixture" in result.stderr
