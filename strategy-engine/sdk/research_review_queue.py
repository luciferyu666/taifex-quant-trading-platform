from __future__ import annotations

import hashlib
import json
from dataclasses import dataclass
from typing import Any

from .backtest_research_bundle_index import (
    BacktestResearchBundleIndex,
    BacktestResearchBundleIndexError,
)


class ResearchReviewQueueError(ValueError):
    pass


@dataclass(frozen=True)
class ResearchReviewQueue:
    review_queue_id: str
    review_queue_label: str
    bundle_count: int
    review_items: tuple[dict[str, Any], ...]
    queue_checksum: str
    reproducibility_hash: str
    research_only: bool
    execution_eligible: bool
    order_created: bool
    broker_api_called: bool
    risk_engine_called: bool
    oms_called: bool
    performance_claim: bool
    simulated_metrics_only: bool
    external_data_downloaded: bool
    ranking_generated: bool
    best_strategy_selected: bool
    approval_for_live: bool
    persisted: bool
    warnings: tuple[str, ...] = ()

    @classmethod
    def from_payload(cls, payload: dict[str, Any]) -> ResearchReviewQueue:
        if not isinstance(payload, dict):
            raise ResearchReviewQueueError("research review queue payload must be an object")
        review_items = payload.get("review_items") or []
        if not isinstance(review_items, list):
            raise ResearchReviewQueueError("review_items must be a list")
        record = cls(
            review_queue_id=str(payload.get("review_queue_id") or ""),
            review_queue_label=str(payload.get("review_queue_label") or ""),
            bundle_count=int(payload.get("bundle_count") or 0),
            review_items=tuple(dict(item) for item in review_items),
            queue_checksum=str(payload.get("queue_checksum") or ""),
            reproducibility_hash=str(payload.get("reproducibility_hash") or ""),
            research_only=bool(payload.get("research_only")),
            execution_eligible=bool(payload.get("execution_eligible")),
            order_created=bool(payload.get("order_created")),
            broker_api_called=bool(payload.get("broker_api_called")),
            risk_engine_called=bool(payload.get("risk_engine_called")),
            oms_called=bool(payload.get("oms_called")),
            performance_claim=bool(payload.get("performance_claim")),
            simulated_metrics_only=bool(payload.get("simulated_metrics_only")),
            external_data_downloaded=bool(payload.get("external_data_downloaded")),
            ranking_generated=bool(payload.get("ranking_generated")),
            best_strategy_selected=bool(payload.get("best_strategy_selected")),
            approval_for_live=bool(payload.get("approval_for_live")),
            persisted=bool(payload.get("persisted")),
            warnings=tuple(str(item) for item in payload.get("warnings", [])),
        )
        record.validate_safe_queue()
        return record

    def validate_safe_queue(self) -> None:
        if not self.review_queue_id:
            raise ResearchReviewQueueError("review_queue_id is required")
        if not self.review_queue_label:
            raise ResearchReviewQueueError("review_queue_label is required")
        if self.bundle_count != len(self.review_items):
            raise ResearchReviewQueueError(
                "bundle_count must match review_items length"
            )
        if self.bundle_count < 1:
            raise ResearchReviewQueueError("bundle_count must be positive")
        if not is_sha256_digest(self.queue_checksum):
            raise ResearchReviewQueueError("queue_checksum must be a SHA-256 digest")
        if not is_sha256_digest(self.reproducibility_hash):
            raise ResearchReviewQueueError(
                "reproducibility_hash must be a SHA-256 digest"
            )
        if self.research_only is not True:
            raise ResearchReviewQueueError(
                "research review queue must be research_only=true"
            )
        if self.execution_eligible is not False:
            raise ResearchReviewQueueError(
                "research review queue must be execution_eligible=false"
            )
        if self.order_created:
            raise ResearchReviewQueueError("research review queue must not create orders")
        if self.broker_api_called:
            raise ResearchReviewQueueError(
                "research review queue must not call broker APIs"
            )
        if self.risk_engine_called:
            raise ResearchReviewQueueError(
                "research review queue must not call Risk Engine"
            )
        if self.oms_called:
            raise ResearchReviewQueueError("research review queue must not call OMS")
        if self.performance_claim:
            raise ResearchReviewQueueError(
                "research review queue must not make performance claims"
            )
        if self.simulated_metrics_only is not True:
            raise ResearchReviewQueueError(
                "research review queue must be simulated_metrics_only=true"
            )
        if self.external_data_downloaded:
            raise ResearchReviewQueueError(
                "research review queue must not download external data"
            )
        if self.ranking_generated:
            raise ResearchReviewQueueError(
                "research review queue must not generate rankings"
            )
        if self.best_strategy_selected:
            raise ResearchReviewQueueError(
                "research review queue must not select best strategy"
            )
        if self.approval_for_live:
            raise ResearchReviewQueueError(
                "research review queue must not approve live trading"
            )
        if self.persisted:
            raise ResearchReviewQueueError(
                "research review queue preview must not persist by default"
            )
        for item in self.review_items:
            if item.get("review_status") != "pending_review":
                raise ResearchReviewQueueError(
                    "review_status must remain pending_review"
                )
            if not is_sha256_digest(str(item.get("bundle_checksum") or "")):
                raise ResearchReviewQueueError(
                    "review item bundle_checksum must be a SHA-256 digest"
                )


def build_research_review_queue_payload(
    bundle_index_payload: dict[str, Any],
    review_queue_label: str,
) -> dict[str, Any]:
    try:
        bundle_index = BacktestResearchBundleIndex.from_payload(bundle_index_payload)
    except BacktestResearchBundleIndexError as exc:
        raise ResearchReviewQueueError(str(exc)) from exc
    review_items = sorted(
        [review_item_from_bundle(bundle) for bundle in bundle_index.bundles],
        key=lambda item: (item["bundle_id"], item["bundle_checksum"]),
    )
    safety_flags = {
        "research_only": True,
        "execution_eligible": False,
        "order_created": False,
        "broker_api_called": False,
        "risk_engine_called": False,
        "oms_called": False,
        "performance_claim": False,
        "simulated_metrics_only": True,
        "external_data_downloaded": False,
        "ranking_generated": False,
        "best_strategy_selected": False,
        "approval_for_live": False,
        "persisted": False,
    }
    queue_core = {
        "review_queue_label": review_queue_label,
        "bundle_index_id": bundle_index.bundle_index_id,
        "review_items": review_items,
        "safety_flags": safety_flags,
    }
    queue_checksum = sha256_json(queue_core)
    reproducibility_hash = sha256_json(
        {
            **queue_core,
            "queue_checksum": queue_checksum,
            "bundle_index_checksum": bundle_index.index_checksum,
        }
    )
    payload = {
        "review_queue_id": (
            f"research-review-queue-{slugify(review_queue_label)}-"
            f"{queue_checksum[:12]}"
        ),
        "review_queue_label": review_queue_label,
        "bundle_count": len(review_items),
        "review_items": review_items,
        "queue_checksum": queue_checksum,
        "reproducibility_hash": reproducibility_hash,
        "warnings": [
            (
                "SDK research review queue is dry-run local metadata only. It does "
                "not approve live trading, rank strategies, select winners, write "
                "databases, call brokers, or claim performance."
            )
        ],
        **safety_flags,
    }
    if bundle_index.warnings:
        payload["warnings"].append(
            "Source bundle index contains warnings that reviewers should inspect."
        )
    ResearchReviewQueue.from_payload(payload)
    return payload


def review_item_from_bundle(bundle: dict[str, Any]) -> dict[str, Any]:
    return {
        "bundle_id": str(bundle.get("bundle_id") or ""),
        "manifest_id": str(bundle.get("manifest_id") or ""),
        "data_version": str(bundle.get("data_version") or ""),
        "strategy_id": str(bundle.get("strategy_id") or ""),
        "strategy_version": str(bundle.get("strategy_version") or ""),
        "parameter_set_ids": sorted(
            str(item) for item in bundle.get("parameter_set_ids", [])
        ),
        "artifact_count": int(bundle.get("artifact_count") or 0),
        "bundle_checksum": str(bundle.get("bundle_checksum") or ""),
        "review_status": "pending_review",
        "review_reason": (
            "Pending human review. This queue item is not a live-trading approval, "
            "strategy ranking, recommendation, or performance report."
        ),
    }


def is_sha256_digest(value: str) -> bool:
    return len(value) == 64 and all(char in "0123456789abcdef" for char in value)


def sha256_json(payload: dict[str, Any]) -> str:
    encoded = json.dumps(payload, sort_keys=True, separators=(",", ":")).encode("utf-8")
    return hashlib.sha256(encoded).hexdigest()


def slugify(value: str) -> str:
    cleaned = "".join(char.lower() if char.isalnum() else "-" for char in value)
    return "-".join(part for part in cleaned.split("-") if part) or "review-queue"
