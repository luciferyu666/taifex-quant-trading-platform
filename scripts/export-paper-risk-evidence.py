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
from app.domain.paper_risk_state import PaperRiskState  # noqa: E402
from app.domain.risk_rules import (  # noqa: E402
    PaperOrderIntent,
    RiskPolicy,
    evaluate_paper_order,
)

SymbolCode = Literal["TX", "MTX", "TMF"]
OrderSide = Literal["BUY", "SELL"]


class EvidenceExportError(Exception):
    def __init__(self, message: str, exit_code: int = 1) -> None:
        super().__init__(message)
        self.exit_code = exit_code


def main() -> int:
    parser = argparse.ArgumentParser(
        description=(
            "Export a Paper Only Risk Engine guardrail evidence artifact. "
            "This command evaluates one local paper order intent and never writes "
            "databases, creates orders, calls OMS, calls Broker Gateway, or calls brokers."
        )
    )
    parser.add_argument("--symbol", choices=("TX", "MTX", "TMF"), default="TMF")
    parser.add_argument("--side", choices=("BUY", "SELL"), default="BUY")
    parser.add_argument("--quantity", type=int, default=1)
    parser.add_argument("--tx-equivalent-exposure", type=float)
    parser.add_argument("--quote-age-seconds", type=float, default=0)
    parser.add_argument("--order-price", type=float, default=20000)
    parser.add_argument("--reference-price", type=float, default=20000)
    parser.add_argument("--idempotency-key", default="paper-risk-evidence-idempotency-key")
    parser.add_argument(
        "--seen-idempotency-key",
        action="append",
        default=[],
        help="Local paper state idempotency key. Repeat to simulate duplicates.",
    )
    parser.add_argument("--daily-realized-loss-twd", type=int, default=0)
    parser.add_argument("--current-position-tx-equivalent", type=float, default=0)
    parser.add_argument("--kill-switch-active", action="store_true")
    parser.add_argument("--broker-heartbeat-unhealthy", action="store_true")
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
            quantity=args.quantity,
            tx_equivalent_exposure=args.tx_equivalent_exposure,
            quote_age_seconds=args.quote_age_seconds,
            order_price=args.order_price,
            reference_price=args.reference_price,
            idempotency_key=args.idempotency_key,
            seen_idempotency_keys=set(args.seen_idempotency_key),
            daily_realized_loss_twd=args.daily_realized_loss_twd,
            current_position_tx_equivalent=args.current_position_tx_equivalent,
            kill_switch_active=args.kill_switch_active,
            broker_heartbeat_healthy=not args.broker_heartbeat_unhealthy,
            persisted=output_path is not None,
        )
        validate_evidence_safety(evidence)
    except EvidenceExportError as exc:
        print(str(exc), file=sys.stderr)
        return exc.exit_code
    except Exception as exc:
        print(f"Refusing to export unsafe paper risk evidence: {exc}", file=sys.stderr)
        return 3

    content = json.dumps(evidence, ensure_ascii=False, indent=2, sort_keys=True)
    if output_path:
        output_path.parent.mkdir(parents=True, exist_ok=True)
        output_path.write_text(content + "\n", encoding="utf-8")
        print("Paper risk evidence exported.")
        print(f"output={output_path}")
        print(f"evidence_id={evidence['evidence_id']}")
        print(f"approved={evidence['risk_evaluation']['approved']}")
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
    symbol: str,
    side: str,
    quantity: int,
    tx_equivalent_exposure: float | None,
    quote_age_seconds: float,
    order_price: float,
    reference_price: float,
    idempotency_key: str,
    seen_idempotency_keys: set[str],
    daily_realized_loss_twd: int,
    current_position_tx_equivalent: float,
    kill_switch_active: bool,
    broker_heartbeat_healthy: bool,
    persisted: bool,
) -> dict[str, Any]:
    if quantity <= 0:
        raise EvidenceExportError("--quantity must be greater than zero.", 2)
    if quote_age_seconds < 0:
        raise EvidenceExportError("--quote-age-seconds must be greater than or equal to zero.", 2)

    typed_symbol = cast(SymbolCode, symbol)
    typed_side = cast(OrderSide, side)
    intent = PaperOrderIntent(
        order_id="paper-risk-evidence-order",
        idempotency_key=idempotency_key,
        symbol=typed_symbol,
        side=typed_side,
        quantity=quantity,
        tx_equivalent_exposure=(
            tx_equivalent_exposure
            if tx_equivalent_exposure is not None
            else round(quantity * tx_equivalent_ratio(typed_symbol), 6)
        ),
        quote_age_seconds=quote_age_seconds,
        order_price=order_price,
        reference_price=reference_price,
        paper_only=True,
        source_signal_id="paper-risk-evidence-signal",
        strategy_id="paper-risk-evidence-strategy",
        strategy_version="0.1.0",
        approval_id="paper-risk-evidence-approval",
    )
    policy = RiskPolicy()
    state = PaperRiskState(
        seen_idempotency_keys=seen_idempotency_keys,
        daily_realized_loss_twd=daily_realized_loss_twd,
        current_position_tx_equivalent=current_position_tx_equivalent,
        kill_switch_active=kill_switch_active,
        broker_heartbeat_healthy=broker_heartbeat_healthy,
        paper_only=True,
        live_trading_enabled=False,
        broker_api_called=False,
    )
    risk_evaluation = evaluate_paper_order(intent, policy, state)
    evaluation_payload = risk_evaluation.model_dump(mode="json")
    passed_checks = [
        check["name"] for check in evaluation_payload["checks"] if check["passed"]
    ]
    failed_checks = [
        check["name"] for check in evaluation_payload["checks"] if not check["passed"]
    ]
    evidence_core = {
        "intent": intent.model_dump(mode="json"),
        "policy": policy.model_dump(mode="json"),
        "state": state.model_dump(mode="json"),
        "risk_evaluation": evaluation_payload,
        "passed_checks": passed_checks,
        "failed_checks": failed_checks,
    }
    evidence_id = f"paper-risk-evidence-{stable_hash(evidence_core)[:16]}"
    return {
        "evidence_type": "paper_risk_guardrail_evidence",
        "evidence_id": evidence_id,
        "generated_at": datetime.now(UTC).isoformat(),
        **evidence_core,
        "safety_flags": {
            "paper_only": True,
            "live_trading_enabled": False,
            "broker_provider": "paper",
            "broker_api_called": False,
            "order_created": False,
            "risk_engine_called": True,
            "oms_called": False,
            "broker_gateway_called": False,
            "database_written": False,
            "broker_credentials_collected": False,
            "production_risk_approval": False,
            "investment_advice": False,
        },
        "persisted": persisted,
        "warnings": [
            "Paper risk evidence is a local guardrail evaluation artifact only.",
            "No database, broker, OMS, Broker Gateway, live trading, or order path was used.",
            "Kill switch and broker heartbeat are paper-only placeholders.",
            "This evidence is not production risk approval, investment advice, or live trading approval.",
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
    required_true = ["paper_only", "risk_engine_called"]
    required_false = [
        "live_trading_enabled",
        "broker_api_called",
        "order_created",
        "oms_called",
        "broker_gateway_called",
        "database_written",
        "broker_credentials_collected",
        "production_risk_approval",
        "investment_advice",
    ]
    for key in required_true:
        if flags[key] is not True:
            raise EvidenceExportError(f"Unsafe evidence flag: {key} must be true.", 3)
    for key in required_false:
        if flags[key] is not False:
            raise EvidenceExportError(f"Unsafe evidence flag: {key} must be false.", 3)
    if flags["broker_provider"] != "paper":
        raise EvidenceExportError("Unsafe evidence flag: broker_provider must be paper.", 3)
    if evidence["intent"]["paper_only"] is not True:
        raise EvidenceExportError("Intent must remain paper_only=true.", 3)
    if evidence["policy"]["live_trading_enabled"] is not False:
        raise EvidenceExportError("Policy must keep live_trading_enabled=false.", 3)
    if evidence["policy"]["broker_provider"] != "paper":
        raise EvidenceExportError("Policy must keep broker_provider=paper.", 3)


if __name__ == "__main__":
    raise SystemExit(main())
