from datetime import UTC, datetime
from pathlib import Path

from fastapi.testclient import TestClient

from app.core.config import get_settings
from app.main import app


def _signal_payload(exposure: float = 0.05) -> dict[str, object]:
    return {
        "signal_id": "signal-paper-route",
        "strategy_id": "route-demo-strategy",
        "strategy_version": "0.1.0",
        "timestamp": datetime.now(UTC).isoformat(),
        "symbol_group": "TAIEX_FUTURES",
        "direction": "LONG",
        "target_tx_equivalent": exposure,
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


def test_paper_execution_status_is_paper_only() -> None:
    client = TestClient(app)

    response = client.get("/api/paper-execution/status")

    assert response.status_code == 200
    payload = response.json()
    assert payload["trading_mode"] == "paper"
    assert payload["live_trading_enabled"] is False
    assert payload["broker_provider"] == "paper"
    assert payload["broker_api_called"] is False
    assert "approved_for_paper_simulation" in payload["workflow_statuses"]
    assert payload["order_path"] == [
        "StrategySignal",
        "Platform PaperOrderIntent",
        "Risk Engine",
        "OMS",
        "Paper Broker Gateway",
        "Audit Event",
    ]


def test_paper_execution_workflow_preview_runs_full_paper_path() -> None:
    client = TestClient(app)

    response = client.post(
        "/api/paper-execution/workflow/preview",
        json={
            "signal": _signal_payload(),
            "approval_decision": "approved_for_paper_simulation",
            "approval_reason": "reviewed for paper simulation",
            "broker_simulation": "fill",
        },
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["paper_only"] is True
    assert payload["live_trading_enabled"] is False
    assert payload["broker_api_called"] is False
    assert payload["order_created"] is True
    assert payload["paper_broker_gateway_called"] is True
    assert payload["approval"]["approval_for_live"] is False
    assert payload["approval"]["approval_for_paper_simulation"] is True
    assert payload["paper_order_intent"]["paper_only"] is True
    assert payload["risk_evaluation"]["approved"] is True
    assert payload["oms_state"]["status"] == "FILLED"
    assert payload["paper_broker_ack"]["broker_provider"] == "paper"
    assert "No real order was placed" in payload["message"]
    assert len(payload["audit_events"]) >= 4


def test_paper_execution_workflow_preview_non_approved_decision_creates_no_order() -> None:
    client = TestClient(app)

    response = client.post(
        "/api/paper-execution/workflow/preview",
        json={
            "signal": _signal_payload(),
            "approval_decision": "needs_data_review",
            "approval_reason": "data version needs review",
        },
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["paper_only"] is True
    assert payload["order_created"] is False
    assert payload["paper_broker_gateway_called"] is False
    assert payload["paper_order_intent"] is None
    assert payload["risk_evaluation"] is None
    assert payload["oms_state"] is None
    assert payload["paper_broker_ack"] is None


def test_paper_execution_workflow_preview_rejects_unsafe_signal() -> None:
    client = TestClient(app)
    signal = _signal_payload()
    signal["reason"] = {"signals_only": False}

    response = client.post(
        "/api/paper-execution/workflow/preview",
        json={
            "signal": signal,
            "approval_decision": "approved_for_paper_simulation",
            "approval_reason": "unsafe signal",
        },
    )

    assert response.status_code == 400
    assert "signals_only=true" in response.json()["detail"]


def test_paper_execution_workflow_record_persists_and_exposes_query_endpoints(
    tmp_path: Path,
    monkeypatch,
) -> None:
    db_path = tmp_path / "paper_execution_audit.sqlite"
    monkeypatch.setenv("PAPER_EXECUTION_AUDIT_DB_PATH", str(db_path))
    get_settings.cache_clear()
    client = TestClient(app)

    try:
        response = client.post(
            "/api/paper-execution/workflow/record",
            json={
                "signal": _signal_payload(),
                "approval_decision": "approved_for_paper_simulation",
                "approval_reason": "record this paper simulation",
                "broker_simulation": "fill",
            },
        )

        assert response.status_code == 200
        payload = response.json()
        workflow_run_id = payload["workflow_run_id"]
        order_id = payload["paper_order_intent"]["order_id"]
        assert payload["persisted"] is True
        assert payload["persistence_backend"] == "sqlite"
        assert db_path.exists()

        status = client.get("/api/paper-execution/persistence/status").json()
        assert status["enabled"] is True
        assert status["backend"] == "sqlite"
        assert status["local_only"] is True
        assert status["live_trading_enabled"] is False
        assert status["broker_api_called"] is False
        assert status["runs_count"] == 1

        runs = client.get("/api/paper-execution/runs").json()
        assert runs[0]["workflow_run_id"] == workflow_run_id
        assert runs[0]["final_oms_status"] == "FILLED"

        run = client.get(f"/api/paper-execution/runs/{workflow_run_id}").json()
        assert run["workflow_run_id"] == workflow_run_id
        assert run["paper_only"] is True

        oms_events = client.get(
            f"/api/paper-execution/orders/{order_id}/oms-events"
        ).json()
        assert [event["event_type"] for event in oms_events] == [
            "CREATE",
            "RISK_APPROVE",
            "SUBMIT",
            "ACKNOWLEDGE",
            "FILL",
        ]

        audit_events = client.get(
            f"/api/paper-execution/runs/{workflow_run_id}/audit-events"
        ).json()
        assert len(audit_events) >= 4
        assert any(
            event["action"] == "paper_execution.paper_broker_simulated"
            for event in audit_events
        )
    finally:
        get_settings.cache_clear()
