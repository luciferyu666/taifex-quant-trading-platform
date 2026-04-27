from __future__ import annotations

import hashlib
import json
from datetime import UTC, datetime
from typing import Any

from pydantic import BaseModel, Field, field_validator

from app.domain.toy_backtest import SimulatedMetricValue, ToyBacktestResponse


class BacktestArtifactPreviewRequest(BaseModel):
    toy_backtest_run: ToyBacktestResponse
    artifact_label: str = Field(min_length=1)
    research_only: bool = True

    @field_validator("research_only")
    @classmethod
    def require_research_only(cls, value: bool) -> bool:
        if value is not True:
            raise ValueError("backtest artifact preview must remain research_only=true")
        return value


class BacktestArtifactPreviewResponse(BaseModel):
    artifact_id: str
    toy_backtest_run_id: str
    result_preview_id: str
    manifest_id: str
    strategy_id: str
    strategy_version: str
    parameter_set_id: str
    data_version: str
    artifact_label: str
    generated_at: datetime = Field(default_factory=lambda: datetime.now(UTC))
    simulated_metric_values: list[SimulatedMetricValue]
    artifact_checksum: str
    reproducibility_hash: str
    warnings: list[str] = Field(default_factory=list)
    research_only: bool = True
    execution_eligible: bool = False
    order_created: bool = False
    broker_api_called: bool = False
    risk_engine_called: bool = False
    oms_called: bool = False
    performance_claim: bool = False
    simulated_metrics_only: bool = True
    external_data_downloaded: bool = False
    persisted: bool = False


def preview_backtest_artifact(
    request: BacktestArtifactPreviewRequest,
) -> BacktestArtifactPreviewResponse:
    validate_toy_backtest_for_artifact(request.toy_backtest_run)
    safety_flags = {
        "research_only": True,
        "execution_eligible": False,
        "order_created": False,
        "broker_api_called": False,
        "risk_engine_called": False,
        "oms_called": False,
        "performance_claim": False,
        "simulated_metrics_only": True,
        "external_data_downloaded": False,
        "persisted": False,
    }
    artifact_core = {
        "toy_backtest_run_id": request.toy_backtest_run.toy_backtest_run_id,
        "toy_backtest_reproducibility_hash": (
            request.toy_backtest_run.reproducibility_hash
        ),
        "result_preview_id": request.toy_backtest_run.result_preview_id,
        "manifest_id": request.toy_backtest_run.manifest_id,
        "strategy_id": request.toy_backtest_run.strategy_id,
        "strategy_version": request.toy_backtest_run.strategy_version,
        "parameter_set_id": request.toy_backtest_run.parameter_set_id,
        "data_version": request.toy_backtest_run.data_version,
        "artifact_label": request.artifact_label,
        "simulated_metric_values": [
            metric.model_dump() for metric in request.toy_backtest_run.simulated_metric_values
        ],
        "safety_flags": safety_flags,
    }
    artifact_checksum = sha256_json(artifact_core)
    reproducibility_hash = sha256_json(
        {
            **artifact_core,
            "artifact_checksum": artifact_checksum,
        }
    )
    warnings = [
        *request.toy_backtest_run.warnings,
        (
            "Backtest artifact preview is local JSON metadata only. It does not write "
            "a database, create orders, call brokers, or claim performance."
        ),
        "persisted=false unless an explicit SDK CLI --output path is used.",
    ]
    return BacktestArtifactPreviewResponse(
        artifact_id=(
            f"backtest-artifact-{slugify(request.artifact_label)}-"
            f"{artifact_checksum[:12]}"
        ),
        toy_backtest_run_id=request.toy_backtest_run.toy_backtest_run_id,
        result_preview_id=request.toy_backtest_run.result_preview_id,
        manifest_id=request.toy_backtest_run.manifest_id,
        strategy_id=request.toy_backtest_run.strategy_id,
        strategy_version=request.toy_backtest_run.strategy_version,
        parameter_set_id=request.toy_backtest_run.parameter_set_id,
        data_version=request.toy_backtest_run.data_version,
        artifact_label=request.artifact_label,
        simulated_metric_values=request.toy_backtest_run.simulated_metric_values,
        artifact_checksum=artifact_checksum,
        reproducibility_hash=reproducibility_hash,
        warnings=warnings,
        **safety_flags,
    )


def validate_toy_backtest_for_artifact(toy_run: ToyBacktestResponse) -> None:
    if toy_run.research_only is not True:
        raise ValueError("toy backtest run must be research_only=true")
    if toy_run.execution_eligible is not False:
        raise ValueError("toy backtest run must be execution_eligible=false")
    if toy_run.order_created:
        raise ValueError("toy backtest run must not create orders")
    if toy_run.broker_api_called:
        raise ValueError("toy backtest run must not call broker APIs")
    if toy_run.risk_engine_called:
        raise ValueError("toy backtest run must not call Risk Engine")
    if toy_run.oms_called:
        raise ValueError("toy backtest run must not call OMS")
    if toy_run.performance_claim:
        raise ValueError("toy backtest run must not make performance claims")
    if toy_run.simulated_metrics_only is not True:
        raise ValueError("toy backtest run must be simulated_metrics_only=true")
    if toy_run.external_data_downloaded:
        raise ValueError("toy backtest run must not download external data")
    if not toy_run.simulated_metric_values:
        raise ValueError("toy backtest run must include simulated metrics")
    for metric in toy_run.simulated_metric_values:
        if metric.simulated is not True:
            raise ValueError("artifact metrics must be simulated=true")
        if metric.research_only is not True:
            raise ValueError("artifact metrics must be research_only=true")
        if metric.performance_claim is not False:
            raise ValueError("artifact metrics must not make performance claims")


def sha256_json(payload: dict[str, Any]) -> str:
    encoded = json.dumps(payload, sort_keys=True, separators=(",", ":")).encode("utf-8")
    return hashlib.sha256(encoded).hexdigest()


def slugify(value: str) -> str:
    cleaned = "".join(char.lower() if char.isalnum() else "-" for char in value)
    return "-".join(part for part in cleaned.split("-") if part) or "artifact"
