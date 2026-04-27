from __future__ import annotations

import hashlib
import json
from datetime import UTC, datetime
from typing import Any, Literal

from pydantic import BaseModel, Field, field_validator

from app.domain.research_review_queue import ResearchReviewQueuePreviewResponse

ResearchReviewDecisionValue = Literal[
    "rejected",
    "needs_data_review",
    "approved_for_paper_research",
]


class ResearchReviewDecisionPreviewRequest(BaseModel):
    review_queue: ResearchReviewQueuePreviewResponse
    bundle_id: str = Field(min_length=1)
    decision: ResearchReviewDecisionValue
    reviewer_id: str = Field(default="local-reviewer", min_length=1)
    decision_reason: str = Field(min_length=1)
    research_only: bool = True

    @field_validator("research_only")
    @classmethod
    def require_research_only(cls, value: bool) -> bool:
        if value is not True:
            raise ValueError("research review decision must remain research_only=true")
        return value


class ResearchReviewDecisionPreviewResponse(BaseModel):
    decision_id: str
    review_queue_id: str
    bundle_id: str
    decision: ResearchReviewDecisionValue
    reviewer_id: str
    decision_reason: str
    decided_at: datetime
    decision_checksum: str
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
    approval_for_paper_execution: bool = False
    persisted: bool = False


def preview_research_review_decision(
    request: ResearchReviewDecisionPreviewRequest,
) -> ResearchReviewDecisionPreviewResponse:
    validate_review_queue_for_decision(request.review_queue)
    review_item = find_review_item(request.review_queue, request.bundle_id)
    decided_at = datetime.now(UTC)
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
        "approval_for_paper_execution": False,
        "persisted": False,
    }
    decision_core = {
        "review_queue_id": request.review_queue.review_queue_id,
        "bundle_id": request.bundle_id,
        "bundle_checksum": review_item.bundle_checksum,
        "decision": request.decision,
        "reviewer_id": request.reviewer_id,
        "decision_reason": request.decision_reason,
        "decided_at": decided_at.isoformat(),
        "safety_flags": safety_flags,
    }
    decision_checksum = sha256_json(decision_core)
    reproducibility_hash = sha256_json(
        {
            **decision_core,
            "decision_checksum": decision_checksum,
            "queue_checksum": request.review_queue.queue_checksum,
        }
    )
    warnings = [
        (
            "Research review decision is dry-run local metadata only. It does not "
            "approve live trading, approve paper execution, rank strategies, write "
            "databases, call brokers, or claim performance."
        )
    ]
    if request.decision == "approved_for_paper_research":
        warnings.append(
            "approved_for_paper_research permits continued research review only. "
            "It is not approval for paper execution, OMS routing, Broker Gateway "
            "submission, or live trading."
        )
    return ResearchReviewDecisionPreviewResponse(
        decision_id=(
            f"research-review-decision-{slugify(request.decision)}-"
            f"{decision_checksum[:12]}"
        ),
        review_queue_id=request.review_queue.review_queue_id,
        bundle_id=request.bundle_id,
        decision=request.decision,
        reviewer_id=request.reviewer_id,
        decision_reason=request.decision_reason,
        decided_at=decided_at,
        decision_checksum=decision_checksum,
        reproducibility_hash=reproducibility_hash,
        warnings=warnings,
        **safety_flags,
    )


def validate_review_queue_for_decision(
    review_queue: ResearchReviewQueuePreviewResponse,
) -> None:
    if review_queue.research_only is not True:
        raise ValueError("research review queue must be research_only=true")
    if review_queue.execution_eligible is not False:
        raise ValueError("research review queue must be execution_eligible=false")
    if review_queue.order_created:
        raise ValueError("research review queue must not create orders")
    if review_queue.broker_api_called:
        raise ValueError("research review queue must not call broker APIs")
    if review_queue.risk_engine_called:
        raise ValueError("research review queue must not call Risk Engine")
    if review_queue.oms_called:
        raise ValueError("research review queue must not call OMS")
    if review_queue.performance_claim:
        raise ValueError("research review queue must not make performance claims")
    if review_queue.simulated_metrics_only is not True:
        raise ValueError("research review queue must be simulated_metrics_only=true")
    if review_queue.external_data_downloaded:
        raise ValueError("research review queue must not download external data")
    if review_queue.ranking_generated:
        raise ValueError("research review queue must not generate rankings")
    if review_queue.best_strategy_selected:
        raise ValueError("research review queue must not select best strategy")
    if review_queue.approval_for_live:
        raise ValueError("research review queue must not approve live trading")
    if review_queue.persisted:
        raise ValueError("research review queue preview must not be persisted")
    if not is_sha256_digest(review_queue.queue_checksum):
        raise ValueError("review queue checksum must be a SHA-256 digest")
    if not is_sha256_digest(review_queue.reproducibility_hash):
        raise ValueError("review queue reproducibility_hash must be a SHA-256 digest")


def find_review_item(review_queue: ResearchReviewQueuePreviewResponse, bundle_id: str) -> Any:
    for item in review_queue.review_items:
        if item.bundle_id == bundle_id:
            if item.review_status != "pending_review":
                raise ValueError("review item must be pending_review before decision")
            return item
    raise ValueError(f"bundle_id not found in review queue: {bundle_id}")


def is_sha256_digest(value: str) -> bool:
    return len(value) == 64 and all(char in "0123456789abcdef" for char in value)


def sha256_json(payload: dict[str, Any]) -> str:
    encoded = json.dumps(payload, sort_keys=True, separators=(",", ":")).encode("utf-8")
    return hashlib.sha256(encoded).hexdigest()


def slugify(value: str) -> str:
    cleaned = "".join(char.lower() if char.isalnum() else "-" for char in value)
    return "-".join(part for part in cleaned.split("-") if part) or "decision"
