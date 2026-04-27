import sys
from pathlib import Path

import pytest
from fastapi.testclient import TestClient
from pydantic import ValidationError

from app.domain.backtest_preview import (
    BacktestPreviewRequest,
    preview_backtest_contract,
)
from app.domain.backtest_result import (
    BacktestResultPreviewRequest,
    preview_backtest_result_schema,
)
from app.domain.feature_manifest import FeatureManifestPreviewRequest, build_feature_manifest
from app.domain.strategy_research import (
    StrategyResearchPreviewRequest,
    preview_research_signal,
)
from app.main import app

REPO_ROOT = Path(__file__).resolve().parents[2]
STRATEGY_ENGINE_ROOT = REPO_ROOT / "strategy-engine"
sys.path.insert(0, str(STRATEGY_ENGINE_ROOT))

from sdk.backtest_contract import build_backtest_preview_payload  # noqa: E402
from sdk.backtest_result import (  # noqa: E402
    BacktestResultContractError,
    BacktestResultPreviewContract,
    build_backtest_result_preview_payload,
)
from sdk.examples.manifest_signal_strategy import preview_from_manifest_payload  # noqa: E402


def _manifest() -> object:
    return build_feature_manifest(
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


def _backtest_preview() -> object:
    manifest = _manifest()
    signal = preview_research_signal(
        StrategyResearchPreviewRequest(
            feature_manifest=manifest,
            strategy_id="manifest-signal-strategy",
            strategy_version="0.1.0",
            research_only=True,
        )
    ).signal
    return preview_backtest_contract(
        BacktestPreviewRequest(
            feature_manifest=manifest,
            signal=signal,
            strategy_id="manifest-signal-strategy",
            strategy_version="0.1.0",
            parameter_set_id="phase3-preview-default",
            research_only=True,
        )
    )


def _request_payload() -> dict[str, object]:
    return {
        "backtest_preview": _backtest_preview().model_dump(mode="json"),
        "result_label": "phase3-result-schema-preview",
        "research_only": True,
    }


def test_backtest_result_preview_schema_is_dry_run_only() -> None:
    request = BacktestResultPreviewRequest(**_request_payload())

    first = preview_backtest_result_schema(request)
    second = preview_backtest_result_schema(request)

    assert first.result_preview_id == second.result_preview_id
    assert first.reproducibility_hash == second.reproducibility_hash
    assert first.research_only is True
    assert first.execution_eligible is False
    assert first.order_created is False
    assert first.broker_api_called is False
    assert first.risk_engine_called is False
    assert first.oms_called is False
    assert first.performance_claim is False
    assert first.simulated_metrics_only is True
    assert len(first.reproducibility_hash) == 64
    assert first.metric_schema
    assert all(metric.value is None for metric in first.metric_schema)


def test_backtest_result_preview_api_returns_metric_schema_only() -> None:
    client = TestClient(app)

    response = client.post(
        "/api/strategy/backtest/result-preview",
        json=_request_payload(),
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["research_only"] is True
    assert payload["execution_eligible"] is False
    assert payload["performance_claim"] is False
    assert payload["simulated_metrics_only"] is True
    assert payload["order_created"] is False
    assert payload["broker_api_called"] is False
    assert payload["metric_schema"]
    assert all(metric["value"] is None for metric in payload["metric_schema"])


def test_backtest_result_preview_rejects_performance_claim_input() -> None:
    client = TestClient(app)
    payload = _request_payload()
    backtest_preview = dict(payload["backtest_preview"])
    backtest_preview["performance_claim"] = True
    payload["backtest_preview"] = backtest_preview

    response = client.post("/api/strategy/backtest/result-preview", json=payload)

    assert response.status_code == 422
    assert "performance claims" in response.json()["detail"]


def test_backtest_result_preview_rejects_execution_eligible_input() -> None:
    client = TestClient(app)
    payload = _request_payload()
    backtest_preview = dict(payload["backtest_preview"])
    backtest_preview["execution_eligible"] = True
    payload["backtest_preview"] = backtest_preview

    response = client.post("/api/strategy/backtest/result-preview", json=payload)

    assert response.status_code == 422
    assert "execution_eligible=false" in response.json()["detail"]


def test_backtest_result_preview_rejects_non_research_request() -> None:
    payload = _request_payload()
    payload["research_only"] = False

    with pytest.raises(ValidationError):
        BacktestResultPreviewRequest(**payload)


def test_strategy_sdk_backtest_result_contract_validates_safe_payload() -> None:
    manifest_payload = _manifest().model_dump(mode="json")
    signal_preview = preview_from_manifest_payload(manifest_payload)
    backtest_preview = build_backtest_preview_payload(
        manifest_payload=manifest_payload,
        signal_payload=signal_preview["signal"],
        strategy_id="manifest-signal-strategy",
        strategy_version="0.1.0",
        parameter_set_id="phase3-preview-default",
    )

    payload = build_backtest_result_preview_payload(
        backtest_preview_payload=backtest_preview,
        result_label="phase3-result-schema-preview",
    )
    contract = BacktestResultPreviewContract.from_payload(payload)

    assert contract.performance_claim is False
    assert contract.simulated_metrics_only is True
    assert all(metric["value"] is None for metric in contract.metric_schema)


def test_strategy_sdk_backtest_result_contract_rejects_metric_values() -> None:
    manifest_payload = _manifest().model_dump(mode="json")
    signal_preview = preview_from_manifest_payload(manifest_payload)
    backtest_preview = build_backtest_preview_payload(
        manifest_payload=manifest_payload,
        signal_payload=signal_preview["signal"],
        strategy_id="manifest-signal-strategy",
        strategy_version="0.1.0",
        parameter_set_id="phase3-preview-default",
    )
    payload = build_backtest_result_preview_payload(
        backtest_preview_payload=backtest_preview,
        result_label="phase3-result-schema-preview",
    )
    payload["metric_schema"][0]["value"] = 12.3

    with pytest.raises(BacktestResultContractError, match="performance values"):
        BacktestResultPreviewContract.from_payload(payload)
