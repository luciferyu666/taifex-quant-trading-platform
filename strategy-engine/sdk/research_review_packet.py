from __future__ import annotations

import hashlib
import json
from dataclasses import dataclass
from typing import Any

from .research_review_decision import (
    ResearchReviewDecision,
    ResearchReviewDecisionError,
)
from .research_review_decision_index import (
    ResearchReviewDecisionIndex,
    ResearchReviewDecisionIndexError,
)
from .research_review_queue import ResearchReviewQueue, ResearchReviewQueueError


class ResearchReviewPacketError(ValueError):
    pass


@dataclass(frozen=True)
class ResearchReviewPacket:
    packet_id: str
    packet_label: str
    review_queue_id: str
    decision_index_id: str
    bundle_count: int
    decision_count: int
    decision_summary: dict[str, int]
    included_sections: tuple[str, ...]
    checksums: dict[str, Any]
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
    def from_payload(cls, payload: dict[str, Any]) -> ResearchReviewPacket:
        if not isinstance(payload, dict):
            raise ResearchReviewPacketError(
                "research review packet payload must be an object"
            )
        record = cls(
            packet_id=str(payload.get("packet_id") or ""),
            packet_label=str(payload.get("packet_label") or ""),
            review_queue_id=str(payload.get("review_queue_id") or ""),
            decision_index_id=str(payload.get("decision_index_id") or ""),
            bundle_count=int(payload.get("bundle_count") or 0),
            decision_count=int(payload.get("decision_count") or 0),
            decision_summary=dict(payload.get("decision_summary") or {}),
            included_sections=tuple(
                str(item) for item in payload.get("included_sections", [])
            ),
            checksums=dict(payload.get("checksums") or {}),
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
        record.validate_safe_packet()
        return record

    def validate_safe_packet(self) -> None:
        if not self.packet_id:
            raise ResearchReviewPacketError("packet_id is required")
        if not self.packet_label:
            raise ResearchReviewPacketError("packet_label is required")
        if not self.review_queue_id:
            raise ResearchReviewPacketError("review_queue_id is required")
        if not self.decision_index_id:
            raise ResearchReviewPacketError("decision_index_id is required")
        if self.bundle_count < 1:
            raise ResearchReviewPacketError("bundle_count must be positive")
        if self.decision_count < 1:
            raise ResearchReviewPacketError("decision_count must be positive")
        if self.included_sections != ("review_queue", "decisions", "decision_index"):
            raise ResearchReviewPacketError("included_sections are not allowed")
        required_summary_keys = {
            "rejected_count",
            "needs_data_review_count",
            "approved_for_paper_research_count",
        }
        if set(self.decision_summary) != required_summary_keys:
            raise ResearchReviewPacketError(
                "decision_summary must contain all required counts"
            )
        if sum(int(value) for value in self.decision_summary.values()) != self.decision_count:
            raise ResearchReviewPacketError(
                "decision_summary counts must equal decision_count"
            )
        required_checksum_keys = {
            "queue_checksum",
            "decision_checksums",
            "index_checksum",
            "packet_checksum",
        }
        if set(self.checksums) != required_checksum_keys:
            raise ResearchReviewPacketError("checksums must contain required fields")
        if not is_sha256_digest(str(self.checksums["queue_checksum"])):
            raise ResearchReviewPacketError(
                "queue_checksum must be a SHA-256 digest"
            )
        if not is_sha256_digest(str(self.checksums["index_checksum"])):
            raise ResearchReviewPacketError(
                "index_checksum must be a SHA-256 digest"
            )
        if not is_sha256_digest(str(self.checksums["packet_checksum"])):
            raise ResearchReviewPacketError(
                "packet_checksum must be a SHA-256 digest"
            )
        decision_checksums = self.checksums["decision_checksums"]
        if not isinstance(decision_checksums, list):
            raise ResearchReviewPacketError("decision_checksums must be a list")
        if len(decision_checksums) != self.decision_count:
            raise ResearchReviewPacketError(
                "decision_checksums length must equal decision_count"
            )
        if any(not is_sha256_digest(str(item)) for item in decision_checksums):
            raise ResearchReviewPacketError(
                "decision_checksums must be SHA-256 digests"
            )
        if not is_sha256_digest(self.reproducibility_hash):
            raise ResearchReviewPacketError(
                "reproducibility_hash must be a SHA-256 digest"
            )
        if self.research_only is not True:
            raise ResearchReviewPacketError(
                "research review packet must be research_only=true"
            )
        if self.execution_eligible is not False:
            raise ResearchReviewPacketError(
                "research review packet must be execution_eligible=false"
            )
        if self.order_created:
            raise ResearchReviewPacketError(
                "research review packet must not create orders"
            )
        if self.broker_api_called:
            raise ResearchReviewPacketError(
                "research review packet must not call broker APIs"
            )
        if self.risk_engine_called:
            raise ResearchReviewPacketError(
                "research review packet must not call Risk Engine"
            )
        if self.oms_called:
            raise ResearchReviewPacketError("research review packet must not call OMS")
        if self.performance_claim:
            raise ResearchReviewPacketError(
                "research review packet must not make performance claims"
            )
        if self.simulated_metrics_only is not True:
            raise ResearchReviewPacketError(
                "research review packet must be simulated_metrics_only=true"
            )
        if self.external_data_downloaded:
            raise ResearchReviewPacketError(
                "research review packet must not download external data"
            )
        if self.ranking_generated:
            raise ResearchReviewPacketError(
                "research review packet must not generate rankings"
            )
        if self.best_strategy_selected:
            raise ResearchReviewPacketError(
                "research review packet must not select best strategy"
            )
        if self.approval_for_live:
            raise ResearchReviewPacketError(
                "research review packet must not approve live trading"
            )
        if self.approval_for_paper_execution:
            raise ResearchReviewPacketError(
                "research review packet must not approve paper execution"
            )
        if self.persisted:
            raise ResearchReviewPacketError(
                "research review packet preview must not persist by default"
            )


def build_research_review_packet_payload(
    review_queue_payload: dict[str, Any],
    decision_payloads: list[dict[str, Any]],
    decision_index_payload: dict[str, Any],
    packet_label: str,
) -> dict[str, Any]:
    try:
        review_queue = ResearchReviewQueue.from_payload(review_queue_payload)
    except ResearchReviewQueueError as exc:
        raise ResearchReviewPacketError(str(exc)) from exc
    decisions: list[ResearchReviewDecision] = []
    for payload in decision_payloads:
        try:
            decisions.append(ResearchReviewDecision.from_payload(payload))
        except ResearchReviewDecisionError as exc:
            raise ResearchReviewPacketError(str(exc)) from exc
    try:
        decision_index = ResearchReviewDecisionIndex.from_payload(decision_index_payload)
    except ResearchReviewDecisionIndexError as exc:
        raise ResearchReviewPacketError(str(exc)) from exc
    validate_packet_consistency(review_queue, decisions, decision_index)

    decision_checksums = sorted(decision.decision_checksum for decision in decisions)
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
        "packet_label": packet_label,
        "review_queue_id": review_queue.review_queue_id,
        "decision_index_id": decision_index.decision_index_id,
        "bundle_count": review_queue.bundle_count,
        "decision_count": len(decisions),
        "decision_summary": decision_index.decision_summary,
        "included_sections": included_sections,
        "queue_checksum": review_queue.queue_checksum,
        "decision_checksums": decision_checksums,
        "index_checksum": decision_index.index_checksum,
        "safety_flags": safety_flags,
    }
    packet_checksum = sha256_json(packet_core)
    reproducibility_hash = sha256_json(
        {
            **packet_core,
            "packet_checksum": packet_checksum,
            "queue_reproducibility_hash": review_queue.reproducibility_hash,
            "decision_reproducibility_hashes": sorted(
                decision.reproducibility_hash for decision in decisions
            ),
            "decision_index_reproducibility_hash": (
                decision_index.reproducibility_hash
            ),
        }
    )
    warnings = [
        (
            "SDK research review packet is dry-run local metadata only. It packages "
            "review queue, decisions, and decision index context for future UI, "
            "audit, and reviewer handoff. It does not approve paper execution, "
            "approve live trading, rank strategies, write databases, call brokers, "
            "or claim performance."
        )
    ]
    if decision_index.decision_summary["approved_for_paper_research_count"] > 0:
        warnings.append(
            "approved_for_paper_research decisions permit continued research review "
            "only. They are not approval for paper execution, OMS routing, Broker "
            "Gateway submission, or live trading."
        )

    payload = {
        "packet_id": (
            f"research-review-packet-{slugify(packet_label)}-{packet_checksum[:12]}"
        ),
        "packet_label": packet_label,
        "review_queue_id": review_queue.review_queue_id,
        "decision_index_id": decision_index.decision_index_id,
        "bundle_count": review_queue.bundle_count,
        "decision_count": len(decisions),
        "decision_summary": decision_index.decision_summary,
        "included_sections": included_sections,
        "checksums": {
            "queue_checksum": review_queue.queue_checksum,
            "decision_checksums": decision_checksums,
            "index_checksum": decision_index.index_checksum,
            "packet_checksum": packet_checksum,
        },
        "reproducibility_hash": reproducibility_hash,
        "warnings": warnings,
        **safety_flags,
    }
    ResearchReviewPacket.from_payload(payload)
    return payload


def validate_packet_consistency(
    review_queue: ResearchReviewQueue,
    decisions: list[ResearchReviewDecision],
    decision_index: ResearchReviewDecisionIndex,
) -> None:
    if decision_index.decision_count != len(decisions):
        raise ResearchReviewPacketError(
            "decision index count must match packet decisions length"
        )
    queue_bundle_ids = {
        str(item.get("bundle_id") or "") for item in review_queue.review_items
    }
    index_records = {
        (
            str(record.get("decision_id") or ""),
            str(record.get("bundle_id") or ""),
            str(record.get("decision_checksum") or ""),
        )
        for record in decision_index.decisions
    }
    decision_records = {
        (decision.decision_id, decision.bundle_id, decision.decision_checksum)
        for decision in decisions
    }
    if index_records != decision_records:
        raise ResearchReviewPacketError(
            "decision index records must match packet decisions"
        )
    for decision in decisions:
        if decision.review_queue_id != review_queue.review_queue_id:
            raise ResearchReviewPacketError(
                "decision review_queue_id must match packet review queue"
            )
        if decision.bundle_id not in queue_bundle_ids:
            raise ResearchReviewPacketError(
                "decision bundle_id must exist in packet review queue"
            )
    summary = {
        "rejected_count": 0,
        "needs_data_review_count": 0,
        "approved_for_paper_research_count": 0,
    }
    for decision in decisions:
        if decision.decision == "rejected":
            summary["rejected_count"] += 1
        elif decision.decision == "needs_data_review":
            summary["needs_data_review_count"] += 1
        elif decision.decision == "approved_for_paper_research":
            summary["approved_for_paper_research_count"] += 1
        else:
            raise ResearchReviewPacketError("decision value is not allowed")
    if decision_index.decision_summary != summary:
        raise ResearchReviewPacketError(
            "decision index summary must match packet decisions"
        )


def is_sha256_digest(value: str) -> bool:
    return len(value) == 64 and all(char in "0123456789abcdef" for char in value)


def sha256_json(payload: dict[str, Any]) -> str:
    encoded = json.dumps(payload, sort_keys=True, separators=(",", ":")).encode("utf-8")
    return hashlib.sha256(encoded).hexdigest()


def slugify(value: str) -> str:
    cleaned = "".join(char.lower() if char.isalnum() else "-" for char in value)
    return "-".join(part for part in cleaned.split("-") if part) or "review-packet"
