from __future__ import annotations

import hashlib
import json
from dataclasses import dataclass
from datetime import UTC, datetime
from typing import Any

from .research_review_queue import ResearchReviewQueue, ResearchReviewQueueError

ALLOWED_DECISIONS = {
    "rejected",
    "needs_data_review",
    "approved_for_paper_research",
}


class ResearchReviewDecisionError(ValueError):
    pass


@dataclass(frozen=True)
class ResearchReviewDecision:
    decision_id: str
    review_queue_id: str
    bundle_id: str
    decision: str
    reviewer_id: str
    decision_reason: str
    decided_at: str
    decision_checksum: str
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
    approval_for_paper_execution: bool
    persisted: bool
    warnings: tuple[str, ...] = ()

    @classmethod
    def from_payload(cls, payload: dict[str, Any]) -> ResearchReviewDecision:
        if not isinstance(payload, dict):
            raise ResearchReviewDecisionError(
                "research review decision payload must be an object"
            )
        record = cls(
            decision_id=str(payload.get("decision_id") or ""),
            review_queue_id=str(payload.get("review_queue_id") or ""),
            bundle_id=str(payload.get("bundle_id") or ""),
            decision=str(payload.get("decision") or ""),
            reviewer_id=str(payload.get("reviewer_id") or ""),
            decision_reason=str(payload.get("decision_reason") or ""),
            decided_at=str(payload.get("decided_at") or ""),
            decision_checksum=str(payload.get("decision_checksum") or ""),
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
            approval_for_paper_execution=bool(
                payload.get("approval_for_paper_execution")
            ),
            persisted=bool(payload.get("persisted")),
            warnings=tuple(str(item) for item in payload.get("warnings", [])),
        )
        record.validate_safe_decision()
        return record

    def validate_safe_decision(self) -> None:
        if not self.decision_id:
            raise ResearchReviewDecisionError("decision_id is required")
        if not self.review_queue_id:
            raise ResearchReviewDecisionError("review_queue_id is required")
        if not self.bundle_id:
            raise ResearchReviewDecisionError("bundle_id is required")
        if self.decision not in ALLOWED_DECISIONS:
            raise ResearchReviewDecisionError("decision value is not allowed")
        if not self.reviewer_id:
            raise ResearchReviewDecisionError("reviewer_id is required")
        if not self.decision_reason:
            raise ResearchReviewDecisionError("decision_reason is required")
        if not self.decided_at:
            raise ResearchReviewDecisionError("decided_at is required")
        if not is_sha256_digest(self.decision_checksum):
            raise ResearchReviewDecisionError(
                "decision_checksum must be a SHA-256 digest"
            )
        if not is_sha256_digest(self.reproducibility_hash):
            raise ResearchReviewDecisionError(
                "reproducibility_hash must be a SHA-256 digest"
            )
        if self.research_only is not True:
            raise ResearchReviewDecisionError(
                "research review decision must be research_only=true"
            )
        if self.execution_eligible is not False:
            raise ResearchReviewDecisionError(
                "research review decision must be execution_eligible=false"
            )
        if self.order_created:
            raise ResearchReviewDecisionError(
                "research review decision must not create orders"
            )
        if self.broker_api_called:
            raise ResearchReviewDecisionError(
                "research review decision must not call broker APIs"
            )
        if self.risk_engine_called:
            raise ResearchReviewDecisionError(
                "research review decision must not call Risk Engine"
            )
        if self.oms_called:
            raise ResearchReviewDecisionError(
                "research review decision must not call OMS"
            )
        if self.performance_claim:
            raise ResearchReviewDecisionError(
                "research review decision must not make performance claims"
            )
        if self.simulated_metrics_only is not True:
            raise ResearchReviewDecisionError(
                "research review decision must be simulated_metrics_only=true"
            )
        if self.external_data_downloaded:
            raise ResearchReviewDecisionError(
                "research review decision must not download external data"
            )
        if self.ranking_generated:
            raise ResearchReviewDecisionError(
                "research review decision must not generate rankings"
            )
        if self.best_strategy_selected:
            raise ResearchReviewDecisionError(
                "research review decision must not select best strategy"
            )
        if self.approval_for_live:
            raise ResearchReviewDecisionError(
                "research review decision must not approve live trading"
            )
        if self.approval_for_paper_execution:
            raise ResearchReviewDecisionError(
                "research review decision must not approve paper execution"
            )
        if self.persisted:
            raise ResearchReviewDecisionError(
                "research review decision preview must not persist by default"
            )


def build_research_review_decision_payload(
    review_queue_payload: dict[str, Any],
    bundle_id: str,
    decision: str,
    reviewer_id: str,
    decision_reason: str,
) -> dict[str, Any]:
    if decision not in ALLOWED_DECISIONS:
        raise ResearchReviewDecisionError("decision value is not allowed")
    try:
        review_queue = ResearchReviewQueue.from_payload(review_queue_payload)
    except ResearchReviewQueueError as exc:
        raise ResearchReviewDecisionError(str(exc)) from exc
    review_item = find_review_item(review_queue, bundle_id)
    decided_at = datetime.now(UTC).isoformat()
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
        "review_queue_id": review_queue.review_queue_id,
        "bundle_id": bundle_id,
        "bundle_checksum": review_item["bundle_checksum"],
        "decision": decision,
        "reviewer_id": reviewer_id,
        "decision_reason": decision_reason,
        "decided_at": decided_at,
        "safety_flags": safety_flags,
    }
    decision_checksum = sha256_json(decision_core)
    reproducibility_hash = sha256_json(
        {
            **decision_core,
            "decision_checksum": decision_checksum,
            "queue_checksum": review_queue.queue_checksum,
        }
    )
    warnings = [
        (
            "SDK research review decision is dry-run local metadata only. It does "
            "not approve live trading, approve paper execution, rank strategies, "
            "write databases, call brokers, or claim performance."
        )
    ]
    if decision == "approved_for_paper_research":
        warnings.append(
            "approved_for_paper_research permits continued research review only. "
            "It is not approval for paper execution, OMS routing, Broker Gateway "
            "submission, or live trading."
        )
    payload = {
        "decision_id": (
            f"research-review-decision-{slugify(decision)}-"
            f"{decision_checksum[:12]}"
        ),
        "review_queue_id": review_queue.review_queue_id,
        "bundle_id": bundle_id,
        "decision": decision,
        "reviewer_id": reviewer_id,
        "decision_reason": decision_reason,
        "decided_at": decided_at,
        "decision_checksum": decision_checksum,
        "reproducibility_hash": reproducibility_hash,
        "warnings": warnings,
        **safety_flags,
    }
    ResearchReviewDecision.from_payload(payload)
    return payload


def find_review_item(review_queue: ResearchReviewQueue, bundle_id: str) -> dict[str, Any]:
    for item in review_queue.review_items:
        if item.get("bundle_id") == bundle_id:
            if item.get("review_status") != "pending_review":
                raise ResearchReviewDecisionError(
                    "review item must be pending_review before decision"
                )
            return item
    raise ResearchReviewDecisionError(f"bundle_id not found in review queue: {bundle_id}")


def is_sha256_digest(value: str) -> bool:
    return len(value) == 64 and all(char in "0123456789abcdef" for char in value)


def sha256_json(payload: dict[str, Any]) -> str:
    encoded = json.dumps(payload, sort_keys=True, separators=(",", ":")).encode("utf-8")
    return hashlib.sha256(encoded).hexdigest()


def slugify(value: str) -> str:
    cleaned = "".join(char.lower() if char.isalnum() else "-" for char in value)
    return "-".join(part for part in cleaned.split("-") if part) or "decision"
