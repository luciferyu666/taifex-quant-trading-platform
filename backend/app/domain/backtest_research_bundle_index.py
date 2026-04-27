from __future__ import annotations

import hashlib
import json
from collections import Counter
from datetime import UTC, datetime
from typing import Any

from pydantic import BaseModel, Field, field_validator

from app.domain.backtest_research_bundle import BacktestResearchBundlePreviewResponse


class BacktestResearchBundleSummary(BaseModel):
    bundle_id: str
    manifest_id: str
    data_version: str
    strategy_id: str
    strategy_version: str
    parameter_set_ids: list[str]
    artifact_count: int
    bundle_checksum: str
    persisted: bool


class BacktestResearchBundleIndexPreviewRequest(BaseModel):
    bundles: list[BacktestResearchBundlePreviewResponse] = Field(
        min_length=1,
        max_length=500,
    )
    index_label: str = Field(min_length=1)
    research_only: bool = True

    @field_validator("research_only")
    @classmethod
    def require_research_only(cls, value: bool) -> bool:
        if value is not True:
            raise ValueError("backtest research bundle index must remain research_only=true")
        return value


class BacktestResearchBundleIndexPreviewResponse(BaseModel):
    bundle_index_id: str
    index_label: str
    bundle_count: int
    bundles: list[BacktestResearchBundleSummary]
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
    ranking_generated: bool = False
    best_strategy_selected: bool = False
    persisted: bool = False


def preview_backtest_research_bundle_index(
    request: BacktestResearchBundleIndexPreviewRequest,
) -> BacktestResearchBundleIndexPreviewResponse:
    for bundle in request.bundles:
        validate_bundle_for_index(bundle)
    summaries = sorted(
        [bundle_summary(bundle) for bundle in request.bundles],
        key=lambda item: (item.bundle_id, item.bundle_checksum),
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
        "index_label": request.index_label,
        "bundles": [summary.model_dump() for summary in summaries],
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
            "Backtest research bundle index is local manifest metadata only. It does "
            "not rank bundles, select best strategies, write databases, call brokers, "
            "or claim alpha."
        )
    ]
    duplicate_checksums = duplicate_bundle_checksums(summaries)
    if duplicate_checksums:
        warnings.append(
            "Duplicate research bundle checksums detected: "
            + ", ".join(duplicate_checksums)
            + ". Duplicates are allowed for local cataloging but should be reviewed."
        )
    return BacktestResearchBundleIndexPreviewResponse(
        bundle_index_id=(
            f"backtest-research-bundle-index-{slugify(request.index_label)}-"
            f"{index_checksum[:12]}"
        ),
        index_label=request.index_label,
        bundle_count=len(summaries),
        bundles=summaries,
        index_checksum=index_checksum,
        reproducibility_hash=reproducibility_hash,
        warnings=warnings,
        **safety_flags,
    )


def validate_bundle_for_index(bundle: BacktestResearchBundlePreviewResponse) -> None:
    if bundle.research_only is not True:
        raise ValueError("research bundle must be research_only=true")
    if bundle.execution_eligible is not False:
        raise ValueError("research bundle must be execution_eligible=false")
    if bundle.order_created:
        raise ValueError("research bundle must not create orders")
    if bundle.broker_api_called:
        raise ValueError("research bundle must not call broker APIs")
    if bundle.risk_engine_called:
        raise ValueError("research bundle must not call Risk Engine")
    if bundle.oms_called:
        raise ValueError("research bundle must not call OMS")
    if bundle.performance_claim:
        raise ValueError("research bundle must not make performance claims")
    if bundle.simulated_metrics_only is not True:
        raise ValueError("research bundle must be simulated_metrics_only=true")
    if bundle.external_data_downloaded:
        raise ValueError("research bundle must not download external data")
    if bundle.ranking_generated:
        raise ValueError("research bundle must not generate rankings")
    if bundle.best_strategy_selected:
        raise ValueError("research bundle must not select best strategy")
    if not is_sha256_digest(bundle.checksums.bundle_checksum):
        raise ValueError("bundle_checksum must be a SHA-256 digest")
    if not is_sha256_digest(bundle.reproducibility_hash):
        raise ValueError("bundle reproducibility_hash must be a SHA-256 digest")


def bundle_summary(
    bundle: BacktestResearchBundlePreviewResponse,
) -> BacktestResearchBundleSummary:
    return BacktestResearchBundleSummary(
        bundle_id=bundle.bundle_id,
        manifest_id=bundle.manifest_id,
        data_version=bundle.data_version,
        strategy_id=bundle.strategy_id,
        strategy_version=bundle.strategy_version,
        parameter_set_ids=sorted(bundle.parameter_set_ids),
        artifact_count=bundle.artifact_count,
        bundle_checksum=bundle.checksums.bundle_checksum,
        persisted=bundle.persisted,
    )


def duplicate_bundle_checksums(
    summaries: list[BacktestResearchBundleSummary],
) -> list[str]:
    counts = Counter(summary.bundle_checksum for summary in summaries)
    return sorted(checksum for checksum, count in counts.items() if count > 1)


def is_sha256_digest(value: str) -> bool:
    return len(value) == 64 and all(char in "0123456789abcdef" for char in value)


def sha256_json(payload: dict[str, Any]) -> str:
    encoded = json.dumps(payload, sort_keys=True, separators=(",", ":")).encode("utf-8")
    return hashlib.sha256(encoded).hexdigest()


def slugify(value: str) -> str:
    cleaned = "".join(char.lower() if char.isalnum() else "-" for char in value)
    return "-".join(part for part in cleaned.split("-") if part) or "bundle-index"
