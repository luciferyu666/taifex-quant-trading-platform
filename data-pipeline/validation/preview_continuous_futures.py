#!/usr/bin/env python3
"""Preview research-only continuous futures from local Phase 2 fixtures.

This is a dry-run local preview. It does not download market data, connect to a
database, call broker APIs, write files by default, or place orders.
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

from app.domain.continuous_futures import (  # noqa: E402
    ContinuousFuturesPreviewRequest,
    preview_continuous_futures,
)


DEFAULT_DATA_VERSION = "fixture-v1"


def load_rows(path: Path) -> list[dict[str, str]]:
    with path.open(newline="", encoding="utf-8") as fixture_file:
        return list(csv.DictReader(fixture_file))


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Preview local research-only continuous futures without external data.",
    )
    parser.add_argument(
        "--market-bars",
        type=Path,
        default=FIXTURE_DIR / "market_bars_valid.csv",
        help="Local market bars CSV fixture.",
    )
    parser.add_argument(
        "--rollover-events",
        type=Path,
        default=FIXTURE_DIR / "rollover_events_valid.csv",
        help="Local rollover events CSV fixture.",
    )
    parser.add_argument(
        "--data-version",
        default=DEFAULT_DATA_VERSION,
        help=f"Data version to attach to preview rows. Defaults to {DEFAULT_DATA_VERSION}.",
    )
    parser.add_argument(
        "--adjustment-method",
        choices=("back_adjusted", "ratio_adjusted"),
        default="back_adjusted",
        help="Research adjustment method for preview output.",
    )
    parser.add_argument(
        "--output",
        type=Path,
        help="Optional JSON output path. Generated reports should stay out of git.",
    )
    return parser.parse_args()


def resolve_repo_path(path: Path) -> Path:
    if path.is_absolute():
        return path
    return REPO_ROOT / path


def write_json(path: Path, payload: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    print(f"Wrote JSON preview: {path}")


def main() -> int:
    args = parse_args()
    market_bars_path = resolve_repo_path(args.market_bars)
    rollover_events_path = resolve_repo_path(args.rollover_events)
    output_path = resolve_repo_path(args.output) if args.output else None

    missing = [path for path in (market_bars_path, rollover_events_path) if not path.exists()]
    if missing:
        for path in missing:
            print(f"Missing fixture: {path}", file=sys.stderr)
        return 1

    try:
        request = ContinuousFuturesPreviewRequest(
            data_version=args.data_version,
            adjustment_method=args.adjustment_method,
            market_bars=load_rows(market_bars_path),
            rollover_events=load_rows(rollover_events_path),
        )
        preview = preview_continuous_futures(request)
    except ValueError as exc:
        print(str(exc), file=sys.stderr)
        return 1

    payload = {
        "artifact_type": "phase_2_continuous_futures_preview",
        "paper_only": True,
        "external_data_downloaded": preview.external_data_downloaded,
        "broker_api_called": preview.broker_api_called,
        "research_only": preview.research_only,
        "execution_eligible": preview.execution_eligible,
        "preview": preview.model_dump(mode="json"),
    }

    print("Continuous futures preview:")
    print(f"  data_version: {preview.data_version}")
    print(f"  adjustment_method: {preview.adjustment_method.value}")
    print(f"  source_contracts: {len(preview.source_contracts)}")
    print(f"  rollover_events_applied: {len(preview.rollover_events_applied)}")
    print(f"  adjusted_research_bars: {len(preview.adjusted_research_bars)}")
    print(f"  research_only: {preview.research_only}")
    print(f"  execution_eligible: {preview.execution_eligible}")
    for warning in preview.warnings:
        print(f"  warning: {warning}")
    print("Dry-run only. No database connection, broker call, or external download was attempted.")

    if output_path:
        write_json(output_path, payload)

    if not preview.research_only or preview.execution_eligible:
        print("Continuous futures preview must remain research-only.", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
