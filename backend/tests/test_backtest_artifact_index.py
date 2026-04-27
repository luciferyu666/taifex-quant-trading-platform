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
from app.domain.backtest_artifact_index import (
    BacktestArtifactIndexPreviewRequest,
    preview_backtest_artifact_index,
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

from sdk.backtest_artifact import build_backtest_artifact_payload  # noqa: E402
from sdk.backtest_artifact_index import (  # noqa: E402
    BacktestArtifactIndex,
    BacktestArtifactIndexError,
    build_backtest_artifact_index_payload,
    write_backtest_artifact_index,
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


def _artifact() -> object:
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
    toy_run = run_toy_backtest(
        ToyBacktestRequest(
            result_preview=result_preview,
            bars=_bar_payloads(),
            research_only=True,
        )
    )
    return preview_backtest_artifact(
        BacktestArtifactPreviewRequest(
            toy_backtest_run=toy_run,
            artifact_label="phase3-backtest-artifact",
            research_only=True,
        )
    )


def _request_payload() -> dict[str, object]:
    return {
        "artifacts": [_artifact().model_dump(mode="json")],
        "index_label": "phase3-backtest-artifact-index",
        "research_only": True,
    }


def test_backtest_artifact_index_preview_is_research_only_catalog() -> None:
    request = BacktestArtifactIndexPreviewRequest(**_request_payload())

    first = preview_backtest_artifact_index(request)
    second = preview_backtest_artifact_index(request)

    assert first.index_id == second.index_id
    assert first.index_checksum == second.index_checksum
    assert first.reproducibility_hash == second.reproducibility_hash
    assert first.artifact_count == 1
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
    assert len(first.index_checksum) == 64
    assert len(first.reproducibility_hash) == 64
    assert first.artifacts[0].artifact_checksum


def test_backtest_artifact_index_api_returns_summary_only() -> None:
    client = TestClient(app)

    response = client.post(
        "/api/strategy/backtest/artifact-index/preview",
        json=_request_payload(),
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["research_only"] is True
    assert payload["execution_eligible"] is False
    assert payload["performance_claim"] is False
    assert payload["artifact_count"] == 1
    assert payload["persisted"] is False
    assert "simulated_metric_values" not in payload["artifacts"][0]


def test_backtest_artifact_index_warns_on_duplicate_checksums() -> None:
    payload = _request_payload()
    artifact = dict(payload["artifacts"][0])
    payload["artifacts"] = [artifact, artifact]

    index = preview_backtest_artifact_index(
        BacktestArtifactIndexPreviewRequest(**payload)
    )

    assert index.artifact_count == 2
    assert any("Duplicate artifact checksums" in warning for warning in index.warnings)


def test_backtest_artifact_index_rejects_performance_claim_input() -> None:
    client = TestClient(app)
    payload = _request_payload()
    artifact = dict(payload["artifacts"][0])
    artifact["performance_claim"] = True
    payload["artifacts"] = [artifact]

    response = client.post("/api/strategy/backtest/artifact-index/preview", json=payload)

    assert response.status_code == 422
    assert "performance claims" in response.json()["detail"]


def test_backtest_artifact_index_rejects_execution_eligible_input() -> None:
    client = TestClient(app)
    payload = _request_payload()
    artifact = dict(payload["artifacts"][0])
    artifact["execution_eligible"] = True
    payload["artifacts"] = [artifact]

    response = client.post("/api/strategy/backtest/artifact-index/preview", json=payload)

    assert response.status_code == 422
    assert "execution_eligible=false" in response.json()["detail"]


def test_backtest_artifact_index_rejects_non_research_request() -> None:
    payload = _request_payload()
    payload["research_only"] = False

    with pytest.raises(ValidationError):
        BacktestArtifactIndexPreviewRequest(**payload)


def _sdk_artifact_payload() -> dict[str, object]:
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
    toy_run = run_toy_backtest_payload(
        result_preview_payload=result_preview,
        bars=_bar_payloads(),
    )
    return build_backtest_artifact_payload(
        toy_backtest_payload=toy_run,
        artifact_label="phase3-backtest-artifact",
    )


def test_strategy_sdk_artifact_index_validates_safe_payload() -> None:
    payload = build_backtest_artifact_index_payload(
        artifact_payloads=[_sdk_artifact_payload()],
        index_label="phase3-backtest-artifact-index",
    )
    index = BacktestArtifactIndex.from_payload(payload)

    assert index.performance_claim is False
    assert index.execution_eligible is False
    assert index.artifact_count == 1
    assert index.persisted is False


def test_strategy_sdk_artifact_index_warns_on_duplicates() -> None:
    artifact = _sdk_artifact_payload()

    payload = build_backtest_artifact_index_payload(
        artifact_payloads=[artifact, artifact],
        index_label="phase3-backtest-artifact-index",
    )

    assert payload["artifact_count"] == 2
    assert any("Duplicate artifact checksums" in warning for warning in payload["warnings"])


def test_strategy_sdk_artifact_index_rejects_performance_claim() -> None:
    artifact = _sdk_artifact_payload()
    artifact["performance_claim"] = True

    with pytest.raises(BacktestArtifactIndexError, match="performance claims"):
        build_backtest_artifact_index_payload(
            artifact_payloads=[artifact],
            index_label="phase3-backtest-artifact-index",
        )


def test_strategy_sdk_artifact_index_can_write_explicit_local_json(
    tmp_path: Path,
) -> None:
    payload = build_backtest_artifact_index_payload(
        artifact_payloads=[_sdk_artifact_payload()],
        index_label="phase3-backtest-artifact-index",
    )
    output_path = tmp_path / "backtest_artifact_index.preview.json"

    persisted_payload = write_backtest_artifact_index(output_path, payload)

    assert output_path.is_file()
    assert persisted_payload["persisted"] is True
    assert BacktestArtifactIndex.from_payload(persisted_payload).persisted is True
