from __future__ import annotations

from pydantic import BaseModel, Field

from app.core.config import Settings
from app.domain.hosted_paper_readiness import HostedPaperSafetyDefaults


class PaperOmsProductionReadinessCapabilities(BaseModel):
    order_state_machine_enabled: bool = True
    local_sqlite_persistence_enabled: bool = True
    local_outbox_metadata_enabled: bool = True
    duplicate_idempotency_metadata_enabled: bool = True
    execution_report_metadata_enabled: bool = True
    timeout_candidate_scan_enabled: bool = True
    explicit_paper_timeout_mark_enabled: bool = True
    asynchronous_order_processing_enabled: bool = False
    distributed_durable_queue_enabled: bool = False
    outbox_worker_enabled: bool = False
    full_timeout_worker_enabled: bool = False
    amend_replace_enabled: bool = False
    production_partial_fill_accounting_enabled: bool = False
    broker_execution_report_ingestion_enabled: bool = False
    formal_reconciliation_loop_enabled: bool = False
    production_oms_ready: bool = False


class PaperOmsProductionReadinessSafetyFlags(BaseModel):
    paper_only: bool
    read_only: bool = True
    live_trading_enabled: bool
    broker_provider: str
    broker_api_called: bool = False
    order_created: bool = False
    credentials_collected: bool = False
    database_written: bool = False
    external_db_written: bool = False
    production_oms_ready: bool = False
    live_approval_granted: bool = False
    production_trading_ready: bool = False


class PaperOmsProductionReadinessResponse(BaseModel):
    service: str = "paper-oms-production-readiness"
    readiness_state: str = "local_paper_oms_scaffolding_not_production_oms"
    summary: str
    capabilities: PaperOmsProductionReadinessCapabilities = Field(
        default_factory=PaperOmsProductionReadinessCapabilities
    )
    safety_defaults: HostedPaperSafetyDefaults
    safety_flags: PaperOmsProductionReadinessSafetyFlags
    current_scope: list[str]
    missing_for_production_oms: list[str]
    required_before_production_oms: list[str]
    docs: dict[str, str]
    warnings: list[str]


CURRENT_SCOPE = [
    "Deterministic paper OMS state machine and lifecycle transitions.",
    "Local SQLite paper workflow, OMS event, audit event, and execution-report metadata.",
    "Local outbox metadata for completed paper workflow submissions.",
    "Duplicate idempotency metadata checks across local paper records.",
    "Read-only timeout candidate scan plus explicit paper-only timeout mark.",
]


MISSING_FOR_PRODUCTION_OMS = [
    "Asynchronous order processing worker.",
    "Distributed durable queue or production outbox worker.",
    "Crash-safe retry, dead-letter, and replay policy.",
    "Full automated timeout scheduler and recovery workflow.",
    "Amend and replace order lifecycle.",
    "Production-grade partial-fill quantity accounting.",
    "Broker execution report ingestion and normalization.",
    "Formal reconciliation loop against broker/account state.",
    "Operational monitoring, alerting, and incident runbooks.",
]


REQUIRED_BEFORE_PRODUCTION_OMS = [
    "Select and review durable queue/outbox architecture.",
    "Implement idempotent asynchronous OMS worker processing.",
    "Define retry, timeout, dead-letter, replay, and recovery semantics.",
    "Implement amend/replace and cancellation lifecycle contracts.",
    "Implement broker execution-report ingestion behind broker-gateway.",
    "Implement formal reconciliation loop and locked-state handling.",
    "Add load, failure-injection, recovery, and duplicate prevention tests.",
    "Complete security, operations, and legal/compliance review before live use.",
]


def get_paper_oms_production_readiness(
    settings: Settings,
) -> PaperOmsProductionReadinessResponse:
    paper_only = (
        settings.trading_mode == "paper"
        and settings.broker_provider == "paper"
        and not settings.live_trading_enabled
    )
    return PaperOmsProductionReadinessResponse(
        summary=(
            "The current Paper OMS is local paper scaffolding with synchronous "
            "workflow handling and local SQLite metadata. It is useful for demos "
            "and Paper Only review, but it is not a production OMS."
        ),
        safety_defaults=HostedPaperSafetyDefaults(
            trading_mode=settings.trading_mode,
            enable_live_trading=settings.enable_live_trading,
            broker_provider=settings.broker_provider,
        ),
        safety_flags=PaperOmsProductionReadinessSafetyFlags(
            paper_only=paper_only,
            live_trading_enabled=settings.live_trading_enabled,
            broker_provider=settings.broker_provider,
        ),
        current_scope=CURRENT_SCOPE,
        missing_for_production_oms=MISSING_FOR_PRODUCTION_OMS,
        required_before_production_oms=REQUIRED_BEFORE_PRODUCTION_OMS,
        docs={
            "oms_state_machine": "docs/oms-state-machine.md",
            "phase_4_risk_oms_broker_gateway": (
                "docs/phase-4-risk-oms-broker-gateway.md"
            ),
            "paper_shadow_live_boundary": "docs/paper-shadow-live-boundary.md",
            "trading_safety": "docs/trading-safety.md",
        },
        warnings=[
            "This endpoint is read-only production OMS readiness metadata only.",
            (
                "Local Paper OMS scaffolding is not asynchronous production "
                "order processing."
            ),
            (
                "Local outbox metadata is not a distributed durable queue or "
                "production outbox worker."
            ),
            (
                "The current timeout mark is an explicit paper-only action, "
                "not a production timeout worker."
            ),
            "Production Trading Platform remains NOT READY.",
        ],
    )
