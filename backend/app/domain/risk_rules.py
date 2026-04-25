from enum import StrEnum
from typing import Literal

from pydantic import BaseModel, Field


class RiskRuleName(StrEnum):
    LIVE_TRADING_DISABLED = "LIVE_TRADING_DISABLED"
    MAX_EXPOSURE = "MAX_EXPOSURE"
    STALE_QUOTE = "STALE_QUOTE"
    IDEMPOTENCY_KEY_PRESENT = "IDEMPOTENCY_KEY_PRESENT"
    PAPER_BROKER_ONLY = "PAPER_BROKER_ONLY"


class RiskCheckResult(BaseModel):
    name: RiskRuleName
    passed: bool
    message: str


class RiskEvaluation(BaseModel):
    approved: bool
    checks: list[RiskCheckResult]
    reason: str


class RiskPolicy(BaseModel):
    trading_mode: str = "paper"
    live_trading_enabled: bool = False
    broker_provider: str = "paper"
    max_tx_equivalent_exposure: float = 0.25
    max_daily_loss_twd: int = 5000
    stale_quote_seconds: int = 3


class PaperOrderIntent(BaseModel):
    order_id: str
    idempotency_key: str
    symbol: str
    side: Literal["BUY", "SELL"]
    quantity: int = Field(gt=0)
    tx_equivalent_exposure: float = Field(ge=0)
    quote_age_seconds: float = Field(default=0, ge=0)


def evaluate_paper_order(intent: PaperOrderIntent, policy: RiskPolicy) -> RiskEvaluation:
    checks = [
        RiskCheckResult(
            name=RiskRuleName.LIVE_TRADING_DISABLED,
            passed=not policy.live_trading_enabled and policy.trading_mode == "paper",
            message="Live trading must be disabled and trading_mode must be paper.",
        ),
        RiskCheckResult(
            name=RiskRuleName.PAPER_BROKER_ONLY,
            passed=policy.broker_provider == "paper",
            message="Only the paper broker provider is allowed in this implementation.",
        ),
        RiskCheckResult(
            name=RiskRuleName.IDEMPOTENCY_KEY_PRESENT,
            passed=bool(intent.idempotency_key.strip()),
            message="Order intent must include an idempotency key.",
        ),
        RiskCheckResult(
            name=RiskRuleName.MAX_EXPOSURE,
            passed=intent.tx_equivalent_exposure <= policy.max_tx_equivalent_exposure,
            message="TX-equivalent exposure must not exceed the configured max exposure.",
        ),
        RiskCheckResult(
            name=RiskRuleName.STALE_QUOTE,
            passed=intent.quote_age_seconds <= policy.stale_quote_seconds,
            message="Quote age must not exceed the stale quote threshold.",
        ),
    ]

    failed = [check for check in checks if not check.passed]
    if failed:
        return RiskEvaluation(
            approved=False,
            checks=checks,
            reason=failed[0].message,
        )

    return RiskEvaluation(
        approved=True,
        checks=checks,
        reason="Approved for paper-only order simulation.",
    )
