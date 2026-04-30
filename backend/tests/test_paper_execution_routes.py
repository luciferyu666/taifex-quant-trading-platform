import sqlite3
from datetime import UTC, datetime, timedelta
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


def test_paper_broker_simulation_preview_uses_local_snapshot_only() -> None:
    client = TestClient(app)

    response = client.post(
        "/api/paper-execution/broker-simulation/preview",
        json={
            "intent": {
                "order_id": "paper-order-route-simulation",
                "idempotency_key": "paper-idem-route-simulation",
                "symbol": "TMF",
                "side": "BUY",
                "quantity": 3,
                "tx_equivalent_exposure": 0.05,
                "paper_only": True,
            },
            "simulation": {
                "market_snapshot": {
                    "symbol": "TMF",
                    "bid_price": 19999,
                    "ask_price": 20000,
                    "last_price": 19999.5,
                    "bid_size": 5,
                    "ask_size": 2,
                    "quote_age_seconds": 0,
                    "liquidity_score": 1,
                    "paper_only": True,
                },
                "order_type": "MARKET",
                "paper_only": True,
            },
            "paper_only": True,
        },
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["simulation_outcome"] == "partial_fill"
    assert payload["simulated_fill_quantity"] == 2
    assert payload["remaining_quantity"] == 1
    assert payload["broker_api_called"] is False
    assert payload["external_market_data_downloaded"] is False
    assert payload["production_execution_model"] is False


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


def test_paper_execution_timeout_preview_and_mark_are_paper_only(
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
        workflow_run_id = payload["workflow_run_id"]
        order_id = payload["paper_order_intent"]["order_id"]
        assert payload["oms_state"]["status"] == "PARTIALLY_FILLED"
        old_persisted_at = datetime.now(UTC) - timedelta(seconds=120)
        with sqlite3.connect(db_path) as connection:
            connection.execute(
                """
                UPDATE paper_execution_runs
                SET persisted_at = ?
                WHERE workflow_run_id = ?
                """,
                (old_persisted_at.isoformat(), workflow_run_id),
            )

        timeout_payload = {
            "workflow_run_id": workflow_run_id,
            "order_id": order_id,
            "timeout_seconds": 30,
            "actor_id": "route-timeout-reviewer",
            "reason": "Route test explicit paper timeout mark.",
            "paper_only": True,
        }
        preview = client.post(
            "/api/paper-execution/reliability/timeout-preview",
            json=timeout_payload,
        )
        assert preview.status_code == 200
        preview_payload = preview.json()
        assert preview_payload["persisted"] is False
        assert preview_payload["previous_status"] == "PARTIALLY_FILLED"
        assert preview_payload["new_status"] == "EXPIRED"
        assert preview_payload["paper_only"] is True
        assert preview_payload["live_trading_enabled"] is False
        assert preview_payload["broker_api_called"] is False
        assert preview_payload["production_oms_ready"] is False

        run_before_mark = client.get(f"/api/paper-execution/runs/{workflow_run_id}")
        assert run_before_mark.json()["final_oms_status"] == "PARTIALLY_FILLED"

        marked = client.post(
            "/api/paper-execution/reliability/timeout-mark",
            json=timeout_payload,
        )
        assert marked.status_code == 200
        marked_payload = marked.json()
        assert marked_payload["persisted"] is True
        assert marked_payload["new_status"] == "EXPIRED"
        assert marked_payload["oms_event"]["event_type"] == "EXPIRE"
        assert marked_payload["audit_event"]["action"] == (
            "paper_execution.timeout_marked"
        )
        assert marked_payload["execution_report"]["execution_type"] == "EXPIRE"
        assert marked_payload["execution_report"]["broker_api_called"] is False

        run_after_mark = client.get(f"/api/paper-execution/runs/{workflow_run_id}")
        assert run_after_mark.json()["final_oms_status"] == "EXPIRED"

        reports = client.get(
            f"/api/paper-execution/orders/{order_id}/execution-reports"
        ).json()
        assert reports[-1]["execution_type"] == "EXPIRE"
        assert reports[-1]["paper_only"] is True
        assert reports[-1]["broker_api_called"] is False

        audit_events = client.get(
            f"/api/paper-execution/runs/{workflow_run_id}/audit-events"
        ).json()
        assert any(
            event["action"] == "paper_execution.timeout_marked"
            for event in audit_events
        )

        second_mark = client.post(
            "/api/paper-execution/reliability/timeout-mark",
            json=timeout_payload,
        )
        assert second_mark.status_code == 400
        assert "nonterminal OMS status" in second_mark.json()["detail"]
    finally:
        get_settings.cache_clear()
