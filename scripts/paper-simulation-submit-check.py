#!/usr/bin/env python3
from __future__ import annotations

import argparse
import os
import sys
import tempfile
from datetime import UTC, datetime
from pathlib import Path
from typing import Any


REPO_ROOT = Path(__file__).resolve().parents[1]
BACKEND_ROOT = REPO_ROOT / "backend"
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

from fastapi.testclient import TestClient  # noqa: E402

from app.core.config import get_settings  # noqa: E402
from app.main import app  # noqa: E402


def main() -> int:
    parser = argparse.ArgumentParser(
        description=(
            "Run a local Paper Only submit UX drill through /api/paper-execution/"
            "workflow/record and verify queryable OMS/audit events."
        )
    )
    parser.add_argument(
        "--db-path",
        help=(
            "Optional local SQLite path to keep the generated paper workflow record. "
            "If omitted, a temporary SQLite file is used and removed after the check."
        ),
    )
    args = parser.parse_args()

    if args.db_path:
        db_path = Path(args.db_path)
        if not db_path.is_absolute():
            db_path = REPO_ROOT / db_path
        return run_drill(db_path)

    with tempfile.TemporaryDirectory(prefix="paper-submit-check-") as temp_dir:
        return run_drill(Path(temp_dir) / "paper_execution_audit.sqlite")


def run_drill(db_path: Path) -> int:
    os.environ["TRADING_MODE"] = "paper"
    os.environ["ENABLE_LIVE_TRADING"] = "false"
    os.environ["BROKER_PROVIDER"] = "paper"
    os.environ["PAPER_EXECUTION_AUDIT_DB_PATH"] = str(db_path)
    get_settings.cache_clear()

    client = TestClient(app)
    payload = build_ui_like_payload()

    response = client.post("/api/paper-execution/workflow/record", json=payload)
    require(
        response.status_code == 200,
        f"workflow record returned {response.status_code}",
    )
    workflow = response.json()

    require(workflow["paper_only"] is True, "workflow response must be paper_only=true")
    require(
        workflow["live_trading_enabled"] is False,
        "workflow response must keep live_trading_enabled=false",
    )
    require(
        workflow["broker_api_called"] is False,
        "workflow response must keep broker_api_called=false",
    )
    require(workflow["persisted"] is True, "workflow response must be persisted")
    require(
        workflow["persistence_backend"] == "sqlite",
        "workflow persistence backend must be sqlite",
    )
    require(
        workflow["approval"]["approval_for_live"] is False,
        "approval_for_live must remain false",
    )
    require(
        workflow["approval"]["approval_for_paper_simulation"] is True,
        "approval_for_paper_simulation must be true for this drill",
    )
    require(
        workflow["paper_order_intent"]["paper_only"] is True,
        "paper order intent must be paper_only=true",
    )
    require(
        workflow["risk_evaluation"]["approved"] is True,
        "risk evaluation must approve bounded paper drill payload",
    )

    workflow_run_id = workflow["workflow_run_id"]
    order_id = workflow["paper_order_intent"]["order_id"]
    final_status = workflow["oms_state"]["status"]
    require(workflow_run_id, "workflow_run_id must be present")
    require(order_id, "order_id must be present")

    status = client.get("/api/paper-execution/persistence/status").json()
    require(status["enabled"] is True, "persistence status must be enabled")
    require(status["local_only"] is True, "persistence must remain local_only=true")
    require(
        status["live_trading_enabled"] is False,
        "persistence status must keep live_trading_enabled=false",
    )
    require(
        status["broker_api_called"] is False,
        "persistence status must keep broker_api_called=false",
    )

    run_response = client.get(f"/api/paper-execution/runs/{workflow_run_id}")
    require(run_response.status_code == 200, "workflow run must be queryable")
    run = run_response.json()
    require(run["workflow_run_id"] == workflow_run_id, "queried run id mismatch")
    require(run["order_id"] == order_id, "queried run order id mismatch")
    require(run["paper_only"] is True, "queried run must be paper_only=true")
    require(
        run["live_trading_enabled"] is False,
        "queried run must keep live_trading_enabled=false",
    )
    require(run["broker_api_called"] is False, "queried run must not call broker APIs")

    oms_by_run = client.get(f"/api/paper-execution/runs/{workflow_run_id}/oms-events")
    require(oms_by_run.status_code == 200, "OMS events by workflow must be queryable")
    oms_events = oms_by_run.json()
    require_oms_events(oms_events)

    oms_by_order = client.get(f"/api/paper-execution/orders/{order_id}/oms-events")
    require(oms_by_order.status_code == 200, "OMS events by order must be queryable")
    require(
        [event["event_type"] for event in oms_by_order.json()]
        == [event["event_type"] for event in oms_events],
        "OMS events by order must match OMS events by workflow",
    )

    audit_response = client.get(
        f"/api/paper-execution/runs/{workflow_run_id}/audit-events"
    )
    require(audit_response.status_code == 200, "audit events must be queryable")
    audit_events = audit_response.json()
    require_audit_events(audit_events)

    all_audit_response = client.get("/api/paper-execution/audit-events")
    require(all_audit_response.status_code == 200, "global audit event query must work")
    require(
        any(event["resource"] == order_id for event in all_audit_response.json()),
        "global audit event query must include the paper order",
    )

    print("Paper simulation submit UX audit trace drill passed.")
    print(f"workflow_run_id={workflow_run_id}")
    print(f"order_id={order_id}")
    print(f"final_oms_status={final_status}")
    print(f"oms_events_count={len(oms_events)}")
    print(f"audit_events_count={len(audit_events)}")
    print(f"db_path={db_path}")
    print("endpoint=/api/paper-execution/workflow/record")
    print("paper_only=True")
    print("live_trading_enabled=False")
    print("broker_api_called=False")
    print(
        "message=Local SQLite paper simulation only. No broker, credentials, "
        "live approval, or real order path was used."
    )
    return 0


def build_ui_like_payload() -> dict[str, Any]:
    return {
        "signal": {
            "signal_id": "ui-paper-submit-drill-signal",
            "strategy_id": "ui-paper-submit-drill",
            "strategy_version": "0.1.0",
            "timestamp": datetime.now(UTC).isoformat(),
            "symbol_group": "TAIEX_FUTURES",
            "direction": "LONG",
            "target_tx_equivalent": 0.05,
            "confidence": 0.74,
            "stop_distance_points": 20,
            "reason": {
                "signals_only": True,
                "order_created": False,
                "broker_api_called": False,
                "risk_engine_called": False,
                "oms_called": False,
                "ui_source": "paper_simulation_controlled_submit",
                "drill": "paper_simulation_submit_ux_verification",
            },
        },
        "approval_decision": "approved_for_paper_simulation",
        "reviewer_id": "local-paper-submit-drill",
        "approval_reason": (
            "Paper Only UX verification drill for OMS and audit traceability."
        ),
        "symbol": "TMF",
        "quantity": 1,
        "quote_age_seconds": 0,
        "broker_simulation": "fill",
        "paper_only": True,
    }


def require_oms_events(events: list[dict[str, Any]]) -> None:
    event_types = [event["event_type"] for event in events]
    require(
        event_types == ["CREATE", "RISK_APPROVE", "SUBMIT", "ACKNOWLEDGE", "FILL"],
        f"unexpected OMS event sequence: {event_types}",
    )
    require(
        events[-1]["status_after"] == "FILLED",
        "final OMS event must leave order FILLED for this bounded drill",
    )


def require_audit_events(events: list[dict[str, Any]]) -> None:
    actions = {event["action"] for event in events}
    required_actions = {
        "paper_execution.approval_decision",
        "paper_execution.intent_created",
        "paper_execution.risk_evaluated",
        "paper_execution.paper_broker_simulated",
        "paper_execution.oms_lifecycle_recorded",
    }
    missing = sorted(required_actions - actions)
    require(not missing, f"missing audit actions: {', '.join(missing)}")
    require(
        all(event["paper_only"] is True for event in events),
        "all audit events must be paper_only=true",
    )


def require(condition: bool, message: str) -> None:
    if not condition:
        raise SystemExit(f"Paper simulation submit check failed: {message}")


if __name__ == "__main__":
    raise SystemExit(main())
