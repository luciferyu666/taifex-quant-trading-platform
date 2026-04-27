from __future__ import annotations

import hashlib
import json
from datetime import UTC, datetime
from typing import Any, Literal

from pydantic import BaseModel, Field, field_validator

from app.domain.backtest_preview import BacktestPreviewResponse


class BacktestResultPreviewRequest(BaseModel):
    backtest_preview: BacktestPreviewResponse
    result_label: str = Field(min_length=1)
    research_only: bool = True

    @field_validator("research_only")
    @classmethod
    def require_research_only(cls, value: bool) -> bool:
        if value is not True:
            raise ValueError("backtest result preview must remain research_only=true")
        return value


class BacktestMetricSchemaEntry(BaseModel):
    name: str
    value_type: Literal["float", "integer", "percentage", "currency", "duration", "ratio"]
    unit: str
    description: str
    value: None = None


class BacktestResultPreviewResponse(BaseModel):
    result_preview_id: str
    backtest_preview_id: str
    manifest_id: str
    strategy_id: str
    strategy_version: str
    parameter_set_id: str
    data_version: str
    result_label: str
    generated_at: datetime = Field(default_factory=lambda: datetime.now(UTC))
    reproducibility_hash: str
    metric_schema: list[BacktestMetricSchemaEntry]
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


def preview_backtest_result_schema(
    request: BacktestResultPreviewRequest,
) -> BacktestResultPreviewResponse:
    validate_backtest_preview_for_result_schema(request.backtest_preview)
    metric_schema = default_metric_schema()
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
    }
    reproducibility_hash = sha256_json(
        {
            "backtest_preview_id": request.backtest_preview.backtest_preview_id,
            "backtest_preview_reproducibility_hash": (
                request.backtest_preview.reproducibility_hash
            ),
            "result_label": request.result_label,
            "metric_schema": [metric.model_dump() for metric in metric_schema],
            "safety_flags": safety_flags,
        }
    )
    result_preview_id = (
        f"backtest-result-preview-{slugify(request.result_label)}-"
        f"{reproducibility_hash[:12]}"
    )
    warnings = [
        *request.backtest_preview.warnings,
        (
            "Backtest result preview defines metric schema only. It does not calculate "
            "real performance, create orders, write a database, or call broker APIs."
        ),
        "Metric values are intentionally null; performance_claim remains false.",
    ]
    return BacktestResultPreviewResponse(
        result_preview_id=result_preview_id,
        backtest_preview_id=request.backtest_preview.backtest_preview_id,
        manifest_id=request.backtest_preview.manifest_id,
        strategy_id=request.backtest_preview.strategy_id,
        strategy_version=request.backtest_preview.strategy_version,
        parameter_set_id=request.backtest_preview.parameter_set_id,
        data_version=request.backtest_preview.data_version,
        result_label=request.result_label,
        reproducibility_hash=reproducibility_hash,
        metric_schema=metric_schema,
        warnings=warnings,
        **safety_flags,
    )


def validate_backtest_preview_for_result_schema(
    preview: BacktestPreviewResponse,
) -> None:
    if preview.research_only is not True:
        raise ValueError("backtest preview must be research_only=true")
    if preview.execution_eligible is not False:
        raise ValueError("backtest preview must be execution_eligible=false")
    if preview.order_created:
        raise ValueError("backtest preview must not create orders")
    if preview.broker_api_called:
        raise ValueError("backtest preview must not call broker APIs")
    if preview.risk_engine_called:
        raise ValueError("backtest preview must not call Risk Engine")
    if preview.oms_called:
        raise ValueError("backtest preview must not call OMS")
    if preview.performance_claim:
        raise ValueError("backtest preview must not make performance claims")
    if preview.external_data_downloaded:
        raise ValueError("backtest preview must not download external data")


def default_metric_schema() -> list[BacktestMetricSchemaEntry]:
    return [
        BacktestMetricSchemaEntry(
            name="total_return_pct",
            value_type="percentage",
            unit="percent",
            description="Research metric placeholder for future total return calculation.",
        ),
        BacktestMetricSchemaEntry(
            name="max_drawdown_pct",
            value_type="percentage",
            unit="percent",
            description="Research metric placeholder for future drawdown calculation.",
        ),
        BacktestMetricSchemaEntry(
            name="trade_count",
            value_type="integer",
            unit="count",
            description="Research metric placeholder for future simulated trade count.",
        ),
        BacktestMetricSchemaEntry(
            name="tx_equivalent_turnover",
            value_type="float",
            unit="tx_equivalent",
            description="Research metric placeholder for future exposure turnover.",
        ),
        BacktestMetricSchemaEntry(
            name="sharpe_like_ratio",
            value_type="ratio",
            unit="ratio",
            description="Research metric placeholder; not a live performance claim.",
        ),
    ]


def sha256_json(payload: dict[str, Any]) -> str:
    encoded = json.dumps(payload, sort_keys=True, separators=(",", ":")).encode("utf-8")
    return hashlib.sha256(encoded).hexdigest()


def slugify(value: str) -> str:
    cleaned = "".join(char.lower() if char.isalnum() else "-" for char in value)
    return "-".join(part for part in cleaned.split("-") if part) or "result"
