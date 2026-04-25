from datetime import UTC, datetime
from typing import Any

from pydantic import BaseModel, Field


class PlatformEvent(BaseModel):
    event_id: str
    event_type: str
    source: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(UTC))
    payload: dict[str, Any] = Field(default_factory=dict)


class AuditEvent(BaseModel):
    audit_id: str
    actor: str
    action: str
    resource: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(UTC))
    paper_only: bool = True
    metadata: dict[str, Any] = Field(default_factory=dict)
