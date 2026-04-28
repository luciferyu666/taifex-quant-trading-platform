from __future__ import annotations

from app.domain.order_state_machine import (
    OrderEvent,
    OrderEventType,
    OrderState,
    apply_order_event,
    new_order_state,
)
from app.domain.paper_execution import (
    PaperExecutionWorkflowRequest,
    PaperExecutionWorkflowResponse,
    approval_audit_event,
    create_approval,
    paper_order_intent_from_signal,
    workflow_audit_event,
)
from app.domain.risk_rules import RiskPolicy, evaluate_paper_order
from app.services.paper_broker_gateway import PaperBrokerGateway


class PaperExecutionWorkflow:
    def __init__(
        self,
        risk_policy: RiskPolicy,
        paper_broker_gateway: PaperBrokerGateway | None = None,
    ) -> None:
        self.risk_policy = risk_policy
        self.paper_broker_gateway = paper_broker_gateway or PaperBrokerGateway()

    def preview(
        self,
        request: PaperExecutionWorkflowRequest,
    ) -> PaperExecutionWorkflowResponse:
        approval = create_approval(request)
        audit_events = [approval_audit_event(approval)]

        if approval.decision != "approved_for_paper_simulation":
            audit_events.append(
                workflow_audit_event(
                    action="paper_execution.intent_not_created",
                    resource=approval.approval_id,
                    metadata={
                        "decision": approval.decision,
                        "reason": (
                            "Only approved_for_paper_simulation can create a "
                            "paper order intent."
                        ),
                    },
                )
            )
            return PaperExecutionWorkflowResponse(
                approval=approval,
                audit_events=audit_events,
                message=(
                    "Research review decision recorded. No paper order intent was "
                    "created, no Risk Engine/OMS path was entered, and no broker "
                    "gateway was called."
                ),
            )

        intent = paper_order_intent_from_signal(
            request.signal,
            approval,
            symbol=request.symbol,
            quantity=request.quantity,
            quote_age_seconds=request.quote_age_seconds,
        )
        audit_events.append(
            workflow_audit_event(
                action="paper_execution.intent_created",
                resource=intent.order_id,
                metadata={
                    "approval_id": approval.approval_id,
                    "source_signal_id": intent.source_signal_id,
                    "strategy_id": intent.strategy_id,
                    "paper_only": True,
                },
            )
        )

        oms_state = new_order_state(intent.order_id, intent.idempotency_key)
        oms_state = self._apply_oms_event(oms_state, OrderEventType.CREATE)
        risk_evaluation = evaluate_paper_order(intent, self.risk_policy)
        audit_events.append(
            workflow_audit_event(
                action="paper_execution.risk_evaluated",
                resource=intent.order_id,
                metadata=risk_evaluation.model_dump(mode="json"),
            )
        )

        if not risk_evaluation.approved:
            oms_state = self._apply_oms_event(
                oms_state,
                OrderEventType.RISK_REJECT,
                reason=risk_evaluation.reason,
            )
            audit_events.append(
                workflow_audit_event(
                    action="paper_execution.rejected_by_risk_engine",
                    resource=intent.order_id,
                    metadata={"reason": risk_evaluation.reason},
                )
            )
            return PaperExecutionWorkflowResponse(
                order_created=True,
                approval=approval,
                paper_order_intent=intent,
                risk_evaluation=risk_evaluation,
                oms_state=oms_state,
                audit_events=audit_events,
                message=(
                    "Paper order intent was rejected by Risk Engine. OMS recorded "
                    "the rejection and no broker gateway was called."
                ),
            )

        oms_state = self._apply_oms_event(oms_state, OrderEventType.RISK_APPROVE)
        oms_state = self._apply_oms_event(oms_state, OrderEventType.SUBMIT)
        paper_ack = self.paper_broker_gateway.submit_order(
            intent,
            risk_evaluation,
            simulation=request.broker_simulation,
        )
        audit_events.append(
            workflow_audit_event(
                action="paper_execution.paper_broker_simulated",
                resource=intent.order_id,
                metadata=paper_ack.model_dump(mode="json"),
            )
        )

        oms_state = apply_paper_broker_outcome(
            oms_state,
            request.broker_simulation,
            reason=paper_ack.message,
        )
        audit_events.append(
            workflow_audit_event(
                action="paper_execution.oms_lifecycle_recorded",
                resource=intent.order_id,
                metadata={
                    "final_status": oms_state.status,
                    "event_count": len(oms_state.history),
                    "paper_only": True,
                },
            )
        )

        return PaperExecutionWorkflowResponse(
            order_created=True,
            paper_broker_gateway_called=True,
            approval=approval,
            paper_order_intent=intent,
            risk_evaluation=risk_evaluation,
            oms_state=oms_state,
            paper_broker_ack=paper_ack,
            audit_events=audit_events,
            message=(
                "Paper-only workflow completed through Risk Engine, OMS, and Paper "
                "Broker Gateway. No real order was placed."
            ),
        )

    def _apply_oms_event(
        self,
        state: OrderState,
        event_type: OrderEventType,
        reason: str | None = None,
    ) -> OrderState:
        return apply_order_event(
            state,
            OrderEvent(
                event_id=f"{state.order_id}-{len(state.history) + 1}-{event_type.value}",
                order_id=state.order_id,
                event_type=event_type,
                reason=reason,
            ),
        )


def apply_paper_broker_outcome(
    state: OrderState,
    outcome: str,
    reason: str | None = None,
) -> OrderState:
    if outcome == "reject":
        return apply_order_event(
            state,
            OrderEvent(
                event_id=f"{state.order_id}-{len(state.history) + 1}-REJECT",
                order_id=state.order_id,
                event_type=OrderEventType.REJECT,
                reason=reason,
            ),
        )

    state = apply_order_event(
        state,
        OrderEvent(
            event_id=f"{state.order_id}-{len(state.history) + 1}-ACKNOWLEDGE",
            order_id=state.order_id,
            event_type=OrderEventType.ACKNOWLEDGE,
            reason=reason,
        ),
    )
    if outcome == "partial_fill":
        return apply_order_event(
            state,
            OrderEvent(
                event_id=f"{state.order_id}-{len(state.history) + 1}-PARTIAL_FILL",
                order_id=state.order_id,
                event_type=OrderEventType.PARTIAL_FILL,
                reason=reason,
            ),
        )
    if outcome == "fill":
        return apply_order_event(
            state,
            OrderEvent(
                event_id=f"{state.order_id}-{len(state.history) + 1}-FILL",
                order_id=state.order_id,
                event_type=OrderEventType.FILL,
                reason=reason,
            ),
        )
    if outcome == "cancel":
        state = apply_order_event(
            state,
            OrderEvent(
                event_id=f"{state.order_id}-{len(state.history) + 1}-CANCEL_REQUEST",
                order_id=state.order_id,
                event_type=OrderEventType.CANCEL_REQUEST,
                reason=reason,
            ),
        )
        return apply_order_event(
            state,
            OrderEvent(
                event_id=f"{state.order_id}-{len(state.history) + 1}-CANCEL",
                order_id=state.order_id,
                event_type=OrderEventType.CANCEL,
                reason=reason,
            ),
        )
    return state
