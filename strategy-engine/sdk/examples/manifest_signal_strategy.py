from __future__ import annotations

import json
from dataclasses import asdict
from pathlib import Path
from typing import Any

from sdk.base_strategy import BaseStrategy
from sdk.dataset_manifest import DatasetManifest
from sdk.research_context import ResearchContext
from sdk.signal import StrategySignal


class ManifestSignalStrategy(BaseStrategy):
    strategy_id = "manifest-signal-strategy"
    strategy_version = "0.1.0"

    def generate_signal(self, market_snapshot: dict[str, Any]) -> StrategySignal:
        manifest_payload = market_snapshot.get("feature_manifest")
        if not isinstance(manifest_payload, dict):
            raise ValueError("market_snapshot.feature_manifest must be an object")

        manifest = DatasetManifest.from_payload(manifest_payload)
        context = ResearchContext.from_manifest(manifest)
        return StrategySignal(
            strategy_id=self.strategy_id,
            strategy_version=self.strategy_version,
            direction="FLAT",
            target_tx_equivalent=0,
            confidence=0.05,
            reason={
                "source": "feature_dataset_manifest",
                "manifest_id": context.manifest_id,
                "data_version": context.data_version,
                "reproducibility_hash": context.reproducibility_hash,
                "signals_only": True,
                "order_created": False,
                "broker_api_called": False,
            },
        )


def preview_from_manifest_payload(
    payload: dict[str, Any],
    strategy_id: str = ManifestSignalStrategy.strategy_id,
    strategy_version: str = ManifestSignalStrategy.strategy_version,
) -> dict[str, Any]:
    strategy = ManifestSignalStrategy()
    strategy.strategy_id = strategy_id
    strategy.strategy_version = strategy_version
    manifest = DatasetManifest.from_payload(payload)
    context = ResearchContext.from_manifest(manifest)
    signal = strategy.generate_signal({"feature_manifest": payload})
    return {
        "signal": signal_to_payload(signal),
        "research_context": context.to_summary(),
        "warnings": list(manifest.warnings),
        "research_only": True,
        "execution_eligible": False,
        "order_created": False,
        "broker_api_called": False,
    }


def signal_to_payload(signal: StrategySignal) -> dict[str, Any]:
    payload = asdict(signal)
    payload["timestamp"] = signal.timestamp.isoformat()
    return payload


def _example_manifest_payload() -> dict[str, Any]:
    return {
        "manifest_id": "example-fixture-v1-0" * 2,
        "data_version": "fixture-v1",
        "source_files": [
            {
                "path": "data-pipeline/fixtures/market_bars_valid.csv",
                "checksum_sha256": "0" * 64,
                "role": "market_bars_fixture",
            }
        ],
        "feature_set": {
            "feature_set_name": "phase2_fixture_research_features",
            "feature_timeframe": "1m",
            "contract_schema_version": "phase2-contract-master-v1",
        },
        "reproducibility_hash": "1" * 64,
        "warnings": ["Example manifest payload only."],
        "research_only": True,
        "execution_eligible": False,
        "external_data_downloaded": False,
        "broker_api_called": False,
    }


def main() -> int:
    import argparse

    parser = argparse.ArgumentParser(description="Preview a signal-only manifest strategy.")
    parser.add_argument("--manifest-json", type=Path)
    args = parser.parse_args()

    if args.manifest_json:
        payload = json.loads(args.manifest_json.read_text(encoding="utf-8"))
    else:
        payload = _example_manifest_payload()

    preview = preview_from_manifest_payload(payload)
    print(json.dumps(preview, indent=2, sort_keys=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
