from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, Field


class StrategySignal(BaseModel):
    signal_id: str
    strategy_id: str
    strategy_version: str
    timestamp: datetime
    symbol_group: str = "TAIEX_FUTURES"
    direction: Literal["LONG", "SHORT", "FLAT"]
    target_tx_equivalent: float = Field(ge=0)
    confidence: float = Field(ge=0, le=1)
    stop_distance_points: float | None = None
    reason: dict[str, Any] = Field(default_factory=dict)
