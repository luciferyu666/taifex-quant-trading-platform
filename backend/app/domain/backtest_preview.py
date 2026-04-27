from __future__ import annotations

import hashlib
import json
from datetime import UTC, datetime
from typing import Any

from pydantic import BaseModel, Field, field_validator

from app.domain.feature_manifest import FeatureDatasetManifest
from app.domain.signals import StrategySignal
from app.domain.strategy_research import validate_manifest_for_strategy_research


class BacktestPreviewRequest(BaseModel):
    feature_manifest: FeatureDatasetManifest
    signal: StrategySignal
    strategy_id: str = Field(min_length=1)
    strategy_version: str = Field(min_length=1)
    parameter_set_id: str = Field(min_length=1)
    research_only: bool = True

    @field_validator("research_only")
    @classmethod
    def require_research_only(cls, value: bool) -> bool:
        if value is not True:
            raise ValueError("backtest preview must remain research_only=true")
        return value


class BacktestSignalSummary(BaseModel):
    signal_id: str
    strategy_id: str
    strategy_version: str
    symbol_group: str
    direction: str
    target_tx_equivalent: float
    confidence: float
    signals_only: bool


class BacktestPreviewResponse(BaseModel):
    backtest_preview_id: str
    manifest_id: str
    strategy_id: str
    strategy_version: str
    parameter_set_id: str
    data_version: str
    generated_at: datetime = Field(default_factory=lambda: datetime.now(UTC))
    signal_summary: BacktestSignalSummary
    reproducibility_hash: str
    warnings: list[str] = Field(default_factory=list)
    research_only: bool = True
    execution_eligible: bool = False
    order_created: bool = False
    broker_api_called: bool = False
    risk_engine_called: bool = False
    oms_called: bool = False
    performance_claim: bool = False
    external_data_downloaded: bool = False


def preview_backtest_contract(
    request: BacktestPreviewRequest,
) -> BacktestPreviewResponse:
    validate_manifest_for_strategy_research(request.feature_manifest)
    validate_signal_for_backtest_preview(request.signal, request)

    signal_summary = BacktestSignalSummary(
        signal_id=request.signal.signal_id,
        strategy_id=request.signal.strategy_id,
        strategy_version=request.signal.strategy_version,
        symbol_group=request.signal.symbol_group,
        direction=request.signal.direction,
        target_tx_equivalent=request.signal.target_tx_equivalent,
        confidence=request.signal.confidence,
        signals_only=True,
    )
    safety_flags = {
        "research_only": True,
        "execution_eligible": False,
        "order_created": False,
        "broker_api_called": False,
        "risk_engine_called": False,
        "oms_called": False,
        "performance_claim": False,
        "external_data_downloaded": False,
    }
    reproducibility_hash = sha256_json(
        {
            "manifest_id": request.feature_manifest.manifest_id,
            "manifest_reproducibility_hash": request.feature_manifest.reproducibility_hash,
            "data_version": request.feature_manifest.data_version,
            "strategy_id": request.strategy_id,
            "strategy_version": request.strategy_version,
            "parameter_set_id": request.parameter_set_id,
            "signal": request.signal.model_dump(mode="json"),
            "safety_flags": safety_flags,
        }
    )
    preview_id = (
        f"backtest-preview-{slugify(request.strategy_id)}-"
        f"{slugify(request.parameter_set_id)}-{reproducibility_hash[:12]}"
    )
    warnings = [
        *request.feature_manifest.warnings,
        (
            "Backtest preview is a dry-run contract only. It does not calculate "
            "performance, create orders, call Risk Engine, call OMS, or call brokers."
        ),
        "Performance claims remain disabled in Phase 3 preview artifacts.",
    ]
    return BacktestPreviewResponse(
        backtest_preview_id=preview_id,
        manifest_id=request.feature_manifest.manifest_id,
        strategy_id=request.strategy_id,
        strategy_version=request.strategy_version,
        parameter_set_id=request.parameter_set_id,
        data_version=request.feature_manifest.data_version,
        signal_summary=signal_summary,
        reproducibility_hash=reproducibility_hash,
        warnings=warnings,
        **safety_flags,
    )


def validate_signal_for_backtest_preview(
    signal: StrategySignal,
    request: BacktestPreviewRequest,
) -> None:
    if signal.strategy_id != request.strategy_id:
        raise ValueError("signal.strategy_id must match request.strategy_id")
    if signal.strategy_version != request.strategy_version:
        raise ValueError("signal.strategy_version must match request.strategy_version")
    if signal.reason.get("signals_only") is not True:
        raise ValueError("signal.reason.signals_only must be true")
    if signal.reason.get("order_created") is True:
        raise ValueError("signal must not create orders")
    if signal.reason.get("broker_api_called") is True:
        raise ValueError("signal must not call broker APIs")
    if signal.reason.get("risk_engine_called") is True:
        raise ValueError("backtest preview must not call Risk Engine")
    if signal.reason.get("oms_called") is True:
        raise ValueError("backtest preview must not call OMS")


def sha256_json(payload: dict[str, Any]) -> str:
    encoded = json.dumps(payload, sort_keys=True, separators=(",", ":")).encode("utf-8")
    return hashlib.sha256(encoded).hexdigest()


def slugify(value: str) -> str:
    cleaned = "".join(char.lower() if char.isalnum() else "-" for char in value)
    return "-".join(part for part in cleaned.split("-") if part) or "backtest"
