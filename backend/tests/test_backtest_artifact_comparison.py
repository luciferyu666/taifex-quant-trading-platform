import json
import os
import subprocess
import sys
from pathlib import Path

import pytest
from fastapi.testclient import TestClient
from pydantic import ValidationError

from app.domain.backtest_artifact_comparison import (
    BacktestArtifactComparisonPreviewRequest,
    preview_backtest_artifact_comparison,
)
from app.domain.backtest_artifact_index import (
    BacktestArtifactIndexPreviewRequest,
    preview_backtest_artifact_index,
)
from app.main import app
from tests.test_backtest_artifact_index import _request_payload, _sdk_artifact_payload

REPO_ROOT = Path(__file__).resolve().parents[2]
STRATEGY_ENGINE_ROOT = REPO_ROOT / "strategy-engine"
sys.path.insert(0, str(STRATEGY_ENGINE_ROOT))

from sdk.backtest_artifact_comparison import (  # noqa: E402
    BacktestArtifactComparison,
    BacktestArtifactComparisonError,
    build_backtest_artifact_comparison_payload,
)
from sdk.backtest_artifact_index import build_backtest_artifact_index_payload  # noqa: E402


def _index() -> object:
    return preview_backtest_artifact_index(
        BacktestArtifactIndexPreviewRequest(**_request_payload())
    )


def _comparison_payload() -> dict[str, object]:
    return {
        "artifact_index": _index().model_dump(mode="json"),
        "comparison_label": "phase3-backtest-artifact-comparison",
        "research_only": True,
    }


def test_backtest_artifact_comparison_preview_is_metadata_only() -> None:
    comparison = preview_backtest_artifact_comparison(
        BacktestArtifactComparisonPreviewRequest(**_comparison_payload())
    )

    assert comparison.artifact_count == 1
    assert comparison.research_only is True
    assert comparison.execution_eligible is False
    assert comparison.order_created is False
    assert comparison.broker_api_called is False
    assert comparison.risk_engine_called is False
    assert comparison.oms_called is False
    assert comparison.performance_claim is False
    assert comparison.simulated_metrics_only is True
    assert comparison.external_data_downloaded is False
    assert comparison.ranking_generated is False
    assert comparison.best_strategy_selected is False
    assert comparison.persisted is False
    assert len(comparison.comparison_checksum) == 64
    assert len(comparison.reproducibility_hash) == 64
    assert "fixture-v1" in comparison.comparison_summary.data_versions
    assert "phase3-preview-default" in comparison.comparison_summary.parameter_sets
    assert "total_return_pct" in comparison.comparison_summary.metric_names
    assert comparison.comparison_summary.checksum_status["artifact_checksums_valid"]


def test_backtest_artifact_comparison_api_returns_no_ranking_fields_enabled() -> None:
    client = TestClient(app)

    response = client.post(
        "/api/strategy/backtest/artifact-comparison/preview",
        json=_comparison_payload(),
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["research_only"] is True
    assert payload["execution_eligible"] is False
    assert payload["performance_claim"] is False
    assert payload["ranking_generated"] is False
    assert payload["best_strategy_selected"] is False
    assert payload["comparison_summary"]["metric_names"]


def test_backtest_artifact_comparison_rejects_performance_claim_index() -> None:
    client = TestClient(app)
    payload = _comparison_payload()
    index = dict(payload["artifact_index"])
    index["performance_claim"] = True
    payload["artifact_index"] = index

    response = client.post(
        "/api/strategy/backtest/artifact-comparison/preview",
        json=payload,
    )

    assert response.status_code == 422
    assert "performance claims" in response.json()["detail"]


def test_backtest_artifact_comparison_rejects_execution_eligible_index() -> None:
    client = TestClient(app)
    payload = _comparison_payload()
    index = dict(payload["artifact_index"])
    index["execution_eligible"] = True
    payload["artifact_index"] = index

    response = client.post(
        "/api/strategy/backtest/artifact-comparison/preview",
        json=payload,
    )

    assert response.status_code == 422
    assert "execution_eligible=false" in response.json()["detail"]


def test_backtest_artifact_comparison_rejects_non_research_request() -> None:
    payload = _comparison_payload()
    payload["research_only"] = False

    with pytest.raises(ValidationError):
        BacktestArtifactComparisonPreviewRequest(**payload)


def test_backtest_artifact_comparison_warns_on_duplicate_checksums() -> None:
    index_payload = _request_payload()
    artifact = dict(index_payload["artifacts"][0])
    index_payload["artifacts"] = [artifact, artifact]
    index = preview_backtest_artifact_index(
        BacktestArtifactIndexPreviewRequest(**index_payload)
    )

    comparison = preview_backtest_artifact_comparison(
        BacktestArtifactComparisonPreviewRequest(
            artifact_index=index,
            comparison_label="phase3-backtest-artifact-comparison",
            research_only=True,
        )
    )

    assert comparison.artifact_count == 2
    assert any("Duplicate artifact checksums" in item for item in comparison.warnings)


def test_strategy_sdk_artifact_comparison_validates_safe_payload() -> None:
    index_payload = build_backtest_artifact_index_payload(
        artifact_payloads=[_sdk_artifact_payload()],
        index_label="phase3-backtest-artifact-index",
    )
    comparison_payload = build_backtest_artifact_comparison_payload(
        index_payload=index_payload,
        comparison_label="phase3-backtest-artifact-comparison",
    )
    comparison = BacktestArtifactComparison.from_payload(comparison_payload)

    assert comparison.performance_claim is False
    assert comparison.execution_eligible is False
    assert comparison.ranking_generated is False
    assert comparison.best_strategy_selected is False
    assert comparison.comparison_summary["metric_names"]


def test_strategy_sdk_artifact_comparison_rejects_performance_claim() -> None:
    index_payload = build_backtest_artifact_index_payload(
        artifact_payloads=[_sdk_artifact_payload()],
        index_label="phase3-backtest-artifact-index",
    )
    index_payload["performance_claim"] = True

    with pytest.raises(BacktestArtifactComparisonError):
        build_backtest_artifact_comparison_payload(
            index_payload=index_payload,
            comparison_label="phase3-backtest-artifact-comparison",
        )


def test_strategy_sdk_artifact_comparison_example_outputs_no_ranking() -> None:
    env = dict(os.environ)
    env["PYTHONPATH"] = "strategy-engine"
    result = subprocess.run(
        [
            sys.executable,
            "strategy-engine/sdk/examples/compare_backtest_artifacts_example.py",
        ],
        cwd=REPO_ROOT,
        env=env,
        check=True,
        capture_output=True,
        text=True,
    )
    payload = json.loads(result.stdout)

    assert payload["research_only"] is True
    assert payload["ranking_generated"] is False
    assert payload["best_strategy_selected"] is False
    assert payload["comparison_summary"]["metric_names"]
