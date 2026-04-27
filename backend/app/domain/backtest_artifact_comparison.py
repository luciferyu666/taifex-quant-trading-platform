from __future__ import annotations

import hashlib
import json
from collections import Counter
from datetime import UTC, datetime
from typing import Any

from pydantic import BaseModel, Field, field_validator

from app.domain.backtest_artifact_index import (
    BacktestArtifactIndexPreviewResponse,
    BacktestArtifactSummary,
)


class ArtifactComparisonSummary(BaseModel):
    data_versions: list[str]
    strategy_versions: list[str]
    parameter_sets: list[str]
    metric_names: list[str]
    checksum_status: dict[str, Any]


class BacktestArtifactComparisonPreviewRequest(BaseModel):
    artifact_index: BacktestArtifactIndexPreviewResponse
    comparison_label: str = Field(min_length=1)
    research_only: bool = True

    @field_validator("research_only")
    @classmethod
    def require_research_only(cls, value: bool) -> bool:
        if value is not True:
            raise ValueError("backtest artifact comparison must remain research_only=true")
        return value


class BacktestArtifactComparisonPreviewResponse(BaseModel):
    comparison_id: str
    comparison_label: str
    index_id: str
    artifact_count: int
    generated_at: datetime = Field(default_factory=lambda: datetime.now(UTC))
    comparison_summary: ArtifactComparisonSummary
    comparison_checksum: str
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
    ranking_generated: bool = False
    best_strategy_selected: bool = False
    persisted: bool = False


def preview_backtest_artifact_comparison(
    request: BacktestArtifactComparisonPreviewRequest,
) -> BacktestArtifactComparisonPreviewResponse:
    validate_index_for_comparison(request.artifact_index)
    summary = build_comparison_summary(request.artifact_index.artifacts)
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
        "ranking_generated": False,
        "best_strategy_selected": False,
        "persisted": False,
    }
    comparison_core = {
        "comparison_label": request.comparison_label,
        "index_id": request.artifact_index.index_id,
        "index_checksum": request.artifact_index.index_checksum,
        "artifact_count": request.artifact_index.artifact_count,
        "comparison_summary": summary.model_dump(),
        "safety_flags": safety_flags,
    }
    comparison_checksum = sha256_json(comparison_core)
    reproducibility_hash = sha256_json(
        {
            **comparison_core,
            "comparison_checksum": comparison_checksum,
        }
    )
    warnings = [
        (
            "Backtest artifact comparison is a dry-run metadata preview only. It "
            "does not rank strategies, select a best result, create orders, call "
            "brokers, or claim alpha."
        )
    ]
    duplicate_checksums = summary.checksum_status.get("duplicate_artifact_checksums", [])
    if duplicate_checksums:
        warnings.append(
            "Duplicate artifact checksums detected: "
            + ", ".join(str(item) for item in duplicate_checksums)
            + ". Duplicates are compared as catalog metadata only."
        )
    if not summary.metric_names:
        warnings.append(
            "No metric names were available in the artifact index. Rebuild the index "
            "with metric_names for simulated schema comparison."
        )
    return BacktestArtifactComparisonPreviewResponse(
        comparison_id=(
            f"backtest-artifact-comparison-{slugify(request.comparison_label)}-"
            f"{comparison_checksum[:12]}"
        ),
        comparison_label=request.comparison_label,
        index_id=request.artifact_index.index_id,
        artifact_count=request.artifact_index.artifact_count,
        comparison_summary=summary,
        comparison_checksum=comparison_checksum,
        reproducibility_hash=reproducibility_hash,
        warnings=warnings,
        **safety_flags,
    )


def validate_index_for_comparison(index: BacktestArtifactIndexPreviewResponse) -> None:
    if index.research_only is not True:
        raise ValueError("backtest artifact index must be research_only=true")
    if index.execution_eligible is not False:
        raise ValueError("backtest artifact index must be execution_eligible=false")
    if index.order_created:
        raise ValueError("backtest artifact index must not create orders")
    if index.broker_api_called:
        raise ValueError("backtest artifact index must not call broker APIs")
    if index.risk_engine_called:
        raise ValueError("backtest artifact index must not call Risk Engine")
    if index.oms_called:
        raise ValueError("backtest artifact index must not call OMS")
    if index.performance_claim:
        raise ValueError("backtest artifact index must not make performance claims")
    if index.simulated_metrics_only is not True:
        raise ValueError("backtest artifact index must be simulated_metrics_only=true")
    if index.external_data_downloaded:
        raise ValueError("backtest artifact index must not download external data")
    if index.artifact_count != len(index.artifacts):
        raise ValueError("artifact_count must match artifact summaries length")
    if not is_sha256_digest(index.index_checksum):
        raise ValueError("index_checksum must be a SHA-256 digest")
    if not is_sha256_digest(index.reproducibility_hash):
        raise ValueError("index reproducibility_hash must be a SHA-256 digest")
    invalid_checksums = [
        artifact.artifact_id
        for artifact in index.artifacts
        if not is_sha256_digest(artifact.artifact_checksum)
    ]
    if invalid_checksums:
        raise ValueError(
            "artifact summaries contain invalid SHA-256 checksums: "
            + ", ".join(invalid_checksums)
        )


def build_comparison_summary(
    artifacts: list[BacktestArtifactSummary],
) -> ArtifactComparisonSummary:
    data_versions = sorted({artifact.data_version for artifact in artifacts})
    strategy_versions = sorted(
        {f"{artifact.strategy_id}@{artifact.strategy_version}" for artifact in artifacts}
    )
    parameter_sets = sorted({artifact.parameter_set_id for artifact in artifacts})
    metric_names = sorted(
        {
            metric_name
            for artifact in artifacts
            for metric_name in getattr(artifact, "metric_names", [])
        }
    )
    duplicate_checksums = duplicate_artifact_checksums(artifacts)
    return ArtifactComparisonSummary(
        data_versions=data_versions,
        strategy_versions=strategy_versions,
        parameter_sets=parameter_sets,
        metric_names=metric_names,
        checksum_status={
            "index_artifact_count": len(artifacts),
            "artifact_checksums_valid": all(
                is_sha256_digest(artifact.artifact_checksum) for artifact in artifacts
            ),
            "unique_artifact_checksums": len(
                {artifact.artifact_checksum for artifact in artifacts}
            ),
            "duplicate_artifact_checksums": duplicate_checksums,
        },
    )


def duplicate_artifact_checksums(
    artifacts: list[BacktestArtifactSummary],
) -> list[str]:
    counts = Counter(artifact.artifact_checksum for artifact in artifacts)
    return sorted(checksum for checksum, count in counts.items() if count > 1)


def is_sha256_digest(value: str) -> bool:
    return len(value) == 64 and all(char in "0123456789abcdef" for char in value)


def sha256_json(payload: dict[str, Any]) -> str:
    encoded = json.dumps(payload, sort_keys=True, separators=(",", ":")).encode("utf-8")
    return hashlib.sha256(encoded).hexdigest()


def slugify(value: str) -> str:
    cleaned = "".join(char.lower() if char.isalnum() else "-" for char in value)
    return "-".join(part for part in cleaned.split("-") if part) or "comparison"
