from __future__ import annotations

from app.domain.order_state_machine import (
    OrderEvent,
    OrderEventType,
    OrderState,
    apply_order_event,
    new_order_state,
)
from app.domain.paper_approval import PaperApprovalHistory
from app.domain.paper_execution import (
    PaperExecutionWorkflowRequest,
    PaperExecutionWorkflowResponse,
    approval_audit_event,
    create_approval,
    create_workflow_run_id,
    paper_order_intent_from_signal,
    workflow_audit_event,
)
from app.domain.paper_oms_reliability import build_execution_reports
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
        approval_history: PaperApprovalHistory,
    ) -> PaperExecutionWorkflowResponse:
        approval = create_approval(request, approval_history)
        workflow_run_id = create_workflow_run_id(request, approval)
        audit_events = [approval_audit_event(approval)]

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
                workflow_run_id=workflow_run_id,
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
            quantity=intent.quantity,
            reason=paper_ack.message,
        )
        execution_reports = build_execution_reports(
            workflow_run_id=workflow_run_id,
            order_state=oms_state,
        )
        audit_events.append(
            workflow_audit_event(
                action="paper_execution.oms_lifecycle_recorded",
                resource=intent.order_id,
                metadata={
                    "final_status": oms_state.status,
                    "event_count": len(oms_state.history),
                    "execution_report_count": len(execution_reports),
                    "paper_only": True,
                },
            )
        )

        return PaperExecutionWorkflowResponse(
            workflow_run_id=workflow_run_id,
            order_created=True,
            paper_broker_gateway_called=True,
            approval=approval,
            paper_order_intent=intent,
            risk_evaluation=risk_evaluation,
            oms_state=oms_state,
            paper_broker_ack=paper_ack,
            execution_reports=execution_reports,
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
    quantity: int = 0,
    reason: str | None = None,
) -> OrderState:
    requested_quantity = max(0, quantity)
    if outcome == "reject":
        return apply_order_event(
            state,
            OrderEvent(
                event_id=f"{state.order_id}-{len(state.history) + 1}-REJECT",
                order_id=state.order_id,
                event_type=OrderEventType.REJECT,
                reason=reason,
                payload={
                    "last_quantity": 0,
                    "cumulative_filled_quantity": 0,
                    "leaves_quantity": requested_quantity,
                    "paper_only": True,
                },
            ),
        )

    state = apply_order_event(
        state,
        OrderEvent(
            event_id=f"{state.order_id}-{len(state.history) + 1}-ACKNOWLEDGE",
            order_id=state.order_id,
            event_type=OrderEventType.ACKNOWLEDGE,
            reason=reason,
            payload={
                "last_quantity": 0,
                "cumulative_filled_quantity": 0,
                "leaves_quantity": requested_quantity,
                "paper_only": True,
            },
        ),
    )
    if outcome == "partial_fill":
        last_quantity = max(0, requested_quantity - 1)
        return apply_order_event(
            state,
            OrderEvent(
                event_id=f"{state.order_id}-{len(state.history) + 1}-PARTIAL_FILL",
                order_id=state.order_id,
                event_type=OrderEventType.PARTIAL_FILL,
                reason=reason,
                payload={
                    "last_quantity": last_quantity,
                    "cumulative_filled_quantity": last_quantity,
                    "leaves_quantity": max(0, requested_quantity - last_quantity),
                    "paper_only": True,
                    "note": (
                        "Fixture-only partial fill accounting; not a production "
                        "execution report."
                    ),
                },
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
                payload={
                    "last_quantity": requested_quantity,
                    "cumulative_filled_quantity": requested_quantity,
                    "leaves_quantity": 0,
                    "paper_only": True,
                },
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
                payload={
                    "last_quantity": 0,
                    "cumulative_filled_quantity": 0,
                    "leaves_quantity": requested_quantity,
                    "paper_only": True,
                },
            ),
        )
        return apply_order_event(
            state,
            OrderEvent(
                event_id=f"{state.order_id}-{len(state.history) + 1}-CANCEL",
                order_id=state.order_id,
                event_type=OrderEventType.CANCEL,
                reason=reason,
                payload={
                    "last_quantity": 0,
                    "cumulative_filled_quantity": 0,
                    "leaves_quantity": requested_quantity,
                    "paper_only": True,
                },
            ),
        )
    return state
