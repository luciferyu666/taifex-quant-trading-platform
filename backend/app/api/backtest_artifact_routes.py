from fastapi import APIRouter, HTTPException

from app.domain.backtest_artifact import (
    BacktestArtifactPreviewRequest,
    BacktestArtifactPreviewResponse,
    preview_backtest_artifact,
)

router = APIRouter(prefix="/api/strategy/backtest", tags=["strategy-backtest"])


@router.post("/artifact/preview", response_model=BacktestArtifactPreviewResponse)
def preview_artifact(
    request: BacktestArtifactPreviewRequest,
) -> BacktestArtifactPreviewResponse:
    try:
        return preview_backtest_artifact(request)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
