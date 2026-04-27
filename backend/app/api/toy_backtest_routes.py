from fastapi import APIRouter, HTTPException

from app.domain.toy_backtest import (
    ToyBacktestRequest,
    ToyBacktestResponse,
    run_toy_backtest,
)

router = APIRouter(prefix="/api/strategy/backtest", tags=["strategy-backtest"])


@router.post("/toy-run", response_model=ToyBacktestResponse)
def toy_backtest_run(request: ToyBacktestRequest) -> ToyBacktestResponse:
    try:
        return run_toy_backtest(request)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
