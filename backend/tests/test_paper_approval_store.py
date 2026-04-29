from datetime import UTC, datetime
from pathlib import Path

import pytest

from app.domain.paper_approval import (
    PaperApprovalDecisionCreate,
    PaperApprovalRequestCreate,
)
from app.domain.signals import StrategySignal
from app.services.paper_approval_store import PaperApprovalStore


def _signal() -> StrategySignal:
    return StrategySignal(
        signal_id="paper-approval-signal",
        strategy_id="paper-approval-strategy",
        strategy_version="0.1.0",
        timestamp=datetime.now(UTC),
        symbol_group="TAIEX_FUTURES",
        direction="LONG",
        target_tx_equivalent=0.05,
        confidence=0.8,
        stop_distance_points=20,
        reason={
            "signals_only": True,
            "order_created": False,
            "broker_api_called": False,
            "risk_engine_called": False,
            "oms_called": False,
        },
    )


def _request() -> PaperApprovalRequestCreate:
    return PaperApprovalRequestCreate(
        signal=_signal(),
        requester_id="local-requester",
        request_reason="Queue this signal for paper simulation review.",
    )


def _research_decision(
    reviewer_id: str = "research-reviewer",
) -> PaperApprovalDecisionCreate:
    return PaperApprovalDecisionCreate(
        decision="research_approved",
        reviewer_id=reviewer_id,
        reviewer_role="research_reviewer",
        decision_reason="Research review accepted for paper-only follow-up.",
    )


def _risk_decision(reviewer_id: str = "risk-reviewer") -> PaperApprovalDecisionCreate:
    return PaperApprovalDecisionCreate(
        decision="approved_for_paper_simulation",
        reviewer_id=reviewer_id,
        reviewer_role="risk_reviewer",
        decision_reason="Risk review approved paper simulation only.",
    )


def test_paper_approval_store_records_queue_and_dual_review(
    tmp_path: Path,
) -> None:
    store = PaperApprovalStore(tmp_path / "paper_approval.sqlite")

    queued = store.create_request(_request())

    assert queued.current_status == "pending_review"
    assert queued.request.paper_only is True
    assert queued.request.approval_for_live is False
    assert queued.request.live_execution_eligible is False
    assert queued.request.broker_api_called is False
    assert queued.request.required_review_count == 2
    assert queued.pending_second_review is False
    assert queued.paper_simulation_approved is False
    assert len(store.list_queue()) == 1

    after_research = store.record_decision(
        queued.request.approval_request_id,
        _research_decision(),
    )

    assert after_research.current_status == "research_approved"
    assert after_research.pending_second_review is True
    assert after_research.paper_simulation_approved is False
    assert len(after_research.decisions) == 1
    assert (
        after_research.decisions[0].previous_chain_hash
        == queued.request.request_hash
    )

    approved = store.record_decision(
        queued.request.approval_request_id,
        _risk_decision(),
    )

    assert approved.current_status == "approved_for_paper_simulation"
    assert approved.pending_second_review is False
    assert approved.paper_simulation_approved is True
    assert approved.approval_for_live is False
    assert approved.live_execution_eligible is False
    assert approved.broker_api_called is False
    assert len(approved.decisions) == 2
    assert (
        approved.decisions[1].previous_chain_hash
        == approved.decisions[0].decision_hash
    )
    assert store.list_queue() == []


def test_paper_approval_store_rejects_invalid_second_review(
    tmp_path: Path,
) -> None:
    store = PaperApprovalStore(tmp_path / "paper_approval.sqlite")
    queued = store.create_request(_request())

    with pytest.raises(ValueError, match="requires prior research_approved"):
        store.record_decision(
            queued.request.approval_request_id,
            _risk_decision(),
        )

    store.record_decision(
        queued.request.approval_request_id,
        _research_decision(reviewer_id="same-reviewer"),
    )

    with pytest.raises(ValueError, match="distinct reviewer_id"):
        store.record_decision(
            queued.request.approval_request_id,
            _risk_decision(reviewer_id="same-reviewer"),
        )


def test_paper_approval_store_terminal_rejection_blocks_followup(
    tmp_path: Path,
) -> None:
    store = PaperApprovalStore(tmp_path / "paper_approval.sqlite")
    queued = store.create_request(_request())

    rejected = store.record_decision(
        queued.request.approval_request_id,
        PaperApprovalDecisionCreate(
            decision="rejected",
            reviewer_id="risk-reviewer",
            reviewer_role="risk_reviewer",
            decision_reason="Reject for paper-only test.",
        ),
    )

    assert rejected.current_status == "rejected"
    assert rejected.paper_simulation_approved is False

    with pytest.raises(ValueError, match="already terminal"):
        store.record_decision(
            queued.request.approval_request_id,
            _research_decision(reviewer_id="research-reviewer"),
        )
