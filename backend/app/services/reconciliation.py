from datetime import UTC, datetime
from typing import Literal

from pydantic import BaseModel, Field


class PositionSnapshot(BaseModel):
    source: Literal["platform", "broker"]
    positions: dict[str, int] = Field(default_factory=dict)
    timestamp: datetime = Field(default_factory=lambda: datetime.now(UTC))


class ReconciliationResult(BaseModel):
    matched: bool
    differences: dict[str, dict[str, int]]
    locked: bool
    message: str


class ReconciliationService:
    def compare(
        self,
        platform: PositionSnapshot,
        broker: PositionSnapshot,
    ) -> ReconciliationResult:
        symbols = set(platform.positions) | set(broker.positions)
        differences: dict[str, dict[str, int]] = {}

        for symbol in sorted(symbols):
            platform_qty = platform.positions.get(symbol, 0)
            broker_qty = broker.positions.get(symbol, 0)
            if platform_qty != broker_qty:
                differences[symbol] = {
                    "platform": platform_qty,
                    "broker": broker_qty,
                }

        matched = not differences
        return ReconciliationResult(
            matched=matched,
            differences=differences,
            locked=not matched,
            message=(
                "Paper-only simulated reconciliation. No real broker position was queried."
            ),
        )
