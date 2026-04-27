from fastapi import APIRouter, HTTPException

from app.domain.backtest_preview import (
    BacktestPreviewRequest,
    BacktestPreviewResponse,
    preview_backtest_contract,
)

router = APIRouter(prefix="/api/strategy/backtest", tags=["strategy-backtest"])


@router.post("/preview", response_model=BacktestPreviewResponse)
def preview_backtest(
    request: BacktestPreviewRequest,
) -> BacktestPreviewResponse:
    try:
        return preview_backtest_contract(request)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
