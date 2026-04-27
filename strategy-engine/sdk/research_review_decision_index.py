from __future__ import annotations

import hashlib
import json
from collections import Counter
from dataclasses import dataclass
from typing import Any

from .research_review_decision import (
    ResearchReviewDecision,
    ResearchReviewDecisionError,
)


class ResearchReviewDecisionIndexError(ValueError):
    pass


@dataclass(frozen=True)
class ResearchReviewDecisionIndex:
    decision_index_id: str
    decision_index_label: str
    decision_count: int
    decision_summary: dict[str, int]
    decisions: tuple[dict[str, Any], ...]
    index_checksum: str
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
    def from_payload(cls, payload: dict[str, Any]) -> ResearchReviewDecisionIndex:
        if not isinstance(payload, dict):
            raise ResearchReviewDecisionIndexError(
                "research review decision index payload must be an object"
            )
        decisions = payload.get("decisions") or []
        if not isinstance(decisions, list):
            raise ResearchReviewDecisionIndexError("decisions must be a list")
        record = cls(
            decision_index_id=str(payload.get("decision_index_id") or ""),
            decision_index_label=str(payload.get("decision_index_label") or ""),
            decision_count=int(payload.get("decision_count") or 0),
            decision_summary=dict(payload.get("decision_summary") or {}),
            decisions=tuple(dict(item) for item in decisions),
            index_checksum=str(payload.get("index_checksum") or ""),
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
        record.validate_safe_index()
        return record

    def validate_safe_index(self) -> None:
        if not self.decision_index_id:
            raise ResearchReviewDecisionIndexError("decision_index_id is required")
        if not self.decision_index_label:
            raise ResearchReviewDecisionIndexError("decision_index_label is required")
        if self.decision_count != len(self.decisions):
            raise ResearchReviewDecisionIndexError(
                "decision_count must match decisions length"
            )
        if self.decision_count < 1:
            raise ResearchReviewDecisionIndexError("decision_count must be positive")
        required_summary_keys = {
            "rejected_count",
            "needs_data_review_count",
            "approved_for_paper_research_count",
        }
        if set(self.decision_summary) != required_summary_keys:
            raise ResearchReviewDecisionIndexError(
                "decision_summary must contain all required counts"
            )
        summary_total = sum(int(value) for value in self.decision_summary.values())
        if summary_total != self.decision_count:
            raise ResearchReviewDecisionIndexError(
                "decision_summary counts must equal decision_count"
            )
        if not is_sha256_digest(self.index_checksum):
            raise ResearchReviewDecisionIndexError(
                "index_checksum must be a SHA-256 digest"
            )
        if not is_sha256_digest(self.reproducibility_hash):
            raise ResearchReviewDecisionIndexError(
                "reproducibility_hash must be a SHA-256 digest"
            )
        if self.research_only is not True:
            raise ResearchReviewDecisionIndexError(
                "research review decision index must be research_only=true"
            )
        if self.execution_eligible is not False:
            raise ResearchReviewDecisionIndexError(
                "research review decision index must be execution_eligible=false"
            )
        if self.order_created:
            raise ResearchReviewDecisionIndexError(
                "research review decision index must not create orders"
            )
        if self.broker_api_called:
            raise ResearchReviewDecisionIndexError(
                "research review decision index must not call broker APIs"
            )
        if self.risk_engine_called:
            raise ResearchReviewDecisionIndexError(
                "research review decision index must not call Risk Engine"
            )
        if self.oms_called:
            raise ResearchReviewDecisionIndexError(
                "research review decision index must not call OMS"
            )
        if self.performance_claim:
            raise ResearchReviewDecisionIndexError(
                "research review decision index must not make performance claims"
            )
        if self.simulated_metrics_only is not True:
            raise ResearchReviewDecisionIndexError(
                "research review decision index must be simulated_metrics_only=true"
            )
        if self.external_data_downloaded:
            raise ResearchReviewDecisionIndexError(
                "research review decision index must not download external data"
            )
        if self.ranking_generated:
            raise ResearchReviewDecisionIndexError(
                "research review decision index must not generate rankings"
            )
        if self.best_strategy_selected:
            raise ResearchReviewDecisionIndexError(
                "research review decision index must not select best strategy"
            )
        if self.approval_for_live:
            raise ResearchReviewDecisionIndexError(
                "research review decision index must not approve live trading"
            )
        if self.approval_for_paper_execution:
            raise ResearchReviewDecisionIndexError(
                "research review decision index must not approve paper execution"
            )
        if self.persisted:
            raise ResearchReviewDecisionIndexError(
                "research review decision index preview must not persist by default"
            )
        invalid = [
            str(item.get("decision_id") or "")
            for item in self.decisions
            if not is_sha256_digest(str(item.get("decision_checksum") or ""))
        ]
        if invalid:
            raise ResearchReviewDecisionIndexError(
                "decision records contain invalid decision checksums: "
                + ", ".join(invalid)
            )


def build_research_review_decision_index_payload(
    decision_payloads: list[dict[str, Any]],
    decision_index_label: str,
) -> dict[str, Any]:
    decisions: list[ResearchReviewDecision] = []
    for payload in decision_payloads:
        try:
            decisions.append(ResearchReviewDecision.from_payload(payload))
        except ResearchReviewDecisionError as exc:
            raise ResearchReviewDecisionIndexError(str(exc)) from exc
    records = sorted(
        [decision_record(decision) for decision in decisions],
        key=lambda item: (item["review_queue_id"], item["bundle_id"], item["decision_id"]),
    )
    summary = summarize_decisions(records)
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
        "decision_index_label": decision_index_label,
        "decision_summary": summary,
        "decisions": records,
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
            "SDK research review decision index is dry-run local metadata only. It "
            "summarizes review decisions but does not rank strategies, select best "
            "results, approve paper execution, approve live trading, write "
            "databases, call brokers, or claim performance."
        )
    ]
    duplicate_checksums = duplicate_decision_checksums(records)
    if duplicate_checksums:
        warnings.append(
            "Duplicate research review decision checksums detected: "
            + ", ".join(duplicate_checksums)
            + ". Duplicates are allowed for local cataloging but should be reviewed."
        )
    payload = {
        "decision_index_id": (
            f"research-review-decision-index-{slugify(decision_index_label)}-"
            f"{index_checksum[:12]}"
        ),
        "decision_index_label": decision_index_label,
        "decision_count": len(records),
        "decision_summary": summary,
        "decisions": records,
        "index_checksum": index_checksum,
        "reproducibility_hash": reproducibility_hash,
        "warnings": warnings,
        **safety_flags,
    }
    ResearchReviewDecisionIndex.from_payload(payload)
    return payload


def decision_record(decision: ResearchReviewDecision) -> dict[str, Any]:
    return {
        "decision_id": decision.decision_id,
        "review_queue_id": decision.review_queue_id,
        "bundle_id": decision.bundle_id,
        "decision": decision.decision,
        "reviewer_id": decision.reviewer_id,
        "decision_checksum": decision.decision_checksum,
    }


def summarize_decisions(decisions: list[dict[str, Any]]) -> dict[str, int]:
    counts = Counter(str(record["decision"]) for record in decisions)
    return {
        "rejected_count": counts["rejected"],
        "needs_data_review_count": counts["needs_data_review"],
        "approved_for_paper_research_count": counts["approved_for_paper_research"],
    }


def duplicate_decision_checksums(decisions: list[dict[str, Any]]) -> list[str]:
    counts = Counter(str(record["decision_checksum"]) for record in decisions)
    return sorted(checksum for checksum, count in counts.items() if count > 1)


def is_sha256_digest(value: str) -> bool:
    return len(value) == 64 and all(char in "0123456789abcdef" for char in value)


def sha256_json(payload: dict[str, Any]) -> str:
    encoded = json.dumps(payload, sort_keys=True, separators=(",", ":")).encode("utf-8")
    return hashlib.sha256(encoded).hexdigest()


def slugify(value: str) -> str:
    cleaned = "".join(char.lower() if char.isalnum() else "-" for char in value)
    return "-".join(part for part in cleaned.split("-") if part) or "decision-index"
