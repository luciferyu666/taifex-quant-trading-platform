from __future__ import annotations

from pydantic import BaseModel, Field

from app.core.config import Settings
from app.domain.hosted_paper_readiness import (
    HostedPaperSafetyDefaults,
    HostedPaperSafetyFlags,
)


class HostedPaperProductionDatastoreCapability(BaseModel):
    production_datastore_enabled: bool = False
    managed_postgres_selected: bool = False
    marketplace_provisioning_enabled: bool = False
    hosted_records_writable: bool = False
    hosted_records_readable: bool = False
    migrations_apply_enabled: bool = False
    backup_policy_configured: bool = False
    point_in_time_recovery_required: bool = True
    restore_drill_verified: bool = False
    retention_policy_enforced: bool = False
    local_sqlite_allowed_for_production: bool = False


class HostedPaperProductionRecordGroup(BaseModel):
    record_group: str
    table_names: list[str]
    tenant_key: str = "tenant_id"
    required_identifiers: list[str]
    required_controls: list[str]
    backup_required: bool = True
    retention_required: bool = True
    restore_required: bool = True
    local_sqlite_allowed: bool = False


class HostedPaperProductionMigrationBoundary(BaseModel):
    migration_mode: str = "contract_only_no_database_connection"
    dry_run_only: bool = True
    database_url_read: bool = False
    connection_attempted: bool = False
    apply_enabled: bool = False
    automatic_apply_enabled: bool = False
    backup_before_apply_required: bool = True
    restore_drill_before_customer_pilot_required: bool = True
    required_controls_before_apply: list[str]


class HostedPaperProductionRetentionBoundary(BaseModel):
    record_group: str
    minimum_requirement: str
    delete_behavior: str
    export_required: bool = True
    audit_required: bool = True
    legal_hold_required_before_delete: bool = True


class HostedPaperProductionDatastoreReadinessResponse(BaseModel):
    service: str = "hosted-paper-production-datastore-readiness"
    readiness_state: str = "contract_only_no_production_datastore"
    summary: str
    recommended_datastore_pattern: str = "managed_postgres_via_marketplace_candidate"
    tenant_key: str = "tenant_id"
    capabilities: HostedPaperProductionDatastoreCapability = Field(
        default_factory=HostedPaperProductionDatastoreCapability
    )
    record_groups: list[HostedPaperProductionRecordGroup]
    migration_boundary: HostedPaperProductionMigrationBoundary
    retention_boundaries: list[HostedPaperProductionRetentionBoundary]
    local_sqlite_boundary: str
    safety_defaults: HostedPaperSafetyDefaults
    safety_flags: HostedPaperSafetyFlags
    docs: dict[str, str]
    warnings: list[str]


def get_hosted_paper_production_datastore_readiness(
    settings: Settings,
) -> HostedPaperProductionDatastoreReadinessResponse:
    paper_only = (
        settings.trading_mode == "paper"
        and settings.broker_provider == "paper"
        and not settings.live_trading_enabled
    )
    return HostedPaperProductionDatastoreReadinessResponse(
        summary=(
            "Production datastore is not enabled. This contract defines the "
            "future managed database, migration, backup, retention, restore, "
            "and tenant boundary required before hosted paper records can move "
            "beyond local SQLite demo mode."
        ),
        record_groups=[
            HostedPaperProductionRecordGroup(
                record_group="paper_approval",
                table_names=[
                    "hosted_paper_approval_requests",
                    "hosted_paper_approval_decisions",
                ],
                required_identifiers=[
                    "tenant_id",
                    "approval_request_id",
                    "approval_decision_id",
                    "reviewer_user_id",
                ],
                required_controls=[
                    "authenticated reviewer identity",
                    "tenant-scoped RBAC and ABAC",
                    "dual-review sequence where required",
                    "append-only decision audit trail",
                ],
            ),
            HostedPaperProductionRecordGroup(
                record_group="paper_order",
                table_names=[
                    "hosted_paper_workflow_runs",
                    "hosted_paper_orders",
                    "hosted_paper_risk_evaluations",
                ],
                required_identifiers=[
                    "tenant_id",
                    "workflow_run_id",
                    "order_id",
                    "idempotency_key",
                ],
                required_controls=[
                    "completed approval_request_id",
                    "risk evaluation reference",
                    "duplicate order prevention across sessions",
                    "paper-only execution eligibility",
                ],
            ),
            HostedPaperProductionRecordGroup(
                record_group="oms_event",
                table_names=[
                    "hosted_paper_oms_events",
                    "hosted_paper_execution_reports",
                    "hosted_paper_outbox_events",
                ],
                required_identifiers=[
                    "tenant_id",
                    "workflow_run_id",
                    "order_id",
                    "event_id",
                    "sequence",
                ],
                required_controls=[
                    "durable queue/outbox design",
                    "deterministic event ordering",
                    "timeout and retry metadata",
                    "reconciliation reference",
                ],
            ),
            HostedPaperProductionRecordGroup(
                record_group="audit_event",
                table_names=[
                    "hosted_paper_audit_events",
                    "hosted_paper_audit_integrity_snapshots",
                    "hosted_paper_evidence_exports",
                ],
                required_identifiers=[
                    "tenant_id",
                    "audit_event_id",
                    "actor_user_id",
                    "previous_hash",
                    "event_hash",
                ],
                required_controls=[
                    "append-only audit write path",
                    "hash-chain verification",
                    "retention and legal hold metadata",
                    "exportable evidence references",
                ],
            ),
        ],
        migration_boundary=HostedPaperProductionMigrationBoundary(
            required_controls_before_apply=[
                "managed Postgres provider selected and security-reviewed",
                "dev/staging/production database separation documented",
                "tenant_id required on every hosted paper table",
                "migration dry-run reviewed",
                "backup policy documented",
                "restore drill documented",
                "retention policy approved",
                "audit integrity requirements reviewed",
            ]
        ),
        retention_boundaries=[
            HostedPaperProductionRetentionBoundary(
                record_group="paper_approval",
                minimum_requirement=(
                    "retain through customer evaluation, dispute review, and audit hold"
                ),
                delete_behavior="soft delete request metadata only after retention review",
            ),
            HostedPaperProductionRetentionBoundary(
                record_group="paper_order",
                minimum_requirement=(
                    "retain through paper workflow review and customer evidence export"
                ),
                delete_behavior="archive before deletion; no direct user hard delete",
            ),
            HostedPaperProductionRetentionBoundary(
                record_group="oms_event",
                minimum_requirement=(
                    "retain full event timeline through workflow lifecycle and audit review"
                ),
                delete_behavior="append corrective events instead of mutating history",
            ),
            HostedPaperProductionRetentionBoundary(
                record_group="audit_event",
                minimum_requirement="append-only retention with integrity verification",
                delete_behavior="no user deletion path before legal and compliance review",
            ),
        ],
        local_sqlite_boundary=(
            "Local SQLite remains allowed only for demo and developer workflows. "
            "It is not allowed as the production hosted paper datastore."
        ),
        safety_defaults=HostedPaperSafetyDefaults(
            trading_mode=settings.trading_mode,
            enable_live_trading=settings.enable_live_trading,
            broker_provider=settings.broker_provider,
        ),
        safety_flags=HostedPaperSafetyFlags(
            paper_only=paper_only,
            live_trading_enabled=settings.live_trading_enabled,
            broker_api_called=False,
            order_created=False,
            database_written=False,
            external_db_written=False,
            broker_credentials_collected=False,
            production_trading_ready=False,
        ),
        docs={
            "production_datastore": (
                "docs/hosted-paper-production-datastore-readiness.md"
            ),
            "managed_datastore": "docs/hosted-paper-managed-datastore-readiness.md",
            "migration_plan": "docs/hosted-paper-managed-datastore-migration-plan.md",
            "saas_roadmap": "docs/hosted-paper-saas-foundation-roadmap.md",
            "local_data_boundary": "docs/production-local-data-boundary.md",
        },
        warnings=[
            "This endpoint is read-only production datastore readiness metadata.",
            "No production database is selected, provisioned, connected, or written.",
            "No DATABASE_URL is read by this contract.",
            "Local SQLite remains for demo and development only.",
            "Backup, retention, and restore controls are required before hosted use.",
            "Production Trading Platform remains NOT READY.",
            "Live trading remains disabled by default.",
        ],
    )
