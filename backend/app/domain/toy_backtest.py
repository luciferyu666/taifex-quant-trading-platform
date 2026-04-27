from __future__ import annotations

import hashlib
import json
from datetime import UTC, datetime
from statistics import fmean, pstdev
from typing import Literal

from pydantic import BaseModel, Field, field_validator

from app.domain.backtest_result import BacktestResultPreviewResponse
from app.domain.market_data import MarketBar

LOCAL_FIXTURE_SOURCES = {"local-fixture", "manual-fixture"}


class ToyBacktestRequest(BaseModel):
    result_preview: BacktestResultPreviewResponse
    bars: list[MarketBar] = Field(min_length=1, max_length=500)
    research_only: bool = True

    @field_validator("research_only")
    @classmethod
    def require_research_only(cls, value: bool) -> bool:
        if value is not True:
            raise ValueError("toy backtest must remain research_only=true")
        return value


class SimulatedMetricValue(BaseModel):
    name: str
    value: float
    value_type: Literal["float", "integer", "percentage", "currency", "duration", "ratio"]
    unit: str
    simulated: bool = True
    research_only: bool = True
    performance_claim: bool = False
    description: str


class ToyBacktestResponse(BaseModel):
    toy_backtest_run_id: str
    result_preview_id: str
    manifest_id: str
    strategy_id: str
    strategy_version: str
    parameter_set_id: str
    data_version: str
    generated_at: datetime = Field(default_factory=lambda: datetime.now(UTC))
    simulated_metric_values: list[SimulatedMetricValue]
    reproducibility_hash: str
    warnings: list[str] = Field(default_factory=list)
    bar_count: int
    research_only: bool = True
    execution_eligible: bool = False
    order_created: bool = False
    broker_api_called: bool = False
    risk_engine_called: bool = False
    oms_called: bool = False
    performance_claim: bool = False
    simulated_metrics_only: bool = True
    external_data_downloaded: bool = False


def run_toy_backtest(request: ToyBacktestRequest) -> ToyBacktestResponse:
    validate_result_preview_for_toy_backtest(request.result_preview)
    validate_local_fixture_bars(request.bars, request.result_preview.data_version)

    metric_values = build_simulated_metric_values(request.bars, request.result_preview)
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
            "result_preview_id": request.result_preview.result_preview_id,
            "result_preview_reproducibility_hash": (
                request.result_preview.reproducibility_hash
            ),
            "bars": [bar.model_dump(mode="json") for bar in sorted_bars(request.bars)],
            "simulated_metric_values": [
                metric.model_dump() for metric in metric_values
            ],
            "safety_flags": safety_flags,
        }
    )
    warnings = [
        *request.result_preview.warnings,
        (
            "Toy backtest uses local fixture bars only. Metrics are simulated research "
            "values and are not performance claims."
        ),
        "No orders, Risk Engine, OMS, Broker Gateway, database, or external data were used.",
    ]
    return ToyBacktestResponse(
        toy_backtest_run_id=(
            f"toy-backtest-{slugify(request.result_preview.result_label)}-"
            f"{reproducibility_hash[:12]}"
        ),
        result_preview_id=request.result_preview.result_preview_id,
        manifest_id=request.result_preview.manifest_id,
        strategy_id=request.result_preview.strategy_id,
        strategy_version=request.result_preview.strategy_version,
        parameter_set_id=request.result_preview.parameter_set_id,
        data_version=request.result_preview.data_version,
        simulated_metric_values=metric_values,
        reproducibility_hash=reproducibility_hash,
        warnings=warnings,
        bar_count=len(request.bars),
        **safety_flags,
    )


def validate_result_preview_for_toy_backtest(
    result_preview: BacktestResultPreviewResponse,
) -> None:
    if result_preview.research_only is not True:
        raise ValueError("backtest result preview must be research_only=true")
    if result_preview.execution_eligible is not False:
        raise ValueError("backtest result preview must be execution_eligible=false")
    if result_preview.order_created:
        raise ValueError("backtest result preview must not create orders")
    if result_preview.broker_api_called:
        raise ValueError("backtest result preview must not call broker APIs")
    if result_preview.risk_engine_called:
        raise ValueError("backtest result preview must not call Risk Engine")
    if result_preview.oms_called:
        raise ValueError("backtest result preview must not call OMS")
    if result_preview.performance_claim:
        raise ValueError("backtest result preview must not make performance claims")
    if result_preview.simulated_metrics_only is not True:
        raise ValueError("backtest result preview must be simulated_metrics_only=true")
    if result_preview.external_data_downloaded:
        raise ValueError("backtest result preview must not download external data")
    if not result_preview.metric_schema:
        raise ValueError("backtest result preview must include metric_schema")
    for metric in result_preview.metric_schema:
        if metric.value is not None:
            raise ValueError("backtest result preview metric values must be null")


def validate_local_fixture_bars(bars: list[MarketBar], data_version: str) -> None:
    for bar in bars:
        if bar.source not in LOCAL_FIXTURE_SOURCES:
            raise ValueError("toy backtest only accepts local fixture bars")
        if bar.data_version != data_version:
            raise ValueError("bar data_version must match result preview data_version")


def build_simulated_metric_values(
    bars: list[MarketBar],
    result_preview: BacktestResultPreviewResponse,
) -> list[SimulatedMetricValue]:
    schema_by_name = {metric.name: metric for metric in result_preview.metric_schema}
    closes = [bar.close for bar in sorted_bars(bars)]
    close_returns = [
        (current - previous) / previous
        for previous, current in zip(closes, closes[1:], strict=False)
        if previous != 0
    ]
    total_return_pct = ((closes[-1] - closes[0]) / closes[0] * 100) if len(closes) > 1 else 0
    peak = closes[0]
    max_drawdown_pct = 0.0
    for close in closes:
        peak = max(peak, close)
        if peak:
            max_drawdown_pct = max(max_drawdown_pct, (peak - close) / peak * 100)
    sharpe_like_ratio = 0.0
    if len(close_returns) > 1 and pstdev(close_returns) != 0:
        sharpe_like_ratio = fmean(close_returns) / pstdev(close_returns)

    values = {
        "total_return_pct": round(total_return_pct, 6),
        "max_drawdown_pct": round(max_drawdown_pct, 6),
        "trade_count": 0.0,
        "tx_equivalent_turnover": 0.0,
        "sharpe_like_ratio": round(sharpe_like_ratio, 6),
    }
    metrics: list[SimulatedMetricValue] = []
    for name, value in values.items():
        schema = schema_by_name.get(name)
        if not schema:
            continue
        metrics.append(
            SimulatedMetricValue(
                name=name,
                value=value,
                value_type=schema.value_type,
                unit=schema.unit,
                description=(
                    f"Simulated research-only toy value for {name}; not a "
                    "performance claim."
                ),
            )
        )
    return metrics


def sorted_bars(bars: list[MarketBar]) -> list[MarketBar]:
    return sorted(bars, key=lambda bar: (bar.bar_start, bar.symbol, bar.contract_month))


def sha256_json(payload: dict[str, object]) -> str:
    encoded = json.dumps(payload, sort_keys=True, separators=(",", ":")).encode("utf-8")
    return hashlib.sha256(encoded).hexdigest()


def slugify(value: str) -> str:
    cleaned = "".join(char.lower() if char.isalnum() else "-" for char in value)
    return "-".join(part for part in cleaned.split("-") if part) or "toy-backtest"
