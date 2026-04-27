from fastapi import APIRouter, HTTPException

from app.domain.backtest_artifact_index import (
    BacktestArtifactIndexPreviewRequest,
    BacktestArtifactIndexPreviewResponse,
    preview_backtest_artifact_index,
)

router = APIRouter(prefix="/api/strategy/backtest", tags=["strategy-backtest"])


@router.post(
    "/artifact-index/preview",
    response_model=BacktestArtifactIndexPreviewResponse,
)
def preview_artifact_index(
    request: BacktestArtifactIndexPreviewRequest,
) -> BacktestArtifactIndexPreviewResponse:
    try:
        return preview_backtest_artifact_index(request)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
