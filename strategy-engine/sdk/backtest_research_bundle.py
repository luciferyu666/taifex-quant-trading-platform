from __future__ import annotations

import hashlib
import json
from dataclasses import dataclass
from pathlib import Path
from typing import Any

from .backtest_artifact import BacktestArtifact, BacktestArtifactError
from .backtest_artifact_comparison import (
    BacktestArtifactComparison,
    BacktestArtifactComparisonError,
)
from .backtest_artifact_index import BacktestArtifactIndex, BacktestArtifactIndexError
from .backtest_contract import BacktestContractError, BacktestPreviewContract
from .backtest_result import BacktestResultContractError, BacktestResultPreviewContract
from .dataset_manifest import DatasetManifest, DatasetManifestError
from .toy_backtest import ToyBacktestError, ToyBacktestRun


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


class BacktestResearchBundleError(ValueError):
    pass


@dataclass(frozen=True)
class BacktestResearchBundle:
    bundle_id: str
    bundle_label: str
    manifest_id: str
    data_version: str
    strategy_id: str
    strategy_version: str
    parameter_set_ids: tuple[str, ...]
    artifact_count: int
    included_sections: tuple[str, ...]
    checksums: dict[str, str]
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
    ranking_generated: bool
    best_strategy_selected: bool
    persisted: bool
    warnings: tuple[str, ...] = ()

    @classmethod
    def from_payload(cls, payload: dict[str, Any]) -> "BacktestResearchBundle":
        if not isinstance(payload, dict):
            raise BacktestResearchBundleError("research bundle payload must be an object")
        parameter_set_ids = payload.get("parameter_set_ids") or []
        included_sections = payload.get("included_sections") or []
        record = cls(
            bundle_id=str(payload.get("bundle_id") or ""),
            bundle_label=str(payload.get("bundle_label") or ""),
            manifest_id=str(payload.get("manifest_id") or ""),
            data_version=str(payload.get("data_version") or ""),
            strategy_id=str(payload.get("strategy_id") or ""),
            strategy_version=str(payload.get("strategy_version") or ""),
            parameter_set_ids=tuple(str(item) for item in parameter_set_ids),
            artifact_count=int(payload.get("artifact_count") or 0),
            included_sections=tuple(str(item) for item in included_sections),
            checksums=dict(payload.get("checksums") or {}),
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
            ranking_generated=bool(payload.get("ranking_generated")),
            best_strategy_selected=bool(payload.get("best_strategy_selected")),
            persisted=bool(payload.get("persisted")),
            warnings=tuple(str(item) for item in payload.get("warnings", [])),
        )
        record.validate_safe_bundle()
        return record

    def validate_safe_bundle(self) -> None:
        if not self.bundle_id:
            raise BacktestResearchBundleError("bundle_id is required")
        if not self.bundle_label:
            raise BacktestResearchBundleError("bundle_label is required")
        if not self.manifest_id:
            raise BacktestResearchBundleError("manifest_id is required")
        if self.artifact_count < 1:
            raise BacktestResearchBundleError("artifact_count must be positive")
        if set(self.included_sections) != set(INCLUDED_SECTIONS):
            raise BacktestResearchBundleError("included_sections must contain Phase 3 artifacts")
        if len(self.reproducibility_hash) != 64:
            raise BacktestResearchBundleError(
                "reproducibility_hash must be a SHA-256 digest"
            )
        required_checksum_keys = {
            "manifest_reproducibility_hash",
            "backtest_preview_reproducibility_hash",
            "result_preview_reproducibility_hash",
            "toy_run_reproducibility_hash",
            "artifact_checksum",
            "index_checksum",
            "comparison_checksum",
            "bundle_checksum",
        }
        if set(self.checksums) != required_checksum_keys:
            raise BacktestResearchBundleError("checksums must contain all bundle keys")
        invalid = [
            key
            for key, value in self.checksums.items()
            if not is_sha256_digest(str(value))
        ]
        if invalid:
            raise BacktestResearchBundleError(
                "bundle checksums must be SHA-256 digests: " + ", ".join(invalid)
            )
        if self.research_only is not True:
            raise BacktestResearchBundleError("research bundle must be research_only=true")
        if self.execution_eligible is not False:
            raise BacktestResearchBundleError(
                "research bundle must be execution_eligible=false"
            )
        if self.order_created:
            raise BacktestResearchBundleError("research bundle must not create orders")
        if self.broker_api_called:
            raise BacktestResearchBundleError(
                "research bundle must not call broker APIs"
            )
        if self.risk_engine_called:
            raise BacktestResearchBundleError(
                "research bundle must not call Risk Engine"
            )
        if self.oms_called:
            raise BacktestResearchBundleError("research bundle must not call OMS")
        if self.performance_claim:
            raise BacktestResearchBundleError(
                "research bundle must not make performance claims"
            )
        if self.simulated_metrics_only is not True:
            raise BacktestResearchBundleError(
                "research bundle must be simulated_metrics_only=true"
            )
        if self.external_data_downloaded:
            raise BacktestResearchBundleError(
                "research bundle must not download external data"
            )
        if self.ranking_generated:
            raise BacktestResearchBundleError(
                "research bundle must not generate rankings"
            )
        if self.best_strategy_selected:
            raise BacktestResearchBundleError(
                "research bundle must not select a best strategy"
            )


def build_backtest_research_bundle_payload(
    manifest_payload: dict[str, Any],
    signal_payload: dict[str, Any],
    backtest_preview_payload: dict[str, Any],
    result_preview_payload: dict[str, Any],
    toy_backtest_payload: dict[str, Any],
    artifact_payload: dict[str, Any],
    index_payload: dict[str, Any],
    comparison_payload: dict[str, Any],
    bundle_label: str,
) -> dict[str, Any]:
    try:
        manifest = DatasetManifest.from_payload(manifest_payload)
        preview = BacktestPreviewContract.from_payload(backtest_preview_payload)
        result = BacktestResultPreviewContract.from_payload(result_preview_payload)
        toy_run = ToyBacktestRun.from_payload(toy_backtest_payload)
        artifact = BacktestArtifact.from_payload(artifact_payload)
        index = BacktestArtifactIndex.from_payload(index_payload)
        comparison = BacktestArtifactComparison.from_payload(comparison_payload)
    except (
        DatasetManifestError,
        BacktestContractError,
        BacktestResultContractError,
        ToyBacktestError,
        BacktestArtifactError,
        BacktestArtifactIndexError,
        BacktestArtifactComparisonError,
    ) as exc:
        raise BacktestResearchBundleError(str(exc)) from exc
    validate_signal_payload(signal_payload, manifest)
    validate_bundle_consistency(
        manifest=manifest,
        signal_payload=signal_payload,
        preview=preview,
        result=result,
        toy_run=toy_run,
        artifact=artifact,
        index=index,
        comparison=comparison,
    )
    parameter_set_ids = sorted(
        {
            preview.parameter_set_id,
            result.parameter_set_id,
            toy_run.parameter_set_id,
            artifact.parameter_set_id,
            *comparison.comparison_summary.get("parameter_sets", []),
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
        "bundle_label": bundle_label,
        "manifest_id": manifest.manifest_id,
        "data_version": manifest.data_version,
        "strategy_id": preview.strategy_id,
        "strategy_version": preview.strategy_version,
        "parameter_set_ids": parameter_set_ids,
        "artifact_count": index.artifact_count,
        "included_sections": INCLUDED_SECTIONS,
        "manifest_reproducibility_hash": manifest.reproducibility_hash,
        "backtest_preview_reproducibility_hash": preview.reproducibility_hash,
        "result_preview_reproducibility_hash": result.reproducibility_hash,
        "toy_run_reproducibility_hash": toy_run.reproducibility_hash,
        "artifact_checksum": artifact.artifact_checksum,
        "index_checksum": index.index_checksum,
        "comparison_checksum": comparison.comparison_checksum,
        "safety_flags": safety_flags,
    }
    bundle_checksum = sha256_json(bundle_core)
    checksums = {
        "manifest_reproducibility_hash": manifest.reproducibility_hash,
        "backtest_preview_reproducibility_hash": preview.reproducibility_hash,
        "result_preview_reproducibility_hash": result.reproducibility_hash,
        "toy_run_reproducibility_hash": toy_run.reproducibility_hash,
        "artifact_checksum": artifact.artifact_checksum,
        "index_checksum": index.index_checksum,
        "comparison_checksum": comparison.comparison_checksum,
        "bundle_checksum": bundle_checksum,
    }
    reproducibility_hash = sha256_json(
        {
            **bundle_core,
            "bundle_checksum": bundle_checksum,
        }
    )
    payload = {
        "bundle_id": f"backtest-research-bundle-{slugify(bundle_label)}-{bundle_checksum[:12]}",
        "bundle_label": bundle_label,
        "manifest_id": manifest.manifest_id,
        "data_version": manifest.data_version,
        "strategy_id": preview.strategy_id,
        "strategy_version": preview.strategy_version,
        "parameter_set_ids": parameter_set_ids,
        "artifact_count": index.artifact_count,
        "included_sections": INCLUDED_SECTIONS,
        "checksums": checksums,
        "reproducibility_hash": reproducibility_hash,
        "warnings": dedupe_warnings(
            [
                *manifest.warnings,
                *preview.warnings,
                *result.warnings,
                *toy_run.warnings,
                *artifact.warnings,
                *index.warnings,
                *comparison.warnings,
                (
                    "SDK research bundle is local metadata only. It is not a "
                    "performance report, trading recommendation, ranking, or live "
                    "readiness approval."
                ),
            ]
        ),
        **safety_flags,
    }
    BacktestResearchBundle.from_payload(payload)
    return payload


def write_backtest_research_bundle(path: Path, payload: dict[str, Any]) -> dict[str, Any]:
    if path.suffix.lower() != ".json":
        raise BacktestResearchBundleError("research bundle output path must end with .json")
    path.parent.mkdir(parents=True, exist_ok=True)
    persisted_payload = dict(payload)
    persisted_payload["persisted"] = True
    BacktestResearchBundle.from_payload(persisted_payload)
    path.write_text(
        json.dumps(persisted_payload, indent=2, sort_keys=True) + "\n",
        encoding="utf-8",
    )
    return persisted_payload


def validate_signal_payload(
    signal_payload: dict[str, Any],
    manifest: DatasetManifest,
) -> None:
    reason = signal_payload.get("reason") or {}
    if not isinstance(reason, dict):
        raise BacktestResearchBundleError("strategy signal reason must be an object")
    if reason.get("signals_only") is not True:
        raise BacktestResearchBundleError("strategy signal must be signals_only=true")
    if reason.get("order_created") is True:
        raise BacktestResearchBundleError("strategy signal must not create orders")
    if reason.get("broker_api_called") is True:
        raise BacktestResearchBundleError("strategy signal must not call broker APIs")
    if reason.get("manifest_id") != manifest.manifest_id:
        raise BacktestResearchBundleError(
            "strategy signal manifest_id must match manifest"
        )
    if reason.get("data_version") != manifest.data_version:
        raise BacktestResearchBundleError(
            "strategy signal data_version must match manifest"
        )


def validate_bundle_consistency(
    manifest: DatasetManifest,
    signal_payload: dict[str, Any],
    preview: BacktestPreviewContract,
    result: BacktestResultPreviewContract,
    toy_run: ToyBacktestRun,
    artifact: BacktestArtifact,
    index: BacktestArtifactIndex,
    comparison: BacktestArtifactComparison,
) -> None:
    if preview.manifest_id != manifest.manifest_id:
        raise BacktestResearchBundleError("backtest preview manifest_id mismatch")
    if preview.data_version != manifest.data_version:
        raise BacktestResearchBundleError("backtest preview data_version mismatch")
    if preview.strategy_id != signal_payload.get("strategy_id"):
        raise BacktestResearchBundleError("backtest preview strategy_id mismatch")
    if preview.strategy_version != signal_payload.get("strategy_version"):
        raise BacktestResearchBundleError("backtest preview strategy_version mismatch")
    if result.backtest_preview_id != preview.backtest_preview_id:
        raise BacktestResearchBundleError("result preview must reference preview")
    if toy_run.result_preview_id != result.result_preview_id:
        raise BacktestResearchBundleError("toy run must reference result preview")
    if artifact.toy_backtest_run_id != toy_run.toy_backtest_run_id:
        raise BacktestResearchBundleError("artifact must reference toy run")
    if artifact.artifact_id not in {
        str(item["artifact_id"]) for item in index.artifacts
    }:
        raise BacktestResearchBundleError("index must include artifact")
    if comparison.index_id != index.index_id:
        raise BacktestResearchBundleError("comparison must reference artifact index")
    for item in [result, toy_run, artifact]:
        if item.manifest_id != manifest.manifest_id:
            raise BacktestResearchBundleError("bundle manifest_id mismatch")
        if item.data_version != manifest.data_version:
            raise BacktestResearchBundleError("bundle data_version mismatch")
        if item.strategy_id != preview.strategy_id:
            raise BacktestResearchBundleError("bundle strategy_id mismatch")
        if item.strategy_version != preview.strategy_version:
            raise BacktestResearchBundleError("bundle strategy_version mismatch")
        if item.parameter_set_id != preview.parameter_set_id:
            raise BacktestResearchBundleError("bundle parameter_set_id mismatch")


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
