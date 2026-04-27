from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Any

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
from sdk.research_review_packet import (
    ResearchReviewPacket,
    build_research_review_packet_payload,
)
from sdk.research_review_queue import build_research_review_queue_payload


def main() -> int:
    parser = argparse.ArgumentParser(
        description=(
            "Export a safe local Research Review Packet sample for the read-only "
            "Web Command Center JSON loader."
        )
    )
    parser.add_argument(
        "--output",
        type=Path,
        help=(
            "Optional explicit .json output path. When omitted, the sample is "
            "printed to stdout only."
        ),
    )
    parser.add_argument("--packet-label", default="phase5-local-loader-safe-sample")
    parser.add_argument("--reviewer-id", default="local-reviewer")
    parser.add_argument(
        "--bars-csv",
        type=Path,
        default=Path("data-pipeline/fixtures/market_bars_valid.csv"),
    )
    parser.add_argument("--manifest-json", type=Path)
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
    parser.add_argument("--review-queue-label", default="phase3-research-review-queue")
    parser.add_argument(
        "--decision-index-label",
        default="phase3-research-review-decision-index",
    )
    args = parser.parse_args()

    payload = build_sample_packet(args)
    rendered = json.dumps(payload, indent=2, sort_keys=True)

    if args.output:
        write_local_json(args.output, rendered)
    print(rendered)
    return 0


def build_sample_packet(args: argparse.Namespace) -> dict[str, Any]:
    bundle_payload = generate_example_bundle(args)
    bundle_index_payload = build_backtest_research_bundle_index_payload(
        bundle_payloads=[bundle_payload],
        index_label=args.bundle_index_label,
    )
    queue_payload = build_research_review_queue_payload(
        bundle_index_payload=bundle_index_payload,
        review_queue_label=args.review_queue_label,
    )
    bundle_id = str(queue_payload["review_items"][0]["bundle_id"])
    decisions = [
        build_research_review_decision_payload(
            review_queue_payload=queue_payload,
            bundle_id=bundle_id,
            decision="rejected",
            reviewer_id=args.reviewer_id,
            decision_reason=(
                "Safe sample rejected decision. This is local metadata only and "
                "does not approve paper execution or live trading."
            ),
        ),
        build_research_review_decision_payload(
            review_queue_payload=queue_payload,
            bundle_id=bundle_id,
            decision="needs_data_review",
            reviewer_id=args.reviewer_id,
            decision_reason=(
                "Safe sample needs-data-review decision. This requests more "
                "research validation only."
            ),
        ),
        build_research_review_decision_payload(
            review_queue_payload=queue_payload,
            bundle_id=bundle_id,
            decision="approved_for_paper_research",
            reviewer_id=args.reviewer_id,
            decision_reason=(
                "Safe sample paper-research approval only. This is not approval "
                "for paper execution, OMS routing, Broker Gateway submission, or "
                "live trading."
            ),
        ),
    ]
    decision_index_payload = build_research_review_decision_index_payload(
        decision_payloads=decisions,
        decision_index_label=args.decision_index_label,
    )
    payload = build_research_review_packet_payload(
        review_queue_payload=queue_payload,
        decision_payloads=decisions,
        decision_index_payload=decision_index_payload,
        packet_label=args.packet_label,
    )
    ResearchReviewPacket.from_payload(payload)
    return payload


def write_local_json(path: Path, rendered_payload: str) -> None:
    if path.suffix.lower() != ".json":
        raise SystemExit("output path must end with .json")
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(f"{rendered_payload}\n", encoding="utf-8")


if __name__ == "__main__":
    raise SystemExit(main())
