from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.core.config import Settings, get_settings
from app.domain.paper_execution import (
    PaperExecutionWorkflowRequest,
    PaperExecutionWorkflowResponse,
)
from app.domain.risk_rules import RiskPolicy
from app.services.paper_execution_workflow import PaperExecutionWorkflow

router = APIRouter(prefix="/api/paper-execution", tags=["paper-execution"])
SettingsDep = Annotated[Settings, Depends(get_settings)]


class PaperExecutionStatusResponse(BaseModel):
    trading_mode: str
    live_trading_enabled: bool
    broker_provider: str
    workflow_statuses: list[str]
    order_path: list[str]
    ui_mode: str
    broker_api_called: bool
    message: str


def _risk_policy_from_settings(settings: Settings) -> RiskPolicy:
    return RiskPolicy(
        trading_mode=settings.trading_mode,
        live_trading_enabled=settings.live_trading_enabled,
        broker_provider=settings.broker_provider,
        max_tx_equivalent_exposure=settings.max_tx_equivalent_exposure,
        max_daily_loss_twd=settings.max_daily_loss_twd,
        stale_quote_seconds=settings.stale_quote_seconds,
    )


@router.get("/status", response_model=PaperExecutionStatusResponse)
def paper_execution_status(settings: SettingsDep) -> PaperExecutionStatusResponse:
    return PaperExecutionStatusResponse(
        trading_mode=settings.trading_mode,
        live_trading_enabled=settings.live_trading_enabled,
        broker_provider=settings.broker_provider,
        workflow_statuses=[
            "research_approved",
            "approved_for_paper_simulation",
            "rejected",
            "needs_data_review",
        ],
        order_path=[
            "StrategySignal",
            "Platform PaperOrderIntent",
            "Risk Engine",
            "OMS",
            "Paper Broker Gateway",
            "Audit Event",
        ],
        ui_mode="Paper Only read-only workflow status. No live controls are exposed.",
        broker_api_called=False,
        message=(
            "Paper execution approval workflow is available for simulation only. "
            "Live trading remains disabled by default."
        ),
    )


@router.post("/workflow/preview", response_model=PaperExecutionWorkflowResponse)
def paper_execution_workflow_preview(
    request: PaperExecutionWorkflowRequest,
    settings: SettingsDep,
) -> PaperExecutionWorkflowResponse:
    try:
        return PaperExecutionWorkflow(_risk_policy_from_settings(settings)).preview(request)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
