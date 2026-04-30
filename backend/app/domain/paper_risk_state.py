from __future__ import annotations

from datetime import UTC, datetime

from pydantic import BaseModel, Field


class PaperRiskState(BaseModel):
    """Local paper-only state used for guardrail evaluation previews."""

    seen_idempotency_keys: set[str] = Field(default_factory=set)
    daily_realized_loss_twd: int = Field(default=0, ge=0)
    current_position_tx_equivalent: float = 0
    kill_switch_active: bool = False
    broker_heartbeat_healthy: bool = True
    paper_only: bool = True
    live_trading_enabled: bool = False
    broker_api_called: bool = False
    updated_at: datetime = Field(default_factory=lambda: datetime.now(UTC))


def new_paper_risk_state() -> PaperRiskState:
    return PaperRiskState()
