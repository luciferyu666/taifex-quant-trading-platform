from __future__ import annotations

import hashlib
import json
from datetime import UTC, datetime
from typing import Any, Literal

from pydantic import BaseModel, Field, field_validator

from app.domain.order_state_machine import (
    EVENT_TARGET_STATUS,
    OrderEvent,
    OrderEventType,
    OrderState,
    OrderStatus,
)
from app.domain.paper_execution_records import (
    PaperAuditEventRecord,
    PaperOmsEventRecord,
)

ExecutionReportType = Literal[
    "ACKNOWLEDGED",
    "PARTIAL_FILL",
    "FILL",
    "REJECT",
    "CANCEL",
    "EXPIRE",
]

OutboxAction = Literal["paper_order_submit_recorded"]
OutboxStatus = Literal["pending", "processing", "completed", "failed", "expired"]

TERMINAL_ORDER_STATUSES = {
    OrderStatus.FILLED,
    OrderStatus.CANCELLED,
    OrderStatus.REJECTED,
    OrderStatus.EXPIRED,
    OrderStatus.UNKNOWN_NEEDS_RECONCILIATION,
}


class PaperExecutionReport(BaseModel):
    report_id: str
    workflow_run_id: str
    order_id: str
    idempotency_key: str
    execution_type: ExecutionReportType
    order_status: str
    last_quantity: int = Field(ge=0)
    cumulative_filled_quantity: int = Field(ge=0)
    leaves_quantity: int = Field(ge=0)
    average_fill_price: float | None = None
    event_id: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(UTC))
    paper_only: bool = True
    live_trading_enabled: bool = False
    broker_api_called: bool = False
    payload: dict[str, Any] = Field(default_factory=dict)

    @field_validator("paper_only")
    @classmethod
    def require_paper_only(cls, value: bool) -> bool:
        if value is not True:
            raise ValueError("paper execution reports must remain paper_only=true")
        return value

    @field_validator("live_trading_enabled", "broker_api_called")
    @classmethod
    def require_false_safety_flags(cls, value: bool) -> bool:
        if value is not False:
            raise ValueError("paper execution reports must not enable live/broker paths")
        return value


class PaperOmsOutboxItem(BaseModel):
    outbox_id: str
    workflow_run_id: str
    order_id: str
    idempotency_key: str
    action: OutboxAction = "paper_order_submit_recorded"
    status: OutboxStatus = "completed"
    attempts: int = Field(default=1, ge=0)
    created_at: datetime = Field(default_factory=lambda: datetime.now(UTC))
    available_at: datetime = Field(default_factory=lambda: datetime.now(UTC))
    processed_at: datetime | None = Field(default_factory=lambda: datetime.now(UTC))
    paper_only: bool = True
    live_trading_enabled: bool = False
    broker_api_called: bool = False
    payload: dict[str, Any] = Field(default_factory=dict)

    @field_validator("paper_only")
    @classmethod
    def require_paper_only(cls, value: bool) -> bool:
        if value is not True:
            raise ValueError("paper OMS outbox items must remain paper_only=true")
        return value

    @field_validator("live_trading_enabled", "broker_api_called")
    @classmethod
    def require_false_safety_flags(cls, value: bool) -> bool:
        if value is not False:
            raise ValueError("paper OMS outbox items must not enable live/broker paths")
        return value


class PaperDuplicateOrderCheck(BaseModel):
    idempotency_key: str
    duplicate: bool
    existing_workflow_run_id: str | None = None
    existing_order_id: str | None = None
    requested_workflow_run_id: str | None = None
    requested_order_id: str | None = None
    paper_only: bool = True
    live_trading_enabled: bool = False
    broker_api_called: bool = False
    message: str


class PaperOrderTimeoutCandidate(BaseModel):
    workflow_run_id: str
    order_id: str
    final_oms_status: str
    persisted_at: datetime
    age_seconds: float
    timeout_seconds: int
    paper_only: bool = True
    live_trading_enabled: bool = False
    broker_api_called: bool = False
    message: str


class PaperOrderTimeoutMarkRequest(BaseModel):
    workflow_run_id: str = Field(min_length=1)
    order_id: str = Field(min_length=1)
    timeout_seconds: int = Field(default=30, ge=1, le=86_400)
    actor_id: str = Field(default="local-timeout-reviewer", min_length=1)
    reason: str = Field(
        default="Explicit paper-only timeout handling action.",
        min_length=1,
    )
    paper_only: bool = True

    @field_validator("paper_only")
    @classmethod
    def require_paper_only(cls, value: bool) -> bool:
        if value is not True:
            raise ValueError("paper timeout handling must remain paper_only=true")
        return value


class PaperOrderTimeoutMarkResponse(BaseModel):
    workflow_run_id: str
    order_id: str
    previous_status: str
    new_status: str
    timeout_seconds: int
    age_seconds: float
    persisted: bool = False
    paper_only: bool = True
    live_trading_enabled: bool = False
    broker_api_called: bool = False
    production_oms_ready: bool = False
    oms_event: PaperOmsEventRecord
    audit_event: PaperAuditEventRecord
    execution_report: PaperExecutionReport
    warnings: list[str] = Field(default_factory=list)
    message: str

    @field_validator("paper_only")
    @classmethod
    def require_paper_only(cls, value: bool) -> bool:
        if value is not True:
            raise ValueError("paper timeout mark response must remain paper_only=true")
        return value

    @field_validator(
        "live_trading_enabled",
        "broker_api_called",
        "production_oms_ready",
    )
    @classmethod
    def require_false_safety_flags(cls, value: bool) -> bool:
        if value is not False:
            raise ValueError("paper timeout handling must not enable live/broker paths")
        return value


class PaperOmsReliabilityStatus(BaseModel):
    paper_only: bool = True
    live_trading_enabled: bool = False
    broker_api_called: bool = False
    production_oms_ready: bool = False
    local_sqlite_only: bool = True
    async_order_processing_enabled: bool = False
    durable_outbox_metadata_enabled: bool = True
    duplicate_order_prevention_enabled: bool = True
    timeout_candidate_scan_enabled: bool = True
    execution_report_model_enabled: bool = True
    amend_replace_enabled: bool = False
    reconciliation_loop_enabled: bool = False
    outbox_items_count: int = 0
    idempotency_keys_count: int = 0
    execution_reports_count: int = 0
    timeout_candidates_count: int = 0
    known_gaps: list[str] = Field(default_factory=list)
    message: str


def build_execution_reports(
    *,
    workflow_run_id: str,
    order_state: OrderState,
) -> list[PaperExecutionReport]:
    reports: list[PaperExecutionReport] = []
    status = OrderStatus.PENDING
    cumulative_filled_quantity = 0
    for event in order_state.history:
        status = _status_after_event(status, event)
        execution_type = _execution_type_for_event(event.event_type)
        if execution_type is None:
            continue

        last_quantity = _safe_int(event.payload.get("last_quantity"))
        cumulative_filled_quantity = _safe_int(
            event.payload.get("cumulative_filled_quantity"),
            default=cumulative_filled_quantity + last_quantity,
        )
        leaves_quantity = _safe_int(event.payload.get("leaves_quantity"))
        report_core = {
            "workflow_run_id": workflow_run_id,
            "order_id": order_state.order_id,
            "event_id": event.event_id,
            "execution_type": execution_type,
            "paper_only": True,
        }
        reports.append(
            PaperExecutionReport(
                report_id=f"paper-exec-report-{_sha256_json(report_core)[:16]}",
                workflow_run_id=workflow_run_id,
                order_id=order_state.order_id,
                idempotency_key=order_state.idempotency_key,
                execution_type=execution_type,
                order_status=str(status),
                last_quantity=last_quantity,
                cumulative_filled_quantity=cumulative_filled_quantity,
                leaves_quantity=leaves_quantity,
                average_fill_price=event.payload.get("average_fill_price"),
                event_id=event.event_id,
                timestamp=event.timestamp,
                paper_only=True,
                live_trading_enabled=False,
                broker_api_called=False,
                payload=event.payload,
            )
        )
    return reports


def build_outbox_item(
    *,
    workflow_run_id: str,
    order_id: str,
    idempotency_key: str,
    payload: dict[str, Any],
) -> PaperOmsOutboxItem:
    outbox_core = {
        "workflow_run_id": workflow_run_id,
        "order_id": order_id,
        "idempotency_key": idempotency_key,
        "action": "paper_order_submit_recorded",
        "paper_only": True,
    }
    return PaperOmsOutboxItem(
        outbox_id=f"paper-oms-outbox-{_sha256_json(outbox_core)[:16]}",
        workflow_run_id=workflow_run_id,
        order_id=order_id,
        idempotency_key=idempotency_key,
        payload=payload,
    )


def build_timeout_execution_report(
    *,
    workflow_run_id: str,
    order_id: str,
    idempotency_key: str,
    event: OrderEvent,
    previous_report: PaperExecutionReport | None = None,
) -> PaperExecutionReport:
    cumulative_filled_quantity = (
        previous_report.cumulative_filled_quantity if previous_report else 0
    )
    leaves_quantity = previous_report.leaves_quantity if previous_report else 0
    report_core = {
        "workflow_run_id": workflow_run_id,
        "order_id": order_id,
        "event_id": event.event_id,
        "execution_type": "EXPIRE",
        "paper_only": True,
    }
    return PaperExecutionReport(
        report_id=f"paper-exec-report-{_sha256_json(report_core)[:16]}",
        workflow_run_id=workflow_run_id,
        order_id=order_id,
        idempotency_key=idempotency_key,
        execution_type="EXPIRE",
        order_status=str(OrderStatus.EXPIRED),
        last_quantity=0,
        cumulative_filled_quantity=cumulative_filled_quantity,
        leaves_quantity=leaves_quantity,
        event_id=event.event_id,
        timestamp=event.timestamp,
        paper_only=True,
        live_trading_enabled=False,
        broker_api_called=False,
        payload={
            "last_quantity": 0,
            "cumulative_filled_quantity": cumulative_filled_quantity,
            "leaves_quantity": leaves_quantity,
            "paper_only": True,
            "timeout_mark": True,
            "note": (
                "Explicit local paper timeout metadata only. No broker was called "
                "and this is not a production execution report."
            ),
        },
    )


def is_terminal_status(status: str | OrderStatus | None) -> bool:
    if status is None:
        return False
    try:
        order_status = OrderStatus(str(status))
    except ValueError:
        return False
    return order_status in TERMINAL_ORDER_STATUSES


def _status_after_event(current_status: OrderStatus, event: OrderEvent) -> OrderStatus:
    if event.event_type == OrderEventType.MARK_UNKNOWN:
        return OrderStatus.UNKNOWN_NEEDS_RECONCILIATION
    return EVENT_TARGET_STATUS[event.event_type]


def _execution_type_for_event(event_type: OrderEventType) -> ExecutionReportType | None:
    mapping: dict[OrderEventType, ExecutionReportType] = {
        OrderEventType.ACKNOWLEDGE: "ACKNOWLEDGED",
        OrderEventType.PARTIAL_FILL: "PARTIAL_FILL",
        OrderEventType.FILL: "FILL",
        OrderEventType.REJECT: "REJECT",
        OrderEventType.CANCEL: "CANCEL",
        OrderEventType.EXPIRE: "EXPIRE",
    }
    return mapping.get(event_type)


def _safe_int(value: Any, default: int = 0) -> int:
    try:
        return int(value)
    except (TypeError, ValueError):
        return default


def _sha256_json(payload: dict[str, Any]) -> str:
    encoded = json.dumps(payload, sort_keys=True, separators=(",", ":")).encode("utf-8")
    return hashlib.sha256(encoded).hexdigest()
