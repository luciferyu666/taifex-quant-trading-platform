#!/usr/bin/env python3
from __future__ import annotations

import argparse
import hashlib
import json
import sys
from datetime import UTC, datetime
from pathlib import Path
from typing import Any


REPO_ROOT = Path(__file__).resolve().parents[1]
BACKEND_ROOT = REPO_ROOT / "backend"
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

from app.core.config import get_settings  # noqa: E402
from app.domain.hosted_paper_session import get_hosted_paper_mock_session  # noqa: E402


class EvidenceExportError(Exception):
    def __init__(self, message: str, exit_code: int = 1) -> None:
        super().__init__(message)
        self.exit_code = exit_code


def main() -> int:
    parser = argparse.ArgumentParser(
        description=(
            "Export Hosted Paper tenant boundary evidence from the read-only mock "
            "session contract. This command never authenticates users, writes "
            "databases, collects credentials, calls brokers, or enables live trading."
        )
    )
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
        evidence = build_evidence(persisted=output_path is not None)
        validate_evidence_safety(evidence)
    except EvidenceExportError as exc:
        print(str(exc), file=sys.stderr)
        return exc.exit_code
    except Exception as exc:
        print(
            f"Refusing to export unsafe hosted paper tenant boundary evidence: {exc}",
            file=sys.stderr,
        )
        return 3

    content = json.dumps(evidence, ensure_ascii=False, indent=2, sort_keys=True)
    if output_path:
        output_path.parent.mkdir(parents=True, exist_ok=True)
        output_path.write_text(content + "\n", encoding="utf-8")
        print("Hosted paper tenant boundary evidence exported.")
        print(f"output={output_path}")
        print(f"evidence_id={evidence['evidence_id']}")
        print("contract_state=mock_read_only")
        print("authenticated=False")
        print("hosted_datastore_written=False")
        print("broker_api_called=False")
        print("live_trading_enabled=False")
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


def build_evidence(*, persisted: bool) -> dict[str, Any]:
    session = get_hosted_paper_mock_session(get_settings())
    session_payload = session.model_dump(mode="json")
    permission_schema = session_payload["permission_schema"]
    granted_permissions = [
        permission
        for permission in permission_schema
        if permission["granted_in_mock_session"]
    ]
    denied_permissions = [
        permission
        for permission in permission_schema
        if not permission["granted_in_mock_session"]
    ]
    denied_mutation_permissions = [
        permission
        for permission in denied_permissions
        if permission["mutation"]
    ]
    evidence_core = {
        "service": session_payload["service"],
        "contract_state": session_payload["contract_state"],
        "summary": session_payload["summary"],
        "session": session_payload["session"],
        "tenant": session_payload["tenant"],
        "role_schema": session_payload["role_schema"],
        "permission_schema": permission_schema,
        "granted_permissions": granted_permissions,
        "denied_permissions": denied_permissions,
        "denied_mutation_permissions": denied_mutation_permissions,
        "safety_defaults": session_payload["safety_defaults"],
        "mock_session_safety_flags": session_payload["safety_flags"],
        "boundary_assertions": {
            "hosted_paper_mode_enabled": False,
            "mock_read_only": session.contract_state == "mock_read_only",
            "authenticated": session.session.authenticated,
            "authentication_provider": session.session.authentication_provider,
            "session_cookie_issued": session.safety_flags.session_cookie_issued,
            "tenant_isolation_required": session.tenant.tenant_isolation_required,
            "hosted_datastore_enabled": session.tenant.hosted_datastore_enabled,
            "hosted_datastore_written": session.safety_flags.hosted_datastore_written,
            "local_sqlite_access": session.tenant.local_sqlite_access,
            "broker_provider": session.tenant.broker_provider,
            "broker_api_called": session.safety_flags.broker_api_called,
            "credentials_collected": session.safety_flags.credentials_collected,
            "broker_credentials_collected": session.safety_flags.broker_credentials_collected,
            "live_trading_enabled": session.safety_flags.live_trading_enabled,
            "production_trading_ready": session.safety_flags.production_trading_ready,
            "mutation_permissions_granted": any(
                permission["mutation"] for permission in granted_permissions
            ),
        },
        "docs": session_payload["docs"],
    }
    return {
        "evidence_type": "hosted_paper_tenant_boundary_evidence",
        "evidence_id": f"hosted-paper-tenant-boundary-evidence-{stable_hash(evidence_core)[:16]}",
        "generated_at": datetime.now(UTC).isoformat(),
        **evidence_core,
        "safety_flags": {
            "paper_only": True,
            "read_only": True,
            "hosted_paper_enabled": False,
            "live_trading_enabled": False,
            "broker_provider": "paper",
            "broker_api_called": False,
            "order_created": False,
            "risk_engine_called": False,
            "oms_called": False,
            "broker_gateway_called": False,
            "authenticated": False,
            "hosted_auth_provider_enabled": False,
            "session_cookie_issued": False,
            "credentials_collected": False,
            "broker_credentials_collected": False,
            "database_written": False,
            "hosted_datastore_enabled": False,
            "hosted_datastore_written": False,
            "external_db_written": False,
            "local_sqlite_access": False,
            "production_trading_ready": False,
            "investment_advice": False,
        },
        "persisted": persisted,
        "warnings": [
            "Hosted paper tenant boundary evidence is generated from a mock read-only contract only.",
            "No user is authenticated, no session cookie is issued, and no hosted datastore is written.",
            "No credentials are collected and no broker API is called.",
            "Denied mutation permissions do not authorize paper workflow submission, broker credential upload, or live trading.",
            "Production Trading Platform remains NOT READY.",
        ],
    }


def validate_evidence_safety(evidence: dict[str, Any]) -> None:
    if evidence["evidence_type"] != "hosted_paper_tenant_boundary_evidence":
        raise EvidenceExportError("Unexpected evidence type.", 3)
    if evidence["contract_state"] != "mock_read_only":
        raise EvidenceExportError("Hosted paper contract must remain mock_read_only.", 3)

    session = evidence["session"]
    if session["authenticated"] is not False:
        raise EvidenceExportError("Mock session must not authenticate users.", 3)
    if session["authentication_provider"] != "none":
        raise EvidenceExportError("Mock session must not enable an auth provider.", 3)

    tenant = evidence["tenant"]
    if tenant["hosted_datastore_enabled"] is not False:
        raise EvidenceExportError("Hosted datastore must remain disabled.", 3)
    if tenant["local_sqlite_access"] is not False:
        raise EvidenceExportError("Hosted tenant must not access local SQLite.", 3)
    if tenant["live_trading_enabled"] is not False:
        raise EvidenceExportError("Live trading must remain disabled.", 3)
    if tenant["broker_provider"] != "paper":
        raise EvidenceExportError("Broker provider must remain paper.", 3)

    safety_flags = evidence["safety_flags"]
    required_false_flags = [
        "hosted_paper_enabled",
        "live_trading_enabled",
        "broker_api_called",
        "order_created",
        "risk_engine_called",
        "oms_called",
        "broker_gateway_called",
        "authenticated",
        "hosted_auth_provider_enabled",
        "session_cookie_issued",
        "credentials_collected",
        "broker_credentials_collected",
        "database_written",
        "hosted_datastore_enabled",
        "hosted_datastore_written",
        "external_db_written",
        "local_sqlite_access",
        "production_trading_ready",
        "investment_advice",
    ]
    for flag in required_false_flags:
        if safety_flags[flag] is not False:
            raise EvidenceExportError(f"Unsafe evidence flag: {flag} must be false.", 3)

    if safety_flags["paper_only"] is not True or safety_flags["read_only"] is not True:
        raise EvidenceExportError("Evidence must remain paper-only and read-only.", 3)
    if safety_flags["broker_provider"] != "paper":
        raise EvidenceExportError("Evidence broker provider must remain paper.", 3)

    if evidence["boundary_assertions"]["mutation_permissions_granted"] is not False:
        raise EvidenceExportError("Mock session must not grant mutation permissions.", 3)

    denied_permission_names = {
        permission["permission"] for permission in evidence["denied_mutation_permissions"]
    }
    for permission in (
        "create_paper_approval_request",
        "record_paper_reviewer_decision",
        "submit_approved_paper_workflow",
        "enable_live_trading",
        "upload_broker_credentials",
    ):
        if permission not in denied_permission_names:
            raise EvidenceExportError(f"Missing denied mutation permission: {permission}.", 3)


def stable_hash(payload: dict[str, Any]) -> str:
    content = json.dumps(payload, ensure_ascii=False, sort_keys=True, separators=(",", ":"))
    return hashlib.sha256(content.encode("utf-8")).hexdigest()


if __name__ == "__main__":
    raise SystemExit(main())
