from __future__ import annotations

import hashlib
import json
from datetime import UTC, datetime
from typing import Any, Literal

from pydantic import BaseModel, Field, field_validator

from app.domain.paper_execution import validate_strategy_signal_for_paper_execution
from app.domain.signals import StrategySignal

PaperApprovalStatus = Literal[
    "pending_review",
    "research_approved",
    "approved_for_paper_simulation",
    "rejected",
    "needs_data_review",
]

PaperApprovalDecision = Literal[
    "research_approved",
    "approved_for_paper_simulation",
    "rejected",
    "needs_data_review",
]

PaperApprovalReviewerRole = Literal[
    "research_reviewer",
    "risk_reviewer",
    "compliance_reviewer",
]


class PaperApprovalRequestCreate(BaseModel):
    signal: StrategySignal
    requested_action: Literal["paper_simulation"] = "paper_simulation"
    requester_id: str = Field(default="local-paper-requester", min_length=1)
    request_reason: str = Field(min_length=1)
    paper_only: bool = True

    @field_validator("paper_only")
    @classmethod
    def require_paper_only(cls, value: bool) -> bool:
        if value is not True:
            raise ValueError("paper approval requests must remain paper_only=true")
        return value


class PaperApprovalDecisionCreate(BaseModel):
    decision: PaperApprovalDecision
    reviewer_id: str = Field(min_length=1)
    reviewer_role: PaperApprovalReviewerRole
    decision_reason: str = Field(min_length=1)
    paper_only: bool = True
    approval_for_live: bool = False

    @field_validator("paper_only")
    @classmethod
    def require_paper_only(cls, value: bool) -> bool:
        if value is not True:
            raise ValueError("paper approval decisions must remain paper_only=true")
        return value

    @field_validator("approval_for_live")
    @classmethod
    def forbid_live_approval(cls, value: bool) -> bool:
        if value is not False:
            raise ValueError("approval_for_live must remain false")
        return value


class PaperApprovalRequestRecord(BaseModel):
    approval_request_id: str
    signal_id: str
    strategy_id: str
    strategy_version: str
    requested_action: Literal["paper_simulation"]
    requester_id: str
    request_reason: str
    created_at: datetime
    status: PaperApprovalStatus = "pending_review"
    required_review_count: int = 2
    required_decision_sequence: list[str] = Field(
        default_factory=lambda: [
            "research_approved",
            "approved_for_paper_simulation",
        ]
    )
    paper_only: bool = True
    approval_for_live: bool = False
    live_execution_eligible: bool = False
    broker_api_called: bool = False
    request_hash: str
    latest_chain_hash: str
    payload: dict[str, Any] = Field(default_factory=dict)


class PaperApprovalDecisionRecord(BaseModel):
    approval_decision_id: str
    approval_request_id: str
    sequence: int
    decision: PaperApprovalDecision
    reviewer_id: str
    reviewer_role: PaperApprovalReviewerRole
    decision_reason: str
    decided_at: datetime
    paper_only: bool = True
    approval_for_live: bool = False
    broker_api_called: bool = False
    previous_chain_hash: str
    decision_hash: str
    payload: dict[str, Any] = Field(default_factory=dict)


class PaperApprovalHistory(BaseModel):
    request: PaperApprovalRequestRecord
    decisions: list[PaperApprovalDecisionRecord] = Field(default_factory=list)
    current_status: PaperApprovalStatus
    pending_second_review: bool
    paper_simulation_approved: bool
    approval_for_live: bool = False
    live_execution_eligible: bool = False
    broker_api_called: bool = False
    immutable_record_policy: str
    message: str


class PaperApprovalStatusResponse(BaseModel):
    trading_mode: str
    live_trading_enabled: bool
    broker_provider: str
    approval_mode: str
    supported_decisions: list[PaperApprovalDecision]
    reviewer_roles: list[PaperApprovalReviewerRole]
    dual_review_required: bool
    immutable_record_policy: str
    broker_api_called: bool = False
    message: str


def build_paper_approval_request_record(
    request: PaperApprovalRequestCreate,
) -> PaperApprovalRequestRecord:
    validate_strategy_signal_for_paper_execution(request.signal)
    created_at = datetime.now(UTC)
    payload = request.model_dump(mode="json")
    request_core = {
        "signal_id": request.signal.signal_id,
        "strategy_id": request.signal.strategy_id,
        "strategy_version": request.signal.strategy_version,
        "requested_action": request.requested_action,
        "requester_id": request.requester_id,
        "request_reason": request.request_reason,
        "created_at": created_at.isoformat(),
        "paper_only": True,
        "approval_for_live": False,
    }
    request_hash = sha256_json(request_core)
    return PaperApprovalRequestRecord(
        approval_request_id=f"paper-approval-request-{request_hash[:16]}",
        signal_id=request.signal.signal_id,
        strategy_id=request.signal.strategy_id,
        strategy_version=request.signal.strategy_version,
        requested_action=request.requested_action,
        requester_id=request.requester_id,
        request_reason=request.request_reason,
        created_at=created_at,
        request_hash=request_hash,
        latest_chain_hash=request_hash,
        payload=payload,
    )


def build_paper_approval_decision_record(
    *,
    approval_request_id: str,
    request_hash: str,
    existing_decisions: list[PaperApprovalDecisionRecord],
    decision: PaperApprovalDecisionCreate,
) -> PaperApprovalDecisionRecord:
    validate_decision_transition(existing_decisions, decision)
    decided_at = datetime.now(UTC)
    sequence = len(existing_decisions) + 1
    previous_chain_hash = (
        existing_decisions[-1].decision_hash if existing_decisions else request_hash
    )
    decision_core = {
        "approval_request_id": approval_request_id,
        "sequence": sequence,
        "decision": decision.decision,
        "reviewer_id": decision.reviewer_id,
        "reviewer_role": decision.reviewer_role,
        "decision_reason": decision.decision_reason,
        "decided_at": decided_at.isoformat(),
        "paper_only": True,
        "approval_for_live": False,
        "previous_chain_hash": previous_chain_hash,
    }
    decision_hash = sha256_json(decision_core)
    return PaperApprovalDecisionRecord(
        approval_decision_id=f"paper-approval-decision-{decision_hash[:16]}",
        approval_request_id=approval_request_id,
        sequence=sequence,
        decision=decision.decision,
        reviewer_id=decision.reviewer_id,
        reviewer_role=decision.reviewer_role,
        decision_reason=decision.decision_reason,
        decided_at=decided_at,
        previous_chain_hash=previous_chain_hash,
        decision_hash=decision_hash,
        payload=decision.model_dump(mode="json"),
    )


def validate_decision_transition(
    existing_decisions: list[PaperApprovalDecisionRecord],
    decision: PaperApprovalDecisionCreate,
) -> None:
    current_status = derive_approval_status(existing_decisions)
    if current_status in {
        "approved_for_paper_simulation",
        "rejected",
        "needs_data_review",
    }:
        raise ValueError("approval request is already terminal")

    if any(item.reviewer_id == decision.reviewer_id for item in existing_decisions):
        raise ValueError("dual review requires distinct reviewer_id values")

    if decision.decision == "research_approved":
        if existing_decisions:
            raise ValueError("research_approved must be the first approval decision")
        if decision.reviewer_role not in {"research_reviewer", "compliance_reviewer"}:
            raise ValueError(
                "research_approved requires research_reviewer or compliance_reviewer"
            )

    if decision.decision == "approved_for_paper_simulation":
        if current_status != "research_approved":
            raise ValueError(
                "approved_for_paper_simulation requires prior research_approved"
            )
        if decision.reviewer_role not in {"risk_reviewer", "compliance_reviewer"}:
            raise ValueError(
                "approved_for_paper_simulation requires risk_reviewer or "
                "compliance_reviewer"
            )


def build_approval_history(
    request: PaperApprovalRequestRecord,
    decisions: list[PaperApprovalDecisionRecord],
) -> PaperApprovalHistory:
    current_status = derive_approval_status(decisions)
    latest_hash = decisions[-1].decision_hash if decisions else request.request_hash
    request = request.model_copy(
        update={
            "status": current_status,
            "latest_chain_hash": latest_hash,
        }
    )
    return PaperApprovalHistory(
        request=request,
        decisions=decisions,
        current_status=current_status,
        pending_second_review=current_status == "research_approved",
        paper_simulation_approved=current_status == "approved_for_paper_simulation",
        immutable_record_policy=(
            "Append-only local SQLite records with hash chaining. This is not a "
            "production WORM ledger."
        ),
        message=history_message(current_status),
    )


def derive_approval_status(
    decisions: list[PaperApprovalDecisionRecord],
) -> PaperApprovalStatus:
    if not decisions:
        return "pending_review"
    if any(decision.decision == "rejected" for decision in decisions):
        return "rejected"
    if any(decision.decision == "needs_data_review" for decision in decisions):
        return "needs_data_review"
    if any(
        decision.decision == "approved_for_paper_simulation" for decision in decisions
    ):
        return "approved_for_paper_simulation"
    if any(decision.decision == "research_approved" for decision in decisions):
        return "research_approved"
    return "pending_review"


def history_message(status: PaperApprovalStatus) -> str:
    if status == "pending_review":
        return "Approval request is queued for paper-only review."
    if status == "research_approved":
        return "Research approval recorded. A distinct second review is required."
    if status == "approved_for_paper_simulation":
        return "Approved for paper simulation only. Live trading remains disabled."
    if status == "rejected":
        return "Approval request rejected. No paper order path is authorized."
    return "Approval request needs data review. No paper order path is authorized."


def sha256_json(payload: dict[str, Any]) -> str:
    encoded = json.dumps(payload, sort_keys=True, separators=(",", ":")).encode("utf-8")
    return hashlib.sha256(encoded).hexdigest()
