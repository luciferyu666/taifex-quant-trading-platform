from fastapi import APIRouter, HTTPException

from app.domain.backtest_artifact_comparison import (
    BacktestArtifactComparisonPreviewRequest,
    BacktestArtifactComparisonPreviewResponse,
    preview_backtest_artifact_comparison,
)

router = APIRouter(prefix="/api/strategy/backtest", tags=["strategy-backtest"])


@router.post(
    "/artifact-comparison/preview",
    response_model=BacktestArtifactComparisonPreviewResponse,
)
def preview_artifact_comparison(
    request: BacktestArtifactComparisonPreviewRequest,
) -> BacktestArtifactComparisonPreviewResponse:
    try:
        return preview_backtest_artifact_comparison(request)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
