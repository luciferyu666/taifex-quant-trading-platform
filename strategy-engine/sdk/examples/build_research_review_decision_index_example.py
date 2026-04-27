from __future__ import annotations

import json
from pathlib import Path

from sdk.backtest_research_bundle_index import (
    build_backtest_research_bundle_index_payload,
)
from sdk.examples.build_backtest_research_bundle_index_example import (
    generate_example_bundle,
)
from sdk.research_review_decision import build_research_review_decision_payload
from sdk.research_review_decision_index import (
    build_research_review_decision_index_payload,
)
from sdk.research_review_queue import build_research_review_queue_payload


def main() -> int:
    import argparse

    parser = argparse.ArgumentParser(
        description="Preview a dry-run local research review decision index."
    )
    parser.add_argument("--decision-json", type=Path, action="append", default=[])
    parser.add_argument("--review-queue-json", type=Path)
    parser.add_argument("--bundle-index-json", type=Path)
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
    parser.add_argument(
        "--review-queue-label",
        default="phase3-research-review-queue",
    )
    parser.add_argument(
        "--decision-index-label",
        default="phase3-research-review-decision-index",
    )
    parser.add_argument("--reviewer-id", default="local-reviewer")
    args = parser.parse_args()

    if args.decision_json:
        decision_payloads = [
            json.loads(path.read_text(encoding="utf-8"))
            for path in args.decision_json
        ]
    else:
        if args.review_queue_json:
            queue_payload = json.loads(args.review_queue_json.read_text(encoding="utf-8"))
        else:
            if args.bundle_index_json:
                bundle_index_payload = json.loads(
                    args.bundle_index_json.read_text(encoding="utf-8")
                )
            else:
                if args.bundle_json:
                    bundle_payloads = [
                        json.loads(path.read_text(encoding="utf-8"))
                        for path in args.bundle_json
                    ]
                else:
                    bundle_payloads = [generate_example_bundle(args)]
                bundle_index_payload = build_backtest_research_bundle_index_payload(
                    bundle_payloads=bundle_payloads,
                    index_label=args.bundle_index_label,
                )
            queue_payload = build_research_review_queue_payload(
                bundle_index_payload=bundle_index_payload,
                review_queue_label=args.review_queue_label,
            )

        if not queue_payload.get("review_items"):
            raise SystemExit("review queue has no review_items")
        bundle_id = str(queue_payload["review_items"][0]["bundle_id"])
        decision_payloads = [
            build_research_review_decision_payload(
                review_queue_payload=queue_payload,
                bundle_id=bundle_id,
                decision="rejected",
                reviewer_id=args.reviewer_id,
                decision_reason=(
                    "Dry-run rejected example. This is not investment advice or "
                    "trading approval."
                ),
            ),
            build_research_review_decision_payload(
                review_queue_payload=queue_payload,
                bundle_id=bundle_id,
                decision="needs_data_review",
                reviewer_id=args.reviewer_id,
                decision_reason=(
                    "Dry-run needs-data-review example. This requests more research "
                    "validation only."
                ),
            ),
            build_research_review_decision_payload(
                review_queue_payload=queue_payload,
                bundle_id=bundle_id,
                decision="approved_for_paper_research",
                reviewer_id=args.reviewer_id,
                decision_reason=(
                    "Dry-run paper-research approval only. This does not approve "
                    "paper execution or live trading."
                ),
            ),
        ]

    index_payload = build_research_review_decision_index_payload(
        decision_payloads=decision_payloads,
        decision_index_label=args.decision_index_label,
    )
    print(json.dumps(index_payload, indent=2, sort_keys=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
