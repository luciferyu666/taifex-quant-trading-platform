from __future__ import annotations

import json
from pathlib import Path
from types import SimpleNamespace
from typing import Any

from sdk.backtest_research_bundle import build_backtest_research_bundle_payload
from sdk.backtest_research_bundle_index import (
    build_backtest_research_bundle_index_payload,
)
from sdk.examples.build_backtest_research_bundle_example import build_example_chain


def generate_example_bundle(args: Any) -> dict[str, Any]:
    chain = build_example_chain(args)
    return build_backtest_research_bundle_payload(
        manifest_payload=chain["feature_manifest"],
        signal_payload=chain["strategy_signal"],
        backtest_preview_payload=chain["backtest_preview"],
        result_preview_payload=chain["backtest_result_preview"],
        toy_backtest_payload=chain["toy_backtest_run"],
        artifact_payload=chain["backtest_artifact"],
        index_payload=chain["backtest_artifact_index"],
        comparison_payload=chain["backtest_artifact_comparison"],
        bundle_label=args.bundle_label,
    )


def main() -> int:
    import argparse

    parser = argparse.ArgumentParser(
        description="Preview a dry-run local research bundle index."
    )
    parser.add_argument("--bundle-json", type=Path, action="append", default=[])
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
    parser.add_argument("--artifact-label", default="phase3-backtest-artifact")
    parser.add_argument("--index-label", default="phase3-backtest-artifact-index")
    parser.add_argument(
        "--comparison-label",
        default="phase3-backtest-artifact-comparison",
    )
    parser.add_argument("--bundle-label", default="phase3-backtest-research-bundle")
    parser.add_argument(
        "--bundle-index-label",
        default="phase3-backtest-research-bundle-index",
    )
    args = parser.parse_args()

    if args.bundle_json:
        bundle_payloads = [
            json.loads(path.read_text(encoding="utf-8"))
            for path in args.bundle_json
        ]
    else:
        first_bundle = generate_example_bundle(args)
        second_args = SimpleNamespace(**vars(args))
        second_args.parameter_set_id = f"{args.parameter_set_id}-bundle-variant"
        second_args.bundle_label = f"{args.bundle_label}-variant"
        second_bundle = generate_example_bundle(second_args)
        bundle_payloads = [first_bundle, second_bundle]

    index_payload = build_backtest_research_bundle_index_payload(
        bundle_payloads=bundle_payloads,
        index_label=args.bundle_index_label,
    )
    print(json.dumps(index_payload, indent=2, sort_keys=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
