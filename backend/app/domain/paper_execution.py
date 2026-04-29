from __future__ import annotations

import hashlib
import json
from datetime import UTC, datetime
from typing import TYPE_CHECKING, Any, Literal

from pydantic import BaseModel, Field, field_validator

from app.domain.events import AuditEvent
from app.domain.order_state_machine import OrderState
from app.domain.paper_oms_reliability import PaperExecutionReport
from app.domain.risk_rules import PaperOrderIntent, RiskEvaluation
from app.domain.signals import StrategySignal
from app.services.paper_broker_gateway import PaperBrokerAck

if TYPE_CHECKING:
    from app.domain.paper_approval import PaperApprovalHistory

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
    approval_request_id: str = Field(min_length=1)
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
    execution_reports: list[PaperExecutionReport] = Field(default_factory=list)
    audit_events: list[AuditEvent] = Field(default_factory=list)
    message: str


def create_approval(
    request: PaperExecutionWorkflowRequest,
    approval_history: PaperApprovalHistory,
) -> PaperExecutionApproval:
    validate_persisted_approval_for_paper_execution(request, approval_history)
    latest_decision = approval_history.decisions[-1]
    return PaperExecutionApproval(
        approval_id=approval_history.request.approval_request_id,
        decision="approved_for_paper_simulation",
        reviewer_id=latest_decision.reviewer_id,
        reason=latest_decision.decision_reason,
        decided_at=latest_decision.decided_at,
        approval_for_paper_simulation=(
            approval_history.current_status == "approved_for_paper_simulation"
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


def validate_persisted_approval_for_paper_execution(
    request: PaperExecutionWorkflowRequest,
    approval_history: PaperApprovalHistory,
) -> None:
    if approval_history.request.approval_request_id != request.approval_request_id:
        raise ValueError("approval_request_id does not match persisted approval history")
    if approval_history.current_status != "approved_for_paper_simulation":
        raise ValueError(
            "paper execution requires persisted approval_request_id with "
            "approved_for_paper_simulation status"
        )
    if not approval_history.paper_simulation_approved:
        raise ValueError("paper approval history has not approved paper simulation")
    if approval_history.approval_for_live or approval_history.live_execution_eligible:
        raise ValueError("approval history must not approve live trading")
    if approval_history.broker_api_called:
        raise ValueError("approval history must not call broker APIs")
    if not approval_history.request.paper_only:
        raise ValueError("approval request must remain paper_only=true")
    if approval_history.request.approval_for_live:
        raise ValueError("approval request must not approve live trading")
    if approval_history.request.live_execution_eligible:
        raise ValueError("approval request must not be live-execution eligible")
    if approval_history.request.broker_api_called:
        raise ValueError("approval request must not call broker APIs")
    if len(approval_history.decisions) < approval_history.request.required_review_count:
        raise ValueError("paper execution requires the full required review sequence")

    decisions = [decision.decision for decision in approval_history.decisions]
    if decisions[:2] != approval_history.request.required_decision_sequence[:2]:
        raise ValueError("paper approval decisions do not match required review sequence")
    if any(decision.approval_for_live for decision in approval_history.decisions):
        raise ValueError("approval decisions must not approve live trading")
    if any(decision.broker_api_called for decision in approval_history.decisions):
        raise ValueError("approval decisions must not call broker APIs")

    if approval_history.request.signal_id != request.signal.signal_id:
        raise ValueError("paper execution signal_id must match approval request signal")
    if approval_history.request.strategy_id != request.signal.strategy_id:
        raise ValueError("paper execution strategy_id must match approval request signal")
    if approval_history.request.strategy_version != request.signal.strategy_version:
        raise ValueError(
            "paper execution strategy_version must match approval request signal"
        )

    approved_signal = approval_history.request.payload.get("signal")
    if isinstance(approved_signal, dict):
        if approved_signal.get("direction") != request.signal.direction:
            raise ValueError("paper execution signal direction must match approval request")
        try:
            approved_target = float(approved_signal.get("target_tx_equivalent"))
        except (TypeError, ValueError) as exc:
            raise ValueError(
                "approval request signal target_tx_equivalent is invalid"
            ) from exc
        if approved_target != float(request.signal.target_tx_equivalent):
            raise ValueError(
                "paper execution target_tx_equivalent must match approval request"
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
        action="paper_execution.approval_request_verified",
        resource=approval.approval_id,
        metadata={
            "decision": approval.decision,
            "approval_request_id": approval.approval_id,
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
