from __future__ import annotations

import hashlib
import json
from collections import Counter
from datetime import UTC, datetime
from typing import Any

from pydantic import BaseModel, Field, field_validator

from app.domain.backtest_artifact import BacktestArtifactPreviewResponse


class BacktestArtifactSummary(BaseModel):
    artifact_id: str
    toy_backtest_run_id: str
    manifest_id: str
    strategy_id: str
    strategy_version: str
    parameter_set_id: str
    data_version: str
    artifact_checksum: str
    persisted: bool
    metric_names: list[str] = Field(default_factory=list)


class BacktestArtifactIndexPreviewRequest(BaseModel):
    artifacts: list[BacktestArtifactPreviewResponse] = Field(min_length=1, max_length=500)
    index_label: str = Field(min_length=1)
    research_only: bool = True

    @field_validator("research_only")
    @classmethod
    def require_research_only(cls, value: bool) -> bool:
        if value is not True:
            raise ValueError("backtest artifact index must remain research_only=true")
        return value


class BacktestArtifactIndexPreviewResponse(BaseModel):
    index_id: str
    index_label: str
    artifact_count: int
    artifacts: list[BacktestArtifactSummary]
    generated_at: datetime = Field(default_factory=lambda: datetime.now(UTC))
    index_checksum: str
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


def preview_backtest_artifact_index(
    request: BacktestArtifactIndexPreviewRequest,
) -> BacktestArtifactIndexPreviewResponse:
    for artifact in request.artifacts:
        validate_artifact_for_index(artifact)
    summaries = sorted(
        [artifact_summary(artifact) for artifact in request.artifacts],
        key=lambda item: (item.artifact_id, item.artifact_checksum),
    )
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
    index_core = {
        "index_label": request.index_label,
        "artifacts": [summary.model_dump() for summary in summaries],
        "safety_flags": safety_flags,
    }
    index_checksum = sha256_json(index_core)
    reproducibility_hash = sha256_json(
        {
            **index_core,
            "index_checksum": index_checksum,
        }
    )
    warnings = [
        (
            "Backtest artifact index is local manifest metadata only. It does not "
            "rank strategies, select best results, write databases, call brokers, "
            "or claim alpha."
        )
    ]
    duplicate_checksums = duplicate_artifact_checksums(summaries)
    if duplicate_checksums:
        warnings.append(
            "Duplicate artifact checksums detected: "
            + ", ".join(duplicate_checksums)
            + ". Duplicates are allowed for local cataloging but should be reviewed."
        )
    return BacktestArtifactIndexPreviewResponse(
        index_id=f"backtest-artifact-index-{slugify(request.index_label)}-{index_checksum[:12]}",
        index_label=request.index_label,
        artifact_count=len(summaries),
        artifacts=summaries,
        index_checksum=index_checksum,
        reproducibility_hash=reproducibility_hash,
        warnings=warnings,
        **safety_flags,
    )


def validate_artifact_for_index(artifact: BacktestArtifactPreviewResponse) -> None:
    if artifact.research_only is not True:
        raise ValueError("backtest artifact must be research_only=true")
    if artifact.execution_eligible is not False:
        raise ValueError("backtest artifact must be execution_eligible=false")
    if artifact.order_created:
        raise ValueError("backtest artifact must not create orders")
    if artifact.broker_api_called:
        raise ValueError("backtest artifact must not call broker APIs")
    if artifact.risk_engine_called:
        raise ValueError("backtest artifact must not call Risk Engine")
    if artifact.oms_called:
        raise ValueError("backtest artifact must not call OMS")
    if artifact.performance_claim:
        raise ValueError("backtest artifact must not make performance claims")
    if artifact.simulated_metrics_only is not True:
        raise ValueError("backtest artifact must be simulated_metrics_only=true")
    if artifact.external_data_downloaded:
        raise ValueError("backtest artifact must not download external data")
    if len(artifact.artifact_checksum) != 64:
        raise ValueError("backtest artifact checksum must be a SHA-256 digest")
    for metric in artifact.simulated_metric_values:
        if metric.simulated is not True:
            raise ValueError("artifact index metrics must be simulated=true")
        if metric.research_only is not True:
            raise ValueError("artifact index metrics must be research_only=true")
        if metric.performance_claim is not False:
            raise ValueError("artifact index metrics must not make performance claims")


def artifact_summary(artifact: BacktestArtifactPreviewResponse) -> BacktestArtifactSummary:
    return BacktestArtifactSummary(
        artifact_id=artifact.artifact_id,
        toy_backtest_run_id=artifact.toy_backtest_run_id,
        manifest_id=artifact.manifest_id,
        strategy_id=artifact.strategy_id,
        strategy_version=artifact.strategy_version,
        parameter_set_id=artifact.parameter_set_id,
        data_version=artifact.data_version,
        artifact_checksum=artifact.artifact_checksum,
        persisted=artifact.persisted,
        metric_names=sorted({metric.name for metric in artifact.simulated_metric_values}),
    )


def duplicate_artifact_checksums(
    summaries: list[BacktestArtifactSummary],
) -> list[str]:
    counts = Counter(summary.artifact_checksum for summary in summaries)
    return sorted(checksum for checksum, count in counts.items() if count > 1)


def sha256_json(payload: dict[str, Any]) -> str:
    encoded = json.dumps(payload, sort_keys=True, separators=(",", ":")).encode("utf-8")
    return hashlib.sha256(encoded).hexdigest()


def slugify(value: str) -> str:
    cleaned = "".join(char.lower() if char.isalnum() else "-" for char in value)
    return "-".join(part for part in cleaned.split("-") if part) or "artifact-index"
