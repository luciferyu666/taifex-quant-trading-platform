from typing import Annotated

from fastapi import APIRouter, Depends

from app.core.config import Settings, get_settings
from app.schemas.manifest import (
    HealthResponse,
    ModuleManifest,
    RiskConfigResponse,
    SystemManifest,
)

router = APIRouter()
SettingsDep = Annotated[Settings, Depends(get_settings)]


@router.get("/health", response_model=HealthResponse)
def health(settings: SettingsDep) -> HealthResponse:
    return HealthResponse(
        status="ok",
        service="taifex-quant-trading-platform-backend",
        trading_mode=settings.trading_mode,
        live_trading_enabled=settings.live_trading_enabled,
    )


@router.get("/api/system/manifest", response_model=SystemManifest)
def system_manifest(settings: SettingsDep) -> SystemManifest:
    modules = {
        "data_pipeline": ModuleManifest(
            name="Data Pipeline",
            status="skeleton",
            responsibility="Ingest, validate, and prepare market data for research and execution.",
        ),
        "strategy_engine": ModuleManifest(
            name="Strategy Engine",
            status="skeleton",
            responsibility="Emit target exposure signals only; never access broker SDKs directly.",
        ),
        "risk_engine": ModuleManifest(
            name="Risk Engine",
            status="planned",
            responsibility="Apply pre-trade and in-trade risk checks before OMS handoff.",
        ),
        "oms": ModuleManifest(
            name="OMS",
            status="planned",
            responsibility="Own order state transitions, idempotency, and reconciliation hooks.",
        ),
        "broker_gateway": ModuleManifest(
            name="Broker Gateway",
            status="skeleton",
            responsibility="Isolate broker integrations behind a paper-first adapter boundary.",
        ),
        "frontend": ModuleManifest(
            name="Frontend",
            status="skeleton",
            responsibility="Provide operator dashboards without direct broker access.",
        ),
    }
    return SystemManifest(
        project_name="taifex-quant-trading-platform",
        environment=settings.app_env,
        trading_mode=settings.trading_mode,
        live_trading_enabled=settings.live_trading_enabled,
        modules=modules,
    )


@router.get("/api/risk/config", response_model=RiskConfigResponse)
def risk_config(settings: SettingsDep) -> RiskConfigResponse:
    return RiskConfigResponse(
        max_tx_equivalent_exposure=settings.max_tx_equivalent_exposure,
        max_daily_loss_twd=settings.max_daily_loss_twd,
        stale_quote_seconds=settings.stale_quote_seconds,
        live_trading_enabled=settings.live_trading_enabled,
        trading_mode=settings.trading_mode,
    )
