#!/usr/bin/env python3
"""Dry-run or persist a Phase 2 data version registry record.

Default behavior is dry-run only. Database writes require both:
- `--apply`
- `DATABASE_URL` or `--database-url`

This script does not download market data, call broker APIs, or enable live trading.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import shutil
import subprocess
import sys
from dataclasses import dataclass
from datetime import UTC, datetime
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[2]
VALID_STATUSES = ("draft", "validated", "rejected", "retired")


@dataclass(frozen=True)
class DataVersionRecord:
    version_id: str
    contract_schema_version: str
    market_bars_source: str
    rollover_rule_version: str
    data_quality_report_path: str | None
    data_quality_report_checksum: str | None
    status: str
    notes: str
    created_at: str


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Register a local Phase 2 data version record.",
    )
    parser.add_argument("--version-id", default="local-fixture-draft")
    parser.add_argument("--contract-schema-version", default="phase2-contract-master-v1")
    parser.add_argument("--market-bars-source", default="local-fixtures")
    parser.add_argument("--rollover-rule-version", default="phase2-rollover-metadata-v1")
    parser.add_argument("--data-quality-report", help="Repository-relative report JSON path.")
    parser.add_argument("--status", choices=VALID_STATUSES, default="draft")
    parser.add_argument("--notes", default="Phase 2 local data version registry dry-run.")
    parser.add_argument(
        "--apply",
        action="store_true",
        help="Write to data_versions. Requires DATABASE_URL.",
    )
    parser.add_argument(
        "--database-url",
        help="PostgreSQL connection URL. Defaults to DATABASE_URL environment variable.",
    )
    return parser.parse_args()


def normalize_database_url(database_url: str) -> str:
    return database_url.replace("postgresql+psycopg://", "postgresql://", 1)


def resolve_repo_relative_path(path_text: str) -> Path:
    path = Path(path_text)
    if path.is_absolute():
        raise ValueError("data quality report path must be repository-relative")
    resolved = (REPO_ROOT / path).resolve()
    if not resolved.is_relative_to(REPO_ROOT):
        raise ValueError("data quality report path must stay inside the repository")
    return resolved


def checksum_file(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def validate_report_schema(path: Path) -> None:
    try:
        payload = json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        raise ValueError(f"{path}: invalid JSON: {exc}") from exc
    if not isinstance(payload, dict):
        raise ValueError(f"{path}: report must be a JSON object")
    if payload.get("artifact_type") != "phase_2_market_bar_fixture_validation":
        raise ValueError(f"{path}: unsupported artifact_type")
    if payload.get("paper_only") is not True:
        raise ValueError(f"{path}: paper_only must be true")
    if payload.get("external_data_downloaded") is not False:
        raise ValueError(f"{path}: external_data_downloaded must be false")
    if payload.get("broker_api_called") is not False:
        raise ValueError(f"{path}: broker_api_called must be false")
    if not isinstance(payload.get("fixtures"), list):
        raise ValueError(f"{path}: fixtures must be a list")


def build_record(args: argparse.Namespace) -> DataVersionRecord:
    if " " in args.version_id or args.version_id.strip() != args.version_id:
        raise ValueError("version-id must not contain spaces")

    report_path_text: str | None = None
    report_checksum: str | None = None
    if args.data_quality_report:
        report_path = resolve_repo_relative_path(args.data_quality_report)
        if not report_path.is_file():
            raise ValueError(f"{args.data_quality_report}: report file does not exist")
        validate_report_schema(report_path)
        report_path_text = report_path.relative_to(REPO_ROOT).as_posix()
        report_checksum = checksum_file(report_path)

    return DataVersionRecord(
        version_id=args.version_id,
        contract_schema_version=args.contract_schema_version,
        market_bars_source=args.market_bars_source,
        rollover_rule_version=args.rollover_rule_version,
        data_quality_report_path=report_path_text,
        data_quality_report_checksum=report_checksum,
        status=args.status,
        notes=args.notes,
        created_at=datetime.now(UTC).isoformat(),
    )


def sql_literal(value: str) -> str:
    return "'" + value.replace("'", "''") + "'"


def sql_nullable(value: str | None) -> str:
    if value is None:
        return "NULL"
    return sql_literal(value)


def build_upsert_sql(record: DataVersionRecord) -> str:
    return (
        "INSERT INTO data_versions "
        "(version_id, contract_schema_version, market_bars_source, rollover_rule_version, "
        "data_quality_report_path, data_quality_report_checksum, status, notes) "
        "VALUES ("
        f"{sql_literal(record.version_id)}, "
        f"{sql_literal(record.contract_schema_version)}, "
        f"{sql_literal(record.market_bars_source)}, "
        f"{sql_literal(record.rollover_rule_version)}, "
        f"{sql_nullable(record.data_quality_report_path)}, "
        f"{sql_nullable(record.data_quality_report_checksum)}, "
        f"{sql_literal(record.status)}, "
        f"{sql_literal(record.notes)}"
        ") "
        "ON CONFLICT (version_id) DO UPDATE SET "
        "contract_schema_version = EXCLUDED.contract_schema_version, "
        "market_bars_source = EXCLUDED.market_bars_source, "
        "rollover_rule_version = EXCLUDED.rollover_rule_version, "
        "data_quality_report_path = EXCLUDED.data_quality_report_path, "
        "data_quality_report_checksum = EXCLUDED.data_quality_report_checksum, "
        "status = EXCLUDED.status, "
        "notes = EXCLUDED.notes, "
        "updated_at = NOW();"
    )


def persist_record(record: DataVersionRecord, database_url: str) -> None:
    psql = shutil.which("psql")
    if not psql:
        raise RuntimeError("psql is not installed or not available in PATH.")

    result = subprocess.run(
        [
            psql,
            normalize_database_url(database_url),
            "--set",
            "ON_ERROR_STOP=1",
            "--command",
            build_upsert_sql(record),
        ],
        text=True,
        capture_output=True,
        check=False,
    )
    if result.returncode != 0:
        raise RuntimeError(result.stderr.strip() or "psql failed while registering data version")
    if result.stdout.strip():
        print(result.stdout.strip())


def print_record(record: DataVersionRecord) -> None:
    print("Data version registry record:")
    print(f"  version_id: {record.version_id}")
    print(f"  contract_schema_version: {record.contract_schema_version}")
    print(f"  market_bars_source: {record.market_bars_source}")
    print(f"  rollover_rule_version: {record.rollover_rule_version}")
    print(f"  data_quality_report_path: {record.data_quality_report_path or 'none'}")
    print(f"  data_quality_report_checksum: {record.data_quality_report_checksum or 'none'}")
    print(f"  status: {record.status}")
    print(f"  created_at: {record.created_at}")


def main() -> int:
    args = parse_args()
    try:
        record = build_record(args)
    except ValueError as exc:
        print(str(exc), file=sys.stderr)
        return 1

    print_record(record)
    if not args.apply:
        print("Dry-run only. No database connection was attempted.")
        return 0

    database_url = args.database_url or os.environ.get("DATABASE_URL")
    if not database_url:
        print("DATABASE_URL is required when --apply is used.", file=sys.stderr)
        return 2

    try:
        persist_record(record, database_url)
    except RuntimeError as exc:
        print(str(exc), file=sys.stderr)
        return 1

    print("Persisted data version registry record.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
