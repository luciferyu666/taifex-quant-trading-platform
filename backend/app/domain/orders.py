from datetime import UTC, datetime
from enum import StrEnum
from typing import Any

from pydantic import BaseModel, Field

from app.domain.risk import OrderIntent


class OrderStatus(StrEnum):
    CREATED = "CREATED"
    RISK_CHECKED = "RISK_CHECKED"
    SUBMITTED = "SUBMITTED"
    ACKNOWLEDGED = "ACKNOWLEDGED"
    PARTIALLY_FILLED = "PARTIALLY_FILLED"
    FILLED = "FILLED"
    CANCEL_REQUESTED = "CANCEL_REQUESTED"
    CANCELLED = "CANCELLED"
    REJECTED = "REJECTED"
    EXPIRED = "EXPIRED"
    UNKNOWN_NEEDS_RECONCILIATION = "UNKNOWN_NEEDS_RECONCILIATION"


class Order(BaseModel):
    order_id: str
    intent: OrderIntent
    status: OrderStatus = OrderStatus.CREATED
    paper_only: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(UTC))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(UTC))


class OrderEvent(BaseModel):
    order_id: str
    status: OrderStatus
    timestamp: datetime = Field(default_factory=lambda: datetime.now(UTC))
    message: str = ""
    details: dict[str, Any] = Field(default_factory=dict)
