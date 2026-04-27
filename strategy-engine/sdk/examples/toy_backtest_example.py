from __future__ import annotations

import csv
import json
from pathlib import Path
from typing import Any

from sdk.backtest_contract import build_backtest_preview_payload
from sdk.backtest_result import build_backtest_result_preview_payload
from sdk.examples.manifest_signal_strategy import preview_from_manifest_payload
from sdk.toy_backtest import run_toy_backtest_payload


def _example_manifest_payload() -> dict[str, Any]:
    return {
        "manifest_id": "example-fixture-v1-0" * 2,
        "data_version": "fixture-v1",
        "source_files": [
            {
                "path": "data-pipeline/fixtures/market_bars_valid.csv",
                "checksum_sha256": "0" * 64,
                "role": "market_bars_fixture",
            }
        ],
        "feature_set": {
            "feature_set_name": "phase2_fixture_research_features",
            "feature_timeframe": "1m",
            "contract_schema_version": "phase2-contract-master-v1",
        },
        "reproducibility_hash": "1" * 64,
        "warnings": ["Example manifest payload only."],
        "research_only": True,
        "execution_eligible": False,
        "external_data_downloaded": False,
        "broker_api_called": False,
    }


def load_local_fixture_bars(path: Path) -> list[dict[str, Any]]:
    with path.open(newline="", encoding="utf-8") as fixture_file:
        return list(csv.DictReader(fixture_file))


def main() -> int:
    import argparse

    parser = argparse.ArgumentParser(
        description="Run a fixture-only toy backtest using safe Phase 3 contracts."
    )
    parser.add_argument("--manifest-json", type=Path)
    parser.add_argument(
        "--bars-csv",
        type=Path,
        default=Path("data-pipeline/fixtures/market_bars_valid.csv"),
    )
    parser.add_argument("--strategy-id", default="manifest-signal-strategy")
    parser.add_argument("--strategy-version", default="0.1.0")
    parser.add_argument("--parameter-set-id", default="phase3-preview-default")
    parser.add_argument("--result-label", default="phase3-toy-backtest")
    args = parser.parse_args()

    if args.manifest_json:
        manifest_payload = json.loads(args.manifest_json.read_text(encoding="utf-8"))
    else:
        manifest_payload = _example_manifest_payload()

    strategy_preview = preview_from_manifest_payload(
        manifest_payload,
        strategy_id=args.strategy_id,
        strategy_version=args.strategy_version,
    )
    backtest_preview = build_backtest_preview_payload(
        manifest_payload=manifest_payload,
        signal_payload=strategy_preview["signal"],
        strategy_id=args.strategy_id,
        strategy_version=args.strategy_version,
        parameter_set_id=args.parameter_set_id,
    )
    result_preview = build_backtest_result_preview_payload(
        backtest_preview_payload=backtest_preview,
        result_label=args.result_label,
    )
    toy_run = run_toy_backtest_payload(
        result_preview_payload=result_preview,
        bars=load_local_fixture_bars(args.bars_csv),
    )
    print(json.dumps(toy_run, indent=2, sort_keys=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
