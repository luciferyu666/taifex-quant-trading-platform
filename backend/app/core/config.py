from functools import lru_cache
from typing import Literal

from pydantic import Field, ValidationError, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Runtime settings with paper-trading defaults."""

    model_config = SettingsConfigDict(
        env_file=(".env", "../.env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    app_env: str = Field(default="development", alias="APP_ENV")
    trading_mode: Literal["paper", "shadow", "live"] = Field(default="paper", alias="TRADING_MODE")
    enable_live_trading: bool = Field(default=False, alias="ENABLE_LIVE_TRADING")
    broker_provider: str = Field(default="paper", alias="BROKER_PROVIDER")
    database_url: str = Field(
        default="postgresql+psycopg://tqtp:tqtp@postgres:5432/tqtp",
        alias="DATABASE_URL",
    )
    redis_url: str = Field(default="redis://redis:6379/0", alias="REDIS_URL")
    clickhouse_url: str = Field(default="http://clickhouse:8123", alias="CLICKHOUSE_URL")
    backend_host: str = Field(default="0.0.0.0", alias="BACKEND_HOST")
    backend_port: int = Field(default=8000, alias="BACKEND_PORT")
    frontend_port: int = Field(default=3000, alias="FRONTEND_PORT")
    max_tx_equivalent_exposure: float = Field(default=0.25, alias="MAX_TX_EQUIVALENT_EXPOSURE")
    max_daily_loss_twd: int = Field(default=5000, alias="MAX_DAILY_LOSS_TWD")
    stale_quote_seconds: int = Field(default=3, alias="STALE_QUOTE_SECONDS")
    paper_execution_audit_db_path: str = Field(
        default="data/paper_execution_audit.sqlite",
        alias="PAPER_EXECUTION_AUDIT_DB_PATH",
    )

    @model_validator(mode="after")
    def validate_live_trading_gate(self) -> "Settings":
        if self.enable_live_trading and self.trading_mode != "live":
            raise ValueError(
                "Unsafe trading config: ENABLE_LIVE_TRADING=true requires TRADING_MODE=live."
            )
        if self.trading_mode == "live" and self.broker_provider == "paper":
            raise ValueError(
                "Unsafe trading config: TRADING_MODE=live requires a non-paper broker provider."
            )
        return self

    @property
    def live_trading_enabled(self) -> bool:
        return self.enable_live_trading and self.trading_mode == "live"


@lru_cache
def get_settings() -> Settings:
    try:
        return Settings()
    except ValidationError:
        raise
