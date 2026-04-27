from __future__ import annotations

from dataclasses import dataclass

from .dataset_manifest import DatasetManifest


@dataclass(frozen=True)
class ResearchContext:
    manifest_id: str
    data_version: str
    feature_set_name: str
    feature_timeframe: str
    reproducibility_hash: str
    source_file_count: int
    research_only: bool = True
    execution_eligible: bool = False

    @classmethod
    def from_manifest(cls, manifest: DatasetManifest) -> "ResearchContext":
        manifest.validate_for_research()
        return cls(
            manifest_id=manifest.manifest_id,
            data_version=manifest.data_version,
            feature_set_name=manifest.feature_set_name,
            feature_timeframe=manifest.feature_timeframe,
            reproducibility_hash=manifest.reproducibility_hash,
            source_file_count=manifest.source_file_count,
        )

    def to_summary(self) -> dict[str, str | int | bool]:
        return {
            "manifest_id": self.manifest_id,
            "data_version": self.data_version,
            "feature_set_name": self.feature_set_name,
            "feature_timeframe": self.feature_timeframe,
            "reproducibility_hash": self.reproducibility_hash,
            "source_file_count": self.source_file_count,
            "research_only": self.research_only,
            "execution_eligible": self.execution_eligible,
        }
