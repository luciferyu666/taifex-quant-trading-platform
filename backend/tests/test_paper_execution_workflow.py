from datetime import UTC, datetime

import pytest

from app.domain.order_state_machine import OrderStatus
from app.domain.paper_approval import (
    PaperApprovalDecisionCreate,
    PaperApprovalHistory,
    PaperApprovalRequestCreate,
    build_approval_history,
    build_paper_approval_decision_record,
    build_paper_approval_request_record,
)
from app.domain.paper_execution import PaperExecutionWorkflowRequest
from app.domain.paper_oms_reliability import build_execution_reports
from app.domain.risk_rules import RiskPolicy
from app.domain.signals import StrategySignal
from app.services.paper_execution_workflow import PaperExecutionWorkflow


def _signal(
    *,
    direction: str = "LONG",
    exposure: float = 0.05,
    signals_only: bool = True,
) -> StrategySignal:
    return StrategySignal(
        signal_id="signal-paper-execution",
        strategy_id="demo-strategy",
        strategy_version="0.1.0",
        timestamp=datetime.now(UTC),
        direction=direction,  # type: ignore[arg-type]
        target_tx_equivalent=exposure,
        confidence=0.8,
        stop_distance_points=20,
        reason={
            "signals_only": signals_only,
            "order_created": False,
            "broker_api_called": False,
            "risk_engine_called": False,
            "oms_called": False,
        },
    )


def _request(
    approval_history: PaperApprovalHistory | None = None,
    broker_simulation: str = "fill",
    exposure: float = 0.05,
    signal: StrategySignal | None = None,
) -> tuple[PaperExecutionWorkflowRequest, PaperApprovalHistory]:
    signal = signal or _signal(exposure=exposure)
    approval_history = approval_history or _approved_history(signal)
    return PaperExecutionWorkflowRequest(
        signal=signal,
        approval_request_id=approval_history.request.approval_request_id,
        broker_simulation=broker_simulation,  # type: ignore[arg-type]
    ), approval_history


def _queued_history(signal: StrategySignal | None = None) -> PaperApprovalHistory:
    request = build_paper_approval_request_record(
        PaperApprovalRequestCreate(
            signal=signal or _signal(),
            requester_id="paper-workflow-test-requester",
            request_reason="Workflow test approval request.",
        )
    )
    return build_approval_history(request, [])


def _approved_history(signal: StrategySignal | None = None) -> PaperApprovalHistory:
    request = build_paper_approval_request_record(
        PaperApprovalRequestCreate(
            signal=signal or _signal(),
            requester_id="paper-workflow-test-requester",
            request_reason="Workflow test approval request.",
        )
    )
    research_decision = build_paper_approval_decision_record(
        approval_request_id=request.approval_request_id,
        request_hash=request.request_hash,
        existing_decisions=[],
        decision=PaperApprovalDecisionCreate(
            decision="research_approved",
            reviewer_id="research-reviewer",
            reviewer_role="research_reviewer",
            decision_reason="Research approved for workflow test.",
        ),
    )
    risk_decision = build_paper_approval_decision_record(
        approval_request_id=request.approval_request_id,
        request_hash=request.request_hash,
        existing_decisions=[research_decision],
        decision=PaperApprovalDecisionCreate(
            decision="approved_for_paper_simulation",
            reviewer_id="risk-reviewer",
            reviewer_role="risk_reviewer",
            decision_reason="Approved for paper simulation workflow test.",
        ),
    )
    return build_approval_history(request, [research_decision, risk_decision])


def test_pending_approval_request_cannot_create_order_or_call_broker() -> None:
    history = _queued_history()
    request, _ = _request(approval_history=history)

    with pytest.raises(ValueError, match="approved_for_paper_simulation"):
        PaperExecutionWorkflow(RiskPolicy()).preview(request, history)


def test_approved_paper_simulation_goes_through_risk_oms_and_paper_broker() -> None:
    request, history = _request()
    response = PaperExecutionWorkflow(RiskPolicy()).preview(request, history)

    assert response.order_created is True
    assert response.paper_broker_gateway_called is True
    assert response.broker_api_called is False
    assert response.paper_order_intent is not None
    assert response.paper_order_intent.paper_only is True
    assert response.paper_order_intent.source_signal_id == "signal-paper-execution"
    assert response.risk_evaluation is not None
    assert response.risk_evaluation.approved is True
    assert response.oms_state is not None
    assert response.oms_state.status == OrderStatus.FILLED
    assert [event.event_type for event in response.oms_state.history]
    assert response.paper_broker_ack is not None
    assert response.paper_broker_ack.accepted is True
    assert "No real order was placed" in response.paper_broker_ack.message
    assert any(
        event.action == "paper_execution.oms_lifecycle_recorded"
        for event in response.audit_events
    )


def test_paper_broker_can_simulate_partial_fill_reject_and_cancel() -> None:
    partial_request, partial_history = _request(broker_simulation="partial_fill")
    rejected_request, rejected_history = _request(broker_simulation="reject")
    cancelled_request, cancelled_history = _request(broker_simulation="cancel")
    partial = PaperExecutionWorkflow(RiskPolicy()).preview(
        partial_request,
        partial_history,
    )
    rejected = PaperExecutionWorkflow(RiskPolicy()).preview(
        rejected_request,
        rejected_history,
    )
    cancelled = PaperExecutionWorkflow(RiskPolicy()).preview(
        cancelled_request,
        cancelled_history,
    )

    assert partial.oms_state is not None
    assert partial.oms_state.status == OrderStatus.PARTIALLY_FILLED
    assert rejected.oms_state is not None
    assert rejected.oms_state.status == OrderStatus.REJECTED
    assert rejected.paper_broker_ack is not None
    assert rejected.paper_broker_ack.accepted is False
    assert cancelled.oms_state is not None
    assert cancelled.oms_state.status == OrderStatus.CANCELLED


def test_paper_workflow_builds_execution_reports_with_fill_accounting() -> None:
    signal = _signal(exposure=0.05)
    history = _approved_history(signal)
    request = PaperExecutionWorkflowRequest(
        signal=signal,
        approval_request_id=history.request.approval_request_id,
        quantity=3,
        broker_simulation="partial_fill",
    )

    response = PaperExecutionWorkflow(RiskPolicy()).preview(request, history)

    assert response.oms_state is not None
    assert response.execution_reports
    assert [report.execution_type for report in response.execution_reports] == [
        "ACKNOWLEDGED",
        "PARTIAL_FILL",
    ]
    partial_report = response.execution_reports[-1]
    assert partial_report.paper_only is True
    assert partial_report.live_trading_enabled is False
    assert partial_report.broker_api_called is False
    assert partial_report.last_quantity == 2
    assert partial_report.cumulative_filled_quantity == 2
    assert partial_report.leaves_quantity == 1

    rebuilt_reports = build_execution_reports(
        workflow_run_id=response.workflow_run_id,
        order_state=response.oms_state,
    )
    assert [report.report_id for report in rebuilt_reports] == [
        report.report_id for report in response.execution_reports
    ]


def test_risk_rejection_records_oms_rejection_without_broker_call() -> None:
    request, history = _request(exposure=0.05)
    response = PaperExecutionWorkflow(RiskPolicy(max_tx_equivalent_exposure=0.01)).preview(
        request,
        history,
    )

    assert response.order_created is True
    assert response.paper_broker_gateway_called is False
    assert response.risk_evaluation is not None
    assert response.risk_evaluation.approved is False
    assert response.oms_state is not None
    assert response.oms_state.status == OrderStatus.REJECTED
    assert response.paper_broker_ack is None


def test_signal_must_remain_signal_only() -> None:
    history = _approved_history(_signal(signals_only=True))
    signal = _signal(signals_only=False)
    request = PaperExecutionWorkflowRequest(
        signal=signal,
        approval_request_id=history.request.approval_request_id,
    )

    with pytest.raises(ValueError, match="signals_only=true"):
        PaperExecutionWorkflow(RiskPolicy()).preview(request, history)


def test_flat_signal_cannot_create_paper_order_intent() -> None:
    signal = _signal(direction="FLAT")
    history = _approved_history(signal)
    request = PaperExecutionWorkflowRequest(
        signal=signal,
        approval_request_id=history.request.approval_request_id,
    )

    with pytest.raises(ValueError, match="FLAT"):
        PaperExecutionWorkflow(RiskPolicy()).preview(request, history)


def test_signal_must_match_persisted_approval_request() -> None:
    history = _approved_history(_signal(direction="LONG"))
    request = PaperExecutionWorkflowRequest(
        signal=_signal(direction="SHORT"),
        approval_request_id=history.request.approval_request_id,
    )

    with pytest.raises(ValueError, match="direction must match"):
        PaperExecutionWorkflow(RiskPolicy()).preview(request, history)
