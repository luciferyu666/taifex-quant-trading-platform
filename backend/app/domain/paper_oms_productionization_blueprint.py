from __future__ import annotations

from pydantic import BaseModel

from app.core.config import Settings
from app.domain.hosted_paper_readiness import HostedPaperSafetyDefaults


class PaperOmsProductionizationArea(BaseModel):
    area_id: str
    title: str
    status: str = "contract_only"
    current_state: str
    production_gap: str
    required_design_artifacts: list[str]
    required_runtime_components: list[str]
    acceptance_criteria: list[str]
    disabled_in_current_release: bool = True


class PaperOmsProductionizationSafetyFlags(BaseModel):
    paper_only: bool
    read_only: bool = True
    live_trading_enabled: bool
    broker_provider: str
    broker_api_called: bool = False
    order_created: bool = False
    queue_worker_started: bool = False
    async_processing_enabled: bool = False
    hosted_database_connected: bool = False
    database_written: bool = False
    external_db_written: bool = False
    credentials_collected: bool = False
    production_oms_enabled: bool = False
    production_trading_ready: bool = False


class PaperOmsProductionizationBlueprintResponse(BaseModel):
    service: str = "paper-oms-productionization-blueprint"
    blueprint_version: str = "v1"
    readiness_state: str = "blueprint_only_no_production_oms"
    summary: str
    safety_defaults: HostedPaperSafetyDefaults
    safety_flags: PaperOmsProductionizationSafetyFlags
    productionization_areas: list[PaperOmsProductionizationArea]
    proposed_processing_flow: list[str]
    staged_delivery_order: list[str]
    docs: dict[str, str]
    warnings: list[str]


PRODUCTIONIZATION_AREAS = [
    PaperOmsProductionizationArea(
        area_id="durable_queue_outbox",
        title="Durable queue and outbox",
        current_state=(
            "Local SQLite stores outbox metadata for completed paper workflow "
            "submissions only."
        ),
        production_gap=(
            "No distributed durable queue, production outbox worker, retry policy, "
            "dead-letter queue, or replay mechanism exists."
        ),
        required_design_artifacts=[
            "queue provider selection and failure-mode review",
            "outbox table schema with tenant_id, ordering, status, and retry metadata",
            "dead-letter and replay operating procedure",
        ],
        required_runtime_components=[
            "durable queue or managed event stream",
            "transactional outbox writer",
            "idempotent outbox dispatcher",
            "dead-letter queue and replay CLI",
        ],
        acceptance_criteria=[
            "outbox records survive process restart",
            "dispatch retries are idempotent",
            "dead-lettered messages can be replayed under operator control",
        ],
    ),
    PaperOmsProductionizationArea(
        area_id="async_order_processing",
        title="Asynchronous order processing",
        current_state="Paper workflow processing is synchronous inside the API request.",
        production_gap=(
            "No separate OMS worker, job ownership, leasing, retry window, or "
            "crash recovery loop exists."
        ),
        required_design_artifacts=[
            "worker ownership and lease semantics",
            "idempotent state transition contract",
            "retry, backoff, and recovery policy",
        ],
        required_runtime_components=[
            "OMS worker process",
            "lease/lock storage",
            "worker heartbeat and metrics",
        ],
        acceptance_criteria=[
            "API enqueue and worker processing are separated",
            "duplicate worker processing cannot create duplicate OMS events",
            "crash recovery resumes from durable state",
        ],
    ),
    PaperOmsProductionizationArea(
        area_id="duplicate_prevention_across_sessions",
        title="Duplicate prevention across sessions",
        current_state=(
            "Local SQLite checks idempotency keys for local paper workflow records."
        ),
        production_gap=(
            "No tenant-scoped, globally unique idempotency ledger exists for hosted "
            "paper workflows."
        ),
        required_design_artifacts=[
            "tenant-scoped idempotency key uniqueness policy",
            "duplicate request response contract",
            "operator audit query contract",
        ],
        required_runtime_components=[
            "managed datastore unique constraints",
            "idempotency lookup service",
            "duplicate attempt audit event writer",
        ],
        acceptance_criteria=[
            "same tenant cannot persist duplicate active idempotency keys",
            "cross-tenant idempotency keys remain isolated",
            "duplicate attempts are audit-visible",
        ],
    ),
    PaperOmsProductionizationArea(
        area_id="timeout_handling_productionization",
        title="Timeout handling productionization",
        current_state=(
            "Timeout handling is an explicit Paper Only preview/mark action."
        ),
        production_gap=(
            "No automated timeout scheduler, stale order recovery worker, "
            "escalation workflow, or SLA model exists."
        ),
        required_design_artifacts=[
            "timeout SLA matrix by order state",
            "operator escalation and lock-state policy",
            "timeout audit and reconciliation contract",
        ],
        required_runtime_components=[
            "timeout scanner worker",
            "operator notification channel",
            "locked-state workflow",
        ],
        acceptance_criteria=[
            "nonterminal stale orders are detected automatically",
            "timeout actions are idempotent and auditable",
            "unknown orders enter review/locked state instead of silent mutation",
        ],
    ),
    PaperOmsProductionizationArea(
        area_id="execution_report_model",
        title="Execution report model",
        current_state=(
            "Paper execution report metadata is derived from simulated paper events."
        ),
        production_gap=(
            "No broker execution report ingestion, normalization, sequencing, or "
            "acknowledgement model exists."
        ),
        required_design_artifacts=[
            "normalized execution report schema",
            "broker gateway ingestion boundary",
            "sequence and duplicate report policy",
        ],
        required_runtime_components=[
            "broker gateway report adapter interface",
            "execution report persistence",
            "report-to-OMS transition mapper",
        ],
        acceptance_criteria=[
            "execution reports are normalized before OMS mutation",
            "duplicate broker reports are ignored or reconciled deterministically",
            "unexpected reports mark orders for reconciliation",
        ],
    ),
    PaperOmsProductionizationArea(
        area_id="reconciliation_loop",
        title="Reconciliation loop",
        current_state="Only simulated reconciliation helpers exist.",
        production_gap=(
            "No recurring reconciliation loop compares platform orders, broker "
            "orders, positions, fills, and account state."
        ),
        required_design_artifacts=[
            "reconciliation schedule and data contract",
            "mismatch severity and lock-state policy",
            "operator resolution workflow",
        ],
        required_runtime_components=[
            "reconciliation worker",
            "broker/account state reader behind broker-gateway",
            "mismatch ledger and alerting",
        ],
        acceptance_criteria=[
            "mismatches are detected and audit-visible",
            "critical mismatches lock execution paths",
            "operator resolution is tracked and reproducible",
        ],
    ),
    PaperOmsProductionizationArea(
        area_id="amend_replace_cancel_lifecycle",
        title="Amend, replace, and cancel lifecycle",
        current_state=(
            "Paper OMS supports basic cancel-request/cancel metadata but not full "
            "amend or replace semantics."
        ),
        production_gap=(
            "No amend/replace request model, validation path, state transitions, "
            "broker report mapping, or conflict handling exists."
        ),
        required_design_artifacts=[
            "amend/replace intent schema",
            "state transition table for amend, replace, cancel, and reject paths",
            "conflict and late-fill handling policy",
        ],
        required_runtime_components=[
            "amend/replace validation service",
            "OMS transition handlers",
            "broker gateway adapter contract",
        ],
        acceptance_criteria=[
            "amend/replace cannot bypass Risk Engine",
            "late fills after cancel/amend are reconciled",
            "all lifecycle changes are audit-event sourced",
        ],
    ),
    PaperOmsProductionizationArea(
        area_id="partial_fill_quantity_accounting",
        title="Partial fill quantity accounting",
        current_state=(
            "Paper partial fill metadata exists for demos but is not production "
            "quantity accounting."
        ),
        production_gap=(
            "No authoritative open quantity, cumulative fill, average price, "
            "remaining quantity, or correction model exists."
        ),
        required_design_artifacts=[
            "quantity accounting invariant specification",
            "fill correction and bust/cancel policy",
            "P&L and position update boundary",
        ],
        required_runtime_components=[
            "execution report quantity accumulator",
            "position projection service",
            "accounting invariant checks",
        ],
        acceptance_criteria=[
            "cumulative fill never exceeds order quantity",
            "remaining quantity is deterministic after every report",
            "corrections are event-sourced and reconciled",
        ],
    ),
]


PROPOSED_PROCESSING_FLOW = [
    "API validates tenant, session, RBAC/ABAC, and paper-only environment.",
    "API writes an idempotent order command plus transactional outbox record.",
    "Durable queue/outbox dispatches the command to an OMS worker.",
    "OMS worker leases the command and applies deterministic state transitions.",
    "Broker gateway adapter emits normalized execution reports for paper/staging.",
    "OMS maps execution reports to order events and quantity accounting records.",
    "Reconciliation worker compares platform state with broker/account state.",
    "Critical mismatches move affected workflows into locked review state.",
]


STAGED_DELIVERY_ORDER = [
    "Review durable queue/outbox architecture and tenant-scoped schema.",
    "Add staging-only managed datastore migrations behind explicit apply gates.",
    "Implement idempotent async OMS worker for paper commands only.",
    "Add execution report persistence and quantity accounting invariants.",
    "Add automated timeout scanner with operator review state.",
    "Add amend/replace/cancel lifecycle contracts and tests.",
    "Add reconciliation loop and locked-state handling.",
    "Run load, restart, duplicate, timeout, and reconciliation drills before any production claim.",
]


def get_paper_oms_productionization_blueprint(
    settings: Settings,
) -> PaperOmsProductionizationBlueprintResponse:
    paper_only = (
        settings.trading_mode == "paper"
        and settings.broker_provider == "paper"
        and not settings.live_trading_enabled
    )
    return PaperOmsProductionizationBlueprintResponse(
        summary=(
            "This blueprint defines the missing contracts and runtime components "
            "required before the Paper OMS can evolve toward production-grade "
            "hosted paper processing. It is read-only metadata and does not "
            "enable production OMS behavior."
        ),
        safety_defaults=HostedPaperSafetyDefaults(
            trading_mode=settings.trading_mode,
            enable_live_trading=settings.enable_live_trading,
            broker_provider=settings.broker_provider,
        ),
        safety_flags=PaperOmsProductionizationSafetyFlags(
            paper_only=paper_only,
            live_trading_enabled=settings.live_trading_enabled,
            broker_provider=settings.broker_provider,
        ),
        productionization_areas=PRODUCTIONIZATION_AREAS,
        proposed_processing_flow=PROPOSED_PROCESSING_FLOW,
        staged_delivery_order=STAGED_DELIVERY_ORDER,
        docs={
            "paper_oms_production_readiness": "docs/paper-oms-production-readiness.md",
            "paper_oms_productionization_blueprint": (
                "docs/paper-oms-productionization-blueprint.md"
            ),
            "oms_state_machine": "docs/oms-state-machine.md",
            "phase_4_risk_oms_broker_gateway": (
                "docs/phase-4-risk-oms-broker-gateway.md"
            ),
            "paper_shadow_live_boundary": "docs/paper-shadow-live-boundary.md",
        },
        warnings=[
            "This blueprint is read-only and contract-only.",
            (
                "No durable queue, async worker, hosted datastore write, broker "
                "report ingestion, or reconciliation worker is enabled."
            ),
            "The current Paper OMS remains local paper scaffolding.",
            "Production Trading Platform remains NOT READY.",
        ],
    )
