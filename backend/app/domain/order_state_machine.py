from datetime import UTC, datetime
from enum import StrEnum
from typing import Any

from pydantic import BaseModel, Field


class OrderStatus(StrEnum):
    PENDING = "PENDING"
    NEW = "NEW"
    RISK_CHECKED = "RISK_CHECKED"
    SUBMITTED = "SUBMITTED"
    ACCEPTED = "ACCEPTED"
    PARTIALLY_FILLED = "PARTIALLY_FILLED"
    FILLED = "FILLED"
    CANCEL_REQUESTED = "CANCEL_REQUESTED"
    CANCELLED = "CANCELLED"
    REJECTED = "REJECTED"
    EXPIRED = "EXPIRED"
    UNKNOWN_NEEDS_RECONCILIATION = "UNKNOWN_NEEDS_RECONCILIATION"


class OrderEventType(StrEnum):
    CREATE = "CREATE"
    RISK_APPROVE = "RISK_APPROVE"
    RISK_REJECT = "RISK_REJECT"
    SUBMIT = "SUBMIT"
    ACKNOWLEDGE = "ACKNOWLEDGE"
    PARTIAL_FILL = "PARTIAL_FILL"
    FILL = "FILL"
    CANCEL_REQUEST = "CANCEL_REQUEST"
    CANCEL = "CANCEL"
    REJECT = "REJECT"
    EXPIRE = "EXPIRE"
    MARK_UNKNOWN = "MARK_UNKNOWN"


class OrderEvent(BaseModel):
    event_id: str
    order_id: str
    event_type: OrderEventType
    timestamp: datetime = Field(default_factory=lambda: datetime.now(UTC))
    reason: str | None = None
    payload: dict[str, Any] = Field(default_factory=dict)


class OrderState(BaseModel):
    order_id: str
    idempotency_key: str
    status: OrderStatus
    history: list[OrderEvent] = Field(default_factory=list)


EVENT_TARGET_STATUS: dict[OrderEventType, OrderStatus] = {
    OrderEventType.CREATE: OrderStatus.NEW,
    OrderEventType.RISK_APPROVE: OrderStatus.RISK_CHECKED,
    OrderEventType.RISK_REJECT: OrderStatus.REJECTED,
    OrderEventType.SUBMIT: OrderStatus.SUBMITTED,
    OrderEventType.ACKNOWLEDGE: OrderStatus.ACCEPTED,
    OrderEventType.PARTIAL_FILL: OrderStatus.PARTIALLY_FILLED,
    OrderEventType.FILL: OrderStatus.FILLED,
    OrderEventType.CANCEL_REQUEST: OrderStatus.CANCEL_REQUESTED,
    OrderEventType.CANCEL: OrderStatus.CANCELLED,
    OrderEventType.REJECT: OrderStatus.REJECTED,
    OrderEventType.EXPIRE: OrderStatus.EXPIRED,
    OrderEventType.MARK_UNKNOWN: OrderStatus.UNKNOWN_NEEDS_RECONCILIATION,
}


ALLOWED_TRANSITIONS: dict[OrderStatus, set[OrderEventType]] = {
    OrderStatus.PENDING: {OrderEventType.CREATE, OrderEventType.RISK_REJECT},
    OrderStatus.NEW: {
        OrderEventType.RISK_APPROVE,
        OrderEventType.RISK_REJECT,
        OrderEventType.CANCEL_REQUEST,
        OrderEventType.REJECT,
        OrderEventType.EXPIRE,
    },
    OrderStatus.RISK_CHECKED: {
        OrderEventType.SUBMIT,
        OrderEventType.CANCEL_REQUEST,
        OrderEventType.REJECT,
        OrderEventType.EXPIRE,
    },
    OrderStatus.SUBMITTED: {
        OrderEventType.ACKNOWLEDGE,
        OrderEventType.CANCEL_REQUEST,
        OrderEventType.REJECT,
        OrderEventType.EXPIRE,
    },
    OrderStatus.ACCEPTED: {
        OrderEventType.PARTIAL_FILL,
        OrderEventType.FILL,
        OrderEventType.CANCEL_REQUEST,
        OrderEventType.REJECT,
        OrderEventType.EXPIRE,
    },
    OrderStatus.PARTIALLY_FILLED: {
        OrderEventType.PARTIAL_FILL,
        OrderEventType.FILL,
        OrderEventType.CANCEL_REQUEST,
        OrderEventType.EXPIRE,
    },
    OrderStatus.CANCEL_REQUESTED: {OrderEventType.CANCEL, OrderEventType.REJECT},
    OrderStatus.FILLED: set(),
    OrderStatus.CANCELLED: set(),
    OrderStatus.REJECTED: set(),
    OrderStatus.EXPIRED: set(),
    OrderStatus.UNKNOWN_NEEDS_RECONCILIATION: set(),
}


def new_order_state(order_id: str, idempotency_key: str) -> OrderState:
    if not idempotency_key.strip():
        raise ValueError("idempotency_key is required")
    return OrderState(
        order_id=order_id,
        idempotency_key=idempotency_key,
        status=OrderStatus.PENDING,
    )


def apply_order_event(state: OrderState, event: OrderEvent) -> OrderState:
    if event.order_id != state.order_id:
        raise ValueError("event.order_id does not match state.order_id")

    if event.event_type == OrderEventType.MARK_UNKNOWN:
        return state.model_copy(
            update={
                "status": OrderStatus.UNKNOWN_NEEDS_RECONCILIATION,
                "history": [*state.history, event],
            }
        )

    allowed_events = ALLOWED_TRANSITIONS[state.status]
    if event.event_type not in allowed_events:
        raise ValueError(
            f"Invalid OMS transition from {state.status} via {event.event_type}"
        )

    return state.model_copy(
        update={
            "status": EVENT_TARGET_STATUS[event.event_type],
            "history": [*state.history, event],
        }
    )
