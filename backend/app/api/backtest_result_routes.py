from fastapi import APIRouter, HTTPException

from app.domain.backtest_result import (
    BacktestResultPreviewRequest,
    BacktestResultPreviewResponse,
    preview_backtest_result_schema,
)

router = APIRouter(prefix="/api/strategy/backtest", tags=["strategy-backtest"])


@router.post("/result-preview", response_model=BacktestResultPreviewResponse)
def preview_backtest_result(
    request: BacktestResultPreviewRequest,
) -> BacktestResultPreviewResponse:
    try:
        return preview_backtest_result_schema(request)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
