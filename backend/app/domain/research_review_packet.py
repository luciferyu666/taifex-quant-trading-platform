from __future__ import annotations

import hashlib
import json
from datetime import UTC, datetime
from typing import Any

from pydantic import BaseModel, Field, field_validator

from app.domain.research_review_decision import (
    ResearchReviewDecisionPreviewResponse,
)
from app.domain.research_review_decision_index import (
    ResearchReviewDecisionIndexPreviewResponse,
    ResearchReviewDecisionSummary,
)
from app.domain.research_review_queue import ResearchReviewQueuePreviewResponse


class ResearchReviewPacketChecksums(BaseModel):
    queue_checksum: str
    decision_checksums: list[str]
    index_checksum: str
    packet_checksum: str


class ResearchReviewPacketPreviewRequest(BaseModel):
    review_queue: ResearchReviewQueuePreviewResponse
    decisions: list[ResearchReviewDecisionPreviewResponse] = Field(
        min_length=1,
        max_length=1000,
    )
    decision_index: ResearchReviewDecisionIndexPreviewResponse
    packet_label: str = Field(min_length=1)
    research_only: bool = True

    @field_validator("research_only")
    @classmethod
    def require_research_only(cls, value: bool) -> bool:
        if value is not True:
            raise ValueError("research review packet must remain research_only=true")
        return value


class ResearchReviewPacketPreviewResponse(BaseModel):
    packet_id: str
    packet_label: str
    review_queue_id: str
    decision_index_id: str
    bundle_count: int
    decision_count: int
    decision_summary: ResearchReviewDecisionSummary
    included_sections: list[str]
    checksums: ResearchReviewPacketChecksums
    generated_at: datetime = Field(default_factory=lambda: datetime.now(UTC))
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


def preview_research_review_packet(
    request: ResearchReviewPacketPreviewRequest,
) -> ResearchReviewPacketPreviewResponse:
    validate_review_queue_for_packet(request.review_queue)
    for decision in request.decisions:
        validate_decision_for_packet(decision)
    validate_decision_index_for_packet(request.decision_index)
    validate_packet_consistency(
        review_queue=request.review_queue,
        decisions=request.decisions,
        decision_index=request.decision_index,
    )

    decision_checksums = sorted(decision.decision_checksum for decision in request.decisions)
    included_sections = ["review_queue", "decisions", "decision_index"]
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
    packet_core = {
        "packet_label": request.packet_label,
        "review_queue_id": request.review_queue.review_queue_id,
        "decision_index_id": request.decision_index.decision_index_id,
        "bundle_count": request.review_queue.bundle_count,
        "decision_count": len(request.decisions),
        "decision_summary": request.decision_index.decision_summary.model_dump(),
        "included_sections": included_sections,
        "queue_checksum": request.review_queue.queue_checksum,
        "decision_checksums": decision_checksums,
        "index_checksum": request.decision_index.index_checksum,
        "safety_flags": safety_flags,
    }
    packet_checksum = sha256_json(packet_core)
    reproducibility_hash = sha256_json(
        {
            **packet_core,
            "packet_checksum": packet_checksum,
            "queue_reproducibility_hash": request.review_queue.reproducibility_hash,
            "decision_reproducibility_hashes": sorted(
                decision.reproducibility_hash for decision in request.decisions
            ),
            "decision_index_reproducibility_hash": (
                request.decision_index.reproducibility_hash
            ),
        }
    )
    warnings = [
        (
            "Research review packet is dry-run local metadata only. It packages "
            "review queue, decision, and decision index context for future UI, audit, "
            "and reviewer handoff. It does not approve paper execution, approve live "
            "trading, rank strategies, write databases, call brokers, or claim "
            "performance."
        )
    ]
    if request.decision_index.decision_summary.approved_for_paper_research_count > 0:
        warnings.append(
            "approved_for_paper_research decisions permit continued research review "
            "only. They are not approval for paper execution, OMS routing, Broker "
            "Gateway submission, or live trading."
        )
    if any(decision.warnings for decision in request.decisions):
        warnings.append(
            "Source review decisions contain warnings that reviewers should inspect."
        )

    return ResearchReviewPacketPreviewResponse(
        packet_id=(
            f"research-review-packet-{slugify(request.packet_label)}-"
            f"{packet_checksum[:12]}"
        ),
        packet_label=request.packet_label,
        review_queue_id=request.review_queue.review_queue_id,
        decision_index_id=request.decision_index.decision_index_id,
        bundle_count=request.review_queue.bundle_count,
        decision_count=len(request.decisions),
        decision_summary=request.decision_index.decision_summary,
        included_sections=included_sections,
        checksums=ResearchReviewPacketChecksums(
            queue_checksum=request.review_queue.queue_checksum,
            decision_checksums=decision_checksums,
            index_checksum=request.decision_index.index_checksum,
            packet_checksum=packet_checksum,
        ),
        reproducibility_hash=reproducibility_hash,
        warnings=warnings,
        **safety_flags,
    )


def sample_research_review_packet() -> ResearchReviewPacketPreviewResponse:
    decision_summary = ResearchReviewDecisionSummary(
        rejected_count=1,
        needs_data_review_count=1,
        approved_for_paper_research_count=1,
    )
    decision_checksums = [
        sha256_json({"sample_decision": "rejected"}),
        sha256_json({"sample_decision": "needs_data_review"}),
        sha256_json({"sample_decision": "approved_for_paper_research"}),
    ]
    queue_checksum = sha256_json({"sample": "research_review_queue"})
    index_checksum = sha256_json(
        {
            "sample": "research_review_decision_index",
            "decision_summary": decision_summary.model_dump(),
            "decision_checksums": decision_checksums,
        }
    )
    included_sections = ["review_queue", "decisions", "decision_index"]
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
    packet_core = {
        "packet_label": "sample-research-review-packet",
        "review_queue_id": "sample-research-review-queue",
        "decision_index_id": "sample-research-review-decision-index",
        "bundle_count": 1,
        "decision_count": len(decision_checksums),
        "decision_summary": decision_summary.model_dump(),
        "included_sections": included_sections,
        "queue_checksum": queue_checksum,
        "decision_checksums": sorted(decision_checksums),
        "index_checksum": index_checksum,
        "safety_flags": safety_flags,
    }
    packet_checksum = sha256_json(packet_core)
    return ResearchReviewPacketPreviewResponse(
        packet_id=f"research-review-packet-sample-{packet_checksum[:12]}",
        packet_label="sample-research-review-packet",
        review_queue_id="sample-research-review-queue",
        decision_index_id="sample-research-review-decision-index",
        bundle_count=1,
        decision_count=len(decision_checksums),
        decision_summary=decision_summary,
        included_sections=included_sections,
        checksums=ResearchReviewPacketChecksums(
            queue_checksum=queue_checksum,
            decision_checksums=sorted(decision_checksums),
            index_checksum=index_checksum,
            packet_checksum=packet_checksum,
        ),
        reproducibility_hash=sha256_json(
            {
                **packet_core,
                "packet_checksum": packet_checksum,
                "source": "sample_endpoint",
            }
        ),
        warnings=[
            (
                "Sample research review packet is read-only metadata for Web Command "
                "Center development. It does not approve paper execution, approve "
                "live trading, rank strategies, call brokers, or claim performance."
            )
        ],
        **safety_flags,
    )


def validate_review_queue_for_packet(
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
    for item in review_queue.review_items:
        if item.review_status != "pending_review":
            raise ValueError("review queue items must remain pending_review")
        if not is_sha256_digest(item.bundle_checksum):
            raise ValueError("review item bundle_checksum must be a SHA-256 digest")


def validate_decision_for_packet(
    decision: ResearchReviewDecisionPreviewResponse,
) -> None:
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


def validate_decision_index_for_packet(
    decision_index: ResearchReviewDecisionIndexPreviewResponse,
) -> None:
    if decision_index.research_only is not True:
        raise ValueError("research review decision index must be research_only=true")
    if decision_index.execution_eligible is not False:
        raise ValueError("research review decision index must be execution_eligible=false")
    if decision_index.order_created:
        raise ValueError("research review decision index must not create orders")
    if decision_index.broker_api_called:
        raise ValueError("research review decision index must not call broker APIs")
    if decision_index.risk_engine_called:
        raise ValueError("research review decision index must not call Risk Engine")
    if decision_index.oms_called:
        raise ValueError("research review decision index must not call OMS")
    if decision_index.performance_claim:
        raise ValueError("research review decision index must not make performance claims")
    if decision_index.simulated_metrics_only is not True:
        raise ValueError("research review decision index must be simulated_metrics_only=true")
    if decision_index.external_data_downloaded:
        raise ValueError("research review decision index must not download external data")
    if decision_index.ranking_generated:
        raise ValueError("research review decision index must not generate rankings")
    if decision_index.best_strategy_selected:
        raise ValueError("research review decision index must not select best strategy")
    if decision_index.approval_for_live:
        raise ValueError("research review decision index must not approve live trading")
    if decision_index.approval_for_paper_execution:
        raise ValueError(
            "research review decision index must not approve paper execution"
        )
    if decision_index.persisted:
        raise ValueError("research review decision index preview must not be persisted")
    if not is_sha256_digest(decision_index.index_checksum):
        raise ValueError("decision index checksum must be a SHA-256 digest")
    if not is_sha256_digest(decision_index.reproducibility_hash):
        raise ValueError("decision index reproducibility_hash must be a SHA-256 digest")


def validate_packet_consistency(
    review_queue: ResearchReviewQueuePreviewResponse,
    decisions: list[ResearchReviewDecisionPreviewResponse],
    decision_index: ResearchReviewDecisionIndexPreviewResponse,
) -> None:
    if decision_index.decision_count != len(decisions):
        raise ValueError("decision index count must match packet decisions length")
    queue_bundle_ids = {item.bundle_id for item in review_queue.review_items}
    decision_records = {
        (record.decision_id, record.bundle_id, record.decision_checksum)
        for record in decision_index.decisions
    }
    decision_payload_records = {
        (decision.decision_id, decision.bundle_id, decision.decision_checksum)
        for decision in decisions
    }
    if decision_records != decision_payload_records:
        raise ValueError("decision index records must match packet decisions")
    for decision in decisions:
        if decision.review_queue_id != review_queue.review_queue_id:
            raise ValueError("decision review_queue_id must match packet review queue")
        if decision.bundle_id not in queue_bundle_ids:
            raise ValueError("decision bundle_id must exist in packet review queue")
    summary_counts = {
        "rejected_count": 0,
        "needs_data_review_count": 0,
        "approved_for_paper_research_count": 0,
    }
    for decision in decisions:
        if decision.decision == "rejected":
            summary_counts["rejected_count"] += 1
        elif decision.decision == "needs_data_review":
            summary_counts["needs_data_review_count"] += 1
        elif decision.decision == "approved_for_paper_research":
            summary_counts["approved_for_paper_research_count"] += 1
        else:
            raise ValueError("decision value is not allowed")
    if decision_index.decision_summary.model_dump() != summary_counts:
        raise ValueError("decision index summary must match packet decisions")


def is_sha256_digest(value: str) -> bool:
    return len(value) == 64 and all(char in "0123456789abcdef" for char in value)


def sha256_json(payload: dict[str, Any]) -> str:
    encoded = json.dumps(payload, sort_keys=True, separators=(",", ":")).encode("utf-8")
    return hashlib.sha256(encoded).hexdigest()


def slugify(value: str) -> str:
    cleaned = "".join(char.lower() if char.isalnum() else "-" for char in value)
    return "-".join(part for part in cleaned.split("-") if part) or "review-packet"
