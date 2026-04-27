import csv
import sys
from pathlib import Path

import pytest
from fastapi.testclient import TestClient
from pydantic import ValidationError

from app.domain.backtest_artifact import (
    BacktestArtifactPreviewRequest,
    preview_backtest_artifact,
)
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

from sdk.backtest_artifact import (  # noqa: E402
    BacktestArtifact,
    BacktestArtifactError,
    build_backtest_artifact_payload,
    write_backtest_artifact,
)
from sdk.backtest_contract import build_backtest_preview_payload  # noqa: E402
from sdk.backtest_result import build_backtest_result_preview_payload  # noqa: E402
from sdk.examples.manifest_signal_strategy import preview_from_manifest_payload  # noqa: E402
from sdk.toy_backtest import run_toy_backtest_payload  # noqa: E402


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


def _bar_payloads() -> list[dict[str, str]]:
    fixture_path = REPO_ROOT / "data-pipeline/fixtures/market_bars_valid.csv"
    with fixture_path.open(newline="", encoding="utf-8") as fixture_file:
        return list(csv.DictReader(fixture_file))


def _toy_run() -> object:
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
    result_preview = preview_backtest_result_schema(
        BacktestResultPreviewRequest(
            backtest_preview=backtest_preview,
            result_label="phase3-toy-backtest",
            research_only=True,
        )
    )
    return run_toy_backtest(
        ToyBacktestRequest(
            result_preview=result_preview,
            bars=_bar_payloads(),
            research_only=True,
        )
    )


def _request_payload() -> dict[str, object]:
    return {
        "toy_backtest_run": _toy_run().model_dump(mode="json"),
        "artifact_label": "phase3-backtest-artifact",
        "research_only": True,
    }


def test_backtest_artifact_preview_is_research_only_metadata() -> None:
    request = BacktestArtifactPreviewRequest(**_request_payload())

    first = preview_backtest_artifact(request)
    second = preview_backtest_artifact(request)

    assert first.artifact_id == second.artifact_id
    assert first.artifact_checksum == second.artifact_checksum
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
    assert first.persisted is False
    assert len(first.artifact_checksum) == 64
    assert len(first.reproducibility_hash) == 64
    assert first.simulated_metric_values


def test_backtest_artifact_api_returns_persisted_false() -> None:
    client = TestClient(app)

    response = client.post(
        "/api/strategy/backtest/artifact/preview",
        json=_request_payload(),
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["research_only"] is True
    assert payload["execution_eligible"] is False
    assert payload["performance_claim"] is False
    assert payload["simulated_metrics_only"] is True
    assert payload["persisted"] is False
    assert payload["artifact_checksum"]
    assert payload["simulated_metric_values"]


def test_backtest_artifact_rejects_performance_claim_input() -> None:
    client = TestClient(app)
    payload = _request_payload()
    toy_run = dict(payload["toy_backtest_run"])
    toy_run["performance_claim"] = True
    payload["toy_backtest_run"] = toy_run

    response = client.post("/api/strategy/backtest/artifact/preview", json=payload)

    assert response.status_code == 422
    assert "performance claims" in response.json()["detail"]


def test_backtest_artifact_rejects_execution_eligible_input() -> None:
    client = TestClient(app)
    payload = _request_payload()
    toy_run = dict(payload["toy_backtest_run"])
    toy_run["execution_eligible"] = True
    payload["toy_backtest_run"] = toy_run

    response = client.post("/api/strategy/backtest/artifact/preview", json=payload)

    assert response.status_code == 422
    assert "execution_eligible=false" in response.json()["detail"]


def test_backtest_artifact_rejects_non_research_request() -> None:
    payload = _request_payload()
    payload["research_only"] = False

    with pytest.raises(ValidationError):
        BacktestArtifactPreviewRequest(**payload)


def _sdk_toy_run_payload() -> dict[str, object]:
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
    return run_toy_backtest_payload(
        result_preview_payload=result_preview,
        bars=_bar_payloads(),
    )


def test_strategy_sdk_backtest_artifact_validates_safe_payload() -> None:
    payload = build_backtest_artifact_payload(
        toy_backtest_payload=_sdk_toy_run_payload(),
        artifact_label="phase3-backtest-artifact",
    )
    artifact = BacktestArtifact.from_payload(payload)

    assert artifact.performance_claim is False
    assert artifact.execution_eligible is False
    assert artifact.persisted is False
    assert artifact.simulated_metrics_only is True


def test_strategy_sdk_backtest_artifact_rejects_metric_performance_claim() -> None:
    payload = build_backtest_artifact_payload(
        toy_backtest_payload=_sdk_toy_run_payload(),
        artifact_label="phase3-backtest-artifact",
    )
    payload["simulated_metric_values"][0]["performance_claim"] = True

    with pytest.raises(BacktestArtifactError, match="performance claims"):
        BacktestArtifact.from_payload(payload)


def test_strategy_sdk_backtest_artifact_can_write_explicit_local_json(
    tmp_path: Path,
) -> None:
    payload = build_backtest_artifact_payload(
        toy_backtest_payload=_sdk_toy_run_payload(),
        artifact_label="phase3-backtest-artifact",
    )
    output_path = tmp_path / "backtest_artifact.preview.json"

    persisted_payload = write_backtest_artifact(output_path, payload)

    assert output_path.is_file()
    assert persisted_payload["persisted"] is True
    assert BacktestArtifact.from_payload(persisted_payload).persisted is True
