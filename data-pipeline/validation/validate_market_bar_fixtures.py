#!/usr/bin/env python3
"""Validate local Phase 2 market bar CSV fixtures.

This script is intentionally local-only. It does not download market data, connect to a
database, call broker APIs, or place orders.
"""

from __future__ import annotations

import argparse
import csv
import json
import sys
from pathlib import Path
from typing import Any


REPO_ROOT = Path(__file__).resolve().parents[2]
BACKEND_ROOT = REPO_ROOT / "backend"
FIXTURE_DIR = REPO_ROOT / "data-pipeline" / "fixtures"

sys.path.insert(0, str(BACKEND_ROOT))

from app.domain.market_data import validate_market_bar_rows  # noqa: E402


DEFAULT_DATA_VERSION = "fixture-v1"


def load_rows(path: Path) -> list[dict[str, str]]:
    with path.open(newline="", encoding="utf-8") as fixture_file:
        return list(csv.DictReader(fixture_file))


def validate_fixture(
    path: Path,
    expected_to_pass: bool,
    data_version: str = DEFAULT_DATA_VERSION,
    dataset_name: str | None = None,
) -> tuple[bool, dict[str, Any]]:
    path = path.resolve()
    rows = load_rows(path)
    report = validate_market_bar_rows(
        rows=rows,
        dataset_name=dataset_name or path.stem,
        data_version=data_version,
    )
    expectation_met = report.passed is expected_to_pass
    print(
        f"{path.name}: total={report.total_rows} "
        f"valid={report.valid_rows} invalid={report.invalid_rows} "
        f"passed={report.passed} expected={expected_to_pass}"
    )

    if not expectation_met:
        if expected_to_pass:
            print(f"Expected {path.name} to pass, but it reported invalid rows.", file=sys.stderr)
        else:
            print(f"Expected {path.name} to fail, but all rows passed.", file=sys.stderr)

    try:
        fixture_path = str(path.relative_to(REPO_ROOT))
    except ValueError:
        fixture_path = str(path)

    return expectation_met, {
        "fixture": fixture_path,
        "expected_to_pass": expected_to_pass,
        "expectation_met": expectation_met,
        "report": report.model_dump(mode="json"),
    }


def write_json_report(path: Path, payload: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    print(f"Wrote JSON report: {path}")


def default_fixtures() -> list[tuple[Path, bool]]:
    return [
        (FIXTURE_DIR / "market_bars_valid.csv", True),
        (FIXTURE_DIR / "market_bars_invalid.csv", False),
    ]


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Validate local market bar CSV fixtures without external data access.",
    )
    parser.add_argument(
        "--input",
        type=Path,
        help="Validate one CSV file instead of the default valid and invalid fixtures.",
    )
    parser.add_argument(
        "--output",
        type=Path,
        help="Optional JSON report path. Generated reports should stay out of git.",
    )
    parser.add_argument(
        "--dataset-name",
        help="Dataset name for --input mode. Defaults to the input file stem.",
    )
    parser.add_argument(
        "--data-version",
        default=DEFAULT_DATA_VERSION,
        help=f"Data version to attach to rows. Defaults to {DEFAULT_DATA_VERSION}.",
    )

    expectation = parser.add_mutually_exclusive_group()
    expectation.add_argument(
        "--expect-pass",
        action="store_true",
        help="Require the input fixture to pass validation.",
    )
    expectation.add_argument(
        "--expect-fail",
        action="store_true",
        help="Require the input fixture to fail validation.",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    if args.input:
        if not args.input.is_absolute():
            args.input = REPO_ROOT / args.input
        expected_to_pass = not args.expect_fail
        fixtures = [(args.input, expected_to_pass)]
    else:
        fixtures = default_fixtures()

    if args.output and not args.output.is_absolute():
        args.output = REPO_ROOT / args.output

    missing = [path for path, _ in fixtures if not path.exists()]
    if missing:
        for path in missing:
            print(f"Missing fixture: {path}", file=sys.stderr)
        return 1

    results = [
        validate_fixture(
            path=path,
            expected_to_pass=expected,
            data_version=args.data_version,
            dataset_name=args.dataset_name if args.input else None,
        )
        for path, expected in fixtures
    ]
    expectations_met = [passed for passed, _ in results]
    report_payload = {
        "artifact_type": "phase_2_market_bar_fixture_validation",
        "paper_only": True,
        "external_data_downloaded": False,
        "broker_api_called": False,
        "data_version": args.data_version,
        "all_expectations_met": all(expectations_met),
        "fixtures": [payload for _, payload in results],
    }

    if args.output:
        write_json_report(args.output, report_payload)

    if not all(expectations_met):
        return 1

    print("Local market bar CSV fixtures validated. No external data was downloaded.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
