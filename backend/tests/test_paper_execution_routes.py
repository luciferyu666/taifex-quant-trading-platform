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


def _create_approval_request(
    client: TestClient,
    signal: dict[str, object],
) -> str:
    response = client.post(
        "/api/paper-execution/approvals/requests",
        json={
            "signal": signal,
            "requester_id": "paper-execution-route-requester",
            "request_reason": "Route test approval request for paper simulation.",
            "paper_only": True,
        },
    )
    assert response.status_code == 200
    return response.json()["request"]["approval_request_id"]


def _create_approved_approval_request(
    client: TestClient,
    signal: dict[str, object],
) -> str:
    approval_request_id = _create_approval_request(client, signal)
    research = client.post(
        f"/api/paper-execution/approvals/requests/{approval_request_id}/decisions",
        json={
            "decision": "research_approved",
            "reviewer_id": "paper-execution-research-reviewer",
            "reviewer_role": "research_reviewer",
            "decision_reason": "Research approved for route paper simulation.",
            "paper_only": True,
        },
    )
    assert research.status_code == 200
    risk = client.post(
        f"/api/paper-execution/approvals/requests/{approval_request_id}/decisions",
        json={
            "decision": "approved_for_paper_simulation",
            "reviewer_id": "paper-execution-risk-reviewer",
            "reviewer_role": "risk_reviewer",
            "decision_reason": "Risk approved for paper simulation only.",
            "paper_only": True,
        },
    )
    assert risk.status_code == 200
    return approval_request_id


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


def test_paper_execution_cors_allows_command_center_without_credentials() -> None:
    client = TestClient(app)

    response = client.options(
        "/api/paper-execution/workflow/record",
        headers={
            "Origin": "https://taifex-quant-trading-platform-front.vercel.app",
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "content-type",
        },
    )

    assert response.status_code == 200
    assert (
        response.headers["access-control-allow-origin"]
        == "https://taifex-quant-trading-platform-front.vercel.app"
    )
    assert "access-control-allow-credentials" not in response.headers


def test_paper_execution_workflow_preview_runs_full_paper_path(
    tmp_path: Path,
    monkeypatch,
) -> None:
    monkeypatch.setenv("PAPER_EXECUTION_AUDIT_DB_PATH", str(tmp_path / "paper.sqlite"))
    get_settings.cache_clear()
    client = TestClient(app)
    try:
        signal = _signal_payload()
        approval_request_id = _create_approved_approval_request(client, signal)

        response = client.post(
            "/api/paper-execution/workflow/preview",
            json={
                "signal": signal,
                "approval_request_id": approval_request_id,
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
        assert payload["approval"]["approval_id"] == approval_request_id
        assert payload["paper_order_intent"]["paper_only"] is True
        assert payload["risk_evaluation"]["approved"] is True
        assert payload["oms_state"]["status"] == "FILLED"
        assert payload["paper_broker_ack"]["broker_provider"] == "paper"
        assert "No real order was placed" in payload["message"]
        assert len(payload["audit_events"]) >= 4
    finally:
        get_settings.cache_clear()


def test_paper_execution_workflow_preview_rejects_unapproved_request(
    tmp_path: Path,
    monkeypatch,
) -> None:
    monkeypatch.setenv("PAPER_EXECUTION_AUDIT_DB_PATH", str(tmp_path / "paper.sqlite"))
    get_settings.cache_clear()
    client = TestClient(app)
    try:
        signal = _signal_payload()
        approval_request_id = _create_approval_request(client, signal)

        response = client.post(
            "/api/paper-execution/workflow/preview",
            json={
                "signal": signal,
                "approval_request_id": approval_request_id,
            },
        )

        assert response.status_code == 400
        assert "approved_for_paper_simulation" in response.json()["detail"]
    finally:
        get_settings.cache_clear()


def test_paper_execution_workflow_preview_rejects_unsafe_signal(
    tmp_path: Path,
    monkeypatch,
) -> None:
    monkeypatch.setenv("PAPER_EXECUTION_AUDIT_DB_PATH", str(tmp_path / "paper.sqlite"))
    get_settings.cache_clear()
    client = TestClient(app)
    try:
        signal = _signal_payload()
        approval_request_id = _create_approved_approval_request(client, signal)
        signal["reason"] = {"signals_only": False}

        response = client.post(
            "/api/paper-execution/workflow/preview",
            json={
                "signal": signal,
                "approval_request_id": approval_request_id,
            },
        )

        assert response.status_code == 400
        assert "signals_only=true" in response.json()["detail"]
    finally:
        get_settings.cache_clear()


def test_paper_execution_workflow_record_persists_and_exposes_query_endpoints(
    tmp_path: Path,
    monkeypatch,
) -> None:
    db_path = tmp_path / "paper_execution_audit.sqlite"
    monkeypatch.setenv("PAPER_EXECUTION_AUDIT_DB_PATH", str(db_path))
    get_settings.cache_clear()
    client = TestClient(app)

    try:
        signal = _signal_payload()
        approval_request_id = _create_approved_approval_request(client, signal)
        response = client.post(
            "/api/paper-execution/workflow/record",
            json={
                "signal": signal,
                "approval_request_id": approval_request_id,
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
        assert status["execution_reports_count"] == 2
        assert status["outbox_items_count"] == 1
        assert status["idempotency_keys_count"] == 1
        assert status["production_oms_ready"] is False

        reliability_status = client.get(
            "/api/paper-execution/reliability/status"
        ).json()
        assert reliability_status["paper_only"] is True
        assert reliability_status["production_oms_ready"] is False
        assert reliability_status["async_order_processing_enabled"] is False
        assert reliability_status["durable_outbox_metadata_enabled"] is True
        assert reliability_status["duplicate_order_prevention_enabled"] is True
        assert reliability_status["execution_report_model_enabled"] is True
        assert reliability_status["outbox_items_count"] == 1

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

        execution_reports = client.get(
            f"/api/paper-execution/orders/{order_id}/execution-reports"
        ).json()
        assert [report["execution_type"] for report in execution_reports] == [
            "ACKNOWLEDGED",
            "FILL",
        ]
        assert execution_reports[-1]["cumulative_filled_quantity"] == 1
        assert execution_reports[-1]["leaves_quantity"] == 0
        assert execution_reports[-1]["paper_only"] is True
        assert execution_reports[-1]["broker_api_called"] is False

        outbox_items = client.get("/api/paper-execution/outbox").json()
        assert len(outbox_items) == 1
        assert outbox_items[0]["status"] == "completed"
        assert outbox_items[0]["paper_only"] is True
        assert outbox_items[0]["broker_api_called"] is False

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


def test_paper_execution_timeout_candidates_are_read_only(
    tmp_path: Path,
    monkeypatch,
) -> None:
    db_path = tmp_path / "paper_execution_audit.sqlite"
    monkeypatch.setenv("PAPER_EXECUTION_AUDIT_DB_PATH", str(db_path))
    get_settings.cache_clear()
    client = TestClient(app)

    try:
        signal = _signal_payload()
        approval_request_id = _create_approved_approval_request(client, signal)
        response = client.post(
            "/api/paper-execution/workflow/record",
            json={
                "signal": signal,
                "approval_request_id": approval_request_id,
                "broker_simulation": "partial_fill",
            },
        )
        assert response.status_code == 200
        payload = response.json()
        assert payload["oms_state"]["status"] == "PARTIALLY_FILLED"

        timeout_candidates = client.get(
            "/api/paper-execution/reliability/timeout-candidates?timeout_seconds=1"
        ).json()

        assert timeout_candidates == []
    finally:
        get_settings.cache_clear()
