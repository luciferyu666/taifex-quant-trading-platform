import json
import os
import subprocess
import sys
from pathlib import Path

import pytest
from fastapi.testclient import TestClient
from pydantic import ValidationError

from app.domain.research_review_decision import (
    ResearchReviewDecisionPreviewRequest,
    preview_research_review_decision,
)
from app.domain.research_review_queue import (
    ResearchReviewQueuePreviewRequest,
    preview_research_review_queue,
)
from app.main import app
from tests.test_research_review_queue import _request_payload as _queue_request_payload

REPO_ROOT = Path(__file__).resolve().parents[2]
STRATEGY_ENGINE_ROOT = REPO_ROOT / "strategy-engine"
sys.path.insert(0, str(STRATEGY_ENGINE_ROOT))

from sdk.backtest_research_bundle_index import (  # noqa: E402
    build_backtest_research_bundle_index_payload,
)
from sdk.research_review_decision import (  # noqa: E402
    ResearchReviewDecision,
    ResearchReviewDecisionError,
    build_research_review_decision_payload,
)
from sdk.research_review_queue import build_research_review_queue_payload  # noqa: E402

from tests.test_research_review_queue import _sdk_bundle_payload  # noqa: E402


def _queue() -> object:
    return preview_research_review_queue(
        ResearchReviewQueuePreviewRequest(**_queue_request_payload())
    )


def _request_payload(decision: str = "approved_for_paper_research") -> dict[str, object]:
    queue = _queue()
    return {
        "review_queue": queue.model_dump(mode="json"),
        "bundle_id": queue.review_items[0].bundle_id,
        "decision": decision,
        "reviewer_id": "local-reviewer",
        "decision_reason": (
            "Dry-run preview only. This decision is for continued research review "
            "and does not approve paper execution or live trading."
        ),
        "research_only": True,
    }


@pytest.mark.parametrize(
    "decision",
    ["rejected", "needs_data_review", "approved_for_paper_research"],
)
def test_research_review_decision_preview_accepts_allowed_decisions(
    decision: str,
) -> None:
    payload = _request_payload(decision=decision)
    result = preview_research_review_decision(
        ResearchReviewDecisionPreviewRequest(**payload)
    )

    assert result.decision == decision
    assert result.research_only is True
    assert result.execution_eligible is False
    assert result.order_created is False
    assert result.broker_api_called is False
    assert result.risk_engine_called is False
    assert result.oms_called is False
    assert result.performance_claim is False
    assert result.simulated_metrics_only is True
    assert result.external_data_downloaded is False
    assert result.ranking_generated is False
    assert result.best_strategy_selected is False
    assert result.approval_for_live is False
    assert result.approval_for_paper_execution is False
    assert result.persisted is False
    assert len(result.decision_checksum) == 64
    assert len(result.reproducibility_hash) == 64


def test_research_review_decision_warns_paper_research_is_not_execution() -> None:
    result = preview_research_review_decision(
        ResearchReviewDecisionPreviewRequest(**_request_payload())
    )

    assert any("not approval for paper execution" in item for item in result.warnings)


def test_research_review_decision_api_returns_no_execution_approval() -> None:
    client = TestClient(app)

    response = client.post(
        "/api/strategy/research-review/decision/preview",
        json=_request_payload(),
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["decision"] == "approved_for_paper_research"
    assert payload["approval_for_live"] is False
    assert payload["approval_for_paper_execution"] is False
    assert payload["execution_eligible"] is False
    assert payload["performance_claim"] is False
    assert payload["ranking_generated"] is False
    assert payload["best_strategy_selected"] is False


def test_research_review_decision_rejects_queue_live_approval() -> None:
    client = TestClient(app)
    payload = _request_payload()
    queue = dict(payload["review_queue"])
    queue["approval_for_live"] = True
    payload["review_queue"] = queue

    response = client.post(
        "/api/strategy/research-review/decision/preview",
        json=payload,
    )

    assert response.status_code == 422
    assert "must not approve live trading" in response.json()["detail"]


def test_research_review_decision_rejects_queue_execution_eligible() -> None:
    client = TestClient(app)
    payload = _request_payload()
    queue = dict(payload["review_queue"])
    queue["execution_eligible"] = True
    payload["review_queue"] = queue

    response = client.post(
        "/api/strategy/research-review/decision/preview",
        json=payload,
    )

    assert response.status_code == 422
    assert "execution_eligible=false" in response.json()["detail"]


def test_research_review_decision_rejects_queue_performance_claim() -> None:
    client = TestClient(app)
    payload = _request_payload()
    queue = dict(payload["review_queue"])
    queue["performance_claim"] = True
    payload["review_queue"] = queue

    response = client.post(
        "/api/strategy/research-review/decision/preview",
        json=payload,
    )

    assert response.status_code == 422
    assert "performance claims" in response.json()["detail"]


def test_research_review_decision_rejects_queue_ranking_generated() -> None:
    client = TestClient(app)
    payload = _request_payload()
    queue = dict(payload["review_queue"])
    queue["ranking_generated"] = True
    payload["review_queue"] = queue

    response = client.post(
        "/api/strategy/research-review/decision/preview",
        json=payload,
    )

    assert response.status_code == 422
    assert "must not generate rankings" in response.json()["detail"]


def test_research_review_decision_rejects_queue_best_strategy_selected() -> None:
    client = TestClient(app)
    payload = _request_payload()
    queue = dict(payload["review_queue"])
    queue["best_strategy_selected"] = True
    payload["review_queue"] = queue

    response = client.post(
        "/api/strategy/research-review/decision/preview",
        json=payload,
    )

    assert response.status_code == 422
    assert "must not select best strategy" in response.json()["detail"]


def test_research_review_decision_rejects_unknown_bundle_id() -> None:
    client = TestClient(app)
    payload = _request_payload()
    payload["bundle_id"] = "missing-bundle"

    response = client.post(
        "/api/strategy/research-review/decision/preview",
        json=payload,
    )

    assert response.status_code == 422
    assert "bundle_id not found" in response.json()["detail"]


def test_research_review_decision_rejects_non_research_request() -> None:
    payload = _request_payload()
    payload["research_only"] = False

    with pytest.raises(ValidationError):
        ResearchReviewDecisionPreviewRequest(**payload)


def test_research_review_decision_rejects_invalid_decision() -> None:
    payload = _request_payload()
    payload["decision"] = "approved_for_live"

    with pytest.raises(ValidationError):
        ResearchReviewDecisionPreviewRequest(**payload)


def _sdk_queue_payload() -> dict[str, object]:
    index_payload = build_backtest_research_bundle_index_payload(
        bundle_payloads=[_sdk_bundle_payload()],
        index_label="phase3-backtest-research-bundle-index",
    )
    return build_research_review_queue_payload(
        bundle_index_payload=index_payload,
        review_queue_label="phase3-research-review-queue",
    )


def test_strategy_sdk_research_review_decision_validates_safe_payload() -> None:
    queue_payload = _sdk_queue_payload()
    bundle_id = str(queue_payload["review_items"][0]["bundle_id"])

    payload = build_research_review_decision_payload(
        review_queue_payload=queue_payload,
        bundle_id=bundle_id,
        decision="approved_for_paper_research",
        reviewer_id="local-reviewer",
        decision_reason="Continued research review only.",
    )
    decision = ResearchReviewDecision.from_payload(payload)

    assert decision.decision == "approved_for_paper_research"
    assert decision.approval_for_live is False
    assert decision.approval_for_paper_execution is False
    assert decision.performance_claim is False
    assert decision.execution_eligible is False


def test_strategy_sdk_research_review_decision_rejects_unsafe_queue() -> None:
    queue_payload = _sdk_queue_payload()
    queue_payload["performance_claim"] = True
    bundle_id = str(queue_payload["review_items"][0]["bundle_id"])

    with pytest.raises(ResearchReviewDecisionError):
        build_research_review_decision_payload(
            review_queue_payload=queue_payload,
            bundle_id=bundle_id,
            decision="rejected",
            reviewer_id="local-reviewer",
            decision_reason="Unsafe queue.",
        )


def test_strategy_sdk_research_review_decision_rejects_paper_execution_flag() -> None:
    queue_payload = _sdk_queue_payload()
    bundle_id = str(queue_payload["review_items"][0]["bundle_id"])
    payload = build_research_review_decision_payload(
        review_queue_payload=queue_payload,
        bundle_id=bundle_id,
        decision="needs_data_review",
        reviewer_id="local-reviewer",
        decision_reason="Needs data review.",
    )
    payload["approval_for_paper_execution"] = True

    with pytest.raises(ResearchReviewDecisionError):
        ResearchReviewDecision.from_payload(payload)


def test_strategy_sdk_research_review_decision_example_outputs_safe_decision() -> None:
    env = dict(os.environ)
    env["PYTHONPATH"] = "strategy-engine"
    result = subprocess.run(
        [
            sys.executable,
            "strategy-engine/sdk/examples/build_research_review_decision_example.py",
        ],
        cwd=REPO_ROOT,
        env=env,
        check=True,
        capture_output=True,
        text=True,
    )
    payload = json.loads(result.stdout)

    assert payload["decision"] == "approved_for_paper_research"
    assert payload["research_only"] is True
    assert payload["execution_eligible"] is False
    assert payload["performance_claim"] is False
    assert payload["ranking_generated"] is False
    assert payload["best_strategy_selected"] is False
    assert payload["approval_for_live"] is False
    assert payload["approval_for_paper_execution"] is False
    assert payload["persisted"] is False
