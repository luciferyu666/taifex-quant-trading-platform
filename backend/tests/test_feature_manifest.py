import pytest
from fastapi.testclient import TestClient
from pydantic import ValidationError

from app.domain.feature_manifest import (
    FeatureManifestPreviewRequest,
    build_feature_manifest,
)
from app.main import app


def _manifest_payload() -> dict[str, object]:
    return {
        "data_version": "fixture-v1",
        "contract_schema_version": "phase2-contract-master-v1",
        "market_bars_fixture": "data-pipeline/fixtures/market_bars_valid.csv",
        "rollover_events_fixture": "data-pipeline/fixtures/rollover_events_valid.csv",
        "continuous_futures_adjustment_method": "back_adjusted",
        "feature_set_name": "phase2_fixture_research_features",
        "feature_timeframe": "1m",
        "research_only": True,
    }


def test_feature_manifest_is_research_only_and_reproducible() -> None:
    request = FeatureManifestPreviewRequest(**_manifest_payload())

    first = build_feature_manifest(request)
    second = build_feature_manifest(request)

    assert first.research_only is True
    assert first.execution_eligible is False
    assert first.external_data_downloaded is False
    assert first.broker_api_called is False
    assert first.reproducibility_hash == second.reproducibility_hash
    assert first.manifest_id == second.manifest_id
    assert len(first.source_files) == 2
    assert first.quality_report is None
    assert any("Phase 2 dry-run" in warning for warning in first.warnings)


def test_feature_manifest_rejects_non_research_request() -> None:
    payload = _manifest_payload()
    payload["research_only"] = False

    with pytest.raises(ValidationError):
        FeatureManifestPreviewRequest(**payload)


def test_feature_manifest_rejects_missing_fixture() -> None:
    payload = _manifest_payload()
    payload["market_bars_fixture"] = "data-pipeline/fixtures/missing.csv"

    with pytest.raises(ValueError, match="missing local file"):
        build_feature_manifest(FeatureManifestPreviewRequest(**payload))


def test_feature_manifest_api_preview_returns_contract_for_phase_3() -> None:
    client = TestClient(app)

    response = client.post("/api/data/features/manifest/preview", json=_manifest_payload())

    assert response.status_code == 200
    payload = response.json()
    assert payload["research_only"] is True
    assert payload["execution_eligible"] is False
    assert payload["summary"]["feature_set_name"] == "phase2_fixture_research_features"
    assert payload["continuous_futures_config"]["execution_eligible"] is False
    assert len(payload["reproducibility_hash"]) == 64
