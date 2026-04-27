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
from app.domain.research_review_decision_index import (
    ResearchReviewDecisionIndexPreviewRequest,
    preview_research_review_decision_index,
)
from app.main import app
from tests.test_research_review_decision import (
    _request_payload as _decision_request_payload,
)
from tests.test_research_review_decision import (
    _sdk_queue_payload,
)

REPO_ROOT = Path(__file__).resolve().parents[2]
STRATEGY_ENGINE_ROOT = REPO_ROOT / "strategy-engine"
sys.path.insert(0, str(STRATEGY_ENGINE_ROOT))

from sdk.research_review_decision import (  # noqa: E402
    build_research_review_decision_payload,
)
from sdk.research_review_decision_index import (  # noqa: E402
    ResearchReviewDecisionIndex,
    ResearchReviewDecisionIndexError,
    build_research_review_decision_index_payload,
)


def _decision(decision: str) -> object:
    return preview_research_review_decision(
        ResearchReviewDecisionPreviewRequest(
            **_decision_request_payload(decision=decision)
        )
    )


def _request_payload() -> dict[str, object]:
    return {
        "decisions": [
            _decision("rejected").model_dump(mode="json"),
            _decision("needs_data_review").model_dump(mode="json"),
            _decision("approved_for_paper_research").model_dump(mode="json"),
        ],
        "decision_index_label": "phase3-research-review-decision-index",
        "research_only": True,
    }


def test_research_review_decision_index_preview_counts_decisions_only() -> None:
    request = ResearchReviewDecisionIndexPreviewRequest(**_request_payload())
    index = preview_research_review_decision_index(request)

    assert index.decision_count == 3
    assert index.decision_summary.rejected_count == 1
    assert index.decision_summary.needs_data_review_count == 1
    assert index.decision_summary.approved_for_paper_research_count == 1
    assert index.research_only is True
    assert index.execution_eligible is False
    assert index.order_created is False
    assert index.broker_api_called is False
    assert index.risk_engine_called is False
    assert index.oms_called is False
    assert index.performance_claim is False
    assert index.simulated_metrics_only is True
    assert index.external_data_downloaded is False
    assert index.ranking_generated is False
    assert index.best_strategy_selected is False
    assert index.approval_for_live is False
    assert index.approval_for_paper_execution is False
    assert index.persisted is False
    assert len(index.index_checksum) == 64
    assert len(index.reproducibility_hash) == 64


def test_research_review_decision_index_api_returns_distribution_no_approval() -> None:
    client = TestClient(app)

    response = client.post(
        "/api/strategy/research-review/decision-index/preview",
        json=_request_payload(),
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["decision_count"] == 3
    assert payload["decision_summary"]["rejected_count"] == 1
    assert payload["decision_summary"]["needs_data_review_count"] == 1
    assert payload["decision_summary"]["approved_for_paper_research_count"] == 1
    assert payload["approval_for_live"] is False
    assert payload["approval_for_paper_execution"] is False
    assert payload["ranking_generated"] is False
    assert payload["best_strategy_selected"] is False


def test_research_review_decision_index_warns_on_duplicate_checksums() -> None:
    payload = _request_payload()
    decision = dict(payload["decisions"][0])
    payload["decisions"] = [decision, decision]

    index = preview_research_review_decision_index(
        ResearchReviewDecisionIndexPreviewRequest(**payload)
    )

    assert index.decision_count == 2
    assert any(
        "Duplicate research review decision checksums" in warning
        for warning in index.warnings
    )


def test_research_review_decision_index_rejects_live_approval_decision() -> None:
    client = TestClient(app)
    payload = _request_payload()
    decision = dict(payload["decisions"][0])
    decision["approval_for_live"] = True
    payload["decisions"] = [decision]

    response = client.post(
        "/api/strategy/research-review/decision-index/preview",
        json=payload,
    )

    assert response.status_code == 422
    assert "must not approve live trading" in response.json()["detail"]


def test_research_review_decision_index_rejects_paper_execution_decision() -> None:
    client = TestClient(app)
    payload = _request_payload()
    decision = dict(payload["decisions"][0])
    decision["approval_for_paper_execution"] = True
    payload["decisions"] = [decision]

    response = client.post(
        "/api/strategy/research-review/decision-index/preview",
        json=payload,
    )

    assert response.status_code == 422
    assert "must not approve paper execution" in response.json()["detail"]


def test_research_review_decision_index_rejects_execution_eligible_decision() -> None:
    client = TestClient(app)
    payload = _request_payload()
    decision = dict(payload["decisions"][0])
    decision["execution_eligible"] = True
    payload["decisions"] = [decision]

    response = client.post(
        "/api/strategy/research-review/decision-index/preview",
        json=payload,
    )

    assert response.status_code == 422
    assert "execution_eligible=false" in response.json()["detail"]


def test_research_review_decision_index_rejects_performance_claim_decision() -> None:
    client = TestClient(app)
    payload = _request_payload()
    decision = dict(payload["decisions"][0])
    decision["performance_claim"] = True
    payload["decisions"] = [decision]

    response = client.post(
        "/api/strategy/research-review/decision-index/preview",
        json=payload,
    )

    assert response.status_code == 422
    assert "performance claims" in response.json()["detail"]


def test_research_review_decision_index_rejects_ranking_decision() -> None:
    client = TestClient(app)
    payload = _request_payload()
    decision = dict(payload["decisions"][0])
    decision["ranking_generated"] = True
    payload["decisions"] = [decision]

    response = client.post(
        "/api/strategy/research-review/decision-index/preview",
        json=payload,
    )

    assert response.status_code == 422
    assert "must not generate rankings" in response.json()["detail"]


def test_research_review_decision_index_rejects_best_strategy_decision() -> None:
    client = TestClient(app)
    payload = _request_payload()
    decision = dict(payload["decisions"][0])
    decision["best_strategy_selected"] = True
    payload["decisions"] = [decision]

    response = client.post(
        "/api/strategy/research-review/decision-index/preview",
        json=payload,
    )

    assert response.status_code == 422
    assert "must not select best strategy" in response.json()["detail"]


def test_research_review_decision_index_rejects_non_research_request() -> None:
    payload = _request_payload()
    payload["research_only"] = False

    with pytest.raises(ValidationError):
        ResearchReviewDecisionIndexPreviewRequest(**payload)


def _sdk_decision_payload(decision: str) -> dict[str, object]:
    queue_payload = _sdk_queue_payload()
    bundle_id = str(queue_payload["review_items"][0]["bundle_id"])
    return build_research_review_decision_payload(
        review_queue_payload=queue_payload,
        bundle_id=bundle_id,
        decision=decision,
        reviewer_id="local-reviewer",
        decision_reason="Dry-run decision index test.",
    )


def test_strategy_sdk_research_review_decision_index_validates_safe_payload() -> None:
    payload = build_research_review_decision_index_payload(
        decision_payloads=[
            _sdk_decision_payload("rejected"),
            _sdk_decision_payload("needs_data_review"),
            _sdk_decision_payload("approved_for_paper_research"),
        ],
        decision_index_label="phase3-research-review-decision-index",
    )
    index = ResearchReviewDecisionIndex.from_payload(payload)

    assert index.decision_count == 3
    assert index.decision_summary["rejected_count"] == 1
    assert index.decision_summary["needs_data_review_count"] == 1
    assert index.decision_summary["approved_for_paper_research_count"] == 1
    assert index.approval_for_live is False
    assert index.approval_for_paper_execution is False
    assert index.ranking_generated is False
    assert index.best_strategy_selected is False


def test_strategy_sdk_research_review_decision_index_rejects_unsafe_decision() -> None:
    decision = _sdk_decision_payload("rejected")
    decision["approval_for_paper_execution"] = True

    with pytest.raises(ResearchReviewDecisionIndexError):
        build_research_review_decision_index_payload(
            decision_payloads=[decision],
            decision_index_label="phase3-research-review-decision-index",
        )


def test_strategy_sdk_research_review_decision_index_example_outputs_safe_index() -> None:
    env = dict(os.environ)
    env["PYTHONPATH"] = "strategy-engine"
    result = subprocess.run(
        [
            sys.executable,
            "strategy-engine/sdk/examples/build_research_review_decision_index_example.py",
        ],
        cwd=REPO_ROOT,
        env=env,
        check=True,
        capture_output=True,
        text=True,
    )
    payload = json.loads(result.stdout)

    assert payload["decision_count"] == 3
    assert payload["decision_summary"]["rejected_count"] == 1
    assert payload["decision_summary"]["needs_data_review_count"] == 1
    assert payload["decision_summary"]["approved_for_paper_research_count"] == 1
    assert payload["research_only"] is True
    assert payload["execution_eligible"] is False
    assert payload["performance_claim"] is False
    assert payload["ranking_generated"] is False
    assert payload["best_strategy_selected"] is False
    assert payload["approval_for_live"] is False
    assert payload["approval_for_paper_execution"] is False
    assert payload["persisted"] is False
