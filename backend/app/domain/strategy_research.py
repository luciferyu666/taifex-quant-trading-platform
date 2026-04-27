from datetime import UTC, datetime
from typing import Any

from pydantic import BaseModel, Field, field_validator

from app.domain.feature_manifest import FeatureDatasetManifest
from app.domain.signals import StrategySignal


class StrategyResearchPreviewRequest(BaseModel):
    feature_manifest: FeatureDatasetManifest
    strategy_id: str = Field(min_length=1)
    strategy_version: str = Field(min_length=1)
    research_only: bool = True

    @field_validator("research_only")
    @classmethod
    def require_research_only(cls, value: bool) -> bool:
        if value is not True:
            raise ValueError("strategy research preview must remain research_only=true")
        return value


class StrategyResearchContextSummary(BaseModel):
    manifest_id: str
    data_version: str
    feature_set_name: str
    feature_timeframe: str
    reproducibility_hash: str
    source_file_count: int
    research_only: bool = True
    execution_eligible: bool = False


class StrategyResearchPreviewResponse(BaseModel):
    signal: StrategySignal
    research_context: StrategyResearchContextSummary
    warnings: list[str] = Field(default_factory=list)
    research_only: bool = True
    execution_eligible: bool = False
    order_created: bool = False
    broker_api_called: bool = False
    risk_engine_called: bool = False
    oms_called: bool = False
    external_data_downloaded: bool = False


def preview_research_signal(
    request: StrategyResearchPreviewRequest,
) -> StrategyResearchPreviewResponse:
    manifest = request.feature_manifest
    validate_manifest_for_strategy_research(manifest)

    context = StrategyResearchContextSummary(
        manifest_id=manifest.manifest_id,
        data_version=manifest.data_version,
        feature_set_name=manifest.feature_set.feature_set_name,
        feature_timeframe=manifest.feature_set.feature_timeframe,
        reproducibility_hash=manifest.reproducibility_hash,
        source_file_count=len(manifest.source_files),
    )
    signal = StrategySignal(
        signal_id=f"research-preview-{request.strategy_id}-{manifest.manifest_id}",
        strategy_id=request.strategy_id,
        strategy_version=request.strategy_version,
        timestamp=datetime.now(UTC),
        direction="FLAT",
        target_tx_equivalent=0,
        confidence=0.05,
        reason={
            "source": "feature_dataset_manifest",
            "manifest_id": manifest.manifest_id,
            "data_version": manifest.data_version,
            "reproducibility_hash": manifest.reproducibility_hash,
            "signals_only": True,
            "order_created": False,
            "broker_api_called": False,
            "risk_engine_called": False,
            "oms_called": False,
        },
    )
    warnings = [
        *manifest.warnings,
        (
            "Strategy research preview emits signals only; orders require future Risk "
            "Engine and OMS flow."
        ),
    ]
    return StrategyResearchPreviewResponse(
        signal=signal,
        research_context=context,
        warnings=warnings,
    )


def validate_manifest_for_strategy_research(manifest: FeatureDatasetManifest) -> None:
    checks: dict[str, Any] = {
        "research_only": manifest.research_only,
        "execution_eligible": manifest.execution_eligible,
        "external_data_downloaded": manifest.external_data_downloaded,
        "broker_api_called": manifest.broker_api_called,
    }
    if checks["research_only"] is not True:
        raise ValueError("feature manifest must be research_only=true")
    if checks["execution_eligible"] is not False:
        raise ValueError("feature manifest must be execution_eligible=false")
    if checks["external_data_downloaded"]:
        raise ValueError("feature manifest must not download external data")
    if checks["broker_api_called"]:
        raise ValueError("feature manifest must not call broker APIs")
