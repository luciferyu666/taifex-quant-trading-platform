from __future__ import annotations

import hashlib
import json
from datetime import UTC, datetime
from typing import Any

from pydantic import BaseModel, Field, field_validator

from app.domain.backtest_artifact import BacktestArtifactPreviewResponse
from app.domain.backtest_artifact_comparison import (
    BacktestArtifactComparisonPreviewResponse,
)
from app.domain.backtest_artifact_index import BacktestArtifactIndexPreviewResponse
from app.domain.backtest_preview import BacktestPreviewResponse
from app.domain.backtest_result import BacktestResultPreviewResponse
from app.domain.feature_manifest import FeatureDatasetManifest
from app.domain.signals import StrategySignal
from app.domain.toy_backtest import ToyBacktestResponse

INCLUDED_SECTIONS = [
    "feature_manifest",
    "strategy_signal",
    "backtest_preview",
    "backtest_result_preview",
    "toy_backtest_run",
    "backtest_artifact",
    "backtest_artifact_index",
    "backtest_artifact_comparison",
]


class BacktestResearchBundleChecksums(BaseModel):
    manifest_reproducibility_hash: str
    backtest_preview_reproducibility_hash: str
    result_preview_reproducibility_hash: str
    toy_run_reproducibility_hash: str
    artifact_checksum: str
    index_checksum: str
    comparison_checksum: str
    bundle_checksum: str


class BacktestResearchBundlePreviewRequest(BaseModel):
    feature_manifest: FeatureDatasetManifest
    strategy_signal: StrategySignal
    backtest_preview: BacktestPreviewResponse
    backtest_result_preview: BacktestResultPreviewResponse
    toy_backtest_run: ToyBacktestResponse
    backtest_artifact: BacktestArtifactPreviewResponse
    backtest_artifact_index: BacktestArtifactIndexPreviewResponse
    backtest_artifact_comparison: BacktestArtifactComparisonPreviewResponse
    bundle_label: str = Field(min_length=1)
    research_only: bool = True

    @field_validator("research_only")
    @classmethod
    def require_research_only(cls, value: bool) -> bool:
        if value is not True:
            raise ValueError("backtest research bundle must remain research_only=true")
        return value


class BacktestResearchBundlePreviewResponse(BaseModel):
    bundle_id: str
    bundle_label: str
    manifest_id: str
    data_version: str
    strategy_id: str
    strategy_version: str
    parameter_set_ids: list[str]
    artifact_count: int
    included_sections: list[str]
    generated_at: datetime = Field(default_factory=lambda: datetime.now(UTC))
    checksums: BacktestResearchBundleChecksums
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


def preview_backtest_research_bundle(
    request: BacktestResearchBundlePreviewRequest,
) -> BacktestResearchBundlePreviewResponse:
    validate_research_bundle_inputs(request)
    parameter_set_ids = sorted(
        {
            request.backtest_preview.parameter_set_id,
            request.backtest_result_preview.parameter_set_id,
            request.toy_backtest_run.parameter_set_id,
            request.backtest_artifact.parameter_set_id,
            *request.backtest_artifact_comparison.comparison_summary.parameter_sets,
        }
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
        "ranking_generated": False,
        "best_strategy_selected": False,
        "persisted": False,
    }
    bundle_core = {
        "bundle_label": request.bundle_label,
        "manifest_id": request.feature_manifest.manifest_id,
        "data_version": request.feature_manifest.data_version,
        "strategy_id": request.backtest_preview.strategy_id,
        "strategy_version": request.backtest_preview.strategy_version,
        "parameter_set_ids": parameter_set_ids,
        "artifact_count": request.backtest_artifact_index.artifact_count,
        "included_sections": INCLUDED_SECTIONS,
        "manifest_reproducibility_hash": request.feature_manifest.reproducibility_hash,
        "backtest_preview_reproducibility_hash": (
            request.backtest_preview.reproducibility_hash
        ),
        "result_preview_reproducibility_hash": (
            request.backtest_result_preview.reproducibility_hash
        ),
        "toy_run_reproducibility_hash": request.toy_backtest_run.reproducibility_hash,
        "artifact_checksum": request.backtest_artifact.artifact_checksum,
        "index_checksum": request.backtest_artifact_index.index_checksum,
        "comparison_checksum": (
            request.backtest_artifact_comparison.comparison_checksum
        ),
        "safety_flags": safety_flags,
    }
    bundle_checksum = sha256_json(bundle_core)
    checksums = BacktestResearchBundleChecksums(
        manifest_reproducibility_hash=request.feature_manifest.reproducibility_hash,
        backtest_preview_reproducibility_hash=(
            request.backtest_preview.reproducibility_hash
        ),
        result_preview_reproducibility_hash=(
            request.backtest_result_preview.reproducibility_hash
        ),
        toy_run_reproducibility_hash=request.toy_backtest_run.reproducibility_hash,
        artifact_checksum=request.backtest_artifact.artifact_checksum,
        index_checksum=request.backtest_artifact_index.index_checksum,
        comparison_checksum=request.backtest_artifact_comparison.comparison_checksum,
        bundle_checksum=bundle_checksum,
    )
    reproducibility_hash = sha256_json(
        {
            **bundle_core,
            "bundle_checksum": bundle_checksum,
        }
    )
    warnings = dedupe_warnings(
        [
            *request.feature_manifest.warnings,
            *request.backtest_preview.warnings,
            *request.backtest_result_preview.warnings,
            *request.toy_backtest_run.warnings,
            *request.backtest_artifact.warnings,
            *request.backtest_artifact_index.warnings,
            *request.backtest_artifact_comparison.warnings,
            (
                "Backtest research bundle is dry-run local metadata only. It is not "
                "a performance report, trading recommendation, ranking, or live "
                "readiness approval."
            ),
        ]
    )
    return BacktestResearchBundlePreviewResponse(
        bundle_id=f"backtest-research-bundle-{slugify(request.bundle_label)}-{bundle_checksum[:12]}",
        bundle_label=request.bundle_label,
        manifest_id=request.feature_manifest.manifest_id,
        data_version=request.feature_manifest.data_version,
        strategy_id=request.backtest_preview.strategy_id,
        strategy_version=request.backtest_preview.strategy_version,
        parameter_set_ids=parameter_set_ids,
        artifact_count=request.backtest_artifact_index.artifact_count,
        included_sections=list(INCLUDED_SECTIONS),
        checksums=checksums,
        reproducibility_hash=reproducibility_hash,
        warnings=warnings,
        **safety_flags,
    )


def validate_research_bundle_inputs(
    request: BacktestResearchBundlePreviewRequest,
) -> None:
    validate_feature_manifest(request.feature_manifest)
    validate_strategy_signal(request.strategy_signal, request.feature_manifest)
    validate_backtest_preview(request.backtest_preview)
    validate_result_preview(request.backtest_result_preview)
    validate_toy_run(request.toy_backtest_run)
    validate_artifact(request.backtest_artifact)
    validate_index(request.backtest_artifact_index)
    validate_comparison(request.backtest_artifact_comparison)
    validate_bundle_consistency(request)


def validate_feature_manifest(manifest: FeatureDatasetManifest) -> None:
    if manifest.research_only is not True:
        raise ValueError("feature manifest must be research_only=true")
    if manifest.execution_eligible is not False:
        raise ValueError("feature manifest must be execution_eligible=false")
    if manifest.external_data_downloaded:
        raise ValueError("feature manifest must not download external data")
    if manifest.broker_api_called:
        raise ValueError("feature manifest must not call broker APIs")
    if not is_sha256_digest(manifest.reproducibility_hash):
        raise ValueError("manifest reproducibility_hash must be a SHA-256 digest")


def validate_strategy_signal(
    signal: StrategySignal,
    manifest: FeatureDatasetManifest,
) -> None:
    if signal.reason.get("signals_only") is not True:
        raise ValueError("strategy signal must be signals_only=true")
    if signal.reason.get("order_created") is True:
        raise ValueError("strategy signal must not create orders")
    if signal.reason.get("broker_api_called") is True:
        raise ValueError("strategy signal must not call broker APIs")
    if signal.reason.get("risk_engine_called") is True:
        raise ValueError("strategy signal must not call Risk Engine")
    if signal.reason.get("oms_called") is True:
        raise ValueError("strategy signal must not call OMS")
    if signal.reason.get("manifest_id") != manifest.manifest_id:
        raise ValueError("strategy signal manifest_id must match feature manifest")
    if signal.reason.get("data_version") != manifest.data_version:
        raise ValueError("strategy signal data_version must match feature manifest")


def validate_backtest_preview(preview: BacktestPreviewResponse) -> None:
    validate_common_safety(preview, "backtest preview")


def validate_result_preview(result: BacktestResultPreviewResponse) -> None:
    validate_common_safety(result, "backtest result preview")
    if result.simulated_metrics_only is not True:
        raise ValueError("backtest result preview must be simulated_metrics_only=true")


def validate_toy_run(toy_run: ToyBacktestResponse) -> None:
    validate_common_safety(toy_run, "toy backtest run")
    if toy_run.simulated_metrics_only is not True:
        raise ValueError("toy backtest run must be simulated_metrics_only=true")
    for metric in toy_run.simulated_metric_values:
        if metric.simulated is not True:
            raise ValueError("toy backtest metrics must be simulated=true")
        if metric.research_only is not True:
            raise ValueError("toy backtest metrics must be research_only=true")
        if metric.performance_claim is not False:
            raise ValueError("toy backtest metrics must not make performance claims")


def validate_artifact(artifact: BacktestArtifactPreviewResponse) -> None:
    validate_common_safety(artifact, "backtest artifact")
    if artifact.simulated_metrics_only is not True:
        raise ValueError("backtest artifact must be simulated_metrics_only=true")
    if artifact.persisted is not False:
        raise ValueError("backtest artifact bundle input must be persisted=false")
    if not is_sha256_digest(artifact.artifact_checksum):
        raise ValueError("artifact_checksum must be a SHA-256 digest")


def validate_index(index: BacktestArtifactIndexPreviewResponse) -> None:
    validate_common_safety(index, "backtest artifact index")
    if index.simulated_metrics_only is not True:
        raise ValueError("backtest artifact index must be simulated_metrics_only=true")
    if index.persisted is not False:
        raise ValueError("backtest artifact index bundle input must be persisted=false")
    if not is_sha256_digest(index.index_checksum):
        raise ValueError("index_checksum must be a SHA-256 digest")


def validate_comparison(comparison: BacktestArtifactComparisonPreviewResponse) -> None:
    validate_common_safety(comparison, "backtest artifact comparison")
    if comparison.simulated_metrics_only is not True:
        raise ValueError("backtest artifact comparison must be simulated_metrics_only=true")
    if comparison.ranking_generated is not False:
        raise ValueError("backtest artifact comparison must not generate rankings")
    if comparison.best_strategy_selected is not False:
        raise ValueError("backtest artifact comparison must not select best strategy")
    if comparison.persisted is not False:
        raise ValueError("backtest artifact comparison bundle input must be persisted=false")
    if not is_sha256_digest(comparison.comparison_checksum):
        raise ValueError("comparison_checksum must be a SHA-256 digest")


def validate_common_safety(payload: Any, label: str) -> None:
    if payload.research_only is not True:
        raise ValueError(f"{label} must be research_only=true")
    if payload.execution_eligible is not False:
        raise ValueError(f"{label} must be execution_eligible=false")
    if payload.order_created:
        raise ValueError(f"{label} must not create orders")
    if payload.broker_api_called:
        raise ValueError(f"{label} must not call broker APIs")
    if payload.risk_engine_called:
        raise ValueError(f"{label} must not call Risk Engine")
    if payload.oms_called:
        raise ValueError(f"{label} must not call OMS")
    if payload.performance_claim:
        raise ValueError(f"{label} must not make performance claims")
    if payload.external_data_downloaded:
        raise ValueError(f"{label} must not download external data")


def validate_bundle_consistency(request: BacktestResearchBundlePreviewRequest) -> None:
    manifest_id = request.feature_manifest.manifest_id
    data_version = request.feature_manifest.data_version
    strategy_id = request.strategy_signal.strategy_id
    strategy_version = request.strategy_signal.strategy_version
    parameter_set_id = request.backtest_preview.parameter_set_id

    if request.backtest_preview.manifest_id != manifest_id:
        raise ValueError("backtest preview manifest_id must match feature manifest")
    if request.backtest_preview.data_version != data_version:
        raise ValueError("backtest preview data_version must match feature manifest")
    if request.backtest_preview.strategy_id != strategy_id:
        raise ValueError("backtest preview strategy_id must match strategy signal")
    if request.backtest_preview.strategy_version != strategy_version:
        raise ValueError("backtest preview strategy_version must match strategy signal")
    if request.backtest_result_preview.backtest_preview_id != (
        request.backtest_preview.backtest_preview_id
    ):
        raise ValueError("result preview must reference backtest preview")
    if request.toy_backtest_run.result_preview_id != (
        request.backtest_result_preview.result_preview_id
    ):
        raise ValueError("toy backtest run must reference result preview")
    if request.backtest_artifact.toy_backtest_run_id != (
        request.toy_backtest_run.toy_backtest_run_id
    ):
        raise ValueError("backtest artifact must reference toy backtest run")
    if request.backtest_artifact_index.artifact_count != len(
        request.backtest_artifact_index.artifacts
    ):
        raise ValueError("artifact index count must match artifact summaries")
    artifact_summary_ids = {
        summary.artifact_id for summary in request.backtest_artifact_index.artifacts
    }
    if request.backtest_artifact.artifact_id not in artifact_summary_ids:
        raise ValueError("artifact index must include backtest artifact")
    if request.backtest_artifact_comparison.index_id != request.backtest_artifact_index.index_id:
        raise ValueError("artifact comparison must reference artifact index")
    for payload in [
        request.backtest_result_preview,
        request.toy_backtest_run,
        request.backtest_artifact,
    ]:
        if payload.manifest_id != manifest_id:
            raise ValueError("all backtest artifacts must share manifest_id")
        if payload.data_version != data_version:
            raise ValueError("all backtest artifacts must share data_version")
        if payload.strategy_id != strategy_id:
            raise ValueError("all backtest artifacts must share strategy_id")
        if payload.strategy_version != strategy_version:
            raise ValueError("all backtest artifacts must share strategy_version")
        if payload.parameter_set_id != parameter_set_id:
            raise ValueError("all backtest artifacts must share parameter_set_id")


def dedupe_warnings(warnings: list[str]) -> list[str]:
    seen: set[str] = set()
    result: list[str] = []
    for warning in warnings:
        if warning not in seen:
            seen.add(warning)
            result.append(warning)
    return result


def is_sha256_digest(value: str) -> bool:
    return len(value) == 64 and all(char in "0123456789abcdef" for char in value)


def sha256_json(payload: dict[str, Any]) -> str:
    encoded = json.dumps(payload, sort_keys=True, separators=(",", ":")).encode("utf-8")
    return hashlib.sha256(encoded).hexdigest()


def slugify(value: str) -> str:
    cleaned = "".join(char.lower() if char.isalnum() else "-" for char in value)
    return "-".join(part for part in cleaned.split("-") if part) or "research-bundle"
