from typing import Literal

from pydantic import BaseModel, Field


class RiskConfig(BaseModel):
    max_tx_equivalent_exposure: float = Field(default=0.25, ge=0)
    max_daily_loss_twd: int = Field(default=5000, ge=0)
    stale_quote_seconds: int = Field(default=3, ge=0)
    live_trading_enabled: bool = False
    trading_mode: Literal["paper", "shadow", "live"] = "paper"
    broker_provider: str = "paper"


class OrderIntent(BaseModel):
    intent_id: str
    strategy_id: str
    symbol: str
    side: Literal["BUY", "SELL"]
    quantity: int = Field(gt=0)
    tx_equivalent_exposure: float = Field(ge=0)
    order_type: Literal["MARKET", "LIMIT"] = "MARKET"
    limit_price: float | None = None
    trading_mode: Literal["paper", "shadow"] = "paper"
    paper_only: bool = True


class RiskDecision(BaseModel):
    approved: bool
    reason: str
    checks: dict[str, bool]
