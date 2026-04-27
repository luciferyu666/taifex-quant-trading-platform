import pytest
from fastapi.testclient import TestClient
from pydantic import ValidationError

from app.domain.data_versions import (
    DataVersionRecord,
    DataVersionStatus,
    RegisterDataVersionRequest,
)
from app.main import app


def _version_payload(version_id: str = "pytest-fixture-v1") -> dict[str, object]:
    return {
        "version_id": version_id,
        "contract_schema_version": "phase2-contract-master-v1",
        "market_bars_source": "local-fixtures",
        "rollover_rule_version": "phase2-rollover-metadata-v1",
        "data_quality_report_path": "data-pipeline/reports/market_bars_valid.report.json",
        "data_quality_report_checksum": "abc123",
        "status": "draft",
        "notes": "pytest data version registry record",
    }


def test_data_version_record_preserves_registry_fields() -> None:
    record = DataVersionRecord(**_version_payload())

    assert record.version_id == "pytest-fixture-v1"
    assert record.status == DataVersionStatus.DRAFT
    assert record.market_bars_source == "local-fixtures"
    assert record.data_quality_report_checksum == "abc123"


def test_data_version_rejects_spaces_in_version_id() -> None:
    payload = _version_payload("bad version")

    with pytest.raises(ValidationError):
        RegisterDataVersionRequest(**payload)


def test_register_and_get_data_version_routes() -> None:
    client = TestClient(app)
    payload = _version_payload("pytest-route-v1")

    create_response = client.post("/api/data/versions/register", json=payload)

    assert create_response.status_code == 201
    created = create_response.json()
    assert created["version_id"] == "pytest-route-v1"
    assert created["status"] == "draft"

    get_response = client.get("/api/data/versions/pytest-route-v1")
    assert get_response.status_code == 200
    assert get_response.json()["version_id"] == "pytest-route-v1"

    list_response = client.get("/api/data/versions")
    assert list_response.status_code == 200
    assert any(item["version_id"] == "pytest-route-v1" for item in list_response.json())


def test_get_missing_data_version_returns_404() -> None:
    client = TestClient(app)

    response = client.get("/api/data/versions/not-registered")

    assert response.status_code == 404
