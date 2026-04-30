#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import sys
from datetime import UTC, datetime
from pathlib import Path
from typing import Any, Literal, cast


REPO_ROOT = Path(__file__).resolve().parents[1]
BACKEND_ROOT = REPO_ROOT / "backend"
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

from app.core.config import get_settings  # noqa: E402
from app.domain.paper_broker_simulation import (  # noqa: E402
    PaperBrokerSimulationModelInput,
    PaperMarketSnapshot,
    simulate_paper_broker_outcome,
)
from app.domain.risk_rules import PaperOrderIntent  # noqa: E402

SymbolCode = Literal["TX", "MTX", "TMF"]
OrderSide = Literal["BUY", "SELL"]
OrderType = Literal["MARKET", "LIMIT"]


class EvidenceExportError(Exception):
    def __init__(self, message: str, exit_code: int = 1) -> None:
        super().__init__(message)
        self.exit_code = exit_code


def main() -> int:
    parser = argparse.ArgumentParser(
        description=(
            "Export a Paper Only broker simulation preview evidence artifact. "
            "This command uses caller-provided local quote inputs only and never "
            "downloads market data, writes databases, or calls brokers."
        )
    )
    parser.add_argument("--symbol", choices=("TX", "MTX", "TMF"), default="TMF")
    parser.add_argument("--side", choices=("BUY", "SELL"), default="BUY")
    parser.add_argument("--order-type", choices=("MARKET", "LIMIT"), default="MARKET")
    parser.add_argument("--quantity", type=int, default=2)
    parser.add_argument("--bid-price", type=float, default=19999)
    parser.add_argument("--ask-price", type=float, default=20000)
    parser.add_argument("--last-price", type=float, default=19999.5)
    parser.add_argument("--bid-size", type=int, default=5)
    parser.add_argument("--ask-size", type=int, default=5)
    parser.add_argument("--quote-age-seconds", type=float, default=0)
    parser.add_argument("--liquidity-score", type=float, default=1)
    parser.add_argument("--limit-price", type=float)
    parser.add_argument("--max-spread-points", type=float, default=5)
    parser.add_argument("--stale-quote-seconds", type=int, default=3)
    parser.add_argument(
        "--output",
        help="Optional local .json path. Defaults to stdout and writes nothing.",
    )
    args = parser.parse_args()

    try:
        settings = get_settings()
    except Exception as exc:
        print(
            f"Refusing to export evidence because settings are invalid: {exc}",
            file=sys.stderr,
        )
        return 2

    if (
        settings.trading_mode != "paper"
        or settings.enable_live_trading
        or settings.broker_provider != "paper"
    ):
        print(
            "Refusing to export evidence because runtime settings are not paper-only.",
            file=sys.stderr,
        )
        return 2

    try:
        output_path = resolve_output_path(args.output) if args.output else None
        evidence = build_evidence(
            symbol=args.symbol,
            side=args.side,
            order_type=args.order_type,
            quantity=args.quantity,
            bid_price=args.bid_price,
            ask_price=args.ask_price,
            last_price=args.last_price,
            bid_size=args.bid_size,
            ask_size=args.ask_size,
            quote_age_seconds=args.quote_age_seconds,
            liquidity_score=args.liquidity_score,
            limit_price=args.limit_price,
            max_spread_points=args.max_spread_points,
            stale_quote_seconds=args.stale_quote_seconds,
            persisted=output_path is not None,
        )
        validate_evidence_safety(evidence)
    except EvidenceExportError as exc:
        print(str(exc), file=sys.stderr)
        return exc.exit_code
    except Exception as exc:
        print(f"Refusing to export unsafe simulation evidence: {exc}", file=sys.stderr)
        return 3

    content = json.dumps(evidence, ensure_ascii=False, indent=2, sort_keys=True)
    if output_path:
        output_path.parent.mkdir(parents=True, exist_ok=True)
        output_path.write_text(content + "\n", encoding="utf-8")
        print("Paper broker simulation evidence exported.")
        print(f"output={output_path}")
        print(f"evidence_id={evidence['evidence_id']}")
        print(f"simulation_outcome={evidence['result']['simulation_outcome']}")
        print("paper_only=True")
        print("live_trading_enabled=False")
        print("broker_api_called=False")
    else:
        print(content)
    return 0


def resolve_output_path(path_value: str) -> Path:
    if "://" in path_value:
        raise EvidenceExportError("Only local output paths are supported.", 2)
    path = Path(path_value)
    if not path.is_absolute():
        path = REPO_ROOT / path
    if path.suffix.lower() != ".json":
        raise EvidenceExportError("--output must be a local .json file.", 2)
    return path


def build_evidence(
    *,
    symbol: SymbolCode,
    side: str,
    order_type: str,
    quantity: int,
    bid_price: float,
    ask_price: float,
    last_price: float,
    bid_size: int,
    ask_size: int,
    quote_age_seconds: float,
    liquidity_score: float,
    limit_price: float | None,
    max_spread_points: float,
    stale_quote_seconds: int,
    persisted: bool,
) -> dict[str, Any]:
    if quantity <= 0:
        raise EvidenceExportError("--quantity must be greater than zero.", 2)
    if order_type == "LIMIT" and limit_price is None:
        raise EvidenceExportError("--limit-price is required when --order-type=LIMIT.", 2)

    typed_side = cast(OrderSide, side)
    typed_order_type = cast(OrderType, order_type)
    intent = PaperOrderIntent(
        order_id="paper-broker-simulation-evidence-order",
        idempotency_key="paper-broker-simulation-evidence-idempotency-key",
        symbol=symbol,
        side=typed_side,
        quantity=quantity,
        tx_equivalent_exposure=round(quantity * tx_equivalent_ratio(symbol), 6),
        quote_age_seconds=quote_age_seconds,
        paper_only=True,
        source_signal_id="paper-broker-simulation-evidence-signal",
        strategy_id="paper-broker-simulation-evidence-strategy",
        strategy_version="0.1.0",
        approval_id="paper-broker-simulation-evidence-approval",
    )
    simulation = PaperBrokerSimulationModelInput(
        market_snapshot=PaperMarketSnapshot(
            symbol=symbol,
            bid_price=bid_price,
            ask_price=ask_price,
            last_price=last_price,
            bid_size=bid_size,
            ask_size=ask_size,
            quote_age_seconds=quote_age_seconds,
            liquidity_score=liquidity_score,
            paper_only=True,
        ),
        order_type=typed_order_type,
        limit_price=limit_price,
        max_spread_points=max_spread_points,
        stale_quote_seconds=stale_quote_seconds,
        paper_only=True,
    )
    result = simulate_paper_broker_outcome(intent, simulation)
    result_payload = result.model_dump(mode="json")
    input_payload = {
        "symbol": symbol,
        "side": side,
        "order_type": order_type,
        "quantity": quantity,
        "bid_price": bid_price,
        "ask_price": ask_price,
        "last_price": last_price,
        "bid_size": bid_size,
        "ask_size": ask_size,
        "quote_age_seconds": quote_age_seconds,
        "liquidity_score": liquidity_score,
        "limit_price": limit_price,
        "max_spread_points": max_spread_points,
        "stale_quote_seconds": stale_quote_seconds,
        "tx_equivalent_exposure": intent.tx_equivalent_exposure,
        "paper_only": True,
    }
    evidence_core = {
        "input": input_payload,
        "result": {
            "simulation_outcome": result.simulation_outcome,
            "simulated_fill_quantity": result.simulated_fill_quantity,
            "simulated_fill_price": result.simulated_fill_price,
            "remaining_quantity": result.remaining_quantity,
            "reason": result.reason,
            "reference_price": result.reference_price,
            "requested_quantity": result.requested_quantity,
            "spread_points": result.spread_points,
            "available_size": result.available_size,
            "checks": result_payload["checks"],
            "warnings": result.warnings,
        },
    }
    evidence_id = f"paper-broker-simulation-evidence-{stable_hash(evidence_core)[:16]}"
    return {
        "evidence_type": "paper_broker_simulation_preview_evidence",
        "evidence_id": evidence_id,
        "generated_at": datetime.now(UTC).isoformat(),
        **evidence_core,
        "safety_flags": {
            "paper_only": result.paper_only,
            "live_trading_enabled": result.live_trading_enabled,
            "broker_api_called": result.broker_api_called,
            "external_market_data_downloaded": result.external_market_data_downloaded,
            "production_execution_model": result.production_execution_model,
            "database_written": False,
            "order_created": False,
            "risk_engine_called": False,
            "oms_called": False,
            "broker_credentials_collected": False,
            "investment_advice": False,
        },
        "persisted": persisted,
        "warnings": [
            "Paper broker simulation preview evidence uses local caller-provided quote inputs only.",
            "No external market data was downloaded.",
            "No database, broker, Risk Engine, OMS, or production execution path was used.",
            "This evidence is not a broker execution report, production matching result, investment advice, or live trading approval.",
        ],
    }


def stable_hash(payload: dict[str, Any]) -> str:
    from hashlib import sha256

    encoded = json.dumps(payload, ensure_ascii=False, sort_keys=True).encode("utf-8")
    return sha256(encoded).hexdigest()


def tx_equivalent_ratio(symbol: str) -> float:
    ratios = {"TX": 1.0, "MTX": 0.25, "TMF": 0.05}
    return ratios[symbol]


def validate_evidence_safety(evidence: dict[str, Any]) -> None:
    flags = evidence["safety_flags"]
    required_true = ["paper_only"]
    required_false = [
        "live_trading_enabled",
        "broker_api_called",
        "external_market_data_downloaded",
        "production_execution_model",
        "database_written",
        "order_created",
        "risk_engine_called",
        "oms_called",
        "broker_credentials_collected",
        "investment_advice",
    ]
    for key in required_true:
        if flags[key] is not True:
            raise EvidenceExportError(f"Unsafe evidence flag: {key} must be true.", 3)
    for key in required_false:
        if flags[key] is not False:
            raise EvidenceExportError(f"Unsafe evidence flag: {key} must be false.", 3)
    if evidence["input"]["paper_only"] is not True:
        raise EvidenceExportError("Input must remain paper_only=true.", 3)


if __name__ == "__main__":
    raise SystemExit(main())
