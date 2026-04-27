import subprocess
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
APPLY_SCRIPT = REPO_ROOT / "data-pipeline" / "migrations" / "apply_local_migrations.py"
VERIFY_SCRIPT = REPO_ROOT / "data-pipeline" / "migrations" / "verify_local_data_platform.py"


def test_apply_migrations_dry_run_lists_phase_2_migration() -> None:
    result = subprocess.run(
        [sys.executable, str(APPLY_SCRIPT)],
        cwd=REPO_ROOT,
        check=False,
        capture_output=True,
        text=True,
    )

    assert result.returncode == 0
    assert "001_phase_2_data_platform.sql" in result.stdout
    assert "Dry-run only. No database connection was attempted." in result.stdout


def test_apply_migrations_requires_database_url_when_apply_is_set() -> None:
    result = subprocess.run(
        [sys.executable, str(APPLY_SCRIPT), "--apply"],
        cwd=REPO_ROOT,
        check=False,
        capture_output=True,
        text=True,
        env={"PATH": ""},
    )

    assert result.returncode == 2
    assert "DATABASE_URL is required when --apply is used." in result.stderr


def test_verify_data_platform_dry_run_lists_required_checks() -> None:
    result = subprocess.run(
        [sys.executable, str(VERIFY_SCRIPT)],
        cwd=REPO_ROOT,
        check=False,
        capture_output=True,
        text=True,
    )

    assert result.returncode == 0
    assert "required tables: contract_master" in result.stdout
    assert "data_quality_reports columns" in result.stdout
    assert "Dry-run only. No database connection was attempted." in result.stdout


def test_migration_file_list_is_stable() -> None:
    migrations = sorted(
        path.name
        for path in (REPO_ROOT / "data-pipeline" / "migrations").glob("*.sql")
        if path.name[:3].isdigit()
    )

    assert migrations == ["001_phase_2_data_platform.sql"]
