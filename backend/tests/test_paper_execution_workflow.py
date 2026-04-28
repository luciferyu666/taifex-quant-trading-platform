from datetime import UTC, datetime

import pytest

from app.domain.order_state_machine import OrderStatus
from app.domain.paper_execution import PaperExecutionWorkflowRequest
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
    approval_decision: str = "approved_for_paper_simulation",
    broker_simulation: str = "fill",
    exposure: float = 0.05,
) -> PaperExecutionWorkflowRequest:
    return PaperExecutionWorkflowRequest(
        signal=_signal(exposure=exposure),
        approval_decision=approval_decision,  # type: ignore[arg-type]
        approval_reason="reviewed for paper simulation only",
        broker_simulation=broker_simulation,  # type: ignore[arg-type]
    )


def test_rejected_approval_does_not_create_order_or_call_broker() -> None:
    response = PaperExecutionWorkflow(RiskPolicy()).preview(
        _request(approval_decision="rejected")
    )

    assert response.paper_only is True
    assert response.live_trading_enabled is False
    assert response.order_created is False
    assert response.paper_broker_gateway_called is False
    assert response.paper_order_intent is None
    assert response.risk_evaluation is None
    assert response.oms_state is None
    assert response.paper_broker_ack is None
    assert any(
        event.action == "paper_execution.intent_not_created"
        for event in response.audit_events
    )


def test_approved_paper_simulation_goes_through_risk_oms_and_paper_broker() -> None:
    response = PaperExecutionWorkflow(RiskPolicy()).preview(_request())

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
    partial = PaperExecutionWorkflow(RiskPolicy()).preview(
        _request(broker_simulation="partial_fill")
    )
    rejected = PaperExecutionWorkflow(RiskPolicy()).preview(
        _request(broker_simulation="reject")
    )
    cancelled = PaperExecutionWorkflow(RiskPolicy()).preview(
        _request(broker_simulation="cancel")
    )

    assert partial.oms_state is not None
    assert partial.oms_state.status == OrderStatus.PARTIALLY_FILLED
    assert rejected.oms_state is not None
    assert rejected.oms_state.status == OrderStatus.REJECTED
    assert rejected.paper_broker_ack is not None
    assert rejected.paper_broker_ack.accepted is False
    assert cancelled.oms_state is not None
    assert cancelled.oms_state.status == OrderStatus.CANCELLED


def test_risk_rejection_records_oms_rejection_without_broker_call() -> None:
    response = PaperExecutionWorkflow(RiskPolicy(max_tx_equivalent_exposure=0.01)).preview(
        _request(exposure=0.05)
    )

    assert response.order_created is True
    assert response.paper_broker_gateway_called is False
    assert response.risk_evaluation is not None
    assert response.risk_evaluation.approved is False
    assert response.oms_state is not None
    assert response.oms_state.status == OrderStatus.REJECTED
    assert response.paper_broker_ack is None


def test_signal_must_remain_signal_only() -> None:
    request = PaperExecutionWorkflowRequest(
        signal=_signal(signals_only=False),
        approval_decision="approved_for_paper_simulation",
        approval_reason="unsafe signal",
    )

    with pytest.raises(ValueError, match="signals_only=true"):
        PaperExecutionWorkflow(RiskPolicy()).preview(request)


def test_flat_signal_cannot_create_paper_order_intent() -> None:
    request = PaperExecutionWorkflowRequest(
        signal=_signal(direction="FLAT"),
        approval_decision="approved_for_paper_simulation",
        approval_reason="flat signal",
    )

    with pytest.raises(ValueError, match="FLAT"):
        PaperExecutionWorkflow(RiskPolicy()).preview(request)
