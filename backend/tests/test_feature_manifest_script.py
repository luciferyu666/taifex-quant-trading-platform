import json
import subprocess
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
MANIFEST_SCRIPT = REPO_ROOT / "data-pipeline" / "validation" / "build_feature_manifest.py"
REPORT_DIR = REPO_ROOT / "data-pipeline" / "reports"


def test_feature_manifest_script_default_dry_run() -> None:
    result = subprocess.run(
        [sys.executable, str(MANIFEST_SCRIPT)],
        cwd=REPO_ROOT,
        check=False,
        capture_output=True,
        text=True,
    )

    assert result.returncode == 0
    assert "Feature dataset manifest preview:" in result.stdout
    assert "research_only: True" in result.stdout
    assert "execution_eligible: False" in result.stdout
    assert "Dry-run only" in result.stdout


def test_feature_manifest_script_can_write_json() -> None:
    output = REPORT_DIR / "pytest-feature-manifest.report.json"
    try:
        result = subprocess.run(
            [
                sys.executable,
                str(MANIFEST_SCRIPT),
                "--continuous-futures-adjustment-method",
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
        assert payload["artifact_type"] == "phase_2_feature_dataset_manifest"
        assert payload["paper_only"] is True
        assert payload["research_only"] is True
        assert payload["execution_eligible"] is False
        assert payload["manifest"]["continuous_futures_config"]["adjustment_method"] == (
            "ratio_adjusted"
        )
        assert len(payload["manifest"]["reproducibility_hash"]) == 64
    finally:
        output.unlink(missing_ok=True)


def test_feature_manifest_script_rejects_missing_fixture() -> None:
    result = subprocess.run(
        [
            sys.executable,
            str(MANIFEST_SCRIPT),
            "--market-bars-fixture",
            "data-pipeline/fixtures/missing.csv",
        ],
        cwd=REPO_ROOT,
        check=False,
        capture_output=True,
        text=True,
    )

    assert result.returncode == 1
    assert "missing local file" in result.stderr
