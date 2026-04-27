from __future__ import annotations

import hashlib
import json
from collections import Counter
from dataclasses import dataclass
from pathlib import Path
from typing import Any

from .backtest_artifact import BacktestArtifact, BacktestArtifactError


class BacktestArtifactIndexError(ValueError):
    pass


@dataclass(frozen=True)
class BacktestArtifactIndex:
    index_id: str
    index_label: str
    artifact_count: int
    artifacts: tuple[dict[str, Any], ...]
    index_checksum: str
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
    def from_payload(cls, payload: dict[str, Any]) -> "BacktestArtifactIndex":
        if not isinstance(payload, dict):
            raise BacktestArtifactIndexError("artifact index payload must be an object")
        artifacts = payload.get("artifacts") or []
        if not isinstance(artifacts, list):
            raise BacktestArtifactIndexError("artifacts must be a list")
        record = cls(
            index_id=str(payload.get("index_id") or ""),
            index_label=str(payload.get("index_label") or ""),
            artifact_count=int(payload.get("artifact_count") or 0),
            artifacts=tuple(dict(item) for item in artifacts),
            index_checksum=str(payload.get("index_checksum") or ""),
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
        record.validate_safe_index()
        return record

    def validate_safe_index(self) -> None:
        if not self.index_id:
            raise BacktestArtifactIndexError("index_id is required")
        if not self.index_label:
            raise BacktestArtifactIndexError("index_label is required")
        if self.artifact_count != len(self.artifacts):
            raise BacktestArtifactIndexError("artifact_count must match artifacts length")
        if len(self.index_checksum) != 64:
            raise BacktestArtifactIndexError("index_checksum must be a SHA-256 digest")
        if len(self.reproducibility_hash) != 64:
            raise BacktestArtifactIndexError(
                "reproducibility_hash must be a SHA-256 digest"
            )
        if self.research_only is not True:
            raise BacktestArtifactIndexError("artifact index must be research_only=true")
        if self.execution_eligible is not False:
            raise BacktestArtifactIndexError(
                "artifact index must be execution_eligible=false"
            )
        if self.order_created:
            raise BacktestArtifactIndexError("artifact index must not create orders")
        if self.broker_api_called:
            raise BacktestArtifactIndexError("artifact index must not call broker APIs")
        if self.risk_engine_called:
            raise BacktestArtifactIndexError("artifact index must not call Risk Engine")
        if self.oms_called:
            raise BacktestArtifactIndexError("artifact index must not call OMS")
        if self.performance_claim:
            raise BacktestArtifactIndexError(
                "artifact index must not make performance claims"
            )
        if self.simulated_metrics_only is not True:
            raise BacktestArtifactIndexError(
                "artifact index must be simulated_metrics_only=true"
            )
        if self.external_data_downloaded:
            raise BacktestArtifactIndexError(
                "artifact index must not download external data"
            )
        for artifact in self.artifacts:
            if len(str(artifact.get("artifact_checksum") or "")) != 64:
                raise BacktestArtifactIndexError(
                    "artifact summary checksum must be a SHA-256 digest"
                )


def build_backtest_artifact_index_payload(
    artifact_payloads: list[dict[str, Any]],
    index_label: str,
    persisted: bool = False,
) -> dict[str, Any]:
    artifacts: list[BacktestArtifact] = []
    for payload in artifact_payloads:
        try:
            artifacts.append(BacktestArtifact.from_payload(payload))
        except BacktestArtifactError as exc:
            raise BacktestArtifactIndexError(str(exc)) from exc
    summaries = sorted(
        [artifact_summary(artifact) for artifact in artifacts],
        key=lambda item: (item["artifact_id"], item["artifact_checksum"]),
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
        "persisted": persisted,
    }
    index_core = {
        "index_label": index_label,
        "artifacts": summaries,
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
            "SDK backtest artifact index is local manifest metadata only. It does not "
            "rank strategies, select best results, write databases, or claim alpha."
        )
    ]
    duplicate_checksums = duplicate_artifact_checksums(summaries)
    if duplicate_checksums:
        warnings.append(
            "Duplicate artifact checksums detected: "
            + ", ".join(duplicate_checksums)
            + ". Duplicates are allowed for local cataloging but should be reviewed."
        )
    payload = {
        "index_id": (
            f"backtest-artifact-index-{slugify(index_label)}-{index_checksum[:12]}"
        ),
        "index_label": index_label,
        "artifact_count": len(summaries),
        "artifacts": summaries,
        "index_checksum": index_checksum,
        "reproducibility_hash": reproducibility_hash,
        "warnings": warnings,
        **safety_flags,
    }
    BacktestArtifactIndex.from_payload(payload)
    return payload


def write_backtest_artifact_index(path: Path, payload: dict[str, Any]) -> dict[str, Any]:
    if path.suffix.lower() != ".json":
        raise BacktestArtifactIndexError("artifact index output path must end with .json")
    path.parent.mkdir(parents=True, exist_ok=True)
    persisted_payload = dict(payload)
    persisted_payload["persisted"] = True
    BacktestArtifactIndex.from_payload(persisted_payload)
    path.write_text(
        json.dumps(persisted_payload, indent=2, sort_keys=True) + "\n",
        encoding="utf-8",
    )
    return persisted_payload


def artifact_summary(artifact: BacktestArtifact) -> dict[str, Any]:
    return {
        "artifact_id": artifact.artifact_id,
        "toy_backtest_run_id": artifact.toy_backtest_run_id,
        "manifest_id": artifact.manifest_id,
        "strategy_id": artifact.strategy_id,
        "strategy_version": artifact.strategy_version,
        "parameter_set_id": artifact.parameter_set_id,
        "data_version": artifact.data_version,
        "artifact_checksum": artifact.artifact_checksum,
        "persisted": artifact.persisted,
        "metric_names": sorted(
            {str(metric["name"]) for metric in artifact.simulated_metric_values}
        ),
    }


def duplicate_artifact_checksums(summaries: list[dict[str, Any]]) -> list[str]:
    counts = Counter(str(summary["artifact_checksum"]) for summary in summaries)
    return sorted(checksum for checksum, count in counts.items() if count > 1)


def sha256_json(payload: dict[str, Any]) -> str:
    encoded = json.dumps(payload, sort_keys=True, separators=(",", ":")).encode("utf-8")
    return hashlib.sha256(encoded).hexdigest()


def slugify(value: str) -> str:
    cleaned = "".join(char.lower() if char.isalnum() else "-" for char in value)
    return "-".join(part for part in cleaned.split("-") if part) or "artifact-index"
