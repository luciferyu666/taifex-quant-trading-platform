from __future__ import annotations

import hashlib
import json
from datetime import UTC, datetime
from typing import Any, Literal

from pydantic import BaseModel, Field, field_validator

from app.domain.backtest_research_bundle_index import (
    BacktestResearchBundleIndexPreviewResponse,
)


class ResearchReviewItem(BaseModel):
    bundle_id: str
    manifest_id: str
    data_version: str
    strategy_id: str
    strategy_version: str
    parameter_set_ids: list[str]
    artifact_count: int
    bundle_checksum: str
    review_status: Literal["pending_review"] = "pending_review"
    review_reason: str = (
        "Pending human review. This queue item is not a live-trading approval, "
        "strategy ranking, recommendation, or performance report."
    )


class ResearchReviewQueuePreviewRequest(BaseModel):
    bundle_index: BacktestResearchBundleIndexPreviewResponse
    review_queue_label: str = Field(min_length=1)
    research_only: bool = True

    @field_validator("research_only")
    @classmethod
    def require_research_only(cls, value: bool) -> bool:
        if value is not True:
            raise ValueError("research review queue must remain research_only=true")
        return value


class ResearchReviewQueuePreviewResponse(BaseModel):
    review_queue_id: str
    review_queue_label: str
    bundle_count: int
    review_items: list[ResearchReviewItem]
    generated_at: datetime = Field(default_factory=lambda: datetime.now(UTC))
    queue_checksum: str
    reproducibility_hash: str
    warnings: list[str] = Field(default_factory=list)
    research_only: bool = True
    execution_eligible: bool = False
    order_created: bool = False
    broker_api_called: bool = False
    risk_engine_called: bool = False
    oms_called: bool = False
    performance_claim: bool = False
    simulated_metrics_only: bool = True
    external_data_downloaded: bool = False
    ranking_generated: bool = False
    best_strategy_selected: bool = False
    approval_for_live: bool = False
    persisted: bool = False


def preview_research_review_queue(
    request: ResearchReviewQueuePreviewRequest,
) -> ResearchReviewQueuePreviewResponse:
    validate_bundle_index_for_review(request.bundle_index)
    review_items = sorted(
        [review_item_from_bundle(bundle) for bundle in request.bundle_index.bundles],
        key=lambda item: (item.bundle_id, item.bundle_checksum),
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
        "review_queue_label": request.review_queue_label,
        "bundle_index_id": request.bundle_index.bundle_index_id,
        "review_items": [item.model_dump() for item in review_items],
        "safety_flags": safety_flags,
    }
    queue_checksum = sha256_json(queue_core)
    reproducibility_hash = sha256_json(
        {
            **queue_core,
            "queue_checksum": queue_checksum,
            "bundle_index_checksum": request.bundle_index.index_checksum,
        }
    )
    warnings = [
        (
            "Research review queue is dry-run local metadata only. It does not "
            "approve live trading, rank strategies, select winners, write databases, "
            "call brokers, or claim performance."
        )
    ]
    if request.bundle_index.warnings:
        warnings.append(
            "Source bundle index contains warnings that reviewers should inspect."
        )
    return ResearchReviewQueuePreviewResponse(
        review_queue_id=(
            f"research-review-queue-{slugify(request.review_queue_label)}-"
            f"{queue_checksum[:12]}"
        ),
        review_queue_label=request.review_queue_label,
        bundle_count=len(review_items),
        review_items=review_items,
        queue_checksum=queue_checksum,
        reproducibility_hash=reproducibility_hash,
        warnings=warnings,
        **safety_flags,
    )


def validate_bundle_index_for_review(
    bundle_index: BacktestResearchBundleIndexPreviewResponse,
) -> None:
    if bundle_index.research_only is not True:
        raise ValueError("research bundle index must be research_only=true")
    if bundle_index.execution_eligible is not False:
        raise ValueError("research bundle index must be execution_eligible=false")
    if bundle_index.order_created:
        raise ValueError("research bundle index must not create orders")
    if bundle_index.broker_api_called:
        raise ValueError("research bundle index must not call broker APIs")
    if bundle_index.risk_engine_called:
        raise ValueError("research bundle index must not call Risk Engine")
    if bundle_index.oms_called:
        raise ValueError("research bundle index must not call OMS")
    if bundle_index.performance_claim:
        raise ValueError("research bundle index must not make performance claims")
    if bundle_index.simulated_metrics_only is not True:
        raise ValueError("research bundle index must be simulated_metrics_only=true")
    if bundle_index.external_data_downloaded:
        raise ValueError("research bundle index must not download external data")
    if bundle_index.ranking_generated:
        raise ValueError("research bundle index must not generate rankings")
    if bundle_index.best_strategy_selected:
        raise ValueError("research bundle index must not select best strategy")
    if bundle_index.persisted:
        raise ValueError("research bundle index preview must not be persisted")
    if not is_sha256_digest(bundle_index.index_checksum):
        raise ValueError("bundle index checksum must be a SHA-256 digest")
    if not is_sha256_digest(bundle_index.reproducibility_hash):
        raise ValueError("bundle index reproducibility_hash must be a SHA-256 digest")
    for bundle in bundle_index.bundles:
        if not is_sha256_digest(bundle.bundle_checksum):
            raise ValueError("bundle checksum must be a SHA-256 digest")


def review_item_from_bundle(bundle: Any) -> ResearchReviewItem:
    return ResearchReviewItem(
        bundle_id=bundle.bundle_id,
        manifest_id=bundle.manifest_id,
        data_version=bundle.data_version,
        strategy_id=bundle.strategy_id,
        strategy_version=bundle.strategy_version,
        parameter_set_ids=sorted(bundle.parameter_set_ids),
        artifact_count=bundle.artifact_count,
        bundle_checksum=bundle.bundle_checksum,
    )


def is_sha256_digest(value: str) -> bool:
    return len(value) == 64 and all(char in "0123456789abcdef" for char in value)


def sha256_json(payload: dict[str, Any]) -> str:
    encoded = json.dumps(payload, sort_keys=True, separators=(",", ":")).encode("utf-8")
    return hashlib.sha256(encoded).hexdigest()


def slugify(value: str) -> str:
    cleaned = "".join(char.lower() if char.isalnum() else "-" for char in value)
    return "-".join(part for part in cleaned.split("-") if part) or "review-queue"
