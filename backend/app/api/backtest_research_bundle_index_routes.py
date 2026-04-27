from fastapi import APIRouter, HTTPException

from app.domain.backtest_research_bundle_index import (
    BacktestResearchBundleIndexPreviewRequest,
    BacktestResearchBundleIndexPreviewResponse,
    preview_backtest_research_bundle_index,
)

router = APIRouter(prefix="/api/strategy/backtest", tags=["strategy-backtest"])


@router.post(
    "/research-bundle-index/preview",
    response_model=BacktestResearchBundleIndexPreviewResponse,
)
def preview_research_bundle_index(
    request: BacktestResearchBundleIndexPreviewRequest,
) -> BacktestResearchBundleIndexPreviewResponse:
    try:
        return preview_backtest_research_bundle_index(request)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
