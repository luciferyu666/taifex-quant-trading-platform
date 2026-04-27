import csv
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
from app.domain.toy_backtest import ToyBacktestRequest, run_toy_backtest
from app.main import app

REPO_ROOT = Path(__file__).resolve().parents[2]
STRATEGY_ENGINE_ROOT = REPO_ROOT / "strategy-engine"
sys.path.insert(0, str(STRATEGY_ENGINE_ROOT))

from sdk.backtest_contract import build_backtest_preview_payload  # noqa: E402
from sdk.backtest_result import build_backtest_result_preview_payload  # noqa: E402
from sdk.examples.manifest_signal_strategy import preview_from_manifest_payload  # noqa: E402
from sdk.toy_backtest import (  # noqa: E402
    ToyBacktestError,
    ToyBacktestRun,
    run_toy_backtest_payload,
)


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


def _result_preview() -> object:
    manifest = _manifest()
    signal = preview_research_signal(
        StrategyResearchPreviewRequest(
            feature_manifest=manifest,
            strategy_id="manifest-signal-strategy",
            strategy_version="0.1.0",
            research_only=True,
        )
    ).signal
    backtest_preview = preview_backtest_contract(
        BacktestPreviewRequest(
            feature_manifest=manifest,
            signal=signal,
            strategy_id="manifest-signal-strategy",
            strategy_version="0.1.0",
            parameter_set_id="phase3-preview-default",
            research_only=True,
        )
    )
    return preview_backtest_result_schema(
        BacktestResultPreviewRequest(
            backtest_preview=backtest_preview,
            result_label="phase3-toy-backtest",
            research_only=True,
        )
    )


def _bar_payloads() -> list[dict[str, str]]:
    fixture_path = REPO_ROOT / "data-pipeline/fixtures/market_bars_valid.csv"
    with fixture_path.open(newline="", encoding="utf-8") as fixture_file:
        return list(csv.DictReader(fixture_file))


def _request_payload() -> dict[str, object]:
    return {
        "result_preview": _result_preview().model_dump(mode="json"),
        "bars": _bar_payloads(),
        "research_only": True,
    }


def test_toy_backtest_returns_simulated_research_metrics_only() -> None:
    request = ToyBacktestRequest(**_request_payload())

    first = run_toy_backtest(request)
    second = run_toy_backtest(request)

    assert first.toy_backtest_run_id == second.toy_backtest_run_id
    assert first.reproducibility_hash == second.reproducibility_hash
    assert first.research_only is True
    assert first.execution_eligible is False
    assert first.order_created is False
    assert first.broker_api_called is False
    assert first.risk_engine_called is False
    assert first.oms_called is False
    assert first.performance_claim is False
    assert first.simulated_metrics_only is True
    assert first.external_data_downloaded is False
    assert first.bar_count == 3
    assert len(first.reproducibility_hash) == 64
    assert first.simulated_metric_values
    assert all(metric.simulated is True for metric in first.simulated_metric_values)
    assert all(metric.research_only is True for metric in first.simulated_metric_values)
    assert all(
        metric.performance_claim is False for metric in first.simulated_metric_values
    )


def test_toy_backtest_api_returns_fixture_only_result() -> None:
    client = TestClient(app)

    response = client.post("/api/strategy/backtest/toy-run", json=_request_payload())

    assert response.status_code == 200
    payload = response.json()
    assert payload["research_only"] is True
    assert payload["execution_eligible"] is False
    assert payload["order_created"] is False
    assert payload["broker_api_called"] is False
    assert payload["performance_claim"] is False
    assert payload["simulated_metrics_only"] is True
    assert payload["bar_count"] == 3
    assert payload["simulated_metric_values"]
    assert all(
        metric["simulated"] is True for metric in payload["simulated_metric_values"]
    )


def test_toy_backtest_rejects_performance_claim_input() -> None:
    client = TestClient(app)
    payload = _request_payload()
    result_preview = dict(payload["result_preview"])
    result_preview["performance_claim"] = True
    payload["result_preview"] = result_preview

    response = client.post("/api/strategy/backtest/toy-run", json=payload)

    assert response.status_code == 422
    assert "performance claims" in response.json()["detail"]


def test_toy_backtest_rejects_execution_eligible_input() -> None:
    client = TestClient(app)
    payload = _request_payload()
    result_preview = dict(payload["result_preview"])
    result_preview["execution_eligible"] = True
    payload["result_preview"] = result_preview

    response = client.post("/api/strategy/backtest/toy-run", json=payload)

    assert response.status_code == 422
    assert "execution_eligible=false" in response.json()["detail"]


def test_toy_backtest_rejects_non_local_fixture_bars() -> None:
    client = TestClient(app)
    payload = _request_payload()
    bars = [dict(row) for row in payload["bars"]]
    bars[0]["source"] = "external-vendor"
    payload["bars"] = bars

    response = client.post("/api/strategy/backtest/toy-run", json=payload)

    assert response.status_code == 422
    assert "local fixture bars" in response.json()["detail"]


def test_toy_backtest_rejects_non_research_request() -> None:
    payload = _request_payload()
    payload["research_only"] = False

    with pytest.raises(ValidationError):
        ToyBacktestRequest(**payload)


def test_strategy_sdk_toy_backtest_validates_safe_payload() -> None:
    manifest_payload = _manifest().model_dump(mode="json")
    signal_preview = preview_from_manifest_payload(manifest_payload)
    backtest_preview = build_backtest_preview_payload(
        manifest_payload=manifest_payload,
        signal_payload=signal_preview["signal"],
        strategy_id="manifest-signal-strategy",
        strategy_version="0.1.0",
        parameter_set_id="phase3-preview-default",
    )
    result_preview = build_backtest_result_preview_payload(
        backtest_preview_payload=backtest_preview,
        result_label="phase3-toy-backtest",
    )

    payload = run_toy_backtest_payload(
        result_preview_payload=result_preview,
        bars=_bar_payloads(),
    )
    toy_run = ToyBacktestRun.from_payload(payload)

    assert toy_run.performance_claim is False
    assert toy_run.simulated_metrics_only is True
    assert toy_run.order_created is False
    assert all(metric["simulated"] is True for metric in toy_run.simulated_metric_values)


def test_strategy_sdk_toy_backtest_rejects_nonlocal_bars() -> None:
    manifest_payload = _manifest().model_dump(mode="json")
    signal_preview = preview_from_manifest_payload(manifest_payload)
    backtest_preview = build_backtest_preview_payload(
        manifest_payload=manifest_payload,
        signal_payload=signal_preview["signal"],
        strategy_id="manifest-signal-strategy",
        strategy_version="0.1.0",
        parameter_set_id="phase3-preview-default",
    )
    result_preview = build_backtest_result_preview_payload(
        backtest_preview_payload=backtest_preview,
        result_label="phase3-toy-backtest",
    )
    bars = _bar_payloads()
    bars[0]["source"] = "external-vendor"

    with pytest.raises(ToyBacktestError, match="local fixture bars"):
        run_toy_backtest_payload(result_preview, bars)
