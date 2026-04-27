import sys
from pathlib import Path

import pytest
from fastapi.testclient import TestClient
from pydantic import ValidationError

from app.domain.backtest_preview import (
    BacktestPreviewRequest,
    preview_backtest_contract,
)
from app.domain.feature_manifest import FeatureManifestPreviewRequest, build_feature_manifest
from app.domain.strategy_research import (
    StrategyResearchPreviewRequest,
    preview_research_signal,
)
from app.main import app

REPO_ROOT = Path(__file__).resolve().parents[2]
STRATEGY_ENGINE_ROOT = REPO_ROOT / "strategy-engine"
sys.path.insert(0, str(STRATEGY_ENGINE_ROOT))

from sdk.backtest_contract import (  # noqa: E402
    BacktestContractError,
    BacktestPreviewContract,
    build_backtest_preview_payload,
)
from sdk.examples.manifest_signal_strategy import preview_from_manifest_payload  # noqa: E402


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


def _signal() -> object:
    manifest = _manifest()
    return preview_research_signal(
        StrategyResearchPreviewRequest(
            feature_manifest=manifest,
            strategy_id="manifest-signal-strategy",
            strategy_version="0.1.0",
            research_only=True,
        )
    ).signal


def _request_payload() -> dict[str, object]:
    return {
        "feature_manifest": _manifest().model_dump(mode="json"),
        "signal": _signal().model_dump(mode="json"),
        "strategy_id": "manifest-signal-strategy",
        "strategy_version": "0.1.0",
        "parameter_set_id": "phase3-preview-default",
        "research_only": True,
    }


def test_backtest_preview_contract_is_dry_run_and_reproducible() -> None:
    request = BacktestPreviewRequest(**_request_payload())

    first = preview_backtest_contract(request)
    second = preview_backtest_contract(request)

    assert first.backtest_preview_id == second.backtest_preview_id
    assert first.reproducibility_hash == second.reproducibility_hash
    assert first.research_only is True
    assert first.execution_eligible is False
    assert first.order_created is False
    assert first.broker_api_called is False
    assert first.risk_engine_called is False
    assert first.oms_called is False
    assert first.performance_claim is False
    assert first.signal_summary.signals_only is True
    assert len(first.reproducibility_hash) == 64


def test_backtest_preview_api_returns_safety_flags() -> None:
    client = TestClient(app)

    response = client.post("/api/strategy/backtest/preview", json=_request_payload())

    assert response.status_code == 200
    payload = response.json()
    assert payload["research_only"] is True
    assert payload["execution_eligible"] is False
    assert payload["order_created"] is False
    assert payload["broker_api_called"] is False
    assert payload["risk_engine_called"] is False
    assert payload["oms_called"] is False
    assert payload["performance_claim"] is False
    assert payload["signal_summary"]["signals_only"] is True


def test_backtest_preview_rejects_execution_eligible_manifest() -> None:
    client = TestClient(app)
    payload = _request_payload()
    feature_manifest = dict(payload["feature_manifest"])
    feature_manifest["execution_eligible"] = True
    payload["feature_manifest"] = feature_manifest

    response = client.post("/api/strategy/backtest/preview", json=payload)

    assert response.status_code == 422
    assert "execution_eligible=false" in response.json()["detail"]


def test_backtest_preview_rejects_non_signal_only_signal() -> None:
    client = TestClient(app)
    payload = _request_payload()
    signal = dict(payload["signal"])
    reason = dict(signal["reason"])
    reason["signals_only"] = False
    signal["reason"] = reason
    payload["signal"] = signal

    response = client.post("/api/strategy/backtest/preview", json=payload)

    assert response.status_code == 422
    assert "signals_only" in response.json()["detail"]


def test_backtest_preview_rejects_non_research_request() -> None:
    payload = _request_payload()
    payload["research_only"] = False

    with pytest.raises(ValidationError):
        BacktestPreviewRequest(**payload)


def test_strategy_sdk_backtest_contract_validates_safe_payload() -> None:
    manifest_payload = _manifest().model_dump(mode="json")
    signal_preview = preview_from_manifest_payload(manifest_payload)

    payload = build_backtest_preview_payload(
        manifest_payload=manifest_payload,
        signal_payload=signal_preview["signal"],
        strategy_id="manifest-signal-strategy",
        strategy_version="0.1.0",
        parameter_set_id="phase3-preview-default",
    )
    contract = BacktestPreviewContract.from_payload(payload)

    assert contract.execution_eligible is False
    assert contract.performance_claim is False
    assert contract.order_created is False


def test_strategy_sdk_backtest_contract_rejects_performance_claim() -> None:
    manifest_payload = _manifest().model_dump(mode="json")
    signal_preview = preview_from_manifest_payload(manifest_payload)
    payload = build_backtest_preview_payload(
        manifest_payload=manifest_payload,
        signal_payload=signal_preview["signal"],
        strategy_id="manifest-signal-strategy",
        strategy_version="0.1.0",
        parameter_set_id="phase3-preview-default",
    )
    payload["performance_claim"] = True

    with pytest.raises(BacktestContractError, match="performance claims"):
        BacktestPreviewContract.from_payload(payload)
