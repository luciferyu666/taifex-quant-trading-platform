from __future__ import annotations

import hashlib
import json
from collections import Counter
from datetime import UTC, datetime
from typing import Any

from pydantic import BaseModel, Field, field_validator

from app.domain.research_review_decision import ResearchReviewDecisionPreviewResponse


class ResearchReviewDecisionSummary(BaseModel):
    rejected_count: int
    needs_data_review_count: int
    approved_for_paper_research_count: int


class ResearchReviewDecisionRecord(BaseModel):
    decision_id: str
    review_queue_id: str
    bundle_id: str
    decision: str
    reviewer_id: str
    decision_checksum: str


class ResearchReviewDecisionIndexPreviewRequest(BaseModel):
    decisions: list[ResearchReviewDecisionPreviewResponse] = Field(
        min_length=1,
        max_length=1000,
    )
    decision_index_label: str = Field(min_length=1)
    research_only: bool = True

    @field_validator("research_only")
    @classmethod
    def require_research_only(cls, value: bool) -> bool:
        if value is not True:
            raise ValueError("research review decision index must remain research_only=true")
        return value


class ResearchReviewDecisionIndexPreviewResponse(BaseModel):
    decision_index_id: str
    decision_index_label: str
    decision_count: int
    decision_summary: ResearchReviewDecisionSummary
    decisions: list[ResearchReviewDecisionRecord]
    generated_at: datetime = Field(default_factory=lambda: datetime.now(UTC))
    index_checksum: str
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


def preview_research_review_decision_index(
    request: ResearchReviewDecisionIndexPreviewRequest,
) -> ResearchReviewDecisionIndexPreviewResponse:
    for decision in request.decisions:
        validate_decision_for_index(decision)
    decision_records = sorted(
        [decision_record(item) for item in request.decisions],
        key=lambda item: (item.review_queue_id, item.bundle_id, item.decision_id),
    )
    summary = summarize_decisions(decision_records)
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
    index_core = {
        "decision_index_label": request.decision_index_label,
        "decision_summary": summary.model_dump(),
        "decisions": [record.model_dump() for record in decision_records],
        "safety_flags": safety_flags,
    }
    index_checksum = sha256_json(index_core)
    reproducibility_hash = sha256_json(
        {
            **index_core,
            "index_checksum": index_checksum,
        }
    )
    warnings = [
        (
            "Research review decision index is dry-run local metadata only. It "
            "summarizes review decisions but does not rank strategies, select best "
            "results, approve paper execution, approve live trading, write "
            "databases, call brokers, or claim performance."
        )
    ]
    duplicate_checksums = duplicate_decision_checksums(decision_records)
    if duplicate_checksums:
        warnings.append(
            "Duplicate research review decision checksums detected: "
            + ", ".join(duplicate_checksums)
            + ". Duplicates are allowed for local cataloging but should be reviewed."
        )
    return ResearchReviewDecisionIndexPreviewResponse(
        decision_index_id=(
            f"research-review-decision-index-{slugify(request.decision_index_label)}-"
            f"{index_checksum[:12]}"
        ),
        decision_index_label=request.decision_index_label,
        decision_count=len(decision_records),
        decision_summary=summary,
        decisions=decision_records,
        index_checksum=index_checksum,
        reproducibility_hash=reproducibility_hash,
        warnings=warnings,
        **safety_flags,
    )


def validate_decision_for_index(decision: ResearchReviewDecisionPreviewResponse) -> None:
    if decision.research_only is not True:
        raise ValueError("research review decision must be research_only=true")
    if decision.execution_eligible is not False:
        raise ValueError("research review decision must be execution_eligible=false")
    if decision.order_created:
        raise ValueError("research review decision must not create orders")
    if decision.broker_api_called:
        raise ValueError("research review decision must not call broker APIs")
    if decision.risk_engine_called:
        raise ValueError("research review decision must not call Risk Engine")
    if decision.oms_called:
        raise ValueError("research review decision must not call OMS")
    if decision.performance_claim:
        raise ValueError("research review decision must not make performance claims")
    if decision.simulated_metrics_only is not True:
        raise ValueError("research review decision must be simulated_metrics_only=true")
    if decision.external_data_downloaded:
        raise ValueError("research review decision must not download external data")
    if decision.ranking_generated:
        raise ValueError("research review decision must not generate rankings")
    if decision.best_strategy_selected:
        raise ValueError("research review decision must not select best strategy")
    if decision.approval_for_live:
        raise ValueError("research review decision must not approve live trading")
    if decision.approval_for_paper_execution:
        raise ValueError("research review decision must not approve paper execution")
    if decision.persisted:
        raise ValueError("research review decision preview must not be persisted")
    if not is_sha256_digest(decision.decision_checksum):
        raise ValueError("decision checksum must be a SHA-256 digest")
    if not is_sha256_digest(decision.reproducibility_hash):
        raise ValueError("decision reproducibility_hash must be a SHA-256 digest")


def decision_record(
    decision: ResearchReviewDecisionPreviewResponse,
) -> ResearchReviewDecisionRecord:
    return ResearchReviewDecisionRecord(
        decision_id=decision.decision_id,
        review_queue_id=decision.review_queue_id,
        bundle_id=decision.bundle_id,
        decision=decision.decision,
        reviewer_id=decision.reviewer_id,
        decision_checksum=decision.decision_checksum,
    )


def summarize_decisions(
    decisions: list[ResearchReviewDecisionRecord],
) -> ResearchReviewDecisionSummary:
    counts = Counter(record.decision for record in decisions)
    return ResearchReviewDecisionSummary(
        rejected_count=counts["rejected"],
        needs_data_review_count=counts["needs_data_review"],
        approved_for_paper_research_count=counts["approved_for_paper_research"],
    )


def duplicate_decision_checksums(
    decisions: list[ResearchReviewDecisionRecord],
) -> list[str]:
    counts = Counter(record.decision_checksum for record in decisions)
    return sorted(checksum for checksum, count in counts.items() if count > 1)


def is_sha256_digest(value: str) -> bool:
    return len(value) == 64 and all(char in "0123456789abcdef" for char in value)


def sha256_json(payload: dict[str, Any]) -> str:
    encoded = json.dumps(payload, sort_keys=True, separators=(",", ":")).encode("utf-8")
    return hashlib.sha256(encoded).hexdigest()


def slugify(value: str) -> str:
    cleaned = "".join(char.lower() if char.isalnum() else "-" for char in value)
    return "-".join(part for part in cleaned.split("-") if part) or "decision-index"
