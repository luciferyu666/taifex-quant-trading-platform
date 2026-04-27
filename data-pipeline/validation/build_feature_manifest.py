#!/usr/bin/env python3
"""Build a dry-run Phase 2 feature dataset manifest from local fixtures.

This script does not download market data, connect to a database, call broker APIs,
write files by default, create trading signals, or run a backtest.
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[2]
BACKEND_ROOT = REPO_ROOT / "backend"

sys.path.insert(0, str(BACKEND_ROOT))

from app.domain.feature_manifest import (  # noqa: E402
    FeatureManifestPreviewRequest,
    build_feature_manifest,
)


DEFAULT_DATA_VERSION = "fixture-v1"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Build a local research-only feature dataset manifest.",
    )
    parser.add_argument("--data-version", default=DEFAULT_DATA_VERSION)
    parser.add_argument("--contract-schema-version", default="phase2-contract-master-v1")
    parser.add_argument(
        "--market-bars-fixture",
        default="data-pipeline/fixtures/market_bars_valid.csv",
    )
    parser.add_argument(
        "--rollover-events-fixture",
        default="data-pipeline/fixtures/rollover_events_valid.csv",
    )
    parser.add_argument("--quality-report-path")
    parser.add_argument("--quality-report-checksum")
    parser.add_argument(
        "--continuous-futures-adjustment-method",
        choices=("back_adjusted", "ratio_adjusted"),
        default="back_adjusted",
    )
    parser.add_argument("--feature-set-name", default="phase2_fixture_research_features")
    parser.add_argument("--feature-timeframe", default="1m")
    parser.add_argument(
        "--output",
        type=Path,
        help="Optional JSON output path. Generated reports should stay out of git.",
    )
    return parser.parse_args()


def resolve_output_path(path: Path) -> Path:
    if path.is_absolute():
        return path
    return REPO_ROOT / path


def write_json(path: Path, payload: dict[str, object]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    print(f"Wrote feature manifest preview: {path}")


def main() -> int:
    args = parse_args()
    try:
        request = FeatureManifestPreviewRequest(
            data_version=args.data_version,
            contract_schema_version=args.contract_schema_version,
            market_bars_fixture=args.market_bars_fixture,
            rollover_events_fixture=args.rollover_events_fixture,
            quality_report_path=args.quality_report_path,
            quality_report_checksum=args.quality_report_checksum,
            continuous_futures_adjustment_method=args.continuous_futures_adjustment_method,
            feature_set_name=args.feature_set_name,
            feature_timeframe=args.feature_timeframe,
            research_only=True,
        )
        manifest = build_feature_manifest(request)
    except ValueError as exc:
        print(str(exc), file=sys.stderr)
        return 1

    payload = {
        "artifact_type": "phase_2_feature_dataset_manifest",
        "paper_only": True,
        "external_data_downloaded": manifest.external_data_downloaded,
        "broker_api_called": manifest.broker_api_called,
        "research_only": manifest.research_only,
        "execution_eligible": manifest.execution_eligible,
        "manifest": manifest.model_dump(mode="json"),
    }

    print("Feature dataset manifest preview:")
    print(f"  manifest_id: {manifest.manifest_id}")
    print(f"  data_version: {manifest.data_version}")
    print(f"  feature_set_name: {manifest.feature_set.feature_set_name}")
    print(f"  feature_timeframe: {manifest.feature_set.feature_timeframe}")
    print(f"  source_files: {len(manifest.source_files)}")
    print(f"  reproducibility_hash: {manifest.reproducibility_hash}")
    print(f"  research_only: {manifest.research_only}")
    print(f"  execution_eligible: {manifest.execution_eligible}")
    for warning in manifest.warnings:
        print(f"  warning: {warning}")
    print("Dry-run only. No database, broker, external download, signal, or backtest was used.")

    if args.output:
        write_json(resolve_output_path(args.output), payload)

    if not manifest.research_only or manifest.execution_eligible:
        print("Feature manifest must remain research-only.", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
