from __future__ import annotations

from dataclasses import dataclass
from typing import Any


class DatasetManifestError(ValueError):
    pass


@dataclass(frozen=True)
class DatasetManifest:
    manifest_id: str
    data_version: str
    feature_set_name: str
    feature_timeframe: str
    reproducibility_hash: str
    source_file_count: int
    research_only: bool
    execution_eligible: bool
    external_data_downloaded: bool
    broker_api_called: bool
    warnings: tuple[str, ...] = ()

    @classmethod
    def from_payload(cls, payload: dict[str, Any]) -> "DatasetManifest":
        manifest = payload.get("manifest", payload)
        if not isinstance(manifest, dict):
            raise DatasetManifestError("manifest payload must be an object")

        feature_set = manifest.get("feature_set") or {}
        if not isinstance(feature_set, dict):
            raise DatasetManifestError("manifest.feature_set must be an object")

        source_files = manifest.get("source_files") or []
        if not isinstance(source_files, list):
            raise DatasetManifestError("manifest.source_files must be a list")

        record = cls(
            manifest_id=str(manifest.get("manifest_id") or ""),
            data_version=str(manifest.get("data_version") or ""),
            feature_set_name=str(feature_set.get("feature_set_name") or ""),
            feature_timeframe=str(feature_set.get("feature_timeframe") or ""),
            reproducibility_hash=str(manifest.get("reproducibility_hash") or ""),
            source_file_count=len(source_files),
            research_only=bool(manifest.get("research_only")),
            execution_eligible=bool(manifest.get("execution_eligible")),
            external_data_downloaded=bool(manifest.get("external_data_downloaded")),
            broker_api_called=bool(manifest.get("broker_api_called")),
            warnings=tuple(str(item) for item in manifest.get("warnings", [])),
        )
        record.validate_for_research()
        return record

    def validate_for_research(self) -> None:
        if not self.manifest_id:
            raise DatasetManifestError("manifest_id is required")
        if not self.data_version:
            raise DatasetManifestError("data_version is required")
        if not self.feature_set_name:
            raise DatasetManifestError("feature_set_name is required")
        if len(self.reproducibility_hash) != 64:
            raise DatasetManifestError("reproducibility_hash must be a SHA-256 hex digest")
        if self.research_only is not True:
            raise DatasetManifestError("dataset manifest must be research_only=true")
        if self.execution_eligible is not False:
            raise DatasetManifestError("dataset manifest must be execution_eligible=false")
        if self.external_data_downloaded:
            raise DatasetManifestError("dataset manifest must not download external data")
        if self.broker_api_called:
            raise DatasetManifestError("dataset manifest must not call broker APIs")

    def to_summary(self) -> dict[str, str | int | bool]:
        return {
            "manifest_id": self.manifest_id,
            "data_version": self.data_version,
            "feature_set_name": self.feature_set_name,
            "feature_timeframe": self.feature_timeframe,
            "source_file_count": self.source_file_count,
            "research_only": self.research_only,
            "execution_eligible": self.execution_eligible,
        }
