from __future__ import annotations

from enum import StrEnum
from typing import Literal

from pydantic import BaseModel, Field

from app.domain.paper_risk_state import PaperRiskState


class RiskRuleName(StrEnum):
    LIVE_TRADING_DISABLED = "LIVE_TRADING_DISABLED"
    MAX_EXPOSURE = "MAX_EXPOSURE"
    STALE_QUOTE = "STALE_QUOTE"
    IDEMPOTENCY_KEY_PRESENT = "IDEMPOTENCY_KEY_PRESENT"
    PAPER_ONLY_INTENT = "PAPER_ONLY_INTENT"
    PAPER_BROKER_ONLY = "PAPER_BROKER_ONLY"
    PRICE_REASONABILITY = "PRICE_REASONABILITY"
    MAX_ORDER_SIZE_BY_CONTRACT = "MAX_ORDER_SIZE_BY_CONTRACT"
    MARGIN_PROXY = "MARGIN_PROXY"
    DUPLICATE_ORDER_PREVENTION = "DUPLICATE_ORDER_PREVENTION"
    DAILY_LOSS_LIMIT = "DAILY_LOSS_LIMIT"
    POSITION_LIMIT = "POSITION_LIMIT"
    KILL_SWITCH = "KILL_SWITCH"
    BROKER_HEARTBEAT = "BROKER_HEARTBEAT"


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
    price_reasonability_band_pct: float = Field(default=0.02, ge=0)
    max_order_size_by_contract: dict[str, int] = Field(
        default_factory=lambda: {"TX": 1, "MTX": 4, "TMF": 20}
    )
    margin_proxy_per_tx_equivalent_twd: int = Field(default=200_000, ge=0)
    max_margin_proxy_twd: int = Field(default=50_000, ge=0)
    max_position_tx_equivalent: float = Field(default=0.25, ge=0)
    kill_switch_active: bool = False
    broker_heartbeat_healthy: bool = True


class PaperOrderIntent(BaseModel):
    order_id: str
    idempotency_key: str
    symbol: str
    side: Literal["BUY", "SELL"]
    quantity: int = Field(gt=0)
    tx_equivalent_exposure: float = Field(ge=0)
    quote_age_seconds: float = Field(default=0, ge=0)
    order_price: float | None = Field(default=None, gt=0)
    reference_price: float | None = Field(default=None, gt=0)
    paper_only: bool = True
    source_signal_id: str | None = None
    strategy_id: str | None = None
    strategy_version: str | None = None
    approval_id: str | None = None


def _contract_root(symbol: str) -> str:
    normalized = symbol.upper().strip()
    for root in ("TMF", "MTX", "TX"):
        if normalized == root or normalized.startswith(root):
            return root
    return normalized


def _is_price_reasonable(intent: PaperOrderIntent, policy: RiskPolicy) -> bool:
    if intent.order_price is None or intent.reference_price is None:
        return True
    allowed_deviation = intent.reference_price * policy.price_reasonability_band_pct
    return abs(intent.order_price - intent.reference_price) <= allowed_deviation


def _projected_position(intent: PaperOrderIntent, state: PaperRiskState) -> float:
    if intent.side == "BUY":
        return state.current_position_tx_equivalent + intent.tx_equivalent_exposure
    return state.current_position_tx_equivalent - intent.tx_equivalent_exposure


def evaluate_paper_order(
    intent: PaperOrderIntent,
    policy: RiskPolicy,
    state: PaperRiskState | None = None,
) -> RiskEvaluation:
    state = state or PaperRiskState()
    contract_root = _contract_root(intent.symbol)
    max_contract_size = policy.max_order_size_by_contract.get(contract_root, 0)
    margin_proxy = (
        intent.tx_equivalent_exposure * policy.margin_proxy_per_tx_equivalent_twd
    )
    projected_position = _projected_position(intent, state)
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
            name=RiskRuleName.PAPER_ONLY_INTENT,
            passed=intent.paper_only is True,
            message="Order intent must remain paper_only=true.",
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
        RiskCheckResult(
            name=RiskRuleName.PRICE_REASONABILITY,
            passed=_is_price_reasonable(intent, policy),
            message="Order price must stay within the paper price reasonability band.",
        ),
        RiskCheckResult(
            name=RiskRuleName.MAX_ORDER_SIZE_BY_CONTRACT,
            passed=max_contract_size > 0 and intent.quantity <= max_contract_size,
            message="Order quantity must not exceed the paper max size for this contract.",
        ),
        RiskCheckResult(
            name=RiskRuleName.MARGIN_PROXY,
            passed=margin_proxy <= policy.max_margin_proxy_twd,
            message="Paper margin proxy must not exceed the configured max margin proxy.",
        ),
        RiskCheckResult(
            name=RiskRuleName.DUPLICATE_ORDER_PREVENTION,
            passed=intent.idempotency_key not in state.seen_idempotency_keys,
            message="Duplicate idempotency key is not allowed in paper risk evaluation.",
        ),
        RiskCheckResult(
            name=RiskRuleName.DAILY_LOSS_LIMIT,
            passed=state.daily_realized_loss_twd < policy.max_daily_loss_twd,
            message="Paper daily loss state has reached or exceeded the configured limit.",
        ),
        RiskCheckResult(
            name=RiskRuleName.POSITION_LIMIT,
            passed=abs(projected_position) <= policy.max_position_tx_equivalent,
            message="Projected paper position exceeds the configured position limit.",
        ),
        RiskCheckResult(
            name=RiskRuleName.KILL_SWITCH,
            passed=not state.kill_switch_active and not policy.kill_switch_active,
            message="Paper kill switch is active.",
        ),
        RiskCheckResult(
            name=RiskRuleName.BROKER_HEARTBEAT,
            passed=state.broker_heartbeat_healthy and policy.broker_heartbeat_healthy,
            message="Simulated paper broker heartbeat is unhealthy.",
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
