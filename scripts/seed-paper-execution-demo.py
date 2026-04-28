#!/usr/bin/env python3
from __future__ import annotations

import sys
from datetime import UTC, datetime
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[1]
BACKEND_ROOT = REPO_ROOT / "backend"
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

from app.core.config import get_settings  # noqa: E402
from app.domain.paper_execution import PaperExecutionWorkflowRequest  # noqa: E402
from app.domain.risk_rules import RiskPolicy  # noqa: E402
from app.domain.signals import StrategySignal  # noqa: E402
from app.services.paper_execution_store import PaperExecutionStore  # noqa: E402
from app.services.paper_execution_workflow import PaperExecutionWorkflow  # noqa: E402


def main() -> int:
    settings = get_settings()
    if (
        settings.trading_mode != "paper"
        or settings.enable_live_trading
        or settings.broker_provider != "paper"
    ):
        print(
            "Refusing to seed demo record because runtime settings are not "
            "paper-only.",
            file=sys.stderr,
        )
        return 2

    db_path = Path(settings.paper_execution_audit_db_path)
    if not db_path.is_absolute():
        db_path = REPO_ROOT / db_path

    risk_policy = RiskPolicy(
        trading_mode="paper",
        live_trading_enabled=False,
        broker_provider="paper",
        max_tx_equivalent_exposure=settings.max_tx_equivalent_exposure,
        max_daily_loss_twd=settings.max_daily_loss_twd,
        stale_quote_seconds=settings.stale_quote_seconds,
    )

    signal = StrategySignal(
        signal_id="demo-paper-execution-signal",
        strategy_id="demo-paper-strategy",
        strategy_version="0.1.0",
        timestamp=datetime.now(UTC),
        symbol_group="TAIEX_FUTURES",
        direction="LONG",
        target_tx_equivalent=0.05,
        confidence=0.75,
        stop_distance_points=20,
        reason={
            "signals_only": True,
            "order_created": False,
            "broker_api_called": False,
            "risk_engine_called": False,
            "oms_called": False,
            "demo_seed": True,
        },
    )
    request = PaperExecutionWorkflowRequest(
        signal=signal,
        approval_decision="approved_for_paper_simulation",
        reviewer_id="local-demo-reviewer",
        approval_reason=(
            "Local demo seed for the read-only Paper OMS / Audit Query Viewer."
        ),
        symbol="TMF",
        quantity=1,
        quote_age_seconds=0,
        broker_simulation="partial_fill",
        paper_only=True,
    )

    response = PaperExecutionWorkflow(risk_policy).preview(request)
    if (
        response.live_trading_enabled
        or response.broker_api_called
        or not response.paper_order_intent
        or not response.oms_state
    ):
        print("Refusing to persist unsafe or incomplete paper demo response.", file=sys.stderr)
        return 3

    persisted_response = response.model_copy(
        update={"persisted": True, "persistence_backend": "sqlite"}
    )
    run = PaperExecutionStore(db_path).persist_workflow(persisted_response)

    print("Paper execution demo seed created.")
    print(f"workflow_run_id={run.workflow_run_id}")
    print(f"order_id={run.order_id}")
    print(f"final_oms_status={run.final_oms_status}")
    print(f"db_path={db_path}")
    print("paper_only=True")
    print("live_trading_enabled=False")
    print("broker_api_called=False")
    print(
        "message=Local SQLite only. No FastAPI server, broker, external DB, "
        "or real order was used."
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
