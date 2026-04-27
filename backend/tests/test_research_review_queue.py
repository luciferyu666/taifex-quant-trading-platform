import json
import os
import subprocess
import sys
from pathlib import Path

import pytest
from fastapi.testclient import TestClient
from pydantic import ValidationError

from app.domain.backtest_research_bundle_index import (
    BacktestResearchBundleIndexPreviewRequest,
    preview_backtest_research_bundle_index,
)
from app.domain.research_review_queue import (
    ResearchReviewQueuePreviewRequest,
    preview_research_review_queue,
)
from app.main import app
from tests.test_backtest_research_bundle_index import (
    _request_payload_for_index,
    _sdk_bundle_payload,
)

REPO_ROOT = Path(__file__).resolve().parents[2]
STRATEGY_ENGINE_ROOT = REPO_ROOT / "strategy-engine"
sys.path.insert(0, str(STRATEGY_ENGINE_ROOT))

from sdk.backtest_research_bundle_index import (  # noqa: E402
    build_backtest_research_bundle_index_payload,
)
from sdk.research_review_queue import (  # noqa: E402
    ResearchReviewQueue,
    ResearchReviewQueueError,
    build_research_review_queue_payload,
)


def _bundle_index() -> object:
    return preview_backtest_research_bundle_index(
        BacktestResearchBundleIndexPreviewRequest(**_request_payload_for_index())
    )


def _request_payload() -> dict[str, object]:
    return {
        "bundle_index": _bundle_index().model_dump(mode="json"),
        "review_queue_label": "phase3-research-review-queue",
        "research_only": True,
    }


def test_research_review_queue_preview_is_pending_review_only() -> None:
    request = ResearchReviewQueuePreviewRequest(**_request_payload())

    first = preview_research_review_queue(request)
    second = preview_research_review_queue(request)

    assert first.review_queue_id == second.review_queue_id
    assert first.queue_checksum == second.queue_checksum
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
    assert first.approval_for_live is False
    assert first.persisted is False
    assert first.review_items[0].review_status == "pending_review"
    assert "not a live-trading approval" in first.review_items[0].review_reason
    assert len(first.queue_checksum) == 64
    assert len(first.reproducibility_hash) == 64


def test_research_review_queue_api_returns_no_live_approval() -> None:
    client = TestClient(app)

    response = client.post(
        "/api/strategy/research-review/queue/preview",
        json=_request_payload(),
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["research_only"] is True
    assert payload["execution_eligible"] is False
    assert payload["performance_claim"] is False
    assert payload["ranking_generated"] is False
    assert payload["best_strategy_selected"] is False
    assert payload["approval_for_live"] is False
    assert payload["review_items"][0]["review_status"] == "pending_review"


def test_research_review_queue_rejects_performance_claim_index() -> None:
    client = TestClient(app)
    payload = _request_payload()
    index = dict(payload["bundle_index"])
    index["performance_claim"] = True
    payload["bundle_index"] = index

    response = client.post(
        "/api/strategy/research-review/queue/preview",
        json=payload,
    )

    assert response.status_code == 422
    assert "performance claims" in response.json()["detail"]


def test_research_review_queue_rejects_execution_eligible_index() -> None:
    client = TestClient(app)
    payload = _request_payload()
    index = dict(payload["bundle_index"])
    index["execution_eligible"] = True
    payload["bundle_index"] = index

    response = client.post(
        "/api/strategy/research-review/queue/preview",
        json=payload,
    )

    assert response.status_code == 422
    assert "execution_eligible=false" in response.json()["detail"]


def test_research_review_queue_rejects_ranking_generated_index() -> None:
    client = TestClient(app)
    payload = _request_payload()
    index = dict(payload["bundle_index"])
    index["ranking_generated"] = True
    payload["bundle_index"] = index

    response = client.post(
        "/api/strategy/research-review/queue/preview",
        json=payload,
    )

    assert response.status_code == 422
    assert "must not generate rankings" in response.json()["detail"]


def test_research_review_queue_rejects_best_strategy_selected_index() -> None:
    client = TestClient(app)
    payload = _request_payload()
    index = dict(payload["bundle_index"])
    index["best_strategy_selected"] = True
    payload["bundle_index"] = index

    response = client.post(
        "/api/strategy/research-review/queue/preview",
        json=payload,
    )

    assert response.status_code == 422
    assert "must not select best strategy" in response.json()["detail"]


def test_research_review_queue_rejects_non_research_request() -> None:
    payload = _request_payload()
    payload["research_only"] = False

    with pytest.raises(ValidationError):
        ResearchReviewQueuePreviewRequest(**payload)


def test_strategy_sdk_research_review_queue_validates_safe_payload() -> None:
    index_payload = build_backtest_research_bundle_index_payload(
        bundle_payloads=[_sdk_bundle_payload()],
        index_label="phase3-backtest-research-bundle-index",
    )

    payload = build_research_review_queue_payload(
        bundle_index_payload=index_payload,
        review_queue_label="phase3-research-review-queue",
    )
    queue = ResearchReviewQueue.from_payload(payload)

    assert queue.approval_for_live is False
    assert queue.performance_claim is False
    assert queue.execution_eligible is False
    assert queue.ranking_generated is False
    assert queue.best_strategy_selected is False
    assert queue.review_items[0]["review_status"] == "pending_review"


def test_strategy_sdk_research_review_queue_rejects_unsafe_index() -> None:
    index_payload = build_backtest_research_bundle_index_payload(
        bundle_payloads=[_sdk_bundle_payload()],
        index_label="phase3-backtest-research-bundle-index",
    )
    index_payload["performance_claim"] = True

    with pytest.raises(ResearchReviewQueueError):
        build_research_review_queue_payload(
            bundle_index_payload=index_payload,
            review_queue_label="phase3-research-review-queue",
        )


def test_strategy_sdk_research_review_queue_rejects_live_approval_flag() -> None:
    index_payload = build_backtest_research_bundle_index_payload(
        bundle_payloads=[_sdk_bundle_payload()],
        index_label="phase3-backtest-research-bundle-index",
    )
    payload = build_research_review_queue_payload(
        bundle_index_payload=index_payload,
        review_queue_label="phase3-research-review-queue",
    )
    payload["approval_for_live"] = True

    with pytest.raises(ResearchReviewQueueError):
        ResearchReviewQueue.from_payload(payload)


def test_strategy_sdk_research_review_queue_example_outputs_safe_queue() -> None:
    env = dict(os.environ)
    env["PYTHONPATH"] = "strategy-engine"
    result = subprocess.run(
        [
            sys.executable,
            "strategy-engine/sdk/examples/build_research_review_queue_example.py",
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
    assert payload["approval_for_live"] is False
    assert payload["persisted"] is False
    assert payload["review_items"][0]["review_status"] == "pending_review"
