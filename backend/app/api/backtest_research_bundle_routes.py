from fastapi import APIRouter, HTTPException

from app.domain.backtest_research_bundle import (
    BacktestResearchBundlePreviewRequest,
    BacktestResearchBundlePreviewResponse,
    preview_backtest_research_bundle,
)

router = APIRouter(prefix="/api/strategy/backtest", tags=["strategy-backtest"])


@router.post(
    "/research-bundle/preview",
    response_model=BacktestResearchBundlePreviewResponse,
)
def preview_research_bundle(
    request: BacktestResearchBundlePreviewRequest,
) -> BacktestResearchBundlePreviewResponse:
    try:
        return preview_backtest_research_bundle(request)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
