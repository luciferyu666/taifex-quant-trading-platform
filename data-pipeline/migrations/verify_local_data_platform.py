#!/usr/bin/env python3
"""Verify local Phase 2 PostgreSQL data-platform schema.

Default behavior is dry-run and only prints the expected checks. Database verification
requires `DATABASE_URL` or `--database-url`.

This script does not download market data, call broker APIs, write rows, or place orders.
"""

from __future__ import annotations

import argparse
import os
import shutil
import subprocess
import sys
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[2]
REQUIRED_TABLES = (
    "contract_master",
    "market_bars",
    "rollover_events",
    "data_quality_reports",
    "data_versions",
    "data_migration_runs",
)
REQUIRED_CONTRACT_COLUMNS = (
    "symbol",
    "product_name",
    "point_value_twd",
    "tx_equivalent_ratio",
)
REQUIRED_QUALITY_COLUMNS = (
    "dataset_name",
    "data_version",
    "check_name",
    "passed",
    "severity",
    "observed_count",
    "details",
)
REQUIRED_DATA_VERSION_COLUMNS = (
    "version_id",
    "contract_schema_version",
    "market_bars_source",
    "rollover_rule_version",
    "data_quality_report_path",
    "data_quality_report_checksum",
    "status",
)
REQUIRED_MIGRATION_RUN_COLUMNS = (
    "migration_name",
    "migration_checksum",
    "status",
    "applied_at",
    "details",
)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Dry-run or verify local Phase 2 PostgreSQL schema.",
    )
    parser.add_argument(
        "--database-url",
        help="PostgreSQL connection URL. Defaults to DATABASE_URL environment variable.",
    )
    return parser.parse_args()


def normalize_database_url(database_url: str) -> str:
    return database_url.replace("postgresql+psycopg://", "postgresql://", 1)


def run_psql(database_url: str, sql: str) -> str:
    psql = shutil.which("psql")
    if not psql:
        raise RuntimeError("psql is not installed or not available in PATH.")

    result = subprocess.run(
        [
            psql,
            normalize_database_url(database_url),
            "--set",
            "ON_ERROR_STOP=1",
            "--tuples-only",
            "--no-align",
            "--command",
            sql,
        ],
        text=True,
        capture_output=True,
        check=False,
    )
    if result.returncode != 0:
        raise RuntimeError(result.stderr.strip() or "psql verification query failed")
    return result.stdout.strip()


def csv_literal(values: tuple[str, ...]) -> str:
    return ", ".join("'" + value.replace("'", "''") + "'" for value in values)


def verify_database(database_url: str) -> bool:
    found_tables = set(
        filter(
            None,
            run_psql(
                database_url,
                "SELECT table_name FROM information_schema.tables "
                "WHERE table_schema = 'public' "
                f"AND table_name IN ({csv_literal(REQUIRED_TABLES)}) "
                "ORDER BY table_name;",
            ).splitlines(),
        )
    )
    missing_tables = sorted(set(REQUIRED_TABLES) - found_tables)

    contract_columns = set(
        filter(
            None,
            run_psql(
                database_url,
                "SELECT column_name FROM information_schema.columns "
                "WHERE table_schema = 'public' "
                "AND table_name = 'contract_master' "
                f"AND column_name IN ({csv_literal(REQUIRED_CONTRACT_COLUMNS)}) "
                "ORDER BY column_name;",
            ).splitlines(),
        )
    )
    missing_contract_columns = sorted(set(REQUIRED_CONTRACT_COLUMNS) - contract_columns)

    quality_columns = set(
        filter(
            None,
            run_psql(
                database_url,
                "SELECT column_name FROM information_schema.columns "
                "WHERE table_schema = 'public' "
                "AND table_name = 'data_quality_reports' "
                f"AND column_name IN ({csv_literal(REQUIRED_QUALITY_COLUMNS)}) "
                "ORDER BY column_name;",
            ).splitlines(),
        )
    )
    missing_quality_columns = sorted(set(REQUIRED_QUALITY_COLUMNS) - quality_columns)

    data_version_columns = set(
        filter(
            None,
            run_psql(
                database_url,
                "SELECT column_name FROM information_schema.columns "
                "WHERE table_schema = 'public' "
                "AND table_name = 'data_versions' "
                f"AND column_name IN ({csv_literal(REQUIRED_DATA_VERSION_COLUMNS)}) "
                "ORDER BY column_name;",
            ).splitlines(),
        )
    )
    missing_data_version_columns = sorted(
        set(REQUIRED_DATA_VERSION_COLUMNS) - data_version_columns
    )

    migration_run_columns = set(
        filter(
            None,
            run_psql(
                database_url,
                "SELECT column_name FROM information_schema.columns "
                "WHERE table_schema = 'public' "
                "AND table_name = 'data_migration_runs' "
                f"AND column_name IN ({csv_literal(REQUIRED_MIGRATION_RUN_COLUMNS)}) "
                "ORDER BY column_name;",
            ).splitlines(),
        )
    )
    missing_migration_run_columns = sorted(
        set(REQUIRED_MIGRATION_RUN_COLUMNS) - migration_run_columns
    )

    contract_count_text = run_psql(
        database_url,
        "SELECT COUNT(*) FROM contract_master WHERE symbol IN ('TX', 'MTX', 'TMF');",
    )
    contract_count = int(contract_count_text or "0")

    if missing_tables:
        print(f"Missing tables: {', '.join(missing_tables)}", file=sys.stderr)
    if missing_contract_columns:
        print(
            f"Missing contract_master columns: {', '.join(missing_contract_columns)}",
            file=sys.stderr,
        )
    if missing_quality_columns:
        print(
            f"Missing data_quality_reports columns: {', '.join(missing_quality_columns)}",
            file=sys.stderr,
        )
    if missing_data_version_columns:
        print(
            f"Missing data_versions columns: {', '.join(missing_data_version_columns)}",
            file=sys.stderr,
        )
    if missing_migration_run_columns:
        print(
            f"Missing data_migration_runs columns: {', '.join(missing_migration_run_columns)}",
            file=sys.stderr,
        )
    if contract_count != 3:
        print(
            "contract_master must include TX, MTX, and TMF records.",
            file=sys.stderr,
        )

    return (
        not missing_tables
        and not missing_contract_columns
        and not missing_quality_columns
        and not missing_data_version_columns
        and not missing_migration_run_columns
        and contract_count == 3
    )


def print_dry_run_plan() -> None:
    print("Data platform verification checks:")
    print(f"  required tables: {', '.join(REQUIRED_TABLES)}")
    print(f"  contract_master columns: {', '.join(REQUIRED_CONTRACT_COLUMNS)}")
    print(f"  data_quality_reports columns: {', '.join(REQUIRED_QUALITY_COLUMNS)}")
    print(f"  data_versions columns: {', '.join(REQUIRED_DATA_VERSION_COLUMNS)}")
    print(f"  data_migration_runs columns: {', '.join(REQUIRED_MIGRATION_RUN_COLUMNS)}")
    print("  contract records: TX, MTX, TMF")


def main() -> int:
    args = parse_args()
    database_url = args.database_url or os.environ.get("DATABASE_URL")
    print_dry_run_plan()

    if not database_url:
        print("Dry-run only. No database connection was attempted.")
        return 0

    try:
        passed = verify_database(database_url)
    except RuntimeError as exc:
        print(str(exc), file=sys.stderr)
        return 1

    if not passed:
        return 1

    print("Data platform schema verification passed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
