from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends
from pydantic import BaseModel

from app.core.config import Settings, get_settings
from app.domain.paper_risk_state import PaperRiskState, new_paper_risk_state
from app.domain.risk_rules import (
    PaperOrderIntent,
    RiskEvaluation,
    RiskPolicy,
    RiskRuleName,
)
from app.services.risk_engine import PaperRiskEngine

router = APIRouter(prefix="/api/paper-risk", tags=["paper-risk"])
SettingsDep = Annotated[Settings, Depends(get_settings)]

_LOCAL_PAPER_RISK_STATE = new_paper_risk_state()


class PaperRiskStatusResponse(BaseModel):
    trading_mode: str
    live_trading_enabled: bool
    broker_provider: str
    paper_only: bool
    broker_api_called: bool
    state: PaperRiskState
    policy: RiskPolicy
    supported_checks: list[str]
    message: str


class PaperRiskEvaluationRequest(BaseModel):
    intent: PaperOrderIntent
    state: PaperRiskState | None = None
    policy: RiskPolicy | None = None
    use_local_state: bool = False
    paper_only: bool = True


def _risk_policy_from_settings(settings: Settings) -> RiskPolicy:
    return RiskPolicy(
        trading_mode=settings.trading_mode,
        live_trading_enabled=settings.live_trading_enabled,
        broker_provider=settings.broker_provider,
        max_tx_equivalent_exposure=settings.max_tx_equivalent_exposure,
        max_daily_loss_twd=settings.max_daily_loss_twd,
        stale_quote_seconds=settings.stale_quote_seconds,
    )


def _status_response(settings: Settings, state: PaperRiskState) -> PaperRiskStatusResponse:
    policy = _risk_policy_from_settings(settings)
    return PaperRiskStatusResponse(
        trading_mode=policy.trading_mode,
        live_trading_enabled=policy.live_trading_enabled,
        broker_provider=policy.broker_provider,
        paper_only=True,
        broker_api_called=False,
        state=state,
        policy=policy,
        supported_checks=[rule.value for rule in RiskRuleName],
        message=(
            "Paper risk guardrails are available for local simulation evaluation only. "
            "No broker, live trading, real order, or credential path is enabled."
        ),
    )


@router.get("/status", response_model=PaperRiskStatusResponse)
def paper_risk_status(settings: SettingsDep) -> PaperRiskStatusResponse:
    return _status_response(settings, _LOCAL_PAPER_RISK_STATE)


@router.post("/evaluate", response_model=RiskEvaluation)
def paper_risk_evaluate(
    request: PaperRiskEvaluationRequest,
    settings: SettingsDep,
) -> RiskEvaluation:
    policy = request.policy or _risk_policy_from_settings(settings)
    state = _LOCAL_PAPER_RISK_STATE if request.use_local_state else request.state
    if not request.paper_only:
        policy = policy.model_copy(update={"live_trading_enabled": True})
    return PaperRiskEngine(policy=policy, state=state).evaluate_order_intent(
        request.intent
    )


@router.post("/state/reset", response_model=PaperRiskStatusResponse)
def paper_risk_state_reset(settings: SettingsDep) -> PaperRiskStatusResponse:
    global _LOCAL_PAPER_RISK_STATE
    _LOCAL_PAPER_RISK_STATE = new_paper_risk_state()
    return _status_response(settings, _LOCAL_PAPER_RISK_STATE)
