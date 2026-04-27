from __future__ import annotations

import csv
import hashlib
import json
from datetime import UTC, datetime
from pathlib import Path
from typing import Any

from pydantic import BaseModel, Field, computed_field, field_validator

from app.domain.continuous_futures import (
    ContinuousFuturesPreviewRequest,
    preview_continuous_futures,
)
from app.domain.market_data import AdjustmentMethod

REPO_ROOT = Path(__file__).resolve().parents[3]


class SourceFileReference(BaseModel):
    path: str
    checksum_sha256: str
    role: str


class QualityReportReference(BaseModel):
    path: str
    checksum_sha256: str


class ContinuousFuturesManifestConfig(BaseModel):
    adjustment_method: AdjustmentMethod
    market_bars_fixture: str
    rollover_events_fixture: str
    data_version: str
    research_only: bool = True
    execution_eligible: bool = False


class FeatureSetMetadata(BaseModel):
    feature_set_name: str = Field(min_length=1)
    feature_timeframe: str = Field(min_length=1)
    contract_schema_version: str = Field(min_length=1)


class FeatureManifestPreviewRequest(BaseModel):
    data_version: str = Field(min_length=1)
    contract_schema_version: str = Field(min_length=1)
    market_bars_fixture: str = "data-pipeline/fixtures/market_bars_valid.csv"
    rollover_events_fixture: str = "data-pipeline/fixtures/rollover_events_valid.csv"
    quality_report_path: str | None = None
    quality_report_checksum: str | None = None
    continuous_futures_adjustment_method: AdjustmentMethod = AdjustmentMethod.BACK_ADJUSTED
    feature_set_name: str = "phase2_fixture_research_features"
    feature_timeframe: str = "1m"
    research_only: bool = True

    @field_validator("continuous_futures_adjustment_method")
    @classmethod
    def reject_none_adjustment(cls, value: AdjustmentMethod) -> AdjustmentMethod:
        if value == AdjustmentMethod.NONE:
            raise ValueError("feature manifest requires back_adjusted or ratio_adjusted preview")
        return value

    @field_validator("research_only")
    @classmethod
    def require_research_only(cls, value: bool) -> bool:
        if value is not True:
            raise ValueError("feature manifest preview must remain research_only=true")
        return value


class FeatureDatasetManifest(BaseModel):
    manifest_id: str
    generated_at: datetime = Field(default_factory=lambda: datetime.now(UTC))
    data_version: str
    source_files: list[SourceFileReference]
    quality_report: QualityReportReference | None = None
    continuous_futures_config: ContinuousFuturesManifestConfig
    feature_set: FeatureSetMetadata
    reproducibility_hash: str
    warnings: list[str] = Field(default_factory=list)
    research_only: bool = True
    execution_eligible: bool = False
    external_data_downloaded: bool = False
    broker_api_called: bool = False

    @computed_field
    @property
    def summary(self) -> dict[str, str | int | bool]:
        return {
            "manifest_id": self.manifest_id,
            "data_version": self.data_version,
            "source_file_count": len(self.source_files),
            "feature_set_name": self.feature_set.feature_set_name,
            "feature_timeframe": self.feature_set.feature_timeframe,
            "research_only": self.research_only,
            "execution_eligible": self.execution_eligible,
        }


def build_feature_manifest(
    request: FeatureManifestPreviewRequest,
    repo_root: Path = REPO_ROOT,
) -> FeatureDatasetManifest:
    market_bars_path = resolve_repo_path(request.market_bars_fixture, repo_root)
    rollover_events_path = resolve_repo_path(request.rollover_events_fixture, repo_root)
    source_files = [
        SourceFileReference(
            path=market_bars_path.relative_to(repo_root).as_posix(),
            checksum_sha256=checksum_file(market_bars_path),
            role="market_bars_fixture",
        ),
        SourceFileReference(
            path=rollover_events_path.relative_to(repo_root).as_posix(),
            checksum_sha256=checksum_file(rollover_events_path),
            role="rollover_events_fixture",
        ),
    ]

    quality_report = None
    if request.quality_report_path:
        quality_report_path = resolve_repo_path(request.quality_report_path, repo_root)
        computed_quality_checksum = checksum_file(quality_report_path)
        if (
            request.quality_report_checksum
            and request.quality_report_checksum != computed_quality_checksum
        ):
            raise ValueError("quality_report_checksum does not match quality_report_path")
        quality_report = QualityReportReference(
            path=quality_report_path.relative_to(repo_root).as_posix(),
            checksum_sha256=computed_quality_checksum,
        )

    continuous_request = ContinuousFuturesPreviewRequest(
        data_version=request.data_version,
        adjustment_method=request.continuous_futures_adjustment_method,
        market_bars=load_csv_rows(market_bars_path),
        rollover_events=load_csv_rows(rollover_events_path),
    )
    continuous_preview = preview_continuous_futures(continuous_request)

    continuous_config = ContinuousFuturesManifestConfig(
        adjustment_method=request.continuous_futures_adjustment_method,
        market_bars_fixture=source_files[0].path,
        rollover_events_fixture=source_files[1].path,
        data_version=request.data_version,
    )
    feature_set = FeatureSetMetadata(
        feature_set_name=request.feature_set_name,
        feature_timeframe=request.feature_timeframe,
        contract_schema_version=request.contract_schema_version,
    )
    warnings = [
        *continuous_preview.warnings,
        (
            "Feature dataset manifest is a Phase 2 dry-run artifact and is not a "
            "backtest input until Phase 3 validates it."
        ),
    ]

    reproducibility_payload = {
        "data_version": request.data_version,
        "source_files": [source.model_dump() for source in source_files],
        "quality_report": quality_report.model_dump() if quality_report else None,
        "continuous_futures_config": continuous_config.model_dump(mode="json"),
        "feature_set": feature_set.model_dump(),
        "research_only": True,
        "execution_eligible": False,
    }
    reproducibility_hash = sha256_json(reproducibility_payload)
    manifest_id = (
        f"{slugify(request.feature_set_name)}-"
        f"{request.data_version}-{reproducibility_hash[:12]}"
    )

    return FeatureDatasetManifest(
        manifest_id=manifest_id,
        data_version=request.data_version,
        source_files=source_files,
        quality_report=quality_report,
        continuous_futures_config=continuous_config,
        feature_set=feature_set,
        reproducibility_hash=reproducibility_hash,
        warnings=warnings,
    )


def resolve_repo_path(path_text: str, repo_root: Path = REPO_ROOT) -> Path:
    path = Path(path_text)
    if path.is_absolute():
        raise ValueError("paths must be repository-relative")
    resolved = (repo_root / path).resolve()
    if not resolved.is_relative_to(repo_root):
        raise ValueError("paths must stay inside the repository")
    if not resolved.is_file():
        raise ValueError(f"missing local file: {path_text}")
    return resolved


def checksum_file(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def load_csv_rows(path: Path) -> list[dict[str, str]]:
    with path.open(newline="", encoding="utf-8") as fixture_file:
        return list(csv.DictReader(fixture_file))


def sha256_json(payload: dict[str, Any]) -> str:
    encoded = json.dumps(payload, sort_keys=True, separators=(",", ":")).encode("utf-8")
    return hashlib.sha256(encoded).hexdigest()


def slugify(value: str) -> str:
    cleaned = "".join(char.lower() if char.isalnum() else "-" for char in value)
    return "-".join(part for part in cleaned.split("-") if part) or "feature-set"
