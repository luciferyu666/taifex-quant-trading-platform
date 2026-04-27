from app.domain.data_versions import DataVersionRecord, RegisterDataVersionRequest


class DataVersionRegistry:
    def __init__(self) -> None:
        self._records: dict[str, DataVersionRecord] = {}

    def list_versions(self) -> list[DataVersionRecord]:
        return sorted(
            self._records.values(),
            key=lambda record: record.created_at,
            reverse=True,
        )

    def register(self, request: RegisterDataVersionRequest) -> DataVersionRecord:
        record = request.to_record()
        self._records[record.version_id] = record
        return record

    def get(self, version_id: str) -> DataVersionRecord | None:
        return self._records.get(version_id)
