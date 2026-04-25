from dataclasses import dataclass, field
from datetime import UTC, datetime
from typing import Any, Literal
from uuid import uuid4


@dataclass(frozen=True)
class StrategySignal:
    strategy_id: str
    strategy_version: str
    direction: Literal["LONG", "SHORT", "FLAT"]
    target_tx_equivalent: float
    confidence: float
    symbol_group: str = "TAIEX_FUTURES"
    signal_id: str = field(default_factory=lambda: f"signal-{uuid4().hex}")
    timestamp: datetime = field(default_factory=lambda: datetime.now(UTC))
    stop_distance_points: float | None = None
    reason: dict[str, Any] = field(default_factory=dict)
