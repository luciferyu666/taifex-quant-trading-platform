from pydantic import BaseModel


class ModuleManifest(BaseModel):
    name: str
    status: str
    responsibility: str


class SystemManifest(BaseModel):
    project_name: str
    environment: str
    trading_mode: str
    live_trading_enabled: bool
    modules: dict[str, ModuleManifest]


class HealthResponse(BaseModel):
    status: str
    service: str
    trading_mode: str
    live_trading_enabled: bool


class RiskConfigResponse(BaseModel):
    max_tx_equivalent_exposure: float
    max_daily_loss_twd: int
    stale_quote_seconds: int
    live_trading_enabled: bool
    trading_mode: str
