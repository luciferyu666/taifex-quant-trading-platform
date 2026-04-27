from typing import Annotated

from fastapi import APIRouter, Depends
from pydantic import BaseModel

from app.core.config import Settings, get_settings
from app.domain.market_data import (
    ContractMasterRecord,
    DataQualityReport,
    MarketBar,
    MarketBarBatchValidationReport,
    MarketBarBatchValidationRequest,
)
from app.services.market_data import MarketDataService

router = APIRouter(prefix="/api/data", tags=["data-platform"])
SettingsDep = Annotated[Settings, Depends(get_settings)]

_market_data = MarketDataService()


class DataPlatformManifest(BaseModel):
    phase: int
    status: str
    safety_mode: str
    live_trading_enabled: bool
    layers: list[dict[str, str]]
    schemas: list[str]
    rules: list[str]


class RolloverPolicyResponse(BaseModel):
    research_adjusted_contracts: str
    execution_contracts: str
    current_phase_boundary: str
    required_event_fields: list[str]


@router.get("/manifest", response_model=DataPlatformManifest)
def data_platform_manifest(settings: SettingsDep) -> DataPlatformManifest:
    return DataPlatformManifest(
        phase=2,
        status="executable-scaffold",
        safety_mode="paper-only",
        live_trading_enabled=settings.live_trading_enabled,
        layers=_market_data.layer_plan(),
        schemas=[
            "data-pipeline/migrations/001_phase_2_data_platform.sql",
            "data-pipeline/schemas/contract_master.sql",
            "data-pipeline/schemas/market_bars.sql",
            "data-pipeline/schemas/rollover_events.sql",
            "data-pipeline/schemas/data_quality_checks.sql",
            "data-pipeline/schemas/data_versions.sql",
            "data-pipeline/fixtures/market_bars_valid.csv",
            "data-pipeline/fixtures/market_bars_invalid.csv",
            "data-pipeline/fixtures/rollover_events_valid.csv",
            "data-pipeline/fixtures/rollover_events_invalid.csv",
            "data-pipeline/validation/register_data_version.py",
            "data-pipeline/validation/validate_rollover_event_fixtures.py",
            "data-pipeline/validation/preview_continuous_futures.py",
            "data-pipeline/validation/build_feature_manifest.py",
        ],
        rules=[
            "No external market data download in Phase 2.",
            "No broker API calls in Phase 2.",
            "Real contract prices are reserved for paper/live simulation.",
            "Adjusted continuous contracts are research/backtesting inputs only.",
            "Local CSV fixture validation must report row-level failures deterministically.",
        ],
    )


@router.get("/contracts/master", response_model=list[ContractMasterRecord])
def contract_master() -> list[ContractMasterRecord]:
    return _market_data.list_contract_master_records()


@router.get("/layers")
def layers() -> dict[str, list[dict[str, str]]]:
    return {"layers": _market_data.layer_plan()}


@router.get("/quality/rules")
def quality_rules() -> dict[str, list[dict[str, str]]]:
    return {"rules": _market_data.quality_rules()}


@router.post("/quality/validate-bar", response_model=DataQualityReport)
def validate_bar(bar: MarketBar) -> DataQualityReport:
    return _market_data.validate_bar(bar)


@router.post("/quality/validate-bars", response_model=MarketBarBatchValidationReport)
def validate_bars(request: MarketBarBatchValidationRequest) -> MarketBarBatchValidationReport:
    return _market_data.validate_bar_batch(request)


@router.get("/rollover/policy", response_model=RolloverPolicyResponse)
def rollover_policy() -> RolloverPolicyResponse:
    return RolloverPolicyResponse(
        research_adjusted_contracts=(
            "Back-adjusted and ratio-adjusted continuous series belong in the Gold Feature "
            "research path."
        ),
        execution_contracts=(
            "Paper/live simulation must use real contract symbols, real contract months, "
            "and unadjusted prices."
        ),
        current_phase_boundary=(
            "Phase 2 records rollover metadata only; it does not download data or place orders."
        ),
        required_event_fields=[
            "root_symbol",
            "from_contract_month",
            "to_contract_month",
            "rollover_timestamp",
            "spread_points",
            "adjustment_method",
            "adjustment_factor",
            "data_version",
        ],
    )
