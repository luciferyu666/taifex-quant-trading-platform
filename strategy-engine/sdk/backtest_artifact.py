from __future__ import annotations

import hashlib
import json
from dataclasses import dataclass
from pathlib import Path
from typing import Any

from .toy_backtest import ToyBacktestRun


class BacktestArtifactError(ValueError):
    pass


@dataclass(frozen=True)
class BacktestArtifact:
    artifact_id: str
    toy_backtest_run_id: str
    result_preview_id: str
    manifest_id: str
    strategy_id: str
    strategy_version: str
    parameter_set_id: str
    data_version: str
    artifact_label: str
    simulated_metric_values: tuple[dict[str, Any], ...]
    artifact_checksum: str
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
    persisted: bool
    warnings: tuple[str, ...] = ()

    @classmethod
    def from_payload(cls, payload: dict[str, Any]) -> "BacktestArtifact":
        if not isinstance(payload, dict):
            raise BacktestArtifactError("backtest artifact payload must be an object")
        metric_values = payload.get("simulated_metric_values") or []
        if not isinstance(metric_values, list):
            raise BacktestArtifactError("simulated_metric_values must be a list")
        record = cls(
            artifact_id=str(payload.get("artifact_id") or ""),
            toy_backtest_run_id=str(payload.get("toy_backtest_run_id") or ""),
            result_preview_id=str(payload.get("result_preview_id") or ""),
            manifest_id=str(payload.get("manifest_id") or ""),
            strategy_id=str(payload.get("strategy_id") or ""),
            strategy_version=str(payload.get("strategy_version") or ""),
            parameter_set_id=str(payload.get("parameter_set_id") or ""),
            data_version=str(payload.get("data_version") or ""),
            artifact_label=str(payload.get("artifact_label") or ""),
            simulated_metric_values=tuple(dict(item) for item in metric_values),
            artifact_checksum=str(payload.get("artifact_checksum") or ""),
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
            persisted=bool(payload.get("persisted")),
            warnings=tuple(str(item) for item in payload.get("warnings", [])),
        )
        record.validate_safe_artifact()
        return record

    def validate_safe_artifact(self) -> None:
        if not self.artifact_id:
            raise BacktestArtifactError("artifact_id is required")
        if not self.toy_backtest_run_id:
            raise BacktestArtifactError("toy_backtest_run_id is required")
        if len(self.artifact_checksum) != 64:
            raise BacktestArtifactError("artifact_checksum must be a SHA-256 digest")
        if len(self.reproducibility_hash) != 64:
            raise BacktestArtifactError("reproducibility_hash must be a SHA-256 digest")
        if self.research_only is not True:
            raise BacktestArtifactError("backtest artifact must be research_only=true")
        if self.execution_eligible is not False:
            raise BacktestArtifactError(
                "backtest artifact must be execution_eligible=false"
            )
        if self.order_created:
            raise BacktestArtifactError("backtest artifact must not create orders")
        if self.broker_api_called:
            raise BacktestArtifactError("backtest artifact must not call broker APIs")
        if self.risk_engine_called:
            raise BacktestArtifactError("backtest artifact must not call Risk Engine")
        if self.oms_called:
            raise BacktestArtifactError("backtest artifact must not call OMS")
        if self.performance_claim:
            raise BacktestArtifactError(
                "backtest artifact must not make performance claims"
            )
        if self.simulated_metrics_only is not True:
            raise BacktestArtifactError(
                "backtest artifact must be simulated_metrics_only=true"
            )
        if self.external_data_downloaded:
            raise BacktestArtifactError(
                "backtest artifact must not download external data"
            )
        if not self.simulated_metric_values:
            raise BacktestArtifactError("simulated_metric_values are required")
        for metric in self.simulated_metric_values:
            if metric.get("simulated") is not True:
                raise BacktestArtifactError("artifact metrics must be simulated=true")
            if metric.get("research_only") is not True:
                raise BacktestArtifactError("artifact metrics must be research_only=true")
            if metric.get("performance_claim") is not False:
                raise BacktestArtifactError(
                    "artifact metrics must not make performance claims"
                )


def build_backtest_artifact_payload(
    toy_backtest_payload: dict[str, Any],
    artifact_label: str,
    persisted: bool = False,
) -> dict[str, Any]:
    toy_run = ToyBacktestRun.from_payload(toy_backtest_payload)
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
        "persisted": persisted,
    }
    artifact_core = {
        "toy_backtest_run_id": toy_run.toy_backtest_run_id,
        "toy_backtest_reproducibility_hash": toy_run.reproducibility_hash,
        "result_preview_id": toy_run.result_preview_id,
        "manifest_id": toy_run.manifest_id,
        "strategy_id": toy_run.strategy_id,
        "strategy_version": toy_run.strategy_version,
        "parameter_set_id": toy_run.parameter_set_id,
        "data_version": toy_run.data_version,
        "artifact_label": artifact_label,
        "simulated_metric_values": list(toy_run.simulated_metric_values),
        "safety_flags": safety_flags,
    }
    artifact_checksum = sha256_json(artifact_core)
    reproducibility_hash = sha256_json(
        {
            **artifact_core,
            "artifact_checksum": artifact_checksum,
        }
    )
    payload = {
        "artifact_id": (
            f"backtest-artifact-{slugify(artifact_label)}-{artifact_checksum[:12]}"
        ),
        "toy_backtest_run_id": toy_run.toy_backtest_run_id,
        "result_preview_id": toy_run.result_preview_id,
        "manifest_id": toy_run.manifest_id,
        "strategy_id": toy_run.strategy_id,
        "strategy_version": toy_run.strategy_version,
        "parameter_set_id": toy_run.parameter_set_id,
        "data_version": toy_run.data_version,
        "artifact_label": artifact_label,
        "simulated_metric_values": list(toy_run.simulated_metric_values),
        "artifact_checksum": artifact_checksum,
        "reproducibility_hash": reproducibility_hash,
        "warnings": [
            *toy_run.warnings,
            (
                "SDK backtest artifact is local JSON only and remains "
                "research-only simulated metadata."
            ),
        ],
        **safety_flags,
    }
    BacktestArtifact.from_payload(payload)
    return payload


def write_backtest_artifact(path: Path, payload: dict[str, Any]) -> dict[str, Any]:
    if path.suffix.lower() != ".json":
        raise BacktestArtifactError("artifact output path must end with .json")
    path.parent.mkdir(parents=True, exist_ok=True)
    persisted_payload = dict(payload)
    persisted_payload["persisted"] = True
    BacktestArtifact.from_payload(persisted_payload)
    path.write_text(
        json.dumps(persisted_payload, indent=2, sort_keys=True) + "\n",
        encoding="utf-8",
    )
    return persisted_payload


def sha256_json(payload: dict[str, Any]) -> str:
    encoded = json.dumps(payload, sort_keys=True, separators=(",", ":")).encode("utf-8")
    return hashlib.sha256(encoded).hexdigest()


def slugify(value: str) -> str:
    cleaned = "".join(char.lower() if char.isalnum() else "-" for char in value)
    return "-".join(part for part in cleaned.split("-") if part) or "artifact"
