#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import os
import sys
from pathlib import Path
from typing import Any

REPO_ROOT = Path(__file__).resolve().parents[1]
BACKEND_ROOT = REPO_ROOT / "backend"
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

from app.core.config import get_settings  # noqa: E402
from app.services.audit_integrity_service import PaperAuditIntegrityService  # noqa: E402


class AuditIntegrityCliError(RuntimeError):
    pass


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description=(
            "Verify local Paper Only audit hash-chain metadata. This reads local "
            "SQLite only and does not write databases, call brokers, or enable live trading."
        )
    )
    parser.add_argument(
        "--workflow-run-id",
        help="Optional workflow_run_id scope. Defaults to all local paper audit events.",
    )
    parser.add_argument(
        "--output",
        help="Optional local .json output path. Defaults to stdout only.",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    try:
        output_path = resolve_output_path(args.output)
        ensure_paper_safe_env()
        settings = get_settings()
        ensure_paper_safe_settings(settings)
        service = PaperAuditIntegrityService(settings.paper_execution_audit_db_path)
        verification = service.verify(workflow_run_id=args.workflow_run_id)
        payload = verification.model_dump(mode="json")
        payload["evidence_type"] = "paper_audit_integrity_verification"
        payload["safety_flags"] = {
            "paper_only": True,
            "local_sqlite_only": True,
            "live_trading_enabled": False,
            "broker_api_called": False,
            "database_written": False,
            "external_db_written": False,
            "worm_ledger": False,
            "immutable_audit_log": False,
            "centralized_audit_service": False,
            "production_audit_compliance": False,
            "broker_credentials_collected": False,
        }
        validate_payload(payload)
        if output_path is None:
            print(json.dumps(payload, indent=2, sort_keys=True))
        else:
            output_path.parent.mkdir(parents=True, exist_ok=True)
            output_path.write_text(
                json.dumps(payload, indent=2, sort_keys=True) + "\n",
                encoding="utf-8",
            )
            print(f"Paper audit integrity evidence written: {output_path}")
            print(f"verified={payload['verified']}")
            print(f"audit_events_count={payload['audit_events_count']}")
            print(f"broken_chain_count={payload['broken_chain_count']}")
            print("Paper Only local verification. No database write or broker call was used.")
    except AuditIntegrityCliError as exc:
        print(f"error: {exc}", file=sys.stderr)
        return 2
    return 0


def resolve_output_path(raw_output: str | None) -> Path | None:
    if not raw_output:
        return None
    if raw_output.startswith(("http://", "https://")):
        raise AuditIntegrityCliError("--output must be a local filesystem path")
    path = Path(raw_output)
    if path.suffix.lower() != ".json":
        raise AuditIntegrityCliError("--output must end with .json")
    return path


def ensure_paper_safe_settings(settings: Any) -> None:
    if settings.trading_mode != "paper":
        raise AuditIntegrityCliError("TRADING_MODE must remain paper")
    if settings.live_trading_enabled:
        raise AuditIntegrityCliError("ENABLE_LIVE_TRADING must remain false")
    if settings.broker_provider != "paper":
        raise AuditIntegrityCliError("BROKER_PROVIDER must remain paper")


def ensure_paper_safe_env() -> None:
    trading_mode = os.environ.get("TRADING_MODE")
    live_trading_enabled = os.environ.get("ENABLE_LIVE_TRADING")
    broker_provider = os.environ.get("BROKER_PROVIDER")
    if trading_mode is not None and trading_mode != "paper":
        raise AuditIntegrityCliError("TRADING_MODE must remain paper")
    if live_trading_enabled is not None and live_trading_enabled.lower() != "false":
        raise AuditIntegrityCliError("ENABLE_LIVE_TRADING must remain false")
    if broker_provider is not None and broker_provider != "paper":
        raise AuditIntegrityCliError("BROKER_PROVIDER must remain paper")


def validate_payload(payload: dict[str, Any]) -> None:
    flags = payload["safety_flags"]
    required_true = ["paper_only", "local_sqlite_only"]
    required_false = [
        "live_trading_enabled",
        "broker_api_called",
        "database_written",
        "external_db_written",
        "worm_ledger",
        "immutable_audit_log",
        "centralized_audit_service",
        "production_audit_compliance",
        "broker_credentials_collected",
    ]
    for key in required_true:
        if flags.get(key) is not True:
            raise AuditIntegrityCliError(f"unsafe safety flag: {key} must be true")
    for key in required_false:
        if flags.get(key) is not False:
            raise AuditIntegrityCliError(f"unsafe safety flag: {key} must be false")


if __name__ == "__main__":
    raise SystemExit(main())
