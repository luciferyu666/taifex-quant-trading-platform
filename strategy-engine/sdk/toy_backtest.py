from __future__ import annotations

import hashlib
import json
from dataclasses import dataclass
from statistics import fmean, pstdev
from typing import Any

from .backtest_result import BacktestResultPreviewContract

LOCAL_FIXTURE_SOURCES = {"local-fixture", "manual-fixture"}


class ToyBacktestError(ValueError):
    pass


@dataclass(frozen=True)
class ToyBacktestRun:
    toy_backtest_run_id: str
    result_preview_id: str
    manifest_id: str
    strategy_id: str
    strategy_version: str
    parameter_set_id: str
    data_version: str
    simulated_metric_values: tuple[dict[str, Any], ...]
    reproducibility_hash: str
    research_only: bool
    execution_eligible: bool
    order_created: bool
    broker_api_called: bool
    risk_engine_called: bool
    oms_called: bool
    performance_claim: bool
    simulated_metrics_only: bool
    external_data_downloaded: bool
    warnings: tuple[str, ...] = ()

    @classmethod
    def from_payload(cls, payload: dict[str, Any]) -> "ToyBacktestRun":
        if not isinstance(payload, dict):
            raise ToyBacktestError("toy backtest payload must be an object")
        metric_values = payload.get("simulated_metric_values") or []
        if not isinstance(metric_values, list):
            raise ToyBacktestError("simulated_metric_values must be a list")
        record = cls(
            toy_backtest_run_id=str(payload.get("toy_backtest_run_id") or ""),
            result_preview_id=str(payload.get("result_preview_id") or ""),
            manifest_id=str(payload.get("manifest_id") or ""),
            strategy_id=str(payload.get("strategy_id") or ""),
            strategy_version=str(payload.get("strategy_version") or ""),
            parameter_set_id=str(payload.get("parameter_set_id") or ""),
            data_version=str(payload.get("data_version") or ""),
            simulated_metric_values=tuple(dict(item) for item in metric_values),
            reproducibility_hash=str(payload.get("reproducibility_hash") or ""),
            research_only=bool(payload.get("research_only")),
            execution_eligible=bool(payload.get("execution_eligible")),
            order_created=bool(payload.get("order_created")),
            broker_api_called=bool(payload.get("broker_api_called")),
            risk_engine_called=bool(payload.get("risk_engine_called")),
            oms_called=bool(payload.get("oms_called")),
            performance_claim=bool(payload.get("performance_claim")),
            simulated_metrics_only=bool(payload.get("simulated_metrics_only")),
            external_data_downloaded=bool(payload.get("external_data_downloaded")),
            warnings=tuple(str(item) for item in payload.get("warnings", [])),
        )
        record.validate_safe_toy_run()
        return record

    def validate_safe_toy_run(self) -> None:
        if not self.toy_backtest_run_id:
            raise ToyBacktestError("toy_backtest_run_id is required")
        if len(self.reproducibility_hash) != 64:
            raise ToyBacktestError("reproducibility_hash must be a SHA-256 digest")
        if self.research_only is not True:
            raise ToyBacktestError("toy backtest must be research_only=true")
        if self.execution_eligible is not False:
            raise ToyBacktestError("toy backtest must be execution_eligible=false")
        if self.order_created:
            raise ToyBacktestError("toy backtest must not create orders")
        if self.broker_api_called:
            raise ToyBacktestError("toy backtest must not call broker APIs")
        if self.risk_engine_called:
            raise ToyBacktestError("toy backtest must not call Risk Engine")
        if self.oms_called:
            raise ToyBacktestError("toy backtest must not call OMS")
        if self.performance_claim:
            raise ToyBacktestError("toy backtest must not make performance claims")
        if self.simulated_metrics_only is not True:
            raise ToyBacktestError("toy backtest must be simulated_metrics_only=true")
        if self.external_data_downloaded:
            raise ToyBacktestError("toy backtest must not download external data")
        for metric in self.simulated_metric_values:
            if metric.get("simulated") is not True:
                raise ToyBacktestError("toy metrics must be marked simulated=true")
            if metric.get("research_only") is not True:
                raise ToyBacktestError("toy metrics must be marked research_only=true")
            if metric.get("performance_claim") is not False:
                raise ToyBacktestError("toy metrics must not make performance claims")


def run_toy_backtest_payload(
    result_preview_payload: dict[str, Any],
    bars: list[dict[str, Any]],
) -> dict[str, Any]:
    preview = BacktestResultPreviewContract.from_payload(result_preview_payload)
    validate_local_fixture_bars(bars, preview.data_version)
    metric_values = build_simulated_metric_values(bars, preview)
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
            "result_preview_id": preview.result_preview_id,
            "result_preview_reproducibility_hash": preview.reproducibility_hash,
            "bars": sorted_bars(bars),
            "simulated_metric_values": metric_values,
            "safety_flags": safety_flags,
        }
    )
    payload = {
        "toy_backtest_run_id": (
            f"toy-backtest-{slugify(preview.result_label)}-"
            f"{reproducibility_hash[:12]}"
        ),
        "result_preview_id": preview.result_preview_id,
        "manifest_id": preview.manifest_id,
        "strategy_id": preview.strategy_id,
        "strategy_version": preview.strategy_version,
        "parameter_set_id": preview.parameter_set_id,
        "data_version": preview.data_version,
        "simulated_metric_values": metric_values,
        "reproducibility_hash": reproducibility_hash,
        "warnings": [
            *preview.warnings,
            (
                "SDK toy backtest uses local fixture bars only and produces simulated "
                "research metrics."
            ),
        ],
        **safety_flags,
    }
    ToyBacktestRun.from_payload(payload)
    return payload


def validate_local_fixture_bars(
    bars: list[dict[str, Any]],
    data_version: str,
) -> None:
    if not bars:
        raise ToyBacktestError("toy backtest requires at least one local fixture bar")
    for row in bars:
        if str(row.get("source") or "") not in LOCAL_FIXTURE_SOURCES:
            raise ToyBacktestError("toy backtest only accepts local fixture bars")
        if str(row.get("data_version") or "") != data_version:
            raise ToyBacktestError("bar data_version must match result preview")


def build_simulated_metric_values(
    bars: list[dict[str, Any]],
    preview: BacktestResultPreviewContract,
) -> list[dict[str, Any]]:
    schema_by_name = {metric["name"]: metric for metric in preview.metric_schema}
    closes = [float(row["close"]) for row in sorted_bars(bars)]
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
    metrics: list[dict[str, Any]] = []
    for name, value in values.items():
        schema = schema_by_name.get(name)
        if not schema:
            continue
        metrics.append(
            {
                "name": name,
                "value": value,
                "value_type": schema["value_type"],
                "unit": schema["unit"],
                "simulated": True,
                "research_only": True,
                "performance_claim": False,
                "description": (
                    f"Simulated research-only toy value for {name}; not a "
                    "performance claim."
                ),
            }
        )
    return metrics


def sorted_bars(bars: list[dict[str, Any]]) -> list[dict[str, Any]]:
    return sorted(
        bars,
        key=lambda row: (
            str(row.get("bar_start") or ""),
            str(row.get("symbol") or ""),
            str(row.get("contract_month") or ""),
        ),
    )


def sha256_json(payload: dict[str, Any]) -> str:
    encoded = json.dumps(payload, sort_keys=True, separators=(",", ":")).encode("utf-8")
    return hashlib.sha256(encoded).hexdigest()


def slugify(value: str) -> str:
    cleaned = "".join(char.lower() if char.isalnum() else "-" for char in value)
    return "-".join(part for part in cleaned.split("-") if part) or "toy-backtest"
