from __future__ import annotations

from datetime import UTC, datetime
from typing import Any

from pydantic import BaseModel, Field


class PaperExecutionRunRecord(BaseModel):
    workflow_run_id: str
    approval_id: str
    approval_decision: str
    order_id: str | None = None
    source_signal_id: str | None = None
    strategy_id: str | None = None
    strategy_version: str | None = None
    final_oms_status: str | None = None
    paper_only: bool = True
    live_trading_enabled: bool = False
    broker_api_called: bool = False
    paper_broker_gateway_called: bool = False
    persisted_at: datetime = Field(default_factory=lambda: datetime.now(UTC))


class PaperOmsEventRecord(BaseModel):
    workflow_run_id: str
    order_id: str
    event_id: str
    sequence: int
    event_type: str
    status_after: str
    timestamp: datetime
    reason: str | None = None
    payload: dict[str, Any] = Field(default_factory=dict)


class PaperAuditEventRecord(BaseModel):
    workflow_run_id: str
    audit_id: str
    actor: str
    action: str
    resource: str
    timestamp: datetime
    paper_only: bool = True
    metadata: dict[str, Any] = Field(default_factory=dict)


class PaperExecutionPersistenceStatus(BaseModel):
    enabled: bool
    backend: str = "sqlite"
    db_path: str
    local_only: bool = True
    live_trading_enabled: bool = False
    broker_api_called: bool = False
    runs_count: int = 0
    oms_events_count: int = 0
    audit_events_count: int = 0
    execution_reports_count: int = 0
    outbox_items_count: int = 0
    idempotency_keys_count: int = 0
    production_oms_ready: bool = False
    message: str
