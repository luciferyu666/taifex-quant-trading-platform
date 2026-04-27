from __future__ import annotations

import hashlib
import json
from collections import Counter
from dataclasses import dataclass
from typing import Any

from .backtest_artifact_index import BacktestArtifactIndex, BacktestArtifactIndexError


class BacktestArtifactComparisonError(ValueError):
    pass


@dataclass(frozen=True)
class BacktestArtifactComparison:
    comparison_id: str
    comparison_label: str
    index_id: str
    artifact_count: int
    comparison_summary: dict[str, Any]
    comparison_checksum: str
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
    def from_payload(cls, payload: dict[str, Any]) -> "BacktestArtifactComparison":
        if not isinstance(payload, dict):
            raise BacktestArtifactComparisonError(
                "artifact comparison payload must be an object"
            )
        record = cls(
            comparison_id=str(payload.get("comparison_id") or ""),
            comparison_label=str(payload.get("comparison_label") or ""),
            index_id=str(payload.get("index_id") or ""),
            artifact_count=int(payload.get("artifact_count") or 0),
            comparison_summary=dict(payload.get("comparison_summary") or {}),
            comparison_checksum=str(payload.get("comparison_checksum") or ""),
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
        record.validate_safe_comparison()
        return record

    def validate_safe_comparison(self) -> None:
        if not self.comparison_id:
            raise BacktestArtifactComparisonError("comparison_id is required")
        if not self.comparison_label:
            raise BacktestArtifactComparisonError("comparison_label is required")
        if not self.index_id:
            raise BacktestArtifactComparisonError("index_id is required")
        if self.artifact_count < 1:
            raise BacktestArtifactComparisonError("artifact_count must be positive")
        if len(self.comparison_checksum) != 64:
            raise BacktestArtifactComparisonError(
                "comparison_checksum must be a SHA-256 digest"
            )
        if len(self.reproducibility_hash) != 64:
            raise BacktestArtifactComparisonError(
                "reproducibility_hash must be a SHA-256 digest"
            )
        if self.research_only is not True:
            raise BacktestArtifactComparisonError(
                "artifact comparison must be research_only=true"
            )
        if self.execution_eligible is not False:
            raise BacktestArtifactComparisonError(
                "artifact comparison must be execution_eligible=false"
            )
        if self.order_created:
            raise BacktestArtifactComparisonError(
                "artifact comparison must not create orders"
            )
        if self.broker_api_called:
            raise BacktestArtifactComparisonError(
                "artifact comparison must not call broker APIs"
            )
        if self.risk_engine_called:
            raise BacktestArtifactComparisonError(
                "artifact comparison must not call Risk Engine"
            )
        if self.oms_called:
            raise BacktestArtifactComparisonError(
                "artifact comparison must not call OMS"
            )
        if self.performance_claim:
            raise BacktestArtifactComparisonError(
                "artifact comparison must not make performance claims"
            )
        if self.simulated_metrics_only is not True:
            raise BacktestArtifactComparisonError(
                "artifact comparison must be simulated_metrics_only=true"
            )
        if self.external_data_downloaded:
            raise BacktestArtifactComparisonError(
                "artifact comparison must not download external data"
            )
        if self.ranking_generated:
            raise BacktestArtifactComparisonError(
                "artifact comparison must not generate rankings"
            )
        if self.best_strategy_selected:
            raise BacktestArtifactComparisonError(
                "artifact comparison must not select a best strategy"
            )


def build_backtest_artifact_comparison_payload(
    index_payload: dict[str, Any],
    comparison_label: str,
) -> dict[str, Any]:
    try:
        index = BacktestArtifactIndex.from_payload(index_payload)
    except BacktestArtifactIndexError as exc:
        raise BacktestArtifactComparisonError(str(exc)) from exc
    comparison_summary = build_comparison_summary(index)
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
        "comparison_label": comparison_label,
        "index_id": index.index_id,
        "index_checksum": index.index_checksum,
        "artifact_count": index.artifact_count,
        "comparison_summary": comparison_summary,
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
            "SDK backtest artifact comparison is dry-run metadata only. It does not "
            "rank strategies, select best results, call brokers, or claim alpha."
        )
    ]
    duplicate_checksums = comparison_summary["checksum_status"][
        "duplicate_artifact_checksums"
    ]
    if duplicate_checksums:
        warnings.append(
            "Duplicate artifact checksums detected: "
            + ", ".join(str(item) for item in duplicate_checksums)
            + ". Duplicates are compared as catalog metadata only."
        )
    if not comparison_summary["metric_names"]:
        warnings.append(
            "No metric names were available in the artifact index. Rebuild the index "
            "with metric_names for simulated schema comparison."
        )
    payload = {
        "comparison_id": (
            f"backtest-artifact-comparison-{slugify(comparison_label)}-"
            f"{comparison_checksum[:12]}"
        ),
        "comparison_label": comparison_label,
        "index_id": index.index_id,
        "artifact_count": index.artifact_count,
        "comparison_summary": comparison_summary,
        "comparison_checksum": comparison_checksum,
        "reproducibility_hash": reproducibility_hash,
        "warnings": warnings,
        **safety_flags,
    }
    BacktestArtifactComparison.from_payload(payload)
    return payload


def build_comparison_summary(index: BacktestArtifactIndex) -> dict[str, Any]:
    artifacts = list(index.artifacts)
    data_versions = sorted({str(artifact["data_version"]) for artifact in artifacts})
    strategy_versions = sorted(
        {
            f"{artifact['strategy_id']}@{artifact['strategy_version']}"
            for artifact in artifacts
        }
    )
    parameter_sets = sorted(
        {str(artifact["parameter_set_id"]) for artifact in artifacts}
    )
    metric_names = sorted(
        {
            str(metric_name)
            for artifact in artifacts
            for metric_name in artifact.get("metric_names", [])
        }
    )
    artifact_checksums = [str(artifact["artifact_checksum"]) for artifact in artifacts]
    return {
        "data_versions": data_versions,
        "strategy_versions": strategy_versions,
        "parameter_sets": parameter_sets,
        "metric_names": metric_names,
        "checksum_status": {
            "index_artifact_count": len(artifacts),
            "artifact_checksums_valid": all(
                is_sha256_digest(checksum) for checksum in artifact_checksums
            ),
            "unique_artifact_checksums": len(set(artifact_checksums)),
            "duplicate_artifact_checksums": duplicate_artifact_checksums(
                artifact_checksums
            ),
        },
    }


def duplicate_artifact_checksums(checksums: list[str]) -> list[str]:
    counts = Counter(checksums)
    return sorted(checksum for checksum, count in counts.items() if count > 1)


def is_sha256_digest(value: str) -> bool:
    return len(value) == 64 and all(char in "0123456789abcdef" for char in value)


def sha256_json(payload: dict[str, Any]) -> str:
    encoded = json.dumps(payload, sort_keys=True, separators=(",", ":")).encode("utf-8")
    return hashlib.sha256(encoded).hexdigest()


def slugify(value: str) -> str:
    cleaned = "".join(char.lower() if char.isalnum() else "-" for char in value)
    return "-".join(part for part in cleaned.split("-") if part) or "comparison"
