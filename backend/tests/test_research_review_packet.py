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
from app.domain.research_review_packet import (
    ResearchReviewPacketPreviewRequest,
    preview_research_review_packet,
    sample_research_review_packet,
)
from app.main import app
from tests.test_research_review_decision import (
    _request_payload as _decision_request_payload,
)
from tests.test_research_review_queue import (
    _sdk_bundle_payload,
)

REPO_ROOT = Path(__file__).resolve().parents[2]
STRATEGY_ENGINE_ROOT = REPO_ROOT / "strategy-engine"
sys.path.insert(0, str(STRATEGY_ENGINE_ROOT))

from sdk.backtest_research_bundle_index import (  # noqa: E402
    build_backtest_research_bundle_index_payload,
)
from sdk.research_review_decision import (  # noqa: E402
    build_research_review_decision_payload,
)
from sdk.research_review_decision_index import (  # noqa: E402
    build_research_review_decision_index_payload,
)
from sdk.research_review_packet import (  # noqa: E402
    ResearchReviewPacket,
    ResearchReviewPacketError,
    build_research_review_packet_payload,
)
from sdk.research_review_queue import build_research_review_queue_payload  # noqa: E402


def _decision_payload(queue_payload: dict[str, object], decision: str) -> dict[str, object]:
    bundle_id = str(queue_payload["review_items"][0]["bundle_id"])
    request = {
        "review_queue": queue_payload,
        "bundle_id": bundle_id,
        "decision": decision,
        "reviewer_id": "local-reviewer",
        "decision_reason": (
            "Dry-run preview only. This decision is for continued research review "
            "and does not approve paper execution or live trading."
        ),
        "research_only": True,
    }
    return preview_research_review_decision(
        ResearchReviewDecisionPreviewRequest(**request)
    ).model_dump(mode="json")


def _decision_payloads(queue_payload: dict[str, object]) -> list[dict[str, object]]:
    return [
        _decision_payload(queue_payload, "rejected"),
        _decision_payload(queue_payload, "needs_data_review"),
        _decision_payload(queue_payload, "approved_for_paper_research"),
    ]


def _decision_index_payload(
    decisions: list[dict[str, object]],
) -> dict[str, object]:
    request_payload = {
        "decisions": decisions,
        "decision_index_label": "phase3-research-review-decision-index",
        "research_only": True,
    }
    index = preview_research_review_decision_index(
        ResearchReviewDecisionIndexPreviewRequest(**request_payload)
    )
    return index.model_dump(mode="json")


def _request_payload() -> dict[str, object]:
    queue_payload = _decision_request_payload()["review_queue"]
    decisions = _decision_payloads(queue_payload)
    return {
        "review_queue": queue_payload,
        "decisions": decisions,
        "decision_index": _decision_index_payload(decisions),
        "packet_label": "phase3-research-review-packet",
        "research_only": True,
    }


def test_research_review_packet_preview_packages_review_context_only() -> None:
    packet = preview_research_review_packet(
        ResearchReviewPacketPreviewRequest(**_request_payload())
    )

    assert packet.packet_id.startswith("research-review-packet-")
    assert packet.bundle_count == 1
    assert packet.decision_count == 3
    assert packet.decision_summary.rejected_count == 1
    assert packet.decision_summary.needs_data_review_count == 1
    assert packet.decision_summary.approved_for_paper_research_count == 1
    assert packet.included_sections == ["review_queue", "decisions", "decision_index"]
    assert len(packet.checksums.queue_checksum) == 64
    assert len(packet.checksums.index_checksum) == 64
    assert len(packet.checksums.packet_checksum) == 64
    assert len(packet.reproducibility_hash) == 64
    assert packet.research_only is True
    assert packet.execution_eligible is False
    assert packet.order_created is False
    assert packet.broker_api_called is False
    assert packet.risk_engine_called is False
    assert packet.oms_called is False
    assert packet.performance_claim is False
    assert packet.simulated_metrics_only is True
    assert packet.external_data_downloaded is False
    assert packet.ranking_generated is False
    assert packet.best_strategy_selected is False
    assert packet.approval_for_live is False
    assert packet.approval_for_paper_execution is False
    assert packet.persisted is False


def test_research_review_packet_api_returns_no_execution_approval() -> None:
    client = TestClient(app)

    response = client.post(
        "/api/strategy/research-review/packet/preview",
        json=_request_payload(),
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["decision_count"] == 3
    assert payload["approval_for_live"] is False
    assert payload["approval_for_paper_execution"] is False
    assert payload["execution_eligible"] is False
    assert payload["performance_claim"] is False
    assert payload["ranking_generated"] is False
    assert payload["best_strategy_selected"] is False
    assert payload["persisted"] is False


def test_research_review_packet_sample_api_returns_read_only_metadata() -> None:
    client = TestClient(app)

    response = client.get("/api/strategy/research-review/packet/sample")

    assert response.status_code == 200
    payload = response.json()
    assert payload["packet_id"].startswith("research-review-packet-sample-")
    assert payload["decision_count"] == 3
    assert payload["decision_summary"]["rejected_count"] == 1
    assert payload["decision_summary"]["needs_data_review_count"] == 1
    assert payload["decision_summary"]["approved_for_paper_research_count"] == 1
    assert payload["research_only"] is True
    assert payload["execution_eligible"] is False
    assert payload["approval_for_live"] is False
    assert payload["approval_for_paper_execution"] is False
    assert payload["ranking_generated"] is False
    assert payload["best_strategy_selected"] is False
    assert payload["persisted"] is False


def test_research_review_packet_sample_domain_is_safe() -> None:
    packet = sample_research_review_packet()

    assert packet.research_only is True
    assert packet.execution_eligible is False
    assert packet.approval_for_live is False
    assert packet.approval_for_paper_execution is False
    assert packet.performance_claim is False
    assert packet.ranking_generated is False
    assert packet.best_strategy_selected is False
    assert packet.persisted is False
    assert len(packet.checksums.packet_checksum) == 64


def test_research_review_packet_rejects_queue_live_approval() -> None:
    client = TestClient(app)
    payload = _request_payload()
    queue = dict(payload["review_queue"])
    queue["approval_for_live"] = True
    payload["review_queue"] = queue

    response = client.post(
        "/api/strategy/research-review/packet/preview",
        json=payload,
    )

    assert response.status_code == 422
    assert "must not approve live trading" in response.json()["detail"]


def test_research_review_packet_rejects_decision_paper_execution_approval() -> None:
    client = TestClient(app)
    payload = _request_payload()
    decision = dict(payload["decisions"][0])
    decision["approval_for_paper_execution"] = True
    payload["decisions"] = [decision]
    index = dict(payload["decision_index"])
    index["decision_count"] = 1
    index["decisions"] = [
        {
            "decision_id": decision["decision_id"],
            "review_queue_id": decision["review_queue_id"],
            "bundle_id": decision["bundle_id"],
            "decision": decision["decision"],
            "reviewer_id": decision["reviewer_id"],
            "decision_checksum": decision["decision_checksum"],
        }
    ]
    index["decision_summary"] = {
        "rejected_count": 1,
        "needs_data_review_count": 0,
        "approved_for_paper_research_count": 0,
    }
    payload["decision_index"] = index

    response = client.post(
        "/api/strategy/research-review/packet/preview",
        json=payload,
    )

    assert response.status_code == 422
    assert "must not approve paper execution" in response.json()["detail"]


def test_research_review_packet_rejects_ranking_decision_index() -> None:
    client = TestClient(app)
    payload = _request_payload()
    index = dict(payload["decision_index"])
    index["ranking_generated"] = True
    payload["decision_index"] = index

    response = client.post(
        "/api/strategy/research-review/packet/preview",
        json=payload,
    )

    assert response.status_code == 422
    assert "must not generate rankings" in response.json()["detail"]


def test_research_review_packet_rejects_mismatched_decision_index() -> None:
    client = TestClient(app)
    payload = _request_payload()
    index = dict(payload["decision_index"])
    index["decision_count"] = 99
    payload["decision_index"] = index

    response = client.post(
        "/api/strategy/research-review/packet/preview",
        json=payload,
    )

    assert response.status_code == 422
    assert "decision index count" in response.json()["detail"]


def test_research_review_packet_rejects_queue_mismatch() -> None:
    client = TestClient(app)
    payload = _request_payload()
    queue = dict(payload["review_queue"])
    queue["review_queue_id"] = "different-queue"
    payload["review_queue"] = queue

    response = client.post(
        "/api/strategy/research-review/packet/preview",
        json=payload,
    )

    assert response.status_code == 422
    assert "review_queue_id must match" in response.json()["detail"]


def test_research_review_packet_rejects_non_research_request() -> None:
    payload = _request_payload()
    payload["research_only"] = False

    with pytest.raises(ValidationError):
        ResearchReviewPacketPreviewRequest(**payload)


def test_strategy_sdk_research_review_packet_validates_safe_payload() -> None:
    bundle_index_payload = build_backtest_research_bundle_index_payload(
        bundle_payloads=[_sdk_bundle_payload()],
        index_label="phase3-backtest-research-bundle-index",
    )
    queue_payload = build_research_review_queue_payload(
        bundle_index_payload=bundle_index_payload,
        review_queue_label="phase3-research-review-queue",
    )
    decisions = [
        _sdk_decision_payload_for_queue(queue_payload, "rejected"),
        _sdk_decision_payload_for_queue(queue_payload, "needs_data_review"),
        _sdk_decision_payload_for_queue(queue_payload, "approved_for_paper_research"),
    ]
    packet = build_research_review_packet_payload(
        review_queue_payload=queue_payload,
        decision_payloads=decisions,
        decision_index_payload=_sdk_decision_index_payload(decisions),
        packet_label="phase3-research-review-packet",
    )
    record = ResearchReviewPacket.from_payload(packet)

    assert record.decision_count == 3
    assert record.approval_for_live is False
    assert record.approval_for_paper_execution is False
    assert record.execution_eligible is False
    assert record.ranking_generated is False
    assert record.best_strategy_selected is False


def test_strategy_sdk_research_review_packet_rejects_unsafe_decision() -> None:
    bundle_index_payload = build_backtest_research_bundle_index_payload(
        bundle_payloads=[_sdk_bundle_payload()],
        index_label="phase3-backtest-research-bundle-index",
    )
    queue_payload = build_research_review_queue_payload(
        bundle_index_payload=bundle_index_payload,
        review_queue_label="phase3-research-review-queue",
    )
    decision = _sdk_decision_payload_for_queue(queue_payload, "rejected")
    decision["approval_for_live"] = True

    with pytest.raises(ResearchReviewPacketError):
        safe_decision_index = _sdk_decision_index_payload(
            [_sdk_decision_payload_for_queue(queue_payload, "rejected")]
        )
        build_research_review_packet_payload(
            review_queue_payload=queue_payload,
            decision_payloads=[decision],
            decision_index_payload=safe_decision_index,
            packet_label="phase3-research-review-packet",
        )


def test_strategy_sdk_research_review_packet_example_outputs_safe_packet() -> None:
    env = dict(os.environ)
    env["PYTHONPATH"] = "strategy-engine"
    result = subprocess.run(
        [
            sys.executable,
            "strategy-engine/sdk/examples/build_research_review_packet_example.py",
        ],
        cwd=REPO_ROOT,
        env=env,
        check=True,
        capture_output=True,
        text=True,
    )
    payload = json.loads(result.stdout)

    assert payload["decision_count"] == 3
    assert payload["research_only"] is True
    assert payload["execution_eligible"] is False
    assert payload["performance_claim"] is False
    assert payload["ranking_generated"] is False
    assert payload["best_strategy_selected"] is False
    assert payload["approval_for_live"] is False
    assert payload["approval_for_paper_execution"] is False
    assert payload["persisted"] is False


def test_strategy_sdk_sample_research_review_packet_outputs_loader_safe_packet() -> None:
    env = dict(os.environ)
    env["PYTHONPATH"] = "strategy-engine"
    result = subprocess.run(
        [
            sys.executable,
            "strategy-engine/sdk/examples/export_sample_research_review_packet.py",
        ],
        cwd=REPO_ROOT,
        env=env,
        check=True,
        capture_output=True,
        text=True,
    )
    payload = json.loads(result.stdout)

    assert payload["packet_id"].startswith("research-review-packet-")
    assert payload["decision_count"] == 3
    assert payload["decision_summary"]["rejected_count"] == 1
    assert payload["decision_summary"]["needs_data_review_count"] == 1
    assert payload["decision_summary"]["approved_for_paper_research_count"] == 1
    assert payload["research_only"] is True
    assert payload["execution_eligible"] is False
    assert payload["order_created"] is False
    assert payload["broker_api_called"] is False
    assert payload["risk_engine_called"] is False
    assert payload["oms_called"] is False
    assert payload["performance_claim"] is False
    assert payload["simulated_metrics_only"] is True
    assert payload["external_data_downloaded"] is False
    assert payload["ranking_generated"] is False
    assert payload["best_strategy_selected"] is False
    assert payload["approval_for_live"] is False
    assert payload["approval_for_paper_execution"] is False
    assert payload["persisted"] is False
    assert len(payload["checksums"]["packet_checksum"]) == 64
    assert len(payload["reproducibility_hash"]) == 64


def test_strategy_sdk_sample_research_review_packet_explicit_output(
    tmp_path: Path,
) -> None:
    env = dict(os.environ)
    env["PYTHONPATH"] = "strategy-engine"
    output_path = tmp_path / "research_review_packet.sample.json"
    result = subprocess.run(
        [
            sys.executable,
            "strategy-engine/sdk/examples/export_sample_research_review_packet.py",
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

    assert file_payload == stdout_payload
    assert file_payload["persisted"] is False
    assert file_payload["approval_for_live"] is False
    assert file_payload["approval_for_paper_execution"] is False


def test_strategy_sdk_sample_research_review_packet_rejects_non_json_output(
    tmp_path: Path,
) -> None:
    env = dict(os.environ)
    env["PYTHONPATH"] = "strategy-engine"
    result = subprocess.run(
        [
            sys.executable,
            "strategy-engine/sdk/examples/export_sample_research_review_packet.py",
            "--output",
            str(tmp_path / "packet.txt"),
        ],
        cwd=REPO_ROOT,
        env=env,
        capture_output=True,
        text=True,
    )

    assert result.returncode != 0
    assert "output path must end with .json" in result.stderr


def _sdk_decision_payload_for_queue(
    queue_payload: dict[str, object],
    decision: str,
) -> dict[str, object]:
    return build_research_review_decision_payload(
        review_queue_payload=queue_payload,
        bundle_id=str(queue_payload["review_items"][0]["bundle_id"]),
        decision=decision,
        reviewer_id="local-reviewer",
        decision_reason="Dry-run packet test.",
    )


def _sdk_decision_index_payload(
    decisions: list[dict[str, object]],
) -> dict[str, object]:
    return build_research_review_decision_index_payload(
        decision_payloads=decisions,
        decision_index_label="phase3-research-review-decision-index",
    )
