from __future__ import annotations

import hashlib
import json
from collections import Counter
from dataclasses import dataclass
from typing import Any

from .backtest_research_bundle import BacktestResearchBundle, BacktestResearchBundleError


class BacktestResearchBundleIndexError(ValueError):
    pass


@dataclass(frozen=True)
class BacktestResearchBundleIndex:
    bundle_index_id: str
    index_label: str
    bundle_count: int
    bundles: tuple[dict[str, Any], ...]
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
    ranking_generated: bool
    best_strategy_selected: bool
    persisted: bool
    warnings: tuple[str, ...] = ()

    @classmethod
    def from_payload(cls, payload: dict[str, Any]) -> BacktestResearchBundleIndex:
        if not isinstance(payload, dict):
            raise BacktestResearchBundleIndexError(
                "research bundle index payload must be an object"
            )
        bundles = payload.get("bundles") or []
        if not isinstance(bundles, list):
            raise BacktestResearchBundleIndexError("bundles must be a list")
        record = cls(
            bundle_index_id=str(payload.get("bundle_index_id") or ""),
            index_label=str(payload.get("index_label") or ""),
            bundle_count=int(payload.get("bundle_count") or 0),
            bundles=tuple(dict(item) for item in bundles),
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
            ranking_generated=bool(payload.get("ranking_generated")),
            best_strategy_selected=bool(payload.get("best_strategy_selected")),
            persisted=bool(payload.get("persisted")),
            warnings=tuple(str(item) for item in payload.get("warnings", [])),
        )
        record.validate_safe_index()
        return record

    def validate_safe_index(self) -> None:
        if not self.bundle_index_id:
            raise BacktestResearchBundleIndexError("bundle_index_id is required")
        if not self.index_label:
            raise BacktestResearchBundleIndexError("index_label is required")
        if self.bundle_count != len(self.bundles):
            raise BacktestResearchBundleIndexError(
                "bundle_count must match bundles length"
            )
        if self.bundle_count < 1:
            raise BacktestResearchBundleIndexError("bundle_count must be positive")
        if not is_sha256_digest(self.index_checksum):
            raise BacktestResearchBundleIndexError(
                "index_checksum must be a SHA-256 digest"
            )
        if not is_sha256_digest(self.reproducibility_hash):
            raise BacktestResearchBundleIndexError(
                "reproducibility_hash must be a SHA-256 digest"
            )
        if self.research_only is not True:
            raise BacktestResearchBundleIndexError(
                "research bundle index must be research_only=true"
            )
        if self.execution_eligible is not False:
            raise BacktestResearchBundleIndexError(
                "research bundle index must be execution_eligible=false"
            )
        if self.order_created:
            raise BacktestResearchBundleIndexError(
                "research bundle index must not create orders"
            )
        if self.broker_api_called:
            raise BacktestResearchBundleIndexError(
                "research bundle index must not call broker APIs"
            )
        if self.risk_engine_called:
            raise BacktestResearchBundleIndexError(
                "research bundle index must not call Risk Engine"
            )
        if self.oms_called:
            raise BacktestResearchBundleIndexError(
                "research bundle index must not call OMS"
            )
        if self.performance_claim:
            raise BacktestResearchBundleIndexError(
                "research bundle index must not make performance claims"
            )
        if self.simulated_metrics_only is not True:
            raise BacktestResearchBundleIndexError(
                "research bundle index must be simulated_metrics_only=true"
            )
        if self.external_data_downloaded:
            raise BacktestResearchBundleIndexError(
                "research bundle index must not download external data"
            )
        if self.ranking_generated:
            raise BacktestResearchBundleIndexError(
                "research bundle index must not generate rankings"
            )
        if self.best_strategy_selected:
            raise BacktestResearchBundleIndexError(
                "research bundle index must not select best strategy"
            )
        if self.persisted:
            raise BacktestResearchBundleIndexError(
                "research bundle index preview must not persist by default"
            )
        invalid = [
            str(bundle.get("bundle_id") or "")
            for bundle in self.bundles
            if not is_sha256_digest(str(bundle.get("bundle_checksum") or ""))
        ]
        if invalid:
            raise BacktestResearchBundleIndexError(
                "bundle summaries contain invalid bundle checksums: "
                + ", ".join(invalid)
            )


def build_backtest_research_bundle_index_payload(
    bundle_payloads: list[dict[str, Any]],
    index_label: str,
) -> dict[str, Any]:
    bundles: list[BacktestResearchBundle] = []
    for payload in bundle_payloads:
        try:
            bundles.append(BacktestResearchBundle.from_payload(payload))
        except BacktestResearchBundleError as exc:
            raise BacktestResearchBundleIndexError(str(exc)) from exc
    summaries = sorted(
        [bundle_summary(bundle) for bundle in bundles],
        key=lambda item: (item["bundle_id"], item["bundle_checksum"]),
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
    index_core = {
        "index_label": index_label,
        "bundles": summaries,
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
            "SDK research bundle index is local manifest metadata only. It does not "
            "rank bundles, select best strategies, write databases, or claim alpha."
        )
    ]
    duplicate_checksums = duplicate_bundle_checksums(summaries)
    if duplicate_checksums:
        warnings.append(
            "Duplicate research bundle checksums detected: "
            + ", ".join(duplicate_checksums)
            + ". Duplicates are allowed for local cataloging but should be reviewed."
        )
    payload = {
        "bundle_index_id": (
            f"backtest-research-bundle-index-{slugify(index_label)}-"
            f"{index_checksum[:12]}"
        ),
        "index_label": index_label,
        "bundle_count": len(summaries),
        "bundles": summaries,
        "index_checksum": index_checksum,
        "reproducibility_hash": reproducibility_hash,
        "warnings": warnings,
        **safety_flags,
    }
    BacktestResearchBundleIndex.from_payload(payload)
    return payload


def bundle_summary(bundle: BacktestResearchBundle) -> dict[str, Any]:
    return {
        "bundle_id": bundle.bundle_id,
        "manifest_id": bundle.manifest_id,
        "data_version": bundle.data_version,
        "strategy_id": bundle.strategy_id,
        "strategy_version": bundle.strategy_version,
        "parameter_set_ids": sorted(bundle.parameter_set_ids),
        "artifact_count": bundle.artifact_count,
        "bundle_checksum": bundle.checksums["bundle_checksum"],
        "persisted": bundle.persisted,
    }


def duplicate_bundle_checksums(summaries: list[dict[str, Any]]) -> list[str]:
    counts = Counter(str(summary["bundle_checksum"]) for summary in summaries)
    return sorted(checksum for checksum, count in counts.items() if count > 1)


def is_sha256_digest(value: str) -> bool:
    return len(value) == 64 and all(char in "0123456789abcdef" for char in value)


def sha256_json(payload: dict[str, Any]) -> str:
    encoded = json.dumps(payload, sort_keys=True, separators=(",", ":")).encode("utf-8")
    return hashlib.sha256(encoded).hexdigest()


def slugify(value: str) -> str:
    cleaned = "".join(char.lower() if char.isalnum() else "-" for char in value)
    return "-".join(part for part in cleaned.split("-") if part) or "bundle-index"
