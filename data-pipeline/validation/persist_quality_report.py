#!/usr/bin/env python3
"""Dry-run or persist Phase 2 data quality report artifacts.

Default behavior is dry-run only. Database writes require both:
- `--apply`
- `DATABASE_URL` or `--database-url`

This script does not download market data, call broker APIs, or place orders.
"""

from __future__ import annotations

import argparse
import json
import os
import shutil
import subprocess
import sys
from glob import glob
from dataclasses import dataclass
from pathlib import Path
from typing import Any


REPO_ROOT = Path(__file__).resolve().parents[2]
DEFAULT_REPORT_GLOB = "data-pipeline/reports/*.json"


@dataclass(frozen=True)
class QualityReportRecord:
    dataset_name: str
    data_version: str
    check_name: str
    passed: bool
    severity: str
    observed_count: int
    details: dict[str, Any]


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Validate and optionally persist local data quality report artifacts.",
    )
    parser.add_argument(
        "--input",
        default=DEFAULT_REPORT_GLOB,
        help=f"Report JSON path or glob. Defaults to {DEFAULT_REPORT_GLOB}.",
    )
    parser.add_argument(
        "--apply",
        action="store_true",
        help="Write records to data_quality_reports. Requires DATABASE_URL.",
    )
    parser.add_argument(
        "--database-url",
        help="PostgreSQL connection URL. Defaults to DATABASE_URL environment variable.",
    )
    return parser.parse_args()


def resolve_report_paths(pattern: str) -> list[Path]:
    pattern_path = Path(pattern)
    if not pattern_path.is_absolute():
        pattern = str(REPO_ROOT / pattern_path)

    matches = sorted(Path(path).resolve() for path in glob(pattern) if Path(path).is_file())
    if matches:
        return matches

    candidate = Path(pattern)
    if candidate.exists() and candidate.is_file():
        return [candidate.resolve()]
    return []


def load_report(path: Path) -> dict[str, Any]:
    try:
        payload = json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        raise ValueError(f"{path}: invalid JSON: {exc}") from exc
    if not isinstance(payload, dict):
        raise ValueError(f"{path}: report must be a JSON object")
    validate_report_schema(payload, path)
    return payload


def validate_report_schema(payload: dict[str, Any], path: Path) -> None:
    expected_type = "phase_2_market_bar_fixture_validation"
    if payload.get("artifact_type") != expected_type:
        raise ValueError(f"{path}: artifact_type must be {expected_type}")
    if payload.get("paper_only") is not True:
        raise ValueError(f"{path}: paper_only must be true")
    if payload.get("external_data_downloaded") is not False:
        raise ValueError(f"{path}: external_data_downloaded must be false")
    if payload.get("broker_api_called") is not False:
        raise ValueError(f"{path}: broker_api_called must be false")
    if not isinstance(payload.get("fixtures"), list):
        raise ValueError(f"{path}: fixtures must be a list")


def extract_records(payload: dict[str, Any]) -> list[QualityReportRecord]:
    records: list[QualityReportRecord] = []
    for fixture in payload["fixtures"]:
        report = fixture.get("report", {})
        dataset_name = str(report.get("dataset_name") or Path(fixture["fixture"]).stem)
        data_version = str(report.get("data_version") or payload.get("data_version") or "")
        rows = report.get("rows", [])
        if not isinstance(rows, list):
            raise ValueError(f"{fixture.get('fixture')}: report.rows must be a list")

        for row in rows:
            row_number = row.get("row_number")
            row_errors = row.get("errors") or []
            row_dataset_name = str(row.get("dataset_name") or dataset_name)
            row_data_version = str(row.get("data_version") or data_version)
            checks = row.get("checks") or []
            if checks:
                for check in checks:
                    records.append(
                        QualityReportRecord(
                            dataset_name=row_dataset_name,
                            data_version=row_data_version,
                            check_name=str(check["name"]),
                            passed=bool(check["passed"]),
                            severity=str(check["severity"]),
                            observed_count=1,
                            details={
                                "fixture": fixture.get("fixture"),
                                "row_number": row_number,
                                "message": check.get("message"),
                                "check_details": check.get("details") or {},
                                "row_errors": row_errors,
                            },
                        )
                    )
            else:
                records.append(
                    QualityReportRecord(
                        dataset_name=row_dataset_name,
                        data_version=row_data_version,
                        check_name="row_parse_validation",
                        passed=False,
                        severity="error",
                        observed_count=1,
                        details={
                            "fixture": fixture.get("fixture"),
                            "row_number": row_number,
                            "row_errors": row_errors,
                        },
                    )
                )
    return records


def normalize_database_url(database_url: str) -> str:
    return database_url.replace("postgresql+psycopg://", "postgresql://", 1)


def sql_literal(value: str) -> str:
    return "'" + value.replace("'", "''") + "'"


def build_insert_sql(records: list[QualityReportRecord]) -> str:
    statements = ["BEGIN;"]
    for record in records:
        details_json = json.dumps(record.details, sort_keys=True)
        statements.append(
            "INSERT INTO data_quality_reports "
            "(dataset_name, data_version, check_name, passed, severity, observed_count, details) "
            "VALUES ("
            f"{sql_literal(record.dataset_name)}, "
            f"{sql_literal(record.data_version)}, "
            f"{sql_literal(record.check_name)}, "
            f"{'TRUE' if record.passed else 'FALSE'}, "
            f"{sql_literal(record.severity)}, "
            f"{record.observed_count}, "
            f"{sql_literal(details_json)}::jsonb"
            ");"
        )
    statements.append("COMMIT;")
    return "\n".join(statements) + "\n"


def persist_records(records: list[QualityReportRecord], database_url: str) -> None:
    if not records:
        print("No records to persist.")
        return
    psql = shutil.which("psql")
    if not psql:
        raise RuntimeError("psql is not installed or not available in PATH.")

    normalized_url = normalize_database_url(database_url)
    sql = build_insert_sql(records)
    result = subprocess.run(
        [psql, normalized_url, "--set", "ON_ERROR_STOP=1"],
        input=sql,
        text=True,
        capture_output=True,
        check=False,
    )
    if result.returncode != 0:
        raise RuntimeError(result.stderr.strip() or "psql failed without stderr output")
    print(result.stdout.strip())


def main() -> int:
    args = parse_args()
    paths = resolve_report_paths(args.input)
    if not paths:
        print(f"No report artifacts matched: {args.input}")
        print("Dry-run complete. No database connection was attempted.")
        return 0

    try:
        payloads = [load_report(path) for path in paths]
        records = [record for payload in payloads for record in extract_records(payload)]
    except ValueError as exc:
        print(str(exc), file=sys.stderr)
        return 1

    print(f"Reports: {len(paths)}")
    print(f"Quality records: {len(records)}")

    if not args.apply:
        print("Dry-run only. No database connection was attempted.")
        return 0

    database_url = args.database_url or os.environ.get("DATABASE_URL")
    if not database_url:
        print("DATABASE_URL is required when --apply is used.", file=sys.stderr)
        return 2

    try:
        persist_records(records, database_url)
    except RuntimeError as exc:
        print(str(exc), file=sys.stderr)
        return 1

    print("Persisted data quality report records.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
