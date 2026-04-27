from __future__ import annotations

import hashlib
import json
from dataclasses import dataclass
from typing import Any

from .backtest_contract import BacktestPreviewContract


class BacktestResultContractError(ValueError):
    pass


@dataclass(frozen=True)
class BacktestResultPreviewContract:
    result_preview_id: str
    backtest_preview_id: str
    manifest_id: str
    strategy_id: str
    strategy_version: str
    parameter_set_id: str
    data_version: str
    result_label: str
    reproducibility_hash: str
    metric_schema: tuple[dict[str, Any], ...]
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
    def from_payload(cls, payload: dict[str, Any]) -> "BacktestResultPreviewContract":
        if not isinstance(payload, dict):
            raise BacktestResultContractError(
                "backtest result preview payload must be an object"
            )
        metric_schema = payload.get("metric_schema") or []
        if not isinstance(metric_schema, list):
            raise BacktestResultContractError("metric_schema must be a list")

        record = cls(
            result_preview_id=str(payload.get("result_preview_id") or ""),
            backtest_preview_id=str(payload.get("backtest_preview_id") or ""),
            manifest_id=str(payload.get("manifest_id") or ""),
            strategy_id=str(payload.get("strategy_id") or ""),
            strategy_version=str(payload.get("strategy_version") or ""),
            parameter_set_id=str(payload.get("parameter_set_id") or ""),
            data_version=str(payload.get("data_version") or ""),
            result_label=str(payload.get("result_label") or ""),
            reproducibility_hash=str(payload.get("reproducibility_hash") or ""),
            metric_schema=tuple(dict(item) for item in metric_schema),
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
        record.validate_safe_result_preview()
        return record

    def validate_safe_result_preview(self) -> None:
        if not self.result_preview_id:
            raise BacktestResultContractError("result_preview_id is required")
        if not self.backtest_preview_id:
            raise BacktestResultContractError("backtest_preview_id is required")
        if not self.manifest_id:
            raise BacktestResultContractError("manifest_id is required")
        if not self.result_label:
            raise BacktestResultContractError("result_label is required")
        if len(self.reproducibility_hash) != 64:
            raise BacktestResultContractError(
                "reproducibility_hash must be a SHA-256 digest"
            )
        if self.research_only is not True:
            raise BacktestResultContractError(
                "backtest result preview must be research_only=true"
            )
        if self.execution_eligible is not False:
            raise BacktestResultContractError(
                "backtest result preview must be execution_eligible=false"
            )
        if self.order_created:
            raise BacktestResultContractError(
                "backtest result preview must not create orders"
            )
        if self.broker_api_called:
            raise BacktestResultContractError(
                "backtest result preview must not call broker APIs"
            )
        if self.risk_engine_called:
            raise BacktestResultContractError(
                "backtest result preview must not call Risk Engine"
            )
        if self.oms_called:
            raise BacktestResultContractError("backtest result preview must not call OMS")
        if self.performance_claim:
            raise BacktestResultContractError(
                "backtest result preview must not make performance claims"
            )
        if self.simulated_metrics_only is not True:
            raise BacktestResultContractError(
                "backtest result preview must be simulated_metrics_only=true"
            )
        if self.external_data_downloaded:
            raise BacktestResultContractError(
                "backtest result preview must not download external data"
            )
        if not self.metric_schema:
            raise BacktestResultContractError("metric_schema is required")
        for metric in self.metric_schema:
            if metric.get("value") is not None:
                raise BacktestResultContractError(
                    "metric_schema entries must not contain performance values"
                )

    def to_summary(self) -> dict[str, str | bool]:
        return {
            "result_preview_id": self.result_preview_id,
            "backtest_preview_id": self.backtest_preview_id,
            "manifest_id": self.manifest_id,
            "strategy_id": self.strategy_id,
            "strategy_version": self.strategy_version,
            "parameter_set_id": self.parameter_set_id,
            "data_version": self.data_version,
            "research_only": self.research_only,
            "execution_eligible": self.execution_eligible,
            "performance_claim": self.performance_claim,
        }


def build_backtest_result_preview_payload(
    backtest_preview_payload: dict[str, Any],
    result_label: str,
) -> dict[str, Any]:
    preview = BacktestPreviewContract.from_payload(backtest_preview_payload)
    metric_schema = default_metric_schema_payload()
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
            "backtest_preview_id": preview.backtest_preview_id,
            "backtest_preview_reproducibility_hash": preview.reproducibility_hash,
            "result_label": result_label,
            "metric_schema": metric_schema,
            "safety_flags": safety_flags,
        }
    )
    payload = {
        "result_preview_id": (
            f"backtest-result-preview-{slugify(result_label)}-"
            f"{reproducibility_hash[:12]}"
        ),
        "backtest_preview_id": preview.backtest_preview_id,
        "manifest_id": preview.manifest_id,
        "strategy_id": preview.strategy_id,
        "strategy_version": preview.strategy_version,
        "parameter_set_id": preview.parameter_set_id,
        "data_version": preview.data_version,
        "result_label": result_label,
        "reproducibility_hash": reproducibility_hash,
        "metric_schema": metric_schema,
        "warnings": [
            *preview.warnings,
            (
                "SDK backtest result preview defines metric schema only and does not "
                "calculate real performance."
            ),
        ],
        **safety_flags,
    }
    BacktestResultPreviewContract.from_payload(payload)
    return payload


def default_metric_schema_payload() -> list[dict[str, str | None]]:
    return [
        {
            "name": "total_return_pct",
            "value_type": "percentage",
            "unit": "percent",
            "description": "Research metric placeholder for future total return.",
            "value": None,
        },
        {
            "name": "max_drawdown_pct",
            "value_type": "percentage",
            "unit": "percent",
            "description": "Research metric placeholder for future drawdown.",
            "value": None,
        },
        {
            "name": "trade_count",
            "value_type": "integer",
            "unit": "count",
            "description": "Research metric placeholder for future simulated trades.",
            "value": None,
        },
        {
            "name": "tx_equivalent_turnover",
            "value_type": "float",
            "unit": "tx_equivalent",
            "description": "Research metric placeholder for future exposure turnover.",
            "value": None,
        },
        {
            "name": "sharpe_like_ratio",
            "value_type": "ratio",
            "unit": "ratio",
            "description": "Research metric placeholder; not a performance claim.",
            "value": None,
        },
    ]


def sha256_json(payload: dict[str, Any]) -> str:
    encoded = json.dumps(payload, sort_keys=True, separators=(",", ":")).encode("utf-8")
    return hashlib.sha256(encoded).hexdigest()


def slugify(value: str) -> str:
    cleaned = "".join(char.lower() if char.isalnum() else "-" for char in value)
    return "-".join(part for part in cleaned.split("-") if part) or "result"
