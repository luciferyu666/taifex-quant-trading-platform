from fastapi.testclient import TestClient

from app.domain.feature_manifest import FeatureManifestPreviewRequest, build_feature_manifest
from app.main import app


def _manifest_payload() -> dict[str, object]:
    manifest = build_feature_manifest(
        FeatureManifestPreviewRequest(
            data_version="fixture-v1",
            contract_schema_version="phase2-contract-master-v1",
            market_bars_fixture="data-pipeline/fixtures/market_bars_valid.csv",
            rollover_events_fixture="data-pipeline/fixtures/rollover_events_valid.csv",
            continuous_futures_adjustment_method="back_adjusted",
            feature_set_name="phase2_fixture_research_features",
            feature_timeframe="1m",
            research_only=True,
        )
    )
    return manifest.model_dump(mode="json")


def _request_payload() -> dict[str, object]:
    return {
        "feature_manifest": _manifest_payload(),
        "strategy_id": "manifest-signal-strategy",
        "strategy_version": "0.1.0",
        "research_only": True,
    }


def test_strategy_research_preview_signal_returns_signal_only_response() -> None:
    client = TestClient(app)

    response = client.post("/api/strategy/research/preview-signal", json=_request_payload())

    assert response.status_code == 200
    payload = response.json()
    assert payload["research_only"] is True
    assert payload["execution_eligible"] is False
    assert payload["order_created"] is False
    assert payload["broker_api_called"] is False
    assert payload["risk_engine_called"] is False
    assert payload["oms_called"] is False
    assert payload["signal"]["direction"] == "FLAT"
    assert payload["signal"]["target_tx_equivalent"] == 0
    assert payload["signal"]["reason"]["signals_only"] is True
    assert payload["research_context"]["feature_set_name"] == (
        "phase2_fixture_research_features"
    )


def test_strategy_research_preview_rejects_execution_eligible_manifest() -> None:
    client = TestClient(app)
    payload = _request_payload()
    feature_manifest = dict(payload["feature_manifest"])
    feature_manifest["execution_eligible"] = True
    payload["feature_manifest"] = feature_manifest

    response = client.post("/api/strategy/research/preview-signal", json=payload)

    assert response.status_code == 422
    assert "execution_eligible=false" in response.json()["detail"]


def test_strategy_research_preview_rejects_non_research_request() -> None:
    client = TestClient(app)
    payload = _request_payload()
    payload["research_only"] = False

    response = client.post("/api/strategy/research/preview-signal", json=payload)

    assert response.status_code == 422
