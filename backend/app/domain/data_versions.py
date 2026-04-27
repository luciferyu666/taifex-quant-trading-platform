from datetime import UTC, datetime
from enum import StrEnum
from pathlib import Path

from pydantic import BaseModel, Field, field_validator


class DataVersionStatus(StrEnum):
    DRAFT = "draft"
    VALIDATED = "validated"
    REJECTED = "rejected"
    RETIRED = "retired"


class MigrationRunStatus(StrEnum):
    PENDING = "pending"
    APPLIED = "applied"
    FAILED = "failed"


class DataVersionRecord(BaseModel):
    version_id: str = Field(min_length=1)
    contract_schema_version: str = Field(min_length=1)
    market_bars_source: str = Field(min_length=1)
    rollover_rule_version: str = Field(min_length=1)
    data_quality_report_path: str | None = None
    data_quality_report_checksum: str | None = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(UTC))
    status: DataVersionStatus = DataVersionStatus.DRAFT
    notes: str = ""

    @field_validator("version_id")
    @classmethod
    def validate_version_id(cls, value: str) -> str:
        if value.strip() != value or " " in value:
            raise ValueError("version_id must not contain spaces")
        return value


class RegisterDataVersionRequest(BaseModel):
    version_id: str = Field(min_length=1)
    contract_schema_version: str = Field(min_length=1)
    market_bars_source: str = Field(min_length=1)
    rollover_rule_version: str = Field(min_length=1)
    data_quality_report_path: str | None = None
    data_quality_report_checksum: str | None = None
    status: DataVersionStatus = DataVersionStatus.DRAFT
    notes: str = ""

    @field_validator("version_id")
    @classmethod
    def validate_version_id(cls, value: str) -> str:
        if value.strip() != value or " " in value:
            raise ValueError("version_id must not contain spaces")
        return value

    def to_record(self) -> DataVersionRecord:
        return DataVersionRecord(**self.model_dump())


class MigrationRunRecord(BaseModel):
    migration_name: str = Field(min_length=1)
    migration_checksum: str = Field(min_length=1)
    status: MigrationRunStatus = MigrationRunStatus.PENDING
    applied_at: datetime | None = None
    details: dict[str, str] = Field(default_factory=dict)


def ensure_relative_repo_path(path: str | None) -> str | None:
    if path is None:
        return None
    normalized = Path(path)
    if normalized.is_absolute():
        raise ValueError("data_quality_report_path must be repository-relative")
    return normalized.as_posix()
