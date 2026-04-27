import sys
from pathlib import Path

import pytest

from app.domain.feature_manifest import FeatureManifestPreviewRequest, build_feature_manifest

REPO_ROOT = Path(__file__).resolve().parents[2]
STRATEGY_ENGINE_ROOT = REPO_ROOT / "strategy-engine"
sys.path.insert(0, str(STRATEGY_ENGINE_ROOT))

from sdk.dataset_manifest import DatasetManifest, DatasetManifestError  # noqa: E402
from sdk.examples.manifest_signal_strategy import (  # noqa: E402
    ManifestSignalStrategy,
    preview_from_manifest_payload,
)
from sdk.research_context import ResearchContext  # noqa: E402


def _manifest_payload() -> dict[str, object]:
    manifest = build_feature_manifest(
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
    return manifest.model_dump(mode="json")


def test_strategy_sdk_reads_feature_manifest_as_research_context() -> None:
    manifest = DatasetManifest.from_payload(_manifest_payload())
    context = ResearchContext.from_manifest(manifest)

    assert context.research_only is True
    assert context.execution_eligible is False
    assert context.feature_set_name == "phase2_fixture_research_features"
    assert len(context.reproducibility_hash) == 64


def test_manifest_signal_strategy_emits_signal_only() -> None:
    strategy = ManifestSignalStrategy()

    signal = strategy.generate_signal({"feature_manifest": _manifest_payload()})

    assert signal.direction == "FLAT"
    assert signal.target_tx_equivalent == 0
    assert signal.reason["signals_only"] is True
    assert signal.reason["order_created"] is False
    assert signal.reason["broker_api_called"] is False


def test_strategy_sdk_rejects_execution_eligible_manifest() -> None:
    payload = _manifest_payload()
    payload["execution_eligible"] = True

    with pytest.raises(DatasetManifestError, match="execution_eligible=false"):
        DatasetManifest.from_payload(payload)


def test_manifest_strategy_preview_payload_contains_no_order_flags() -> None:
    preview = preview_from_manifest_payload(_manifest_payload())

    assert preview["research_only"] is True
    assert preview["execution_eligible"] is False
    assert preview["order_created"] is False
    assert preview["broker_api_called"] is False
    assert preview["signal"]["direction"] == "FLAT"
