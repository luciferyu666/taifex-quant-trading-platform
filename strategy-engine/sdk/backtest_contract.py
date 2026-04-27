from __future__ import annotations

import hashlib
import json
from dataclasses import dataclass
from typing import Any

from .dataset_manifest import DatasetManifest


class BacktestContractError(ValueError):
    pass


@dataclass(frozen=True)
class BacktestPreviewContract:
    backtest_preview_id: str
    manifest_id: str
    strategy_id: str
    strategy_version: str
    parameter_set_id: str
    data_version: str
    signal_summary: dict[str, Any]
    reproducibility_hash: str
    research_only: bool
    execution_eligible: bool
    order_created: bool
    broker_api_called: bool
    risk_engine_called: bool
    oms_called: bool
    performance_claim: bool
    external_data_downloaded: bool
    warnings: tuple[str, ...] = ()

    @classmethod
    def from_payload(cls, payload: dict[str, Any]) -> "BacktestPreviewContract":
        if not isinstance(payload, dict):
            raise BacktestContractError("backtest preview payload must be an object")

        record = cls(
            backtest_preview_id=str(payload.get("backtest_preview_id") or ""),
            manifest_id=str(payload.get("manifest_id") or ""),
            strategy_id=str(payload.get("strategy_id") or ""),
            strategy_version=str(payload.get("strategy_version") or ""),
            parameter_set_id=str(payload.get("parameter_set_id") or ""),
            data_version=str(payload.get("data_version") or ""),
            signal_summary=dict(payload.get("signal_summary") or {}),
            reproducibility_hash=str(payload.get("reproducibility_hash") or ""),
            research_only=bool(payload.get("research_only")),
            execution_eligible=bool(payload.get("execution_eligible")),
            order_created=bool(payload.get("order_created")),
            broker_api_called=bool(payload.get("broker_api_called")),
            risk_engine_called=bool(payload.get("risk_engine_called")),
            oms_called=bool(payload.get("oms_called")),
            performance_claim=bool(payload.get("performance_claim")),
            external_data_downloaded=bool(payload.get("external_data_downloaded")),
            warnings=tuple(str(item) for item in payload.get("warnings", [])),
        )
        record.validate_safe_preview()
        return record

    def validate_safe_preview(self) -> None:
        if not self.backtest_preview_id:
            raise BacktestContractError("backtest_preview_id is required")
        if not self.manifest_id:
            raise BacktestContractError("manifest_id is required")
        if not self.strategy_id:
            raise BacktestContractError("strategy_id is required")
        if not self.parameter_set_id:
            raise BacktestContractError("parameter_set_id is required")
        if len(self.reproducibility_hash) != 64:
            raise BacktestContractError("reproducibility_hash must be a SHA-256 digest")
        if self.research_only is not True:
            raise BacktestContractError("backtest preview must be research_only=true")
        if self.execution_eligible is not False:
            raise BacktestContractError("backtest preview must be execution_eligible=false")
        if self.order_created:
            raise BacktestContractError("backtest preview must not create orders")
        if self.broker_api_called:
            raise BacktestContractError("backtest preview must not call broker APIs")
        if self.risk_engine_called:
            raise BacktestContractError("backtest preview must not call Risk Engine")
        if self.oms_called:
            raise BacktestContractError("backtest preview must not call OMS")
        if self.performance_claim:
            raise BacktestContractError("backtest preview must not make performance claims")
        if self.external_data_downloaded:
            raise BacktestContractError("backtest preview must not download external data")

    def to_summary(self) -> dict[str, str | bool]:
        return {
            "backtest_preview_id": self.backtest_preview_id,
            "manifest_id": self.manifest_id,
            "strategy_id": self.strategy_id,
            "strategy_version": self.strategy_version,
            "parameter_set_id": self.parameter_set_id,
            "data_version": self.data_version,
            "research_only": self.research_only,
            "execution_eligible": self.execution_eligible,
        }


def build_backtest_preview_payload(
    manifest_payload: dict[str, Any],
    signal_payload: dict[str, Any],
    strategy_id: str,
    strategy_version: str,
    parameter_set_id: str,
) -> dict[str, Any]:
    manifest = DatasetManifest.from_payload(manifest_payload)
    reason = signal_payload.get("reason") or {}
    if not isinstance(reason, dict):
        raise BacktestContractError("signal.reason must be an object")
    if signal_payload.get("strategy_id") != strategy_id:
        raise BacktestContractError("signal.strategy_id must match strategy_id")
    if signal_payload.get("strategy_version") != strategy_version:
        raise BacktestContractError("signal.strategy_version must match strategy_version")
    if reason.get("signals_only") is not True:
        raise BacktestContractError("signal.reason.signals_only must be true")
    if reason.get("order_created") is True:
        raise BacktestContractError("signal must not create orders")
    if reason.get("broker_api_called") is True:
        raise BacktestContractError("signal must not call broker APIs")

    signal_summary = {
        "signal_id": str(signal_payload.get("signal_id") or ""),
        "strategy_id": strategy_id,
        "strategy_version": strategy_version,
        "symbol_group": str(signal_payload.get("symbol_group") or "TAIEX_FUTURES"),
        "direction": str(signal_payload.get("direction") or ""),
        "target_tx_equivalent": float(signal_payload.get("target_tx_equivalent") or 0),
        "confidence": float(signal_payload.get("confidence") or 0),
        "signals_only": True,
    }
    safety_flags = {
        "research_only": True,
        "execution_eligible": False,
        "order_created": False,
        "broker_api_called": False,
        "risk_engine_called": False,
        "oms_called": False,
        "performance_claim": False,
        "external_data_downloaded": False,
    }
    reproducibility_hash = sha256_json(
        {
            "manifest_id": manifest.manifest_id,
            "manifest_reproducibility_hash": manifest.reproducibility_hash,
            "data_version": manifest.data_version,
            "strategy_id": strategy_id,
            "strategy_version": strategy_version,
            "parameter_set_id": parameter_set_id,
            "signal": signal_payload,
            "safety_flags": safety_flags,
        }
    )
    payload = {
        "backtest_preview_id": (
            f"backtest-preview-{slugify(strategy_id)}-"
            f"{slugify(parameter_set_id)}-{reproducibility_hash[:12]}"
        ),
        "manifest_id": manifest.manifest_id,
        "strategy_id": strategy_id,
        "strategy_version": strategy_version,
        "parameter_set_id": parameter_set_id,
        "data_version": manifest.data_version,
        "signal_summary": signal_summary,
        "reproducibility_hash": reproducibility_hash,
        "warnings": [
            *manifest.warnings,
            (
                "SDK backtest preview contract is dry-run only and does not calculate "
                "performance or create orders."
            ),
        ],
        **safety_flags,
    }
    BacktestPreviewContract.from_payload(payload)
    return payload


def sha256_json(payload: dict[str, Any]) -> str:
    encoded = json.dumps(payload, sort_keys=True, separators=(",", ":")).encode("utf-8")
    return hashlib.sha256(encoded).hexdigest()


def slugify(value: str) -> str:
    cleaned = "".join(char.lower() if char.isalnum() else "-" for char in value)
    return "-".join(part for part in cleaned.split("-") if part) or "backtest"
