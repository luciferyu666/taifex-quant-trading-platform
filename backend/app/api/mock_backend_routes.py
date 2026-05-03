from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException

from app.core.config import Settings, get_settings
from app.domain.mock_backend import (
    MockBackendDemoSessionStore,
    MockBackendStatus,
    MockDemoSession,
    MockMarketDataPreview,
    MockOrderSimulationRequest,
    MockOrderSimulationResponse,
    MockStrategyRunRequest,
    MockStrategyRunResponse,
    market_data_preview,
    mock_backend_status,
    run_mock_strategy,
    simulate_mock_order,
)

router = APIRouter(prefix="/api/mock-backend", tags=["mock-backend"])
SettingsDep = Annotated[Settings, Depends(get_settings)]
_demo_session_store = MockBackendDemoSessionStore()


@router.get("/status", response_model=MockBackendStatus)
def mock_backend_demo_status(settings: SettingsDep) -> MockBackendStatus:
    return mock_backend_status(settings)


@router.get("/market-data/preview", response_model=MockMarketDataPreview)
def mock_backend_market_data_preview(tick: int = 0) -> MockMarketDataPreview:
    return market_data_preview(max(0, tick))


@router.post("/strategy/run", response_model=MockStrategyRunResponse)
def mock_backend_strategy_run(
    request: MockStrategyRunRequest,
    settings: SettingsDep,
) -> MockStrategyRunResponse:
    response = run_mock_strategy(request, settings)
    _demo_session_store.set_signal(response)
    return response


@router.post("/order/simulate", response_model=MockOrderSimulationResponse)
def mock_backend_order_simulate(
    request: MockOrderSimulationRequest,
    settings: SettingsDep,
) -> MockOrderSimulationResponse:
    try:
        response = simulate_mock_order(request, settings)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    _demo_session_store.set_order(response)
    return response


@router.get("/demo-session", response_model=MockDemoSession)
def mock_backend_demo_session() -> MockDemoSession:
    return _demo_session_store.get()


@router.post("/demo-session/reset", response_model=MockDemoSession)
def mock_backend_demo_session_reset() -> MockDemoSession:
    return _demo_session_store.reset()
