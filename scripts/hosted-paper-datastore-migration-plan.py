#!/usr/bin/env python3
from __future__ import annotations

import argparse
import hashlib
import json
import sys
from datetime import UTC, datetime
from pathlib import Path
from types import SimpleNamespace
from typing import Any


REPO_ROOT = Path(__file__).resolve().parents[1]
BACKEND_ROOT = REPO_ROOT / "backend"
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

from app.domain.hosted_paper_datastore import (  # noqa: E402
    get_hosted_paper_datastore_readiness,
)


EXPECTED_TABLE_NAMES = {
    "hosted_paper_approval_requests",
    "hosted_paper_approval_decisions",
    "hosted_paper_workflow_runs",
    "hosted_paper_oms_events",
    "hosted_paper_audit_events",
}


class MigrationPlanError(Exception):
    def __init__(self, message: str, exit_code: int = 1) -> None:
        super().__init__(message)
        self.exit_code = exit_code


def main() -> int:
    parser = argparse.ArgumentParser(
        description=(
            "Generate a dry-run hosted paper managed datastore migration plan. "
            "This command never reads DATABASE_URL, connects to a database, "
            "creates hosted records, creates users, calls brokers, or creates orders."
        )
    )
    parser.add_argument(
        "--output",
        help="Optional local .json path. Defaults to stdout and writes nothing.",
    )
    args = parser.parse_args()

    try:
        output_path = resolve_output_path(args.output) if args.output else None
        plan = build_migration_plan(local_artifact_written=output_path is not None)
        validate_plan_safety(plan)
    except MigrationPlanError as exc:
        print(str(exc), file=sys.stderr)
        return exc.exit_code
    except Exception as exc:
        print(f"Refusing to generate unsafe hosted paper migration plan: {exc}", file=sys.stderr)
        return 3

    content = json.dumps(plan, ensure_ascii=False, indent=2, sort_keys=True)
    if output_path:
        output_path.parent.mkdir(parents=True, exist_ok=True)
        output_path.write_text(content + "\n", encoding="utf-8")
        print("Hosted paper datastore migration plan exported.")
        print(f"output={output_path}")
        print(f"plan_id={plan['plan_id']}")
        print("migration_apply_enabled=false")
        print("connection_attempted=false")
        print("database_url_read=false")
        print("hosted_records_written=false")
    else:
        print(content)
    return 0


def resolve_output_path(path_value: str) -> Path:
    if "://" in path_value:
        raise MigrationPlanError("Only local output paths are supported.", 2)
    path = Path(path_value)
    if not path.is_absolute():
        path = REPO_ROOT / path
    if path.suffix.lower() != ".json":
        raise MigrationPlanError("--output must be a local .json file.", 2)
    return path


def build_migration_plan(*, local_artifact_written: bool) -> dict[str, Any]:
    readiness = get_hosted_paper_datastore_readiness(paper_only_settings())
    readiness_payload = readiness.model_dump(mode="json")
    migration_boundary = readiness_payload["migration_boundary"]
    tables = [
        build_table_plan(model, readiness_payload["tenant_key"])
        for model in readiness_payload["record_models"]
    ]
    plan_core: dict[str, Any] = {
        "plan_type": "hosted_paper_managed_datastore_migration_plan",
        "source_contract": "GET /api/hosted-paper/datastore-readiness",
        "readiness_state": readiness_payload["readiness_state"],
        "migration_mode": migration_boundary["migration_mode"],
        "dry_run_only": True,
        "migration_apply_enabled": False,
        "connection_attempted": False,
        "database_url_read": False,
        "database_url_required_before_apply": migration_boundary[
            "database_url_required_before_apply"
        ],
        "automatic_migration_apply": False,
        "hosted_records_written": False,
        "customer_account_created": False,
        "tenant_created": False,
        "reviewer_login_created": False,
        "broker_api_called": False,
        "order_created": False,
        "tenant_key": readiness_payload["tenant_key"],
        "tables": tables,
        "retention_requirements": readiness_payload["retention_requirements"],
        "required_controls_before_apply": migration_boundary[
            "required_controls_before_apply"
        ],
        "safety_defaults": readiness_payload["safety_defaults"],
        "safety_flags": {
            "paper_only": True,
            "live_trading_enabled": False,
            "broker_provider": "paper",
            "broker_api_called": False,
            "order_created": False,
            "hosted_records_written": False,
            "database_url_read": False,
            "connection_attempted": False,
            "customer_account_created": False,
            "tenant_created": False,
            "reviewer_login_created": False,
            "production_migration_apply": False,
            "production_trading_ready": False,
            "local_artifact_written": local_artifact_written,
        },
        "warnings": readiness_payload["warnings"]
        + [
            "Migration plan is dry-run only.",
            "DATABASE_URL is not read by this CLI.",
            "No hosted database connection is configured or attempted.",
            (
                "No hosted records, tenants, customer accounts, reviewer logins, "
                "broker calls, or orders are created."
            ),
        ],
    }
    reproducibility_hash = stable_hash(plan_core)
    return {
        "plan_id": f"hosted-paper-datastore-migration-plan-{reproducibility_hash[:16]}",
        "generated_at": datetime.now(UTC).isoformat(),
        **plan_core,
        "reproducibility_hash": reproducibility_hash,
    }


def paper_only_settings() -> SimpleNamespace:
    return SimpleNamespace(
        trading_mode="paper",
        enable_live_trading=False,
        broker_provider="paper",
        live_trading_enabled=False,
    )


def build_table_plan(model: dict[str, Any], tenant_key: str) -> dict[str, Any]:
    table_name = model["table_name"]
    required_fields = model["required_fields"]
    index_drafts = [
        {
            "name": f"pk_{table_name}",
            "columns": model["primary_identifiers"],
            "unique": True,
            "purpose": "future primary key draft",
        },
        {
            "name": f"idx_{table_name}_{tenant_key}",
            "columns": [tenant_key],
            "unique": False,
            "purpose": "future tenant-scoped filtering",
        },
    ]
    for candidate in ("approval_request_id", "workflow_run_id", "order_id", "event_id"):
        if candidate in required_fields and candidate not in model["primary_identifiers"]:
            index_drafts.append(
                {
                    "name": f"idx_{table_name}_{candidate}",
                    "columns": [tenant_key, candidate],
                    "unique": False,
                    "purpose": f"future lookup by {candidate}",
                }
            )

    return {
        "record_name": model["record_name"],
        "table_name": table_name,
        "tenant_key": tenant_key,
        "tenant_key_required": model["tenant_key_required"],
        "primary_key_draft": model["primary_identifiers"],
        "required_fields": required_fields,
        "index_drafts": index_drafts,
        "retention_class": model["retention_class"],
        "audit_requirements": model["audit_requirements"],
        "notes": model["notes"],
    }


def stable_hash(payload: dict[str, Any]) -> str:
    canonical = json.dumps(payload, ensure_ascii=False, sort_keys=True, separators=(",", ":"))
    return hashlib.sha256(canonical.encode("utf-8")).hexdigest()


def validate_plan_safety(plan: dict[str, Any]) -> None:
    if plan["dry_run_only"] is not True:
        raise MigrationPlanError("Migration plan must remain dry-run only.", 3)
    if plan["migration_apply_enabled"] is not False:
        raise MigrationPlanError("Migration apply must remain disabled.", 3)
    if plan["connection_attempted"] is not False:
        raise MigrationPlanError("Database connection must not be attempted.", 3)
    if plan["database_url_read"] is not False:
        raise MigrationPlanError("DATABASE_URL must not be read.", 3)
    safety_flags = plan["safety_flags"]
    unsafe_true_flags = [
        "live_trading_enabled",
        "broker_api_called",
        "order_created",
        "hosted_records_written",
        "connection_attempted",
        "customer_account_created",
        "tenant_created",
        "reviewer_login_created",
        "production_migration_apply",
        "production_trading_ready",
    ]
    for flag in unsafe_true_flags:
        if safety_flags.get(flag) is not False:
            raise MigrationPlanError(f"Unsafe migration plan flag: {flag}", 3)
    if safety_flags.get("paper_only") is not True:
        raise MigrationPlanError("Migration plan must remain Paper Only.", 3)
    if safety_flags.get("database_url_read") is not False:
        raise MigrationPlanError("DATABASE_URL must not be read.", 3)
    table_names = {table["table_name"] for table in plan["tables"]}
    if table_names != EXPECTED_TABLE_NAMES:
        raise MigrationPlanError("Migration plan table set does not match readiness contract.", 3)
    for table in plan["tables"]:
        if table["tenant_key"] != "tenant_id" or table["tenant_key_required"] is not True:
            raise MigrationPlanError("Every hosted paper table must require tenant_id.", 3)


if __name__ == "__main__":
    raise SystemExit(main())
