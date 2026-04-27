import json
import os
import subprocess
import sys
from pathlib import Path

import pytest
from fastapi.testclient import TestClient
from pydantic import ValidationError

from app.domain.backtest_research_bundle import (
    BacktestResearchBundlePreviewRequest,
    preview_backtest_research_bundle,
)
from app.domain.backtest_research_bundle_index import (
    BacktestResearchBundleIndexPreviewRequest,
    preview_backtest_research_bundle_index,
)
from app.main import app
from tests.test_backtest_research_bundle import _request_payload, _sdk_chain

REPO_ROOT = Path(__file__).resolve().parents[2]
STRATEGY_ENGINE_ROOT = REPO_ROOT / "strategy-engine"
sys.path.insert(0, str(STRATEGY_ENGINE_ROOT))

from sdk.backtest_research_bundle import (  # noqa: E402
    build_backtest_research_bundle_payload,
)
from sdk.backtest_research_bundle_index import (  # noqa: E402
    BacktestResearchBundleIndex,
    BacktestResearchBundleIndexError,
    build_backtest_research_bundle_index_payload,
)


def _bundle() -> object:
    return preview_backtest_research_bundle(
        BacktestResearchBundlePreviewRequest(**_request_payload())
    )


def _request_payload_for_index() -> dict[str, object]:
    return {
        "bundles": [_bundle().model_dump(mode="json")],
        "index_label": "phase3-backtest-research-bundle-index",
        "research_only": True,
    }


def test_backtest_research_bundle_index_preview_is_local_catalog_only() -> None:
    request = BacktestResearchBundleIndexPreviewRequest(**_request_payload_for_index())

    first = preview_backtest_research_bundle_index(request)
    second = preview_backtest_research_bundle_index(request)

    assert first.bundle_index_id == second.bundle_index_id
    assert first.index_checksum == second.index_checksum
    assert first.reproducibility_hash == second.reproducibility_hash
    assert first.bundle_count == 1
    assert first.research_only is True
    assert first.execution_eligible is False
    assert first.order_created is False
    assert first.broker_api_called is False
    assert first.risk_engine_called is False
    assert first.oms_called is False
    assert first.performance_claim is False
    assert first.simulated_metrics_only is True
    assert first.external_data_downloaded is False
    assert first.ranking_generated is False
    assert first.best_strategy_selected is False
    assert first.persisted is False
    assert len(first.index_checksum) == 64
    assert len(first.reproducibility_hash) == 64
    assert first.bundles[0].bundle_checksum


def test_backtest_research_bundle_index_api_returns_no_ranking() -> None:
    client = TestClient(app)

    response = client.post(
        "/api/strategy/backtest/research-bundle-index/preview",
        json=_request_payload_for_index(),
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["research_only"] is True
    assert payload["execution_eligible"] is False
    assert payload["performance_claim"] is False
    assert payload["ranking_generated"] is False
    assert payload["best_strategy_selected"] is False
    assert payload["bundle_count"] == 1
    assert "simulated_metric_values" not in payload["bundles"][0]


def test_backtest_research_bundle_index_warns_on_duplicate_checksums() -> None:
    payload = _request_payload_for_index()
    bundle = dict(payload["bundles"][0])
    payload["bundles"] = [bundle, bundle]

    index = preview_backtest_research_bundle_index(
        BacktestResearchBundleIndexPreviewRequest(**payload)
    )

    assert index.bundle_count == 2
    assert any(
        "Duplicate research bundle checksums" in warning
        for warning in index.warnings
    )


def test_backtest_research_bundle_index_rejects_performance_claim_bundle() -> None:
    client = TestClient(app)
    payload = _request_payload_for_index()
    bundle = dict(payload["bundles"][0])
    bundle["performance_claim"] = True
    payload["bundles"] = [bundle]

    response = client.post(
        "/api/strategy/backtest/research-bundle-index/preview",
        json=payload,
    )

    assert response.status_code == 422
    assert "performance claims" in response.json()["detail"]


def test_backtest_research_bundle_index_rejects_execution_eligible_bundle() -> None:
    client = TestClient(app)
    payload = _request_payload_for_index()
    bundle = dict(payload["bundles"][0])
    bundle["execution_eligible"] = True
    payload["bundles"] = [bundle]

    response = client.post(
        "/api/strategy/backtest/research-bundle-index/preview",
        json=payload,
    )

    assert response.status_code == 422
    assert "execution_eligible=false" in response.json()["detail"]


def test_backtest_research_bundle_index_rejects_ranking_generated_bundle() -> None:
    client = TestClient(app)
    payload = _request_payload_for_index()
    bundle = dict(payload["bundles"][0])
    bundle["ranking_generated"] = True
    payload["bundles"] = [bundle]

    response = client.post(
        "/api/strategy/backtest/research-bundle-index/preview",
        json=payload,
    )

    assert response.status_code == 422
    assert "must not generate rankings" in response.json()["detail"]


def test_backtest_research_bundle_index_rejects_best_strategy_selected_bundle() -> None:
    client = TestClient(app)
    payload = _request_payload_for_index()
    bundle = dict(payload["bundles"][0])
    bundle["best_strategy_selected"] = True
    payload["bundles"] = [bundle]

    response = client.post(
        "/api/strategy/backtest/research-bundle-index/preview",
        json=payload,
    )

    assert response.status_code == 422
    assert "must not select best strategy" in response.json()["detail"]


def test_backtest_research_bundle_index_rejects_non_research_request() -> None:
    payload = _request_payload_for_index()
    payload["research_only"] = False

    with pytest.raises(ValidationError):
        BacktestResearchBundleIndexPreviewRequest(**payload)


def _sdk_bundle_payload(parameter_set_suffix: str = "") -> dict[str, object]:
    chain = _sdk_chain()
    parameter_set_id = "phase3-preview-default"
    if parameter_set_suffix:
        chain["preview"] = dict(chain["preview"])
        chain["result"] = dict(chain["result"])
        chain["toy_run"] = dict(chain["toy_run"])
        chain["artifact"] = dict(chain["artifact"])
        chain["preview"]["parameter_set_id"] = parameter_set_id + parameter_set_suffix
        chain["result"]["parameter_set_id"] = parameter_set_id + parameter_set_suffix
        chain["toy_run"]["parameter_set_id"] = parameter_set_id + parameter_set_suffix
        chain["artifact"]["parameter_set_id"] = parameter_set_id + parameter_set_suffix
    return build_backtest_research_bundle_payload(
        manifest_payload=chain["manifest"],
        signal_payload=chain["signal"],
        backtest_preview_payload=chain["preview"],
        result_preview_payload=chain["result"],
        toy_backtest_payload=chain["toy_run"],
        artifact_payload=chain["artifact"],
        index_payload=chain["index"],
        comparison_payload=chain["comparison"],
        bundle_label="phase3-backtest-research-bundle" + parameter_set_suffix,
    )


def test_strategy_sdk_research_bundle_index_validates_safe_payload() -> None:
    payload = build_backtest_research_bundle_index_payload(
        bundle_payloads=[_sdk_bundle_payload()],
        index_label="phase3-backtest-research-bundle-index",
    )
    index = BacktestResearchBundleIndex.from_payload(payload)

    assert index.performance_claim is False
    assert index.execution_eligible is False
    assert index.ranking_generated is False
    assert index.best_strategy_selected is False
    assert index.bundle_count == 1
    assert index.bundles[0]["bundle_checksum"]


def test_strategy_sdk_research_bundle_index_warns_on_duplicate_checksums() -> None:
    bundle = _sdk_bundle_payload()

    payload = build_backtest_research_bundle_index_payload(
        bundle_payloads=[bundle, bundle],
        index_label="phase3-backtest-research-bundle-index",
    )

    assert payload["bundle_count"] == 2
    assert any(
        "Duplicate research bundle checksums" in warning
        for warning in payload["warnings"]
    )


def test_strategy_sdk_research_bundle_index_rejects_unsafe_bundle() -> None:
    bundle = _sdk_bundle_payload()
    bundle["performance_claim"] = True

    with pytest.raises(BacktestResearchBundleIndexError):
        build_backtest_research_bundle_index_payload(
            bundle_payloads=[bundle],
            index_label="phase3-backtest-research-bundle-index",
        )


def test_strategy_sdk_research_bundle_index_example_outputs_safe_catalog() -> None:
    env = dict(os.environ)
    env["PYTHONPATH"] = "strategy-engine"
    result = subprocess.run(
        [
            sys.executable,
            "strategy-engine/sdk/examples/build_backtest_research_bundle_index_example.py",
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
    assert payload["persisted"] is False
    assert payload["bundle_count"] == 2
