from datetime import UTC, datetime
from pathlib import Path

from fastapi.testclient import TestClient

from app.core.config import get_settings
from app.main import app


def _signal_payload() -> dict[str, object]:
    return {
        "signal_id": "paper-approval-route-signal",
        "strategy_id": "paper-approval-route-strategy",
        "strategy_version": "0.1.0",
        "timestamp": datetime.now(UTC).isoformat(),
        "symbol_group": "TAIEX_FUTURES",
        "direction": "LONG",
        "target_tx_equivalent": 0.05,
        "confidence": 0.8,
        "stop_distance_points": 20,
        "reason": {
            "signals_only": True,
            "order_created": False,
            "broker_api_called": False,
            "risk_engine_called": False,
            "oms_called": False,
        },
    }


def test_paper_approval_status_is_paper_only() -> None:
    client = TestClient(app)

    response = client.get("/api/paper-execution/approvals/status")

    assert response.status_code == 200
    payload = response.json()
    assert payload["trading_mode"] == "paper"
    assert payload["live_trading_enabled"] is False
    assert payload["broker_provider"] == "paper"
    assert payload["dual_review_required"] is True
    assert payload["broker_api_called"] is False
    assert "approved_for_paper_simulation" in payload["supported_decisions"]
    assert "risk_reviewer" in payload["reviewer_roles"]
    assert "production identity system" in payload["immutable_record_policy"]


def test_paper_approval_routes_create_queue_and_dual_review(
    tmp_path: Path,
    monkeypatch,
) -> None:
    db_path = tmp_path / "paper_approval.sqlite"
    monkeypatch.setenv("PAPER_EXECUTION_AUDIT_DB_PATH", str(db_path))
    get_settings.cache_clear()
    client = TestClient(app)

    try:
        request_response = client.post(
            "/api/paper-execution/approvals/requests",
            json={
                "signal": _signal_payload(),
                "requester_id": "local-requester",
                "request_reason": "Queue route signal for paper approval.",
                "paper_only": True,
            },
        )

        assert request_response.status_code == 200
        queued = request_response.json()
        approval_request_id = queued["request"]["approval_request_id"]
        assert queued["current_status"] == "pending_review"
        assert queued["request"]["approval_for_live"] is False
        assert queued["request"]["live_execution_eligible"] is False
        assert queued["approval_for_live"] is False

        queue = client.get("/api/paper-execution/approvals/queue").json()
        assert queue[0]["request"]["approval_request_id"] == approval_request_id

        research_response = client.post(
            f"/api/paper-execution/approvals/requests/{approval_request_id}/decisions",
            json={
                "decision": "research_approved",
                "reviewer_id": "research-reviewer",
                "reviewer_role": "research_reviewer",
                "decision_reason": "Research approval for paper-only simulation.",
                "paper_only": True,
            },
        )

        assert research_response.status_code == 200
        after_research = research_response.json()
        assert after_research["current_status"] == "research_approved"
        assert after_research["pending_second_review"] is True
        assert after_research["paper_simulation_approved"] is False

        approval_response = client.post(
            f"/api/paper-execution/approvals/requests/{approval_request_id}/decisions",
            json={
                "decision": "approved_for_paper_simulation",
                "reviewer_id": "risk-reviewer",
                "reviewer_role": "risk_reviewer",
                "decision_reason": "Risk approval for paper simulation only.",
                "paper_only": True,
            },
        )

        assert approval_response.status_code == 200
        approved = approval_response.json()
        assert approved["current_status"] == "approved_for_paper_simulation"
        assert approved["paper_simulation_approved"] is True
        assert approved["approval_for_live"] is False
        assert approved["broker_api_called"] is False
        assert approved["decisions"][1]["previous_chain_hash"] == (
            approved["decisions"][0]["decision_hash"]
        )

        history = client.get(
            f"/api/paper-execution/approvals/requests/{approval_request_id}/history"
        ).json()
        assert history["current_status"] == "approved_for_paper_simulation"

        all_history = client.get("/api/paper-execution/approvals/history").json()
        assert all_history[0]["request"]["approval_request_id"] == approval_request_id
    finally:
        get_settings.cache_clear()


def test_paper_approval_routes_reject_live_approval_and_invalid_sequence(
    tmp_path: Path,
    monkeypatch,
) -> None:
    db_path = tmp_path / "paper_approval.sqlite"
    monkeypatch.setenv("PAPER_EXECUTION_AUDIT_DB_PATH", str(db_path))
    get_settings.cache_clear()
    client = TestClient(app)

    try:
        queued = client.post(
            "/api/paper-execution/approvals/requests",
            json={
                "signal": _signal_payload(),
                "requester_id": "local-requester",
                "request_reason": "Queue route signal for invalid approval tests.",
            },
        ).json()
        approval_request_id = queued["request"]["approval_request_id"]

        invalid_sequence = client.post(
            f"/api/paper-execution/approvals/requests/{approval_request_id}/decisions",
            json={
                "decision": "approved_for_paper_simulation",
                "reviewer_id": "risk-reviewer",
                "reviewer_role": "risk_reviewer",
                "decision_reason": "Cannot approve without research review.",
            },
        )
        assert invalid_sequence.status_code == 400
        assert "prior research_approved" in invalid_sequence.json()["detail"]

        live_approval = client.post(
            f"/api/paper-execution/approvals/requests/{approval_request_id}/decisions",
            json={
                "decision": "research_approved",
                "reviewer_id": "research-reviewer",
                "reviewer_role": "research_reviewer",
                "decision_reason": "Unsafe live approval flag should fail.",
                "approval_for_live": True,
            },
        )
        assert live_approval.status_code == 422
    finally:
        get_settings.cache_clear()
