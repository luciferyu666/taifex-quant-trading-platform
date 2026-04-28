from __future__ import annotations

import hashlib
import json
from datetime import UTC, datetime
from typing import Any, Literal

from pydantic import BaseModel, Field, field_validator

from app.domain.events import AuditEvent
from app.domain.order_state_machine import OrderState
from app.domain.risk_rules import PaperOrderIntent, RiskEvaluation
from app.domain.signals import StrategySignal
from app.services.paper_broker_gateway import PaperBrokerAck

PaperExecutionApprovalDecision = Literal[
    "research_approved",
    "approved_for_paper_simulation",
    "rejected",
    "needs_data_review",
]

PaperBrokerSimulationOutcome = Literal[
    "acknowledge",
    "partial_fill",
    "fill",
    "reject",
    "cancel",
]


class PaperExecutionApproval(BaseModel):
    approval_id: str
    decision: PaperExecutionApprovalDecision
    reviewer_id: str
    reason: str
    decided_at: datetime = Field(default_factory=lambda: datetime.now(UTC))
    paper_only: bool = True
    approval_for_live: bool = False
    approval_for_paper_simulation: bool = False


class PaperExecutionWorkflowRequest(BaseModel):
    signal: StrategySignal
    approval_decision: PaperExecutionApprovalDecision
    reviewer_id: str = Field(default="paper-reviewer", min_length=1)
    approval_reason: str = Field(min_length=1)
    symbol: Literal["TX", "MTX", "TMF"] = "TMF"
    quantity: int = Field(default=1, gt=0)
    quote_age_seconds: float = Field(default=0, ge=0)
    broker_simulation: PaperBrokerSimulationOutcome = "acknowledge"
    paper_only: bool = True

    @field_validator("paper_only")
    @classmethod
    def require_paper_only(cls, value: bool) -> bool:
        if value is not True:
            raise ValueError("paper execution workflow must remain paper_only=true")
        return value


class PaperExecutionWorkflowResponse(BaseModel):
    workflow_run_id: str = ""
    paper_only: bool = True
    live_trading_enabled: bool = False
    broker_api_called: bool = False
    order_created: bool = False
    paper_broker_gateway_called: bool = False
    persisted: bool = False
    persistence_backend: str = "none"
    approval: PaperExecutionApproval
    paper_order_intent: PaperOrderIntent | None = None
    risk_evaluation: RiskEvaluation | None = None
    oms_state: OrderState | None = None
    paper_broker_ack: PaperBrokerAck | None = None
    audit_events: list[AuditEvent] = Field(default_factory=list)
    message: str


def create_approval(
    request: PaperExecutionWorkflowRequest,
) -> PaperExecutionApproval:
    approval_core = {
        "signal_id": request.signal.signal_id,
        "strategy_id": request.signal.strategy_id,
        "strategy_version": request.signal.strategy_version,
        "decision": request.approval_decision,
        "reviewer_id": request.reviewer_id,
        "reason": request.approval_reason,
        "paper_only": True,
        "approval_for_live": False,
    }
    approval_id = f"paper-approval-{sha256_json(approval_core)[:16]}"
    return PaperExecutionApproval(
        approval_id=approval_id,
        decision=request.approval_decision,
        reviewer_id=request.reviewer_id,
        reason=request.approval_reason,
        approval_for_paper_simulation=(
            request.approval_decision == "approved_for_paper_simulation"
        ),
    )


def create_workflow_run_id(
    request: PaperExecutionWorkflowRequest,
    approval: PaperExecutionApproval,
) -> str:
    workflow_core = {
        "approval_id": approval.approval_id,
        "signal_id": request.signal.signal_id,
        "strategy_id": request.signal.strategy_id,
        "strategy_version": request.signal.strategy_version,
        "symbol": request.symbol,
        "quantity": request.quantity,
        "broker_simulation": request.broker_simulation,
        "paper_only": True,
    }
    return f"paper-workflow-{sha256_json(workflow_core)[:16]}"


def paper_order_intent_from_signal(
    signal: StrategySignal,
    approval: PaperExecutionApproval,
    *,
    symbol: Literal["TX", "MTX", "TMF"],
    quantity: int,
    quote_age_seconds: float,
) -> PaperOrderIntent:
    validate_strategy_signal_for_paper_execution(signal)
    if approval.decision != "approved_for_paper_simulation":
        raise ValueError(
            "paper order intent can only be created after approved_for_paper_simulation"
        )
    if signal.direction == "FLAT":
        raise ValueError("FLAT strategy signals cannot create paper order intents")

    side: Literal["BUY", "SELL"] = "BUY" if signal.direction == "LONG" else "SELL"
    intent_core = {
        "signal_id": signal.signal_id,
        "strategy_id": signal.strategy_id,
        "strategy_version": signal.strategy_version,
        "approval_id": approval.approval_id,
        "symbol": symbol,
        "side": side,
        "quantity": quantity,
        "tx_equivalent_exposure": signal.target_tx_equivalent,
        "paper_only": True,
    }
    intent_digest = sha256_json(intent_core)
    return PaperOrderIntent(
        order_id=f"paper-order-{intent_digest[:16]}",
        idempotency_key=f"paper-idem-{intent_digest[16:32]}",
        symbol=symbol,
        side=side,
        quantity=quantity,
        tx_equivalent_exposure=signal.target_tx_equivalent,
        quote_age_seconds=quote_age_seconds,
        paper_only=True,
        source_signal_id=signal.signal_id,
        strategy_id=signal.strategy_id,
        strategy_version=signal.strategy_version,
        approval_id=approval.approval_id,
    )


def validate_strategy_signal_for_paper_execution(signal: StrategySignal) -> None:
    if signal.reason.get("signals_only") is not True:
        raise ValueError("strategy signal must include reason.signals_only=true")
    if signal.reason.get("order_created") is True:
        raise ValueError("strategy signal must not create orders")
    if signal.reason.get("broker_api_called") is True:
        raise ValueError("strategy signal must not call broker APIs")
    if signal.reason.get("risk_engine_called") is True:
        raise ValueError("strategy signal must not call Risk Engine directly")
    if signal.reason.get("oms_called") is True:
        raise ValueError("strategy signal must not call OMS directly")


def approval_audit_event(approval: PaperExecutionApproval) -> AuditEvent:
    return AuditEvent(
        audit_id=f"audit-{approval.approval_id}",
        actor=approval.reviewer_id,
        action="paper_execution.approval_decision",
        resource=approval.approval_id,
        metadata={
            "decision": approval.decision,
            "approval_for_live": False,
            "approval_for_paper_simulation": approval.approval_for_paper_simulation,
            "paper_only": True,
        },
    )


def workflow_audit_event(
    *,
    action: str,
    resource: str,
    actor: str = "system",
    metadata: dict[str, Any] | None = None,
) -> AuditEvent:
    digest = sha256_json(
        {
            "action": action,
            "resource": resource,
            "actor": actor,
            "metadata": metadata or {},
        }
    )
    return AuditEvent(
        audit_id=f"audit-{digest[:16]}",
        actor=actor,
        action=action,
        resource=resource,
        metadata=metadata or {},
    )


def sha256_json(payload: dict[str, Any]) -> str:
    encoded = json.dumps(payload, sort_keys=True, separators=(",", ":")).encode("utf-8")
    return hashlib.sha256(encoded).hexdigest()
