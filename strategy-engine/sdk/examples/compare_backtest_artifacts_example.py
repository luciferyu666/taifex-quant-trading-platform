from __future__ import annotations

import json
from pathlib import Path
from types import SimpleNamespace
from typing import Any

from sdk.backtest_artifact_comparison import build_backtest_artifact_comparison_payload
from sdk.backtest_artifact_index import build_backtest_artifact_index_payload
from sdk.examples.build_backtest_artifact_index_example import generate_example_artifact


def generate_example_index(args: Any) -> dict[str, Any]:
    first_artifact = generate_example_artifact(args)
    second_args = SimpleNamespace(**vars(args))
    second_args.parameter_set_id = f"{args.parameter_set_id}-variant"
    second_args.artifact_label = f"{args.artifact_label}-variant"
    second_artifact = generate_example_artifact(second_args)
    return build_backtest_artifact_index_payload(
        artifact_payloads=[first_artifact, second_artifact],
        index_label=args.index_label,
        persisted=False,
    )


def main() -> int:
    import argparse

    parser = argparse.ArgumentParser(
        description="Preview a dry-run backtest artifact comparison from a local index."
    )
    parser.add_argument("--index-json", type=Path)
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
    args = parser.parse_args()

    if args.index_json:
        index_payload = json.loads(args.index_json.read_text(encoding="utf-8"))
    else:
        index_payload = generate_example_index(args)

    comparison_payload = build_backtest_artifact_comparison_payload(
        index_payload=index_payload,
        comparison_label=args.comparison_label,
    )
    print(json.dumps(comparison_payload, indent=2, sort_keys=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
