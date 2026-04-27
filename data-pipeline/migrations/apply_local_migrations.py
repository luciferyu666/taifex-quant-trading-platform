#!/usr/bin/env python3
"""Apply local Phase 2 PostgreSQL migrations only with explicit approval.

Default behavior is dry-run. Database writes require both:
- `--apply`
- `DATABASE_URL` or `--database-url`

This script does not download market data, call broker APIs, or place orders.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import shutil
import subprocess
import sys
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[2]
MIGRATION_DIR = REPO_ROOT / "data-pipeline" / "migrations"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Dry-run or apply local Phase 2 PostgreSQL migrations.",
    )
    parser.add_argument(
        "--apply",
        action="store_true",
        help="Actually apply migrations. Requires DATABASE_URL.",
    )
    parser.add_argument(
        "--database-url",
        help="PostgreSQL connection URL. Defaults to DATABASE_URL environment variable.",
    )
    return parser.parse_args()


def list_migration_files() -> list[Path]:
    return sorted(
        path
        for path in MIGRATION_DIR.glob("*.sql")
        if path.is_file() and path.name[:3].isdigit()
    )


def normalize_database_url(database_url: str) -> str:
    return database_url.replace("postgresql+psycopg://", "postgresql://", 1)


def migration_checksum(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def sql_literal(value: str) -> str:
    return "'" + value.replace("'", "''") + "'"


def apply_migration(path: Path, database_url: str) -> None:
    psql = shutil.which("psql")
    if not psql:
        raise RuntimeError("psql is not installed or not available in PATH.")

    result = subprocess.run(
        [
            psql,
            normalize_database_url(database_url),
            "--set",
            "ON_ERROR_STOP=1",
            "--file",
            str(path),
        ],
        text=True,
        capture_output=True,
        check=False,
    )
    if result.returncode != 0:
        raise RuntimeError(result.stderr.strip() or f"psql failed while applying {path.name}")
    if result.stdout.strip():
        print(result.stdout.strip())


def record_migration_run(path: Path, database_url: str) -> None:
    psql = shutil.which("psql")
    if not psql:
        raise RuntimeError("psql is not installed or not available in PATH.")

    details = json.dumps(
        {
            "paper_only": True,
            "external_data_downloaded": False,
            "broker_api_called": False,
        },
        sort_keys=True,
    )
    sql = (
        "INSERT INTO data_migration_runs "
        "(migration_name, migration_checksum, status, applied_at, details) "
        "VALUES ("
        f"{sql_literal(path.name)}, "
        f"{sql_literal(migration_checksum(path))}, "
        "'applied', "
        "NOW(), "
        f"{sql_literal(details)}::jsonb"
        ") "
        "ON CONFLICT (migration_name) DO UPDATE SET "
        "migration_checksum = EXCLUDED.migration_checksum, "
        "status = EXCLUDED.status, "
        "applied_at = EXCLUDED.applied_at, "
        "details = EXCLUDED.details, "
        "updated_at = NOW();"
    )
    result = subprocess.run(
        [
            psql,
            normalize_database_url(database_url),
            "--set",
            "ON_ERROR_STOP=1",
            "--command",
            sql,
        ],
        text=True,
        capture_output=True,
        check=False,
    )
    if result.returncode != 0:
        raise RuntimeError(result.stderr.strip() or f"failed to record {path.name}")


def main() -> int:
    args = parse_args()
    migrations = list_migration_files()
    if not migrations:
        print(f"No local migrations found in {MIGRATION_DIR.relative_to(REPO_ROOT)}.")
        return 1

    print("Local Phase 2 migrations:")
    for migration in migrations:
        print(
            f"  - {migration.relative_to(REPO_ROOT)} "
            f"sha256={migration_checksum(migration)[:12]}"
        )

    if not args.apply:
        print("Dry-run only. No database connection was attempted.")
        return 0

    database_url = args.database_url or os.environ.get("DATABASE_URL")
    if not database_url:
        print("DATABASE_URL is required when --apply is used.", file=sys.stderr)
        return 2

    try:
        for migration in migrations:
            print(f"Applying {migration.relative_to(REPO_ROOT)}")
            apply_migration(migration, database_url)
            record_migration_run(migration, database_url)
    except RuntimeError as exc:
        print(str(exc), file=sys.stderr)
        return 1

    print("Local migrations applied.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
