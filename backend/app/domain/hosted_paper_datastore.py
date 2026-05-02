from __future__ import annotations

from pydantic import BaseModel, Field

from app.core.config import Settings
from app.domain.hosted_paper_readiness import (
    HostedPaperSafetyDefaults,
    HostedPaperSafetyFlags,
)


class HostedPaperDatastoreCapability(BaseModel):
    managed_datastore_enabled: bool = False
    hosted_records_writable: bool = False
    hosted_records_readable: bool = False
    tenant_key_enforced: bool = False
    migrations_apply_enabled: bool = False
    retention_policy_enforced: bool = False
    audit_append_only_enforced: bool = False
    local_sqlite_replacement_required: bool = True


class HostedPaperRecordModel(BaseModel):
    record_name: str
    table_name: str
    tenant_key: str = "tenant_id"
    tenant_key_required: bool = True
    primary_identifiers: list[str]
    required_fields: list[str]
    audit_requirements: list[str]
    retention_class: str
    notes: str


class HostedPaperMigrationBoundary(BaseModel):
    migration_mode: str = "schema_contract_only"
    dry_run_only: bool = True
    apply_enabled: bool = False
    database_url_required_before_apply: bool = True
    automatic_migration_apply: bool = False
    connection_attempted: bool = False
    required_controls_before_apply: list[str]


class HostedPaperRetentionRequirement(BaseModel):
    record_group: str
    minimum_policy: str
    delete_behavior: str
    export_required: bool
    audit_required: bool


class HostedPaperDatastoreReadinessResponse(BaseModel):
    service: str = "hosted-paper-managed-datastore-readiness"
    readiness_state: str = "schema_only_no_hosted_datastore"
    summary: str
    tenant_key: str = "tenant_id"
    capabilities: HostedPaperDatastoreCapability = Field(
        default_factory=HostedPaperDatastoreCapability
    )
    record_models: list[HostedPaperRecordModel]
    migration_boundary: HostedPaperMigrationBoundary
    retention_requirements: list[HostedPaperRetentionRequirement]
    safety_defaults: HostedPaperSafetyDefaults
    safety_flags: HostedPaperSafetyFlags
    docs: dict[str, str]
    warnings: list[str]


def get_hosted_paper_datastore_readiness(
    settings: Settings,
) -> HostedPaperDatastoreReadinessResponse:
    paper_only = (
        settings.trading_mode == "paper"
        and settings.broker_provider == "paper"
        and not settings.live_trading_enabled
    )
    return HostedPaperDatastoreReadinessResponse(
        summary=(
            "Hosted paper managed datastore is not enabled. This response defines "
            "future tenant-scoped paper record models, migration boundary, "
            "retention requirements, and audit requirements as read-only metadata."
        ),
        record_models=[
            HostedPaperRecordModel(
                record_name="Paper approval request",
                table_name="hosted_paper_approval_requests",
                primary_identifiers=["tenant_id", "approval_request_id"],
                required_fields=[
                    "tenant_id",
                    "approval_request_id",
                    "signal_id",
                    "strategy_id",
                    "strategy_version",
                    "requester_id",
                    "status",
                    "created_at",
                    "request_hash",
                ],
                audit_requirements=[
                    "append-only request creation event",
                    "hash-chain reference",
                    "reviewer-visible payload snapshot",
                ],
                retention_class="paper_approval_governance",
                notes="Future hosted approval requests must be tenant-scoped.",
            ),
            HostedPaperRecordModel(
                record_name="Paper approval decision",
                table_name="hosted_paper_approval_decisions",
                primary_identifiers=["tenant_id", "approval_decision_id"],
                required_fields=[
                    "tenant_id",
                    "approval_request_id",
                    "approval_decision_id",
                    "reviewer_user_id",
                    "reviewer_role",
                    "decision",
                    "decision_reason",
                    "decided_at",
                    "decision_hash",
                ],
                audit_requirements=[
                    "distinct reviewer identity",
                    "immutable decision event",
                    "previous decision hash",
                ],
                retention_class="paper_review_history",
                notes="Future reviewer decisions require authenticated identity.",
            ),
            HostedPaperRecordModel(
                record_name="Paper workflow run",
                table_name="hosted_paper_workflow_runs",
                primary_identifiers=["tenant_id", "workflow_run_id"],
                required_fields=[
                    "tenant_id",
                    "workflow_run_id",
                    "approval_request_id",
                    "order_id",
                    "idempotency_key",
                    "strategy_id",
                    "final_oms_status",
                    "created_at",
                ],
                audit_requirements=[
                    "risk evaluation reference",
                    "OMS event sequence reference",
                    "paper broker simulation reference",
                ],
                retention_class="paper_execution_workflow",
                notes="Future hosted paper workflow runs remain Paper Only.",
            ),
            HostedPaperRecordModel(
                record_name="Paper OMS event",
                table_name="hosted_paper_oms_events",
                primary_identifiers=["tenant_id", "workflow_run_id", "event_id"],
                required_fields=[
                    "tenant_id",
                    "workflow_run_id",
                    "order_id",
                    "event_id",
                    "sequence",
                    "event_type",
                    "status_after",
                    "timestamp",
                ],
                audit_requirements=[
                    "deterministic sequence",
                    "idempotency key reference",
                    "event payload hash",
                ],
                retention_class="paper_oms_timeline",
                notes="Future hosted OMS events require tenant-scoped ordering.",
            ),
            HostedPaperRecordModel(
                record_name="Paper audit event",
                table_name="hosted_paper_audit_events",
                primary_identifiers=["tenant_id", "audit_event_id"],
                required_fields=[
                    "tenant_id",
                    "audit_event_id",
                    "workflow_run_id",
                    "actor_user_id",
                    "action",
                    "resource",
                    "timestamp",
                    "previous_hash",
                    "event_hash",
                ],
                audit_requirements=[
                    "append-only write path",
                    "hash-chain continuity",
                    "retention and export metadata",
                ],
                retention_class="paper_audit_trail",
                notes="Future hosted audit events must support integrity verification.",
            ),
        ],
        migration_boundary=HostedPaperMigrationBoundary(
            required_controls_before_apply=[
                "approved managed datastore selection",
                "tenant_id required on every hosted paper table",
                "migration dry-run output reviewed",
                "backup and restore plan documented",
                "retention policy approved",
                "security review completed",
            ]
        ),
        retention_requirements=[
            HostedPaperRetentionRequirement(
                record_group="approval_records",
                minimum_policy="retain through customer evaluation window plus review hold",
                delete_behavior="soft-delete metadata only until retention review",
                export_required=True,
                audit_required=True,
            ),
            HostedPaperRetentionRequirement(
                record_group="paper_workflow_records",
                minimum_policy="retain through paper evaluation and audit review period",
                delete_behavior="tenant-scoped archival before deletion",
                export_required=True,
                audit_required=True,
            ),
            HostedPaperRetentionRequirement(
                record_group="audit_events",
                minimum_policy="append-only retention policy required before hosted use",
                delete_behavior="no direct user deletion path",
                export_required=True,
                audit_required=True,
            ),
        ],
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
            "hosted_paper_datastore": "docs/hosted-paper-managed-datastore-readiness.md",
            "hosted_paper_saas_foundation": "docs/hosted-paper-saas-foundation-roadmap.md",
            "hosted_paper_environment": "GET /api/hosted-paper/environment",
            "auth_boundary": "docs/hosted-paper-auth-boundary-spec.md",
            "local_demo": "docs/customer-self-service-demo.md",
        },
        warnings=[
            "This endpoint is a schema-only datastore readiness contract.",
            "No hosted database connection is configured or attempted.",
            "No hosted records are read or written.",
            "Local SQLite remains for local demo mode only.",
            "Production Trading Platform remains NOT READY.",
            "Live trading remains disabled by default.",
        ],
    )
