import csv
import json
import os
import subprocess
import sys
from pathlib import Path

import pytest
from fastapi.testclient import TestClient
from pydantic import ValidationError

from app.domain.backtest_artifact import (
    BacktestArtifactPreviewRequest,
    preview_backtest_artifact,
)
from app.domain.backtest_artifact_comparison import (
    BacktestArtifactComparisonPreviewRequest,
    preview_backtest_artifact_comparison,
)
from app.domain.backtest_artifact_index import (
    BacktestArtifactIndexPreviewRequest,
    preview_backtest_artifact_index,
)
from app.domain.backtest_preview import (
    BacktestPreviewRequest,
    preview_backtest_contract,
)
from app.domain.backtest_research_bundle import (
    BacktestResearchBundlePreviewRequest,
    preview_backtest_research_bundle,
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
from tests.test_backtest_artifact_index import _sdk_artifact_payload

REPO_ROOT = Path(__file__).resolve().parents[2]
STRATEGY_ENGINE_ROOT = REPO_ROOT / "strategy-engine"
sys.path.insert(0, str(STRATEGY_ENGINE_ROOT))

from sdk.backtest_artifact import build_backtest_artifact_payload  # noqa: E402
from sdk.backtest_artifact_comparison import (  # noqa: E402
    build_backtest_artifact_comparison_payload,
)
from sdk.backtest_artifact_index import build_backtest_artifact_index_payload  # noqa: E402
from sdk.backtest_contract import build_backtest_preview_payload  # noqa: E402
from sdk.backtest_research_bundle import (  # noqa: E402
    BacktestResearchBundle,
    BacktestResearchBundleError,
    build_backtest_research_bundle_payload,
    write_backtest_research_bundle,
)
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


def _chain() -> dict[str, object]:
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
    artifact = preview_backtest_artifact(
        BacktestArtifactPreviewRequest(
            toy_backtest_run=toy_run,
            artifact_label="phase3-backtest-artifact",
            research_only=True,
        )
    )
    artifact_index = preview_backtest_artifact_index(
        BacktestArtifactIndexPreviewRequest(
            artifacts=[artifact],
            index_label="phase3-backtest-artifact-index",
            research_only=True,
        )
    )
    comparison = preview_backtest_artifact_comparison(
        BacktestArtifactComparisonPreviewRequest(
            artifact_index=artifact_index,
            comparison_label="phase3-backtest-artifact-comparison",
            research_only=True,
        )
    )
    return {
        "feature_manifest": manifest,
        "strategy_signal": signal,
        "backtest_preview": backtest_preview,
        "backtest_result_preview": result_preview,
        "toy_backtest_run": toy_run,
        "backtest_artifact": artifact,
        "backtest_artifact_index": artifact_index,
        "backtest_artifact_comparison": comparison,
    }


def _request_payload() -> dict[str, object]:
    return {
        key: value.model_dump(mode="json")
        for key, value in _chain().items()
    } | {
        "bundle_label": "phase3-backtest-research-bundle",
        "research_only": True,
    }


def test_backtest_research_bundle_preview_is_metadata_only() -> None:
    bundle = preview_backtest_research_bundle(
        BacktestResearchBundlePreviewRequest(**_request_payload())
    )

    assert bundle.bundle_id.startswith("backtest-research-bundle-")
    assert bundle.artifact_count == 1
    assert bundle.research_only is True
    assert bundle.execution_eligible is False
    assert bundle.order_created is False
    assert bundle.broker_api_called is False
    assert bundle.risk_engine_called is False
    assert bundle.oms_called is False
    assert bundle.performance_claim is False
    assert bundle.simulated_metrics_only is True
    assert bundle.external_data_downloaded is False
    assert bundle.ranking_generated is False
    assert bundle.best_strategy_selected is False
    assert bundle.persisted is False
    assert "feature_manifest" in bundle.included_sections
    assert "phase3-preview-default" in bundle.parameter_set_ids
    assert len(bundle.checksums.bundle_checksum) == 64
    assert len(bundle.reproducibility_hash) == 64


def test_backtest_research_bundle_api_returns_safety_flags() -> None:
    client = TestClient(app)

    response = client.post(
        "/api/strategy/backtest/research-bundle/preview",
        json=_request_payload(),
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["research_only"] is True
    assert payload["execution_eligible"] is False
    assert payload["performance_claim"] is False
    assert payload["ranking_generated"] is False
    assert payload["best_strategy_selected"] is False
    assert payload["checksums"]["bundle_checksum"]


def test_backtest_research_bundle_rejects_performance_claim_input() -> None:
    client = TestClient(app)
    payload = _request_payload()
    comparison = dict(payload["backtest_artifact_comparison"])
    comparison["performance_claim"] = True
    payload["backtest_artifact_comparison"] = comparison

    response = client.post(
        "/api/strategy/backtest/research-bundle/preview",
        json=payload,
    )

    assert response.status_code == 422
    assert "performance claims" in response.json()["detail"]


def test_backtest_research_bundle_rejects_execution_eligible_input() -> None:
    client = TestClient(app)
    payload = _request_payload()
    artifact = dict(payload["backtest_artifact"])
    artifact["execution_eligible"] = True
    payload["backtest_artifact"] = artifact

    response = client.post(
        "/api/strategy/backtest/research-bundle/preview",
        json=payload,
    )

    assert response.status_code == 422
    assert "execution_eligible=false" in response.json()["detail"]


def test_backtest_research_bundle_rejects_ranking_generated_input() -> None:
    client = TestClient(app)
    payload = _request_payload()
    comparison = dict(payload["backtest_artifact_comparison"])
    comparison["ranking_generated"] = True
    payload["backtest_artifact_comparison"] = comparison

    response = client.post(
        "/api/strategy/backtest/research-bundle/preview",
        json=payload,
    )

    assert response.status_code == 422
    assert "must not generate rankings" in response.json()["detail"]


def test_backtest_research_bundle_rejects_mismatched_artifact_index() -> None:
    client = TestClient(app)
    payload = _request_payload()
    index = dict(payload["backtest_artifact_index"])
    index["artifacts"] = []
    index["artifact_count"] = 0
    payload["backtest_artifact_index"] = index

    response = client.post(
        "/api/strategy/backtest/research-bundle/preview",
        json=payload,
    )

    assert response.status_code == 422
    assert "index must include backtest artifact" in response.json()["detail"]


def test_backtest_research_bundle_rejects_non_research_request() -> None:
    payload = _request_payload()
    payload["research_only"] = False

    with pytest.raises(ValidationError):
        BacktestResearchBundlePreviewRequest(**payload)


def _sdk_chain() -> dict[str, dict[str, object]]:
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
    artifact = build_backtest_artifact_payload(
        toy_backtest_payload=toy_run,
        artifact_label="phase3-backtest-artifact",
    )
    index = build_backtest_artifact_index_payload(
        artifact_payloads=[artifact, _sdk_artifact_payload()],
        index_label="phase3-backtest-artifact-index",
    )
    comparison = build_backtest_artifact_comparison_payload(
        index_payload=index,
        comparison_label="phase3-backtest-artifact-comparison",
    )
    return {
        "manifest": manifest_payload,
        "signal": signal_preview["signal"],
        "preview": backtest_preview,
        "result": result_preview,
        "toy_run": toy_run,
        "artifact": artifact,
        "index": index,
        "comparison": comparison,
    }


def test_strategy_sdk_research_bundle_validates_safe_payload() -> None:
    chain = _sdk_chain()

    payload = build_backtest_research_bundle_payload(
        manifest_payload=chain["manifest"],
        signal_payload=chain["signal"],
        backtest_preview_payload=chain["preview"],
        result_preview_payload=chain["result"],
        toy_backtest_payload=chain["toy_run"],
        artifact_payload=chain["artifact"],
        index_payload=chain["index"],
        comparison_payload=chain["comparison"],
        bundle_label="phase3-backtest-research-bundle",
    )
    bundle = BacktestResearchBundle.from_payload(payload)

    assert bundle.performance_claim is False
    assert bundle.execution_eligible is False
    assert bundle.ranking_generated is False
    assert bundle.best_strategy_selected is False
    assert "backtest_artifact_comparison" in bundle.included_sections


def test_strategy_sdk_research_bundle_write_requires_explicit_json_output(
    tmp_path: Path,
) -> None:
    chain = _sdk_chain()
    payload = build_backtest_research_bundle_payload(
        manifest_payload=chain["manifest"],
        signal_payload=chain["signal"],
        backtest_preview_payload=chain["preview"],
        result_preview_payload=chain["result"],
        toy_backtest_payload=chain["toy_run"],
        artifact_payload=chain["artifact"],
        index_payload=chain["index"],
        comparison_payload=chain["comparison"],
        bundle_label="phase3-backtest-research-bundle",
    )
    output_path = tmp_path / "backtest_research_bundle.preview.json"

    persisted_payload = write_backtest_research_bundle(output_path, payload)
    written_payload = json.loads(output_path.read_text(encoding="utf-8"))

    assert payload["persisted"] is False
    assert persisted_payload["persisted"] is True
    assert written_payload["persisted"] is True
    assert written_payload["execution_eligible"] is False
    assert written_payload["performance_claim"] is False


def test_strategy_sdk_research_bundle_write_rejects_non_json(tmp_path: Path) -> None:
    chain = _sdk_chain()
    payload = build_backtest_research_bundle_payload(
        manifest_payload=chain["manifest"],
        signal_payload=chain["signal"],
        backtest_preview_payload=chain["preview"],
        result_preview_payload=chain["result"],
        toy_backtest_payload=chain["toy_run"],
        artifact_payload=chain["artifact"],
        index_payload=chain["index"],
        comparison_payload=chain["comparison"],
        bundle_label="phase3-backtest-research-bundle",
    )

    with pytest.raises(BacktestResearchBundleError):
        write_backtest_research_bundle(tmp_path / "bundle.txt", payload)


def test_strategy_sdk_research_bundle_rejects_unsafe_comparison() -> None:
    chain = _sdk_chain()
    comparison = dict(chain["comparison"])
    comparison["best_strategy_selected"] = True

    with pytest.raises(BacktestResearchBundleError):
        build_backtest_research_bundle_payload(
            manifest_payload=chain["manifest"],
            signal_payload=chain["signal"],
            backtest_preview_payload=chain["preview"],
            result_preview_payload=chain["result"],
            toy_backtest_payload=chain["toy_run"],
            artifact_payload=chain["artifact"],
            index_payload=chain["index"],
            comparison_payload=comparison,
            bundle_label="phase3-backtest-research-bundle",
        )


def test_strategy_sdk_research_bundle_example_outputs_safe_bundle() -> None:
    env = dict(os.environ)
    env["PYTHONPATH"] = "strategy-engine"
    result = subprocess.run(
        [
            sys.executable,
            "strategy-engine/sdk/examples/build_backtest_research_bundle_example.py",
        ],
        cwd=REPO_ROOT,
        env=env,
        check=True,
        capture_output=True,
        text=True,
    )
    payload = json.loads(result.stdout)

    assert payload["research_only"] is True
    assert payload["execution_eligible"] is False
    assert payload["performance_claim"] is False
    assert payload["ranking_generated"] is False
    assert payload["best_strategy_selected"] is False
    assert payload["checksums"]["bundle_checksum"]


def test_strategy_sdk_research_bundle_example_writes_only_with_output(
    tmp_path: Path,
) -> None:
    output_path = tmp_path / "bundle.preview.json"
    env = dict(os.environ)
    env["PYTHONPATH"] = "strategy-engine"
    result = subprocess.run(
        [
            sys.executable,
            "strategy-engine/sdk/examples/build_backtest_research_bundle_example.py",
            "--output",
            str(output_path),
        ],
        cwd=REPO_ROOT,
        env=env,
        check=True,
        capture_output=True,
        text=True,
    )
    stdout_payload = json.loads(result.stdout)
    file_payload = json.loads(output_path.read_text(encoding="utf-8"))

    assert stdout_payload["persisted"] is True
    assert file_payload["persisted"] is True
    assert file_payload["execution_eligible"] is False
    assert file_payload["performance_claim"] is False
