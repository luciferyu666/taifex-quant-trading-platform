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

from app.domain.hosted_paper_production_datastore import (  # noqa: E402
    get_hosted_paper_production_datastore_readiness,
)


EXPECTED_TABLE_NAMES = {
    "hosted_paper_approval_requests",
    "hosted_paper_approval_decisions",
    "hosted_paper_workflow_runs",
    "hosted_paper_orders",
    "hosted_paper_risk_evaluations",
    "hosted_paper_oms_events",
    "hosted_paper_execution_reports",
    "hosted_paper_outbox_events",
    "hosted_paper_audit_events",
    "hosted_paper_audit_integrity_snapshots",
    "hosted_paper_evidence_exports",
}

TABLE_ID_COLUMNS = {
    "hosted_paper_approval_requests": "approval_request_id",
    "hosted_paper_approval_decisions": "approval_decision_id",
    "hosted_paper_workflow_runs": "workflow_run_id",
    "hosted_paper_orders": "order_id",
    "hosted_paper_risk_evaluations": "risk_evaluation_id",
    "hosted_paper_oms_events": "event_id",
    "hosted_paper_execution_reports": "execution_report_id",
    "hosted_paper_outbox_events": "outbox_event_id",
    "hosted_paper_audit_events": "audit_event_id",
    "hosted_paper_audit_integrity_snapshots": "integrity_snapshot_id",
    "hosted_paper_evidence_exports": "evidence_export_id",
}


class MigrationBlueprintError(Exception):
    def __init__(self, message: str, exit_code: int = 1) -> None:
        super().__init__(message)
        self.exit_code = exit_code


def main() -> int:
    parser = argparse.ArgumentParser(
        description=(
            "Generate the Hosted Paper production datastore migration blueprint v2. "
            "This command is dry-run only: it never reads DATABASE_URL, connects "
            "to a database, writes hosted records, creates tenants, creates users, "
            "calls brokers, or creates orders."
        )
    )
    parser.add_argument(
        "--output",
        help="Optional local .json output path. Defaults to stdout and writes nothing.",
    )
    args = parser.parse_args()

    try:
        output_path = resolve_output_path(args.output) if args.output else None
        blueprint = build_blueprint(local_artifact_written=output_path is not None)
        validate_blueprint_safety(blueprint)
    except MigrationBlueprintError as exc:
        print(str(exc), file=sys.stderr)
        return exc.exit_code
    except Exception as exc:
        print(f"Refusing to generate unsafe production datastore blueprint: {exc}", file=sys.stderr)
        return 3

    content = json.dumps(blueprint, ensure_ascii=False, indent=2, sort_keys=True)
    if output_path:
        output_path.parent.mkdir(parents=True, exist_ok=True)
        output_path.write_text(content + "\n", encoding="utf-8")
        print("Hosted Paper production datastore migration blueprint v2 exported.")
        print(f"output={output_path}")
        print(f"blueprint_id={blueprint['blueprint_id']}")
        print("migration_apply_enabled=false")
        print("connection_attempted=false")
        print("database_url_read=false")
        print("hosted_records_written=false")
    else:
        print(content)
    return 0


def resolve_output_path(path_value: str) -> Path:
    if "://" in path_value:
        raise MigrationBlueprintError("Only local output paths are supported.", 2)
    path = Path(path_value)
    if not path.is_absolute():
        path = REPO_ROOT / path
    if path.suffix.lower() != ".json":
        raise MigrationBlueprintError("--output must be a local .json file.", 2)
    return path


def build_blueprint(*, local_artifact_written: bool) -> dict[str, Any]:
    readiness = get_hosted_paper_production_datastore_readiness(paper_only_settings())
    readiness_payload = readiness.model_dump(mode="json")
    migration_boundary = readiness_payload["migration_boundary"]
    tables = [
        build_table_blueprint(record_group, table_name)
        for record_group in readiness_payload["record_groups"]
        for table_name in record_group["table_names"]
    ]
    blueprint_core: dict[str, Any] = {
        "blueprint_type": "hosted_paper_production_datastore_migration_plan_v2",
        "blueprint_version": "v2",
        "source_contract": "GET /api/hosted-paper/production-datastore/readiness",
        "readiness_state": readiness_payload["readiness_state"],
        "recommended_datastore_pattern": readiness_payload[
            "recommended_datastore_pattern"
        ],
        "tenant_key": readiness_payload["tenant_key"],
        "dry_run_only": True,
        "migration_apply_enabled": False,
        "automatic_apply_enabled": False,
        "database_url_read": False,
        "connection_attempted": False,
        "database_written": False,
        "external_db_written": False,
        "hosted_records_written": False,
        "customer_account_created": False,
        "tenant_created": False,
        "reviewer_login_created": False,
        "broker_api_called": False,
        "order_created": False,
        "migration_boundary": migration_boundary,
        "migration_phases": build_migration_phases(migration_boundary),
        "tables": tables,
        "backup_requirements": build_backup_requirements(),
        "restore_requirements": build_restore_requirements(),
        "retention_boundaries": readiness_payload["retention_boundaries"],
        "required_controls_before_apply": migration_boundary[
            "required_controls_before_apply"
        ],
        "safety_defaults": readiness_payload["safety_defaults"],
        "safety_flags": {
            "paper_only": True,
            "live_trading_enabled": False,
            "broker_provider": "paper",
            "production_datastore_enabled": False,
            "managed_postgres_selected": False,
            "marketplace_provisioning_enabled": False,
            "hosted_records_writable": False,
            "hosted_records_readable": False,
            "migrations_apply_enabled": False,
            "database_url_read": False,
            "connection_attempted": False,
            "database_written": False,
            "external_db_written": False,
            "hosted_records_written": False,
            "customer_account_created": False,
            "tenant_created": False,
            "reviewer_login_created": False,
            "broker_api_called": False,
            "order_created": False,
            "production_trading_ready": False,
            "local_artifact_written": local_artifact_written,
        },
        "warnings": readiness_payload["warnings"]
        + [
            "Migration blueprint v2 is dry-run only.",
            "DATABASE_URL is not read by this CLI.",
            "No production database connection is configured or attempted.",
            "No hosted records, tenants, accounts, reviewer logins, broker calls, or orders are created.",
            "Backup, retention, and restore are requirements only and are not configured by this CLI.",
        ],
    }
    reproducibility_hash = stable_hash(blueprint_core)
    return {
        "blueprint_id": (
            f"hosted-paper-production-datastore-migration-plan-v2-"
            f"{reproducibility_hash[:16]}"
        ),
        "generated_at": datetime.now(UTC).isoformat(),
        **blueprint_core,
        "reproducibility_hash": reproducibility_hash,
    }


def paper_only_settings() -> SimpleNamespace:
    return SimpleNamespace(
        trading_mode="paper",
        enable_live_trading=False,
        broker_provider="paper",
        live_trading_enabled=False,
    )


def build_table_blueprint(
    record_group: dict[str, Any],
    table_name: str,
) -> dict[str, Any]:
    table_id = TABLE_ID_COLUMNS[table_name]
    columns = build_column_drafts(record_group, table_name, table_id)
    return {
        "record_group": record_group["record_group"],
        "table_name": table_name,
        "tenant_key": record_group["tenant_key"],
        "tenant_key_required": True,
        "primary_key_draft": [record_group["tenant_key"], table_id],
        "column_drafts": columns,
        "index_drafts": build_index_drafts(record_group, table_name, table_id),
        "constraint_drafts": build_constraint_drafts(record_group, table_id),
        "backup_required": record_group["backup_required"],
        "retention_required": record_group["retention_required"],
        "restore_required": record_group["restore_required"],
        "local_sqlite_allowed": record_group["local_sqlite_allowed"],
        "required_controls": record_group["required_controls"],
    }


def build_column_drafts(
    record_group: dict[str, Any],
    table_name: str,
    table_id: str,
) -> list[dict[str, Any]]:
    base_columns = [
        column("tenant_id", "text", nullable=False, purpose="tenant boundary"),
        column(table_id, "text", nullable=False, purpose="table identifier"),
        column("created_at", "timestamptz", nullable=False, purpose="creation time"),
        column("updated_at", "timestamptz", nullable=True, purpose="update time"),
        column("status", "text", nullable=True, purpose="record lifecycle state"),
        column("payload_json", "jsonb", nullable=True, purpose="safe payload snapshot"),
    ]
    if table_name in {
        "hosted_paper_audit_events",
        "hosted_paper_audit_integrity_snapshots",
    }:
        base_columns.extend(
            [
                column("previous_hash", "text", nullable=True, purpose="hash-chain link"),
                column("event_hash", "text", nullable=True, purpose="event hash"),
            ]
        )
    for identifier in record_group["required_identifiers"]:
        if identifier not in {draft["name"] for draft in base_columns}:
            base_columns.append(
                column(identifier, "text", nullable=True, purpose="record lookup")
            )
    return base_columns


def column(name: str, data_type: str, *, nullable: bool, purpose: str) -> dict[str, Any]:
    return {
        "name": name,
        "data_type": data_type,
        "nullable": nullable,
        "purpose": purpose,
    }


def build_index_drafts(
    record_group: dict[str, Any],
    table_name: str,
    table_id: str,
) -> list[dict[str, Any]]:
    tenant_key = record_group["tenant_key"]
    indexes = [
        {
            "name": f"pk_{table_name}",
            "columns": [tenant_key, table_id],
            "unique": True,
            "purpose": "future composite primary key draft",
        },
        {
            "name": f"idx_{table_name}_{tenant_key}_created_at",
            "columns": [tenant_key, "created_at"],
            "unique": False,
            "purpose": "future tenant-scoped timeline query",
        },
    ]
    for candidate in ("approval_request_id", "workflow_run_id", "order_id", "event_id"):
        if candidate in record_group["required_identifiers"] and candidate != table_id:
            indexes.append(
                {
                    "name": f"idx_{table_name}_{candidate}",
                    "columns": [tenant_key, candidate],
                    "unique": False,
                    "purpose": f"future lookup by {candidate}",
                }
            )
    return indexes


def build_constraint_drafts(
    record_group: dict[str, Any],
    table_id: str,
) -> list[dict[str, Any]]:
    return [
        {
            "name": f"ck_{record_group['record_group']}_{table_id}_not_empty",
            "expression": f"{table_id} <> ''",
            "purpose": "future identifier integrity check",
        },
        {
            "name": f"ck_{record_group['record_group']}_tenant_id_not_empty",
            "expression": "tenant_id <> ''",
            "purpose": "future tenant boundary integrity check",
        },
    ]


def build_migration_phases(
    migration_boundary: dict[str, Any],
) -> list[dict[str, Any]]:
    controls = migration_boundary["required_controls_before_apply"]
    return [
        {
            "phase": "preflight_review",
            "apply_enabled": False,
            "required_controls": controls,
        },
        {
            "phase": "schema_draft",
            "apply_enabled": False,
            "scope": "table, column, index, and constraint drafts only",
        },
        {
            "phase": "backup_restore_retention_review",
            "apply_enabled": False,
            "scope": "backup, point-in-time recovery, restore drill, and retention policy review",
        },
        {
            "phase": "staging_rehearsal_future",
            "apply_enabled": False,
            "scope": "future staging-only rehearsal after datastore provider selection",
        },
    ]


def build_backup_requirements() -> list[dict[str, Any]]:
    return [
        {
            "requirement": "scheduled backups",
            "configured": False,
            "required_before_customer_pilot": True,
        },
        {
            "requirement": "point-in-time recovery",
            "configured": False,
            "required_before_customer_pilot": True,
        },
        {
            "requirement": "tenant-scoped restore procedure",
            "configured": False,
            "required_before_customer_pilot": True,
        },
    ]


def build_restore_requirements() -> list[dict[str, Any]]:
    return [
        {
            "requirement": "restore drill evidence",
            "verified": False,
            "required_before_customer_pilot": True,
        },
        {
            "requirement": "failed migration rollback procedure",
            "verified": False,
            "required_before_customer_pilot": True,
        },
    ]


def stable_hash(payload: dict[str, Any]) -> str:
    canonical = json.dumps(
        payload,
        ensure_ascii=False,
        sort_keys=True,
        separators=(",", ":"),
    )
    return hashlib.sha256(canonical.encode("utf-8")).hexdigest()


def validate_blueprint_safety(blueprint: dict[str, Any]) -> None:
    required_false_top_level_flags = [
        "migration_apply_enabled",
        "automatic_apply_enabled",
        "database_url_read",
        "connection_attempted",
        "database_written",
        "external_db_written",
        "hosted_records_written",
        "customer_account_created",
        "tenant_created",
        "reviewer_login_created",
        "broker_api_called",
        "order_created",
    ]
    if blueprint["dry_run_only"] is not True:
        raise MigrationBlueprintError("Migration blueprint must remain dry-run only.", 3)
    for flag in required_false_top_level_flags:
        if blueprint[flag] is not False:
            raise MigrationBlueprintError(f"Unsafe blueprint flag: {flag}", 3)
    safety_flags = blueprint["safety_flags"]
    required_false_safety_flags = [
        "database_url_read",
        "connection_attempted",
        "database_written",
        "external_db_written",
        "hosted_records_written",
        "customer_account_created",
        "tenant_created",
        "reviewer_login_created",
        "broker_api_called",
        "order_created",
        "live_trading_enabled",
        "production_datastore_enabled",
        "managed_postgres_selected",
        "marketplace_provisioning_enabled",
        "hosted_records_writable",
        "hosted_records_readable",
        "migrations_apply_enabled",
        "production_trading_ready",
    ]
    for flag in required_false_safety_flags:
        if safety_flags.get(flag) is not False:
            raise MigrationBlueprintError(f"Unsafe safety flag: {flag}", 3)
    if safety_flags.get("paper_only") is not True:
        raise MigrationBlueprintError("Migration blueprint must remain Paper Only.", 3)
    table_names = {table["table_name"] for table in blueprint["tables"]}
    if table_names != EXPECTED_TABLE_NAMES:
        raise MigrationBlueprintError("Migration blueprint table set is incomplete.", 3)
    for table in blueprint["tables"]:
        if table["tenant_key"] != "tenant_id" or table["tenant_key_required"] is not True:
            raise MigrationBlueprintError("Every production table must require tenant_id.", 3)
        if table["local_sqlite_allowed"] is not False:
            raise MigrationBlueprintError("Local SQLite must not be allowed for production.", 3)


if __name__ == "__main__":
    raise SystemExit(main())
