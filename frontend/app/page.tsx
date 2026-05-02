import {
  PaperExecutionRecordsPanel,
  type PaperExecutionRunRecord,
} from "./components/PaperExecutionRecordsPanel";
import {
  PaperApprovalQueuePanel,
  type PaperApprovalHistory,
  type PaperApprovalStatus,
} from "./components/PaperApprovalQueuePanel";
import { CommandCenterTabs } from "./components/CommandCenterTabs";
import { DemoGuidePanel } from "./components/DemoGuidePanel";
import { DeploymentDataBoundaryPanel } from "./components/DeploymentDataBoundaryPanel";
import {
  HostedPaperEnvironmentPanel,
  type HostedPaperEnvironment,
} from "./components/HostedPaperEnvironmentPanel";
import {
  HostedPaperReadinessPanel,
  type HostedPaperReadiness,
} from "./components/HostedPaperReadinessPanel";
import {
  HostedPaperIdentityReadinessPanel,
  type HostedPaperIdentityReadiness,
} from "./components/HostedPaperIdentityReadinessPanel";
import {
  HostedPaperMockSessionPanel,
  type HostedPaperMockSession,
  type HostedPaperTenantContext,
} from "./components/HostedPaperMockSessionPanel";
import { HostedPaperTenantBoundaryEvidencePanel } from "./components/HostedPaperTenantBoundaryEvidencePanel";
import { LocalBackendDemoModePanel } from "./components/LocalBackendDemoModePanel";
import { LocalDemoSetupPanel } from "./components/LocalDemoSetupPanel";
import {
  PaperComplianceApprovalReadinessPanel,
  type PaperComplianceApprovalReadiness,
} from "./components/PaperComplianceApprovalReadinessPanel";
import type { PaperAuditEventRecord } from "./components/PaperAuditTimelinePanel";
import { PaperApprovalDecisionPanel } from "./components/PaperApprovalDecisionPanel";
import { PaperApprovalRequestPanel } from "./components/PaperApprovalRequestPanel";
import {
  PaperAuditIntegrityPanel,
  type PaperAuditIntegrityStatus,
  type PaperAuditIntegrityVerification,
} from "./components/PaperAuditIntegrityPanel";
import { PaperAuditIntegrityEvidencePanel } from "./components/PaperAuditIntegrityEvidencePanel";
import {
  PaperAuditWormReadinessPanel,
  type PaperAuditWormReadiness,
} from "./components/PaperAuditWormReadinessPanel";
import { PaperBrokerSimulationEvidencePanel } from "./components/PaperBrokerSimulationEvidencePanel";
import { PaperBrokerSimulationModelPanel } from "./components/PaperBrokerSimulationModelPanel";
import {
  PaperBrokerSimulationReadinessPanel,
  type PaperBrokerSimulationReadiness,
} from "./components/PaperBrokerSimulationReadinessPanel";
import { PaperDemoEvidencePanel } from "./components/PaperDemoEvidencePanel";
import {
  PaperOmsReliabilityPanel,
  type PaperExecutionReport,
  type PaperOmsOutboxItem,
  type PaperOmsReliabilityStatus,
  type PaperOrderTimeoutCandidate,
} from "./components/PaperOmsReliabilityPanel";
import {
  PaperOmsProductionReadinessPanel,
  type PaperOmsProductionReadiness,
} from "./components/PaperOmsProductionReadinessPanel";
import type { PaperOmsEventRecord } from "./components/PaperOmsTimelinePanel";
import {
  PaperRiskGuardrailsPanel,
  type PaperRiskStatus,
} from "./components/PaperRiskGuardrailsPanel";
import {
  PaperRiskCrossAccountReadinessPanel,
  type PaperRiskCrossAccountReadiness,
} from "./components/PaperRiskCrossAccountReadinessPanel";
import { PaperSimulationSubmitPanel } from "./components/PaperSimulationSubmitPanel";
import { ResearchReviewPacketJsonLoader } from "./components/ResearchReviewPacketJsonLoader";
import type { ResearchReviewPacket } from "./components/ResearchReviewPacketPanel";
import { ReleaseBaselinePanel, type ReleaseBaseline } from "./components/ReleaseBaselinePanel";
import { dashboardCopy, resolveLanguage } from "./i18n";

export const dynamic = "force-dynamic";

type HealthResponse = {
  status: string;
  service: string;
  trading_mode: string;
  live_trading_enabled: boolean;
};

type PhaseStatus = {
  phase: number;
  name: string;
  status: string;
  safety_mode: string;
};

type ContractSpec = {
  symbol: "TX" | "MTX" | "TMF";
  point_value_twd: number;
  tx_equivalent_ratio: number;
  description: string;
};

type PaperStatus = {
  trading_mode: string;
  live_trading_enabled: boolean;
  broker_provider: string;
  max_tx_equivalent_exposure: number;
  max_daily_loss_twd: number;
  stale_quote_seconds: number;
  message: string;
};

type PaperExecutionStatus = {
  trading_mode: string;
  live_trading_enabled: boolean;
  broker_provider: string;
  workflow_statuses: string[];
  order_path: string[];
  ui_mode: string;
  broker_api_called: boolean;
  message: string;
};

type PaperExecutionPersistenceStatus = {
  enabled: boolean;
  backend: string;
  db_path: string;
  local_only: boolean;
  live_trading_enabled: boolean;
  broker_api_called: boolean;
  runs_count: number;
  oms_events_count: number;
  audit_events_count: number;
  execution_reports_count: number;
  outbox_items_count: number;
  idempotency_keys_count: number;
  production_oms_ready: boolean;
  message: string;
};

type LoadState<T> = { available: true; data: T } | { available: false; error: string; data: T };

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000";

const fallbackHealth: HealthResponse = {
  status: "offline-safe",
  service: "backend unavailable",
  trading_mode: "paper",
  live_trading_enabled: false,
};

const fallbackRoadmap: PhaseStatus[] = [
  { phase: 0, name: "Compliance Boundary", status: "planned", safety_mode: "paper" },
  { phase: 1, name: "Infrastructure Foundation", status: "planned", safety_mode: "paper" },
  { phase: 2, name: "Data Platform", status: "planned", safety_mode: "paper" },
  { phase: 3, name: "Strategy SDK and Backtest", status: "planned", safety_mode: "paper" },
  { phase: 4, name: "Risk / OMS / Broker Gateway", status: "planned", safety_mode: "paper" },
  {
    phase: 5,
    name: "Command Center and Shadow Trading",
    status: "planned",
    safety_mode: "paper/shadow",
  },
  {
    phase: 6,
    name: "Reliability and Go-Live Readiness",
    status: "planned",
    safety_mode: "readiness-only",
  },
];

const fallbackContracts: ContractSpec[] = [
  {
    symbol: "TX",
    point_value_twd: 200,
    tx_equivalent_ratio: 1,
    description: "Taiwan Index Futures",
  },
  {
    symbol: "MTX",
    point_value_twd: 50,
    tx_equivalent_ratio: 0.25,
    description: "Mini Taiwan Index Futures",
  },
  {
    symbol: "TMF",
    point_value_twd: 10,
    tx_equivalent_ratio: 0.05,
    description: "Micro Taiwan Index Futures",
  },
];

const fallbackPaperStatus: PaperStatus = {
  trading_mode: "paper",
  live_trading_enabled: false,
  broker_provider: "paper",
  max_tx_equivalent_exposure: 0.25,
  max_daily_loss_twd: 5000,
  stale_quote_seconds: 3,
  message: "Fallback paper-safe status. Backend is unavailable.",
};

const fallbackPaperExecutionStatus: PaperExecutionStatus = {
  trading_mode: "paper",
  live_trading_enabled: false,
  broker_provider: "paper",
  workflow_statuses: [
    "research_approved",
    "approved_for_paper_simulation",
    "rejected",
    "needs_data_review",
  ],
  order_path: [
    "StrategySignal",
    "Platform PaperOrderIntent",
    "Risk Engine",
    "OMS",
    "Paper Broker Gateway",
    "Audit Event",
  ],
  ui_mode: "Paper Only read-only workflow status. No live controls are exposed.",
  broker_api_called: false,
  message: "Fallback paper execution workflow status. Backend is unavailable.",
};

const fallbackPaperExecutionPersistenceStatus: PaperExecutionPersistenceStatus = {
  enabled: false,
  backend: "sqlite",
  db_path: "data/paper_execution_audit.sqlite",
  local_only: true,
  live_trading_enabled: false,
  broker_api_called: false,
  runs_count: 0,
  oms_events_count: 0,
  audit_events_count: 0,
  execution_reports_count: 0,
  outbox_items_count: 0,
  idempotency_keys_count: 0,
  production_oms_ready: false,
  message: "Fallback local persistence status. Backend is unavailable.",
};

const fallbackPaperExecutionRuns: PaperExecutionRunRecord[] = [];
const fallbackPaperOmsEvents: PaperOmsEventRecord[] = [];
const fallbackPaperAuditEvents: PaperAuditEventRecord[] = [];
const fallbackPaperOmsReliabilityStatus: PaperOmsReliabilityStatus = {
  paper_only: true,
  live_trading_enabled: false,
  broker_api_called: false,
  production_oms_ready: false,
  local_sqlite_only: true,
  async_order_processing_enabled: false,
  durable_outbox_metadata_enabled: true,
  duplicate_order_prevention_enabled: true,
  timeout_candidate_scan_enabled: true,
  execution_report_model_enabled: true,
  amend_replace_enabled: false,
  reconciliation_loop_enabled: false,
  outbox_items_count: 0,
  idempotency_keys_count: 0,
  execution_reports_count: 0,
  timeout_candidates_count: 0,
  known_gaps: [
    "No asynchronous order worker exists.",
    "No distributed durable queue or outbox worker exists.",
    "No amend or replace workflow exists.",
    "No production reconciliation loop exists.",
    "Local SQLite reliability metadata is not a production WORM ledger.",
  ],
  message:
    "Fallback Paper OMS reliability metadata. The production OMS path is not ready and remains paper-only.",
};
const fallbackPaperOmsProductionReadiness: PaperOmsProductionReadiness = {
  service: "paper-oms-production-readiness",
  readiness_state: "local_paper_oms_scaffolding_not_production_oms",
  summary:
    "Fallback Paper OMS production readiness metadata. Local paper OMS scaffolding is not a production OMS.",
  capabilities: {
    order_state_machine_enabled: true,
    local_sqlite_persistence_enabled: true,
    local_outbox_metadata_enabled: true,
    duplicate_idempotency_metadata_enabled: true,
    execution_report_metadata_enabled: true,
    timeout_candidate_scan_enabled: true,
    explicit_paper_timeout_mark_enabled: true,
    asynchronous_order_processing_enabled: false,
    distributed_durable_queue_enabled: false,
    outbox_worker_enabled: false,
    full_timeout_worker_enabled: false,
    amend_replace_enabled: false,
    production_partial_fill_accounting_enabled: false,
    broker_execution_report_ingestion_enabled: false,
    formal_reconciliation_loop_enabled: false,
    production_oms_ready: false,
  },
  safety_defaults: {
    trading_mode: "paper",
    enable_live_trading: false,
    broker_provider: "paper",
  },
  safety_flags: {
    paper_only: true,
    read_only: true,
    live_trading_enabled: false,
    broker_provider: "paper",
    broker_api_called: false,
    order_created: false,
    credentials_collected: false,
    database_written: false,
    external_db_written: false,
    production_oms_ready: false,
    live_approval_granted: false,
    production_trading_ready: false,
  },
  current_scope: [
    "Deterministic paper OMS state machine and lifecycle transitions.",
    "Local SQLite paper workflow, OMS event, audit event, and execution-report metadata.",
    "Local outbox metadata for completed paper workflow submissions.",
  ],
  missing_for_production_oms: [
    "Asynchronous order processing worker.",
    "Distributed durable queue or production outbox worker.",
    "Amend and replace order lifecycle.",
    "Formal reconciliation loop against broker/account state.",
  ],
  required_before_production_oms: [
    "Select and review durable queue/outbox architecture.",
    "Implement idempotent asynchronous OMS worker processing.",
    "Implement formal reconciliation loop and locked-state handling.",
  ],
  docs: {
    oms_state_machine: "docs/oms-state-machine.md",
    phase_4_risk_oms_broker_gateway: "docs/phase-4-risk-oms-broker-gateway.md",
    paper_shadow_live_boundary: "docs/paper-shadow-live-boundary.md",
  },
  warnings: [
    "Fallback production OMS readiness metadata. Backend is unavailable.",
    "Production Trading Platform remains NOT READY.",
  ],
};
const fallbackPaperBrokerSimulationReadiness: PaperBrokerSimulationReadiness = {
  service: "paper-broker-simulation-readiness",
  readiness_state: "local_paper_simulation_not_market_matching_or_broker_execution",
  summary:
    "Fallback Paper Broker simulation readiness metadata. Local paper fills are not real market fills or broker execution reports.",
  capabilities: {
    deterministic_broker_simulation_enabled: true,
    local_quote_snapshot_preview_enabled: true,
    paper_ack_reject_partial_fill_fill_cancel_enabled: true,
    caller_provided_quote_only: true,
    real_market_matching_engine_enabled: false,
    exchange_order_book_replay_enabled: false,
    broker_execution_report_model_enabled: false,
    latency_queue_position_model_enabled: false,
    slippage_liquidity_calibration_enabled: false,
    real_account_reconciliation_enabled: false,
    production_execution_model: false,
  },
  safety_defaults: {
    trading_mode: "paper",
    enable_live_trading: false,
    broker_provider: "paper",
  },
  safety_flags: {
    paper_only: true,
    read_only: true,
    live_trading_enabled: false,
    broker_provider: "paper",
    broker_api_called: false,
    external_market_data_downloaded: false,
    real_order_created: false,
    order_created: false,
    credentials_collected: false,
    database_written: false,
    external_db_written: false,
    production_execution_model: false,
    production_trading_ready: false,
  },
  current_scope: [
    "Deterministic broker_simulation outcomes for paper workflow tests.",
    "Caller-provided local quote snapshot preview.",
    "Paper-only simulated ack/reject/partial_fill/fill/cancel outcomes.",
  ],
  missing_for_production_execution_model: [
    "Real market matching engine.",
    "Exchange order book replay.",
    "Broker execution report ingestion and normalization.",
    "Latency and queue position model.",
    "Real account, order, fill, and position reconciliation.",
  ],
  required_before_production_execution_model: [
    "Define broker execution report schema behind broker-gateway.",
    "Define market data and order book replay sources with data licensing review.",
    "Design latency, queue position, slippage, and liquidity model assumptions.",
  ],
  docs: {
    broker_gateway_adapter_pattern: "docs/broker-gateway-adapter-pattern.md",
    phase_4_risk_oms_broker_gateway: "docs/phase-4-risk-oms-broker-gateway.md",
    paper_shadow_live_boundary: "docs/paper-shadow-live-boundary.md",
  },
  warnings: [
    "Fallback broker simulation readiness metadata. Backend is unavailable.",
    "Paper fills are simulated metadata, not real market fills.",
    "Production Trading Platform remains NOT READY.",
  ],
};
const fallbackPaperOmsOutboxItems: PaperOmsOutboxItem[] = [];
const fallbackPaperExecutionReports: PaperExecutionReport[] = [];
const fallbackPaperTimeoutCandidates: PaperOrderTimeoutCandidate[] = [];
const fallbackPaperAuditIntegrityVerification: PaperAuditIntegrityVerification = {
  verified: true,
  workflow_run_id: null,
  generated_at: "fallback",
  db_path: "data/paper_execution_audit.sqlite",
  audit_events_count: 0,
  workflows_checked: 0,
  missing_hash_count: 0,
  broken_chain_count: 0,
  duplicate_audit_ids_count: 0,
  paper_only: true,
  live_trading_enabled: false,
  broker_api_called: false,
  local_sqlite_only: true,
  worm_ledger: false,
  immutable_audit_log: false,
  centralized_audit_service: false,
  production_audit_compliance: false,
  checks: [],
  warnings: [
    "Fallback paper audit integrity verification. Backend is unavailable.",
    "Local SQLite audit records are not WORM storage or production compliance.",
  ],
  message: "Fallback paper audit integrity verification. No local audit events are loaded.",
};
const fallbackPaperAuditIntegrityStatus: PaperAuditIntegrityStatus = {
  enabled: true,
  db_path: "data/paper_execution_audit.sqlite",
  local_sqlite_only: true,
  paper_only: true,
  live_trading_enabled: false,
  broker_api_called: false,
  worm_ledger: false,
  immutable_audit_log: false,
  centralized_audit_service: false,
  production_audit_compliance: false,
  audit_events_count: 0,
  workflows_checked: 0,
  latest_verification: fallbackPaperAuditIntegrityVerification,
  known_gaps: [
    "Local SQLite is not WORM storage.",
    "No centralized audit service is enabled.",
    "No external timestamping, signing, or notarization is enabled.",
    "No retention policy enforcement is enabled.",
  ],
  message: "Fallback paper audit integrity status. Backend is unavailable.",
};
const fallbackPaperAuditWormReadiness: PaperAuditWormReadiness = {
  service: "paper-audit-worm-readiness",
  readiness_state: "local_sqlite_not_production_worm_ledger",
  summary:
    "Fallback WORM readiness metadata. Local SQLite audit records are not a production WORM or immutable audit ledger.",
  storage: {
    local_sqlite_audit_enabled: true,
    local_hash_chain_enabled: true,
    worm_storage_enabled: false,
    immutable_ledger_enabled: false,
    append_only_enforced_by_storage: false,
    centralized_audit_service_enabled: false,
    object_lock_enabled: false,
    external_timestamping_enabled: false,
    cryptographic_signing_enabled: false,
    retention_policy_enforced: false,
    legal_hold_enabled: false,
    audit_export_reviewed: false,
    production_audit_compliance: false,
  },
  safety_defaults: {
    trading_mode: "paper",
    enable_live_trading: false,
    broker_provider: "paper",
  },
  safety_flags: {
    paper_only: true,
    read_only: true,
    live_trading_enabled: false,
    broker_provider: "paper",
    broker_api_called: false,
    order_created: false,
    credentials_collected: false,
    database_written: false,
    external_db_written: false,
    worm_compliance_claim: false,
    production_audit_compliance: false,
    production_trading_ready: false,
  },
  current_scope: [
    "Local SQLite paper audit records for demos and engineering review.",
    "Local hash-chain metadata for paper audit integrity preview.",
    "Read-only UI display of the current non-production audit posture.",
  ],
  missing_for_production_worm: [
    "Storage-level WORM controls.",
    "Centralized audit service.",
    "Cryptographic signing and external timestamping.",
    "Retention policy and legal hold enforcement.",
  ],
  required_before_worm_claim: [
    "Select a reviewed WORM-capable storage architecture.",
    "Implement immutable audit schemas and retention policies.",
    "Complete security, legal, compliance, and DR review.",
  ],
  docs: {
    paper_audit_integrity_preview: "docs/paper-audit-integrity-preview.md",
    paper_audit_worm_readiness: "docs/paper-audit-worm-readiness.md",
    paper_shadow_live_boundary: "docs/paper-shadow-live-boundary.md",
  },
  warnings: [
    "Fallback WORM readiness metadata. Backend is unavailable.",
    "Local SQLite audit persistence is not production WORM storage.",
    "Production Trading Platform remains NOT READY.",
  ],
};
const fallbackPaperRiskStatus: PaperRiskStatus = {
  trading_mode: "paper",
  live_trading_enabled: false,
  broker_provider: "paper",
  paper_only: true,
  broker_api_called: false,
  state: {
    seen_idempotency_keys: [],
    daily_realized_loss_twd: 0,
    current_position_tx_equivalent: 0,
    kill_switch_active: false,
    broker_heartbeat_healthy: true,
    paper_only: true,
    live_trading_enabled: false,
    broker_api_called: false,
    updated_at: "fallback",
  },
  policy: {
    trading_mode: "paper",
    live_trading_enabled: false,
    broker_provider: "paper",
    max_tx_equivalent_exposure: 0.25,
    max_daily_loss_twd: 5000,
    stale_quote_seconds: 3,
    price_reasonability_band_pct: 0.02,
    max_order_size_by_contract: { TX: 1, MTX: 4, TMF: 20 },
    margin_proxy_per_tx_equivalent_twd: 200000,
    max_margin_proxy_twd: 50000,
    max_position_tx_equivalent: 0.25,
    kill_switch_active: false,
    broker_heartbeat_healthy: true,
  },
  supported_checks: [
    "LIVE_TRADING_DISABLED",
    "PAPER_BROKER_ONLY",
    "IDEMPOTENCY_KEY_PRESENT",
    "PAPER_ONLY_INTENT",
    "MAX_EXPOSURE",
    "STALE_QUOTE",
    "PRICE_REASONABILITY",
    "MAX_ORDER_SIZE_BY_CONTRACT",
    "MARGIN_PROXY",
    "DUPLICATE_ORDER_PREVENTION",
    "DAILY_LOSS_LIMIT",
    "POSITION_LIMIT",
    "KILL_SWITCH",
    "BROKER_HEARTBEAT",
  ],
  message: "Fallback paper risk guardrail status. Backend is unavailable.",
};
const fallbackPaperRiskCrossAccountReadiness: PaperRiskCrossAccountReadiness = {
  service: "paper-risk-cross-account-readiness",
  readiness_state: "local_paper_risk_state_not_cross_account_risk_system",
  summary:
    "Fallback cross-account risk readiness metadata. Paper Risk Engine guardrails use local paper state and are not a formal cross-account risk system.",
  capabilities: {
    local_paper_guardrails_enabled: true,
    local_paper_state_enabled: true,
    single_account_demo_state_enabled: true,
    risk_evaluation_detail_enabled: true,
    duplicate_idempotency_local_check_enabled: true,
    cross_account_aggregation_enabled: false,
    account_hierarchy_enabled: false,
    tenant_isolated_risk_state_enabled: false,
    real_account_margin_feed_enabled: false,
    broker_position_feed_enabled: false,
    centralized_risk_limits_enabled: false,
    distributed_kill_switch_enabled: false,
    durable_risk_state_store_enabled: false,
    real_time_equity_pnl_tracking_enabled: false,
    production_cross_account_risk_system: false,
  },
  safety_defaults: {
    trading_mode: "paper",
    enable_live_trading: false,
    broker_provider: "paper",
  },
  safety_flags: {
    paper_only: true,
    read_only: true,
    live_trading_enabled: false,
    broker_provider: "paper",
    broker_api_called: false,
    external_account_data_loaded: false,
    real_account_data_loaded: false,
    order_created: false,
    credentials_collected: false,
    database_written: false,
    hosted_datastore_written: false,
    production_risk_approval: false,
    production_cross_account_risk: false,
    production_trading_ready: false,
  },
  current_scope: [
    "Paper-only guardrail evaluation for local simulation workflows.",
    "Local in-memory paper risk state for demo and engineering checks.",
    "Single-account style paper state snapshot in the current Web Command Center.",
  ],
  missing_for_cross_account_risk: [
    "Cross-account exposure aggregation by customer, strategy, symbol, and contract.",
    "Real account margin, equity, cash, PnL, order, fill, and position feeds.",
    "Broker-side position and order reconciliation per account.",
    "Centralized durable risk state store with replay and recovery.",
  ],
  required_before_cross_account_risk: [
    "Define tenant, account, portfolio, strategy, and reviewer identity model.",
    "Design account-scoped and group-scoped risk limit schemas.",
    "Select reviewed durable storage for cross-account risk state.",
  ],
  docs: {
    risk_engine_spec: "docs/risk-engine-spec.md",
    phase_4_risk_oms_broker_gateway: "docs/phase-4-risk-oms-broker-gateway.md",
    paper_shadow_live_boundary: "docs/paper-shadow-live-boundary.md",
  },
  warnings: [
    "Fallback cross-account risk readiness metadata. Backend is unavailable.",
    "Local paper risk state is not a hosted or cross-account risk store.",
    "Production Trading Platform remains NOT READY.",
  ],
};

const fallbackPaperApprovalStatus: PaperApprovalStatus = {
  trading_mode: "paper",
  live_trading_enabled: false,
  broker_provider: "paper",
  approval_mode: "paper_only_local_approval_foundation",
  supported_decisions: [
    "research_approved",
    "approved_for_paper_simulation",
    "rejected",
    "needs_data_review",
  ],
  reviewer_roles: [
    "research_reviewer",
    "risk_reviewer",
    "compliance_reviewer",
  ],
  dual_review_required: true,
  immutable_record_policy:
    "Append-only local SQLite records with hash chaining. This is not a production WORM ledger or production identity system.",
  broker_api_called: false,
  message:
    "Fallback paper approval status. Approval UI remains read-only and paper-only while backend is unavailable.",
};

const fallbackPaperApprovalQueue: PaperApprovalHistory[] = [];
const fallbackPaperApprovalHistory: PaperApprovalHistory[] = [];

const fallbackPaperComplianceApprovalReadiness: PaperComplianceApprovalReadiness = {
  service: "paper-compliance-approval-readiness",
  readiness_state: "local_paper_scaffolding_not_formal_compliance_system",
  summary:
    "The current approval workflow is local Paper Only scaffolding for technical demos. It is not a formal compliance approval system, does not verify reviewer identity, and does not grant live or production trading approval.",
  scaffolding: {
    local_paper_approval_queue_enabled: true,
    local_sqlite_persistence_enabled: true,
    paper_only_decisions_supported: [
      "research_approved",
      "approved_for_paper_simulation",
      "rejected",
      "needs_data_review",
    ],
    local_dual_review_rule_enabled: true,
    formal_compliance_approval_enabled: false,
    production_approval_authority: false,
    reviewer_identity_verified: false,
    rbac_abac_enforced: false,
    segregation_of_duties_enforced: false,
    compliance_policy_engine_enabled: false,
    approval_policy_versioning_enabled: false,
    tenant_scoped_approval_records_enabled: false,
    legal_retention_policy_enforced: false,
  },
  audit: {
    local_hash_chain_enabled: true,
    worm_ledger_enabled: false,
    immutable_audit_log_enabled: false,
    centralized_audit_service_enabled: false,
    signed_approval_records_enabled: false,
    external_timestamping_enabled: false,
    retention_policy_enforced: false,
    production_compliance_archive_enabled: false,
  },
  safety_defaults: {
    trading_mode: "paper",
    enable_live_trading: false,
    broker_provider: "paper",
  },
  safety_flags: {
    paper_only: true,
    read_only: true,
    live_trading_enabled: false,
    broker_provider: "paper",
    broker_api_called: false,
    order_created: false,
    credentials_collected: false,
    broker_credentials_collected: false,
    database_written: false,
    external_db_written: false,
    production_compliance_approval: false,
    live_approval_granted: false,
    paper_execution_approval_granted: false,
    production_trading_ready: false,
  },
  current_scope: [
    "Local Paper Only approval queue and history for demos and technical testing.",
    "Local SQLite persistence with hash-chain references for paper approval decisions.",
    "Controlled Paper Submit can reference a persisted approval_request_id.",
    "Web Command Center can create local paper requests and decisions for paper simulation only.",
  ],
  missing_for_formal_compliance: [
    "Real reviewer login and verified reviewer identity.",
    "Formal RBAC/ABAC enforcement for approval authority.",
    "Tenant-scoped customer accounts and hosted approval records.",
    "Compliance policy engine with versioned approval rules.",
    "Segregation of duties enforced by identity and authorization controls.",
    "Immutable WORM ledger or centralized compliance audit service.",
    "Signed approval records, external timestamping, and retention policy enforcement.",
    "Legal, regulatory, security, and operations review for customer-facing approval workflows.",
  ],
  required_before_formal_approval: [
    "Select and review an authentication provider.",
    "Implement reviewer identity, session lifecycle, MFA, and logout behavior.",
    "Implement tenant-scoped customer accounts and membership records.",
    "Enforce RBAC/ABAC for reviewer, risk, compliance, and paper operator roles.",
    "Define and version compliance approval policies.",
    "Implement WORM or centralized immutable audit storage.",
    "Implement signed approval records and tamper-evident export.",
    "Complete legal/regulatory review before presenting any approval as formal compliance approval.",
  ],
  docs: {
    paper_approval_workflow: "docs/paper-approval-workflow.md",
    hosted_paper_identity: "docs/hosted-paper-identity-rbac-tenant-readiness.md",
    paper_shadow_live_boundary: "docs/paper-shadow-live-boundary.md",
    compliance_boundary: "docs/compliance-boundary.md",
  },
  warnings: [
    "This endpoint is read-only compliance approval readiness metadata only.",
    "The local paper approval workflow is not formal compliance approval, not legal approval, and not live trading approval.",
    "It does not enable live trading, write databases, collect credentials, call brokers, or create orders.",
    "Production Trading Platform remains NOT READY.",
  ],
};

const fallbackReleaseBaseline: ReleaseBaseline = {
  version: "v0.1.0-paper-research-preview",
  release_level: {
    marketing_website: "external presentation candidate",
    web_command_center: "internal demo candidate",
    paper_research_preview: "internal technical preview",
    production_trading_platform: "NOT READY",
  },
  safety_defaults: {
    trading_mode: "paper",
    enable_live_trading: false,
    broker_provider: "paper",
  },
  validation: {
    release_readiness_check: "passed",
    make_check: "passed",
    github_actions_release_gate: "passed",
  },
  live_trading_enabled: false,
  known_non_production_gaps: [
    "No production trading path exists.",
    "No real broker adapter exists.",
    "No live execution path exists.",
    "Data platform is based on local fixtures, dry-run validation, and schema scaffolding.",
    "Backtest outputs are simulated research artifacts, not performance reports.",
    "Web Command Center is read-only for research review packet inspection.",
  ],
  docs: {
    release_baseline: "docs/release-baseline-v0.1.0.md",
    release_readiness_audit: "docs/release-readiness-audit.md",
    trading_safety: "docs/trading-safety.md",
    paper_shadow_live_boundary: "docs/paper-shadow-live-boundary.md",
  },
};

const fallbackHostedPaperEnvironment: HostedPaperEnvironment = {
  service: "hosted-paper-environment-contract",
  contract_version: "2026-05-02",
  deployment_model: "local_demo_primary_hosted_paper_not_enabled_production_trading_not_ready",
  current_customer_mode: "local_demo_mode",
  local_demo_mode: {
    mode: "local_demo",
    label: "Local Demo Mode",
    state: "primary_local_demo",
    can_read_actual_paper_records: true,
    can_write_paper_records: true,
    auth_required: false,
    tenant_isolation_required: false,
    managed_datastore_required: false,
    local_sqlite_allowed: true,
    description:
      "Primary customer evaluation path for actual paper workflow records. Runs on the reviewer's machine with local backend and local SQLite.",
    limitations: [
      "Engineering-style local setup is still required.",
      "Records are not available from Production Vercel.",
      "Local SQLite is not a hosted tenant datastore.",
      "No hosted customer account or reviewer login is available.",
    ],
  },
  hosted_paper_mode: {
    mode: "hosted_paper",
    label: "Hosted Paper Mode",
    state: "not_enabled",
    can_read_actual_paper_records: false,
    can_write_paper_records: false,
    auth_required: true,
    tenant_isolation_required: true,
    managed_datastore_required: true,
    local_sqlite_allowed: false,
    description:
      "Future SaaS paper workflow path with authenticated sessions, tenant-scoped records, RBAC/ABAC, and managed datastore.",
    limitations: [
      "Hosted backend/API is not deployed as a customer paper workspace.",
      "Managed paper datastore is not connected.",
      "Customer login, reviewer identity, and tenant isolation are not enabled.",
      "Hosted paper workflow persistence is not enabled.",
    ],
  },
  production_trading_platform: {
    mode: "production_trading_platform",
    label: "Production Trading Platform",
    state: "not_ready",
    can_read_actual_paper_records: false,
    can_write_paper_records: false,
    auth_required: true,
    tenant_isolation_required: true,
    managed_datastore_required: true,
    local_sqlite_allowed: false,
    description:
      "Production trading platform remains NOT READY. This contract does not enable live trading, broker connectivity, or real order routing.",
    limitations: [
      "No live trading approval exists.",
      "No broker SDK path is enabled.",
      "No broker credentials are collected.",
      "No production OMS, WORM audit ledger, or cross-account risk system exists.",
    ],
  },
  saas_foundation_path: [
    {
      sequence: 1,
      capability: "Hosted backend",
      current_status: "not_enabled",
      required_before_customer_saas: true,
      notes: "Deploy controlled backend/API for paper-only hosted workspace.",
    },
    {
      sequence: 2,
      capability: "Managed database",
      current_status: "not_enabled",
      required_before_customer_saas: true,
      notes: "Replace local SQLite with tenant-scoped managed datastore.",
    },
    {
      sequence: 3,
      capability: "Auth/session",
      current_status: "schema_only",
      required_before_customer_saas: true,
      notes: "Introduce real customer login and reviewer identity.",
    },
    {
      sequence: 4,
      capability: "Tenant isolation",
      current_status: "schema_only",
      required_before_customer_saas: true,
      notes: "Require tenant id on every hosted paper record and API read/write.",
    },
    {
      sequence: 5,
      capability: "Paper workflow persistence",
      current_status: "local_only",
      required_before_customer_saas: true,
      notes:
        "Move approval, paper OMS, risk, broker simulation, and audit records into hosted datastore.",
    },
    {
      sequence: 6,
      capability: "Hosted customer demo tenant",
      current_status: "not_enabled",
      required_before_customer_saas: true,
      notes:
        "Provision a paper-only tenant with sample records after auth, data, audit, and security gates pass.",
    },
  ],
  safety_defaults: {
    trading_mode: "paper",
    enable_live_trading: false,
    broker_provider: "paper",
  },
  safety_flags: {
    paper_only: true,
    live_trading_enabled: false,
    broker_api_called: false,
    order_created: false,
    database_written: false,
    external_db_written: false,
    broker_credentials_collected: false,
    production_trading_ready: false,
  },
  docs: {
    hosted_paper_saas_foundation: "docs/hosted-paper-saas-foundation-roadmap.md",
    hosted_paper_readiness: "docs/hosted-paper-backend-api-readiness.md",
    auth_boundary: "docs/hosted-paper-auth-boundary-spec.md",
    identity_readiness: "docs/hosted-paper-identity-rbac-tenant-readiness.md",
    local_demo: "docs/customer-self-service-demo.md",
    production_local_data_boundary: "docs/production-local-data-boundary.md",
  },
  warnings: [
    "This endpoint is read-only environment contract metadata only.",
    "Hosted Paper Mode is not enabled for customer SaaS operation.",
    "Production Vercel cannot read local SQLite paper records.",
    "Production Trading Platform remains NOT READY.",
    "Live trading remains disabled by default.",
  ],
};

const fallbackHostedPaperReadiness: HostedPaperReadiness = {
  service: "hosted-paper-api-readiness",
  readiness_state: "not_enabled",
  summary:
    "Hosted paper backend/API is not enabled. The local backend + local SQLite path remains primary for actual paper workflow records; Production Vercel remains read-only for UI, fallback samples, and explicit local JSON evidence.",
  safety_defaults: {
    trading_mode: "paper",
    enable_live_trading: false,
    broker_provider: "paper",
  },
  safety_flags: {
    paper_only: true,
    live_trading_enabled: false,
    broker_api_called: false,
    order_created: false,
    database_written: false,
    external_db_written: false,
    broker_credentials_collected: false,
    production_trading_ready: false,
  },
  capabilities: {
    customer_login_enabled: false,
    hosted_backend_enabled: false,
    hosted_datastore_enabled: false,
    rbac_abac_enabled: false,
    paper_workflow_online_enabled: false,
    local_demo_mode_primary: true,
  },
  current_customer_path: [
    "Use the Production Vercel Web Command Center for read-only UI and fallback samples.",
    "Use local backend + local SQLite to create and inspect actual paper workflow records.",
    "Use explicit local evidence export/import for customer review artifacts.",
  ],
  unavailable_until_hosted_backend: [
    "Customer login to an online paper workspace.",
    "Tenant-scoped hosted paper records.",
    "Hosted approval queue and decision persistence.",
    "Hosted paper OMS/audit query APIs backed by a managed datastore.",
  ],
  future_requirements: [
    "Authenticated session context.",
    "Tenant-scoped managed hosted datastore.",
    "RBAC/ABAC checks for reviewer and operator actions.",
    "Paper-only approval workflow backed by hosted persistence.",
    "Paper-only workflow submit that references a persisted approval_request_id.",
    "Append-only hosted paper audit events with integrity verification.",
    "Security and operations review before any customer pilot.",
  ],
  docs: {
    hosted_paper_readiness: "docs/hosted-paper-backend-api-readiness.md",
    local_backend_demo: "docs/frontend-local-backend-demo-mode.md",
    production_local_data_boundary: "docs/production-local-data-boundary.md",
    self_service_demo: "docs/customer-self-service-paper-demo-roadmap.md",
  },
  warnings: [
    "This endpoint is read-only readiness metadata, not a hosted paper backend.",
    "It does not authenticate users, write records, call brokers, create orders, or turn live trading on.",
    "Production Trading Platform remains NOT READY.",
  ],
};

const fallbackHostedPaperTenant: HostedPaperTenantContext = {
  tenant_id: "mock-tenant-paper-evaluation",
  tenant_name: "Mock Paper Evaluation Tenant",
  tenant_mode: "paper_only_mock",
  tenant_isolation_required: true,
  hosted_datastore_enabled: false,
  local_sqlite_access: false,
  live_trading_enabled: false,
  broker_provider: "paper",
};

const fallbackHostedPaperIdentityReadiness: HostedPaperIdentityReadiness = {
  service: "hosted-paper-identity-rbac-tenant-readiness",
  readiness_state: "schema_only_not_enabled",
  summary:
    "Hosted paper identity, reviewer login, customer accounts, formal RBAC/ABAC, and tenant isolation are schema-only readiness metadata. They are not enabled and do not create hosted sessions or tenant records.",
  identity: {
    reviewer_login_enabled: false,
    customer_accounts_enabled: false,
    authentication_provider: "none",
    session_issuance_enabled: false,
    session_cookie_issued: false,
    mfa_enabled: false,
  },
  access_control: {
    rbac_enabled: false,
    abac_enabled: false,
    roles_defined: [
      "viewer",
      "research_reviewer",
      "risk_reviewer",
      "paper_operator",
      "tenant_admin",
    ],
    permissions_defined: [
      "read_hosted_readiness",
      "read_mock_session",
      "read_current_tenant",
      "read_tenant_paper_records",
      "create_paper_approval_request",
      "record_paper_reviewer_decision",
      "submit_approved_paper_workflow",
      "enable_live_trading",
      "upload_broker_credentials",
    ],
    mutation_permissions_granted: false,
    live_permissions_granted: false,
    dual_review_required_for_future: true,
  },
  tenant_isolation: {
    tenant_isolation_required: true,
    tenant_isolation_enforced: false,
    hosted_tenant_datastore_enabled: false,
    hosted_tenant_records_enabled: false,
    tenant_created: false,
    local_sqlite_access_from_production_vercel: false,
  },
  safety_defaults: {
    trading_mode: "paper",
    enable_live_trading: false,
    broker_provider: "paper",
  },
  safety_flags: {
    paper_only: true,
    read_only: true,
    live_trading_enabled: false,
    broker_provider: "paper",
    broker_api_called: false,
    order_created: false,
    credentials_collected: false,
    broker_credentials_collected: false,
    hosted_auth_provider_enabled: false,
    reviewer_login_created: false,
    customer_account_created: false,
    session_cookie_issued: false,
    hosted_datastore_written: false,
    external_db_written: false,
    rbac_abac_enforced: false,
    tenant_isolation_enforced: false,
    production_trading_ready: false,
  },
  current_customer_path: [
    "Use Production Vercel for read-only UI, fallback samples, and local JSON evidence viewers.",
    "Use local backend + local SQLite for actual paper approval, OMS, and audit records.",
    "Use exported evidence files for reviewer/customer handoff until hosted identity exists.",
  ],
  blocked_until_identity_layer: [
    "Real reviewer login.",
    "Customer account onboarding.",
    "Tenant-scoped hosted paper workspace.",
    "Hosted approval queue mutations.",
    "Hosted paper workflow submission.",
    "Hosted tenant paper record queries backed by a managed datastore.",
  ],
  future_requirements: [
    "Choose and review a hosted authentication provider.",
    "Define session issuance, expiry, rotation, and logout behavior.",
    "Implement tenant-scoped account and membership records.",
    "Enforce RBAC for reviewer and paper operator actions.",
    "Enforce ABAC for paper-only mode, tenant scope, environment, and approval state.",
    "Add dual-review rules before any hosted paper workflow submission.",
    "Add audit trail for identity, authorization, and tenant-boundary decisions.",
    "Complete security and operations review before customer pilot.",
  ],
  docs: {
    hosted_paper_auth_boundary: "docs/hosted-paper-auth-boundary-spec.md",
    hosted_paper_mock_session: "docs/hosted-paper-mock-session-contract.md",
    hosted_paper_readiness: "docs/hosted-paper-backend-api-readiness.md",
    paper_shadow_live_boundary: "docs/paper-shadow-live-boundary.md",
  },
  warnings: [
    "This endpoint is read-only identity readiness metadata only.",
    "It does not create reviewer login, customer accounts, sessions, tenant records, or RBAC/ABAC enforcement.",
    "It does not enable live trading, write databases, collect credentials, call brokers, or create orders.",
    "Production Trading Platform remains NOT READY.",
  ],
};

const fallbackHostedPaperMockSession: HostedPaperMockSession = {
  service: "hosted-paper-mock-session-contract",
  contract_state: "mock_read_only",
  summary:
    "Read-only mock session contract for future hosted paper mode. This is not real authentication and does not create a hosted session.",
  session: {
    user_id: "mock-user-read-only",
    session_id: "mock-session-read-only",
    authenticated: false,
    authentication_provider: "none",
    authentication_mode: "mock_contract_only",
    roles: ["viewer"],
    attributes: {
      environment: "hosted-paper-preview",
      paper_only: true,
      read_only: true,
      tenant_scope: "mock-tenant-paper-evaluation",
    },
  },
  tenant: fallbackHostedPaperTenant,
  role_schema: [
    {
      role: "viewer",
      description:
        "Read hosted readiness, mock session, tenant context, and evidence metadata.",
      paper_only: true,
      can_enable_live_trading: false,
      can_upload_broker_credentials: false,
    },
    {
      role: "research_reviewer",
      description: "Future paper-only role for research review decisions.",
      paper_only: true,
      can_enable_live_trading: false,
      can_upload_broker_credentials: false,
    },
    {
      role: "risk_reviewer",
      description: "Future paper-only role for risk review decisions.",
      paper_only: true,
      can_enable_live_trading: false,
      can_upload_broker_credentials: false,
    },
    {
      role: "paper_operator",
      description: "Future paper-only role for submitting approved paper workflows.",
      paper_only: true,
      can_enable_live_trading: false,
      can_upload_broker_credentials: false,
    },
    {
      role: "tenant_admin",
      description: "Future paper-only role for tenant workspace administration.",
      paper_only: true,
      can_enable_live_trading: false,
      can_upload_broker_credentials: false,
    },
  ],
  permission_schema: [
    {
      permission: "read_hosted_readiness",
      description: "Read hosted paper readiness metadata.",
      granted_in_mock_session: true,
      mutation: false,
      requires_rbac: true,
      requires_abac: true,
      requires_completed_approval_request: false,
    },
    {
      permission: "read_mock_session",
      description: "Read the mock session contract sample.",
      granted_in_mock_session: true,
      mutation: false,
      requires_rbac: true,
      requires_abac: true,
      requires_completed_approval_request: false,
    },
    {
      permission: "read_current_tenant",
      description: "Read the mock tenant context sample.",
      granted_in_mock_session: true,
      mutation: false,
      requires_rbac: true,
      requires_abac: true,
      requires_completed_approval_request: false,
    },
    {
      permission: "create_paper_approval_request",
      description: "Future paper-only mutation for creating approval requests.",
      granted_in_mock_session: false,
      mutation: true,
      requires_rbac: true,
      requires_abac: true,
      requires_completed_approval_request: false,
    },
    {
      permission: "record_paper_reviewer_decision",
      description: "Future paper-only mutation for reviewer decisions.",
      granted_in_mock_session: false,
      mutation: true,
      requires_rbac: true,
      requires_abac: true,
      requires_completed_approval_request: false,
    },
    {
      permission: "submit_approved_paper_workflow",
      description: "Future paper-only mutation requiring a completed approval_request_id.",
      granted_in_mock_session: false,
      mutation: true,
      requires_rbac: true,
      requires_abac: true,
      requires_completed_approval_request: true,
    },
    {
      permission: "enable_live_trading",
      description: "Forbidden in hosted paper mode.",
      granted_in_mock_session: false,
      mutation: true,
      requires_rbac: true,
      requires_abac: true,
      requires_completed_approval_request: false,
    },
    {
      permission: "upload_broker_credentials",
      description: "Forbidden in hosted paper mode.",
      granted_in_mock_session: false,
      mutation: true,
      requires_rbac: true,
      requires_abac: true,
      requires_completed_approval_request: false,
    },
  ],
  safety_defaults: {
    trading_mode: "paper",
    enable_live_trading: false,
    broker_provider: "paper",
  },
  safety_flags: {
    paper_only: true,
    read_only: true,
    live_trading_enabled: false,
    broker_api_called: false,
    order_created: false,
    credentials_collected: false,
    broker_credentials_collected: false,
    hosted_auth_provider_enabled: false,
    session_cookie_issued: false,
    hosted_datastore_written: false,
    external_db_written: false,
    production_trading_ready: false,
  },
  docs: {
    hosted_paper_auth_boundary: "docs/hosted-paper-auth-boundary-spec.md",
    hosted_paper_mock_session: "docs/hosted-paper-mock-session-contract.md",
    hosted_paper_readiness: "docs/hosted-paper-backend-api-readiness.md",
  },
  warnings: [
    "This endpoint is a mock contract only; no hosted authentication provider is enabled.",
    "No credentials are collected, no session cookie is issued, and no hosted datastore is written.",
    "Mock permissions do not authorize paper workflow mutations or live trading.",
    "Production Trading Platform remains NOT READY.",
  ],
};

const fallbackResearchReviewPacket: ResearchReviewPacket = {
  packet_id: "fallback-research-review-packet",
  packet_label: "fallback-research-review-packet",
  review_queue_id: "fallback-research-review-queue",
  decision_index_id: "fallback-research-review-decision-index",
  bundle_count: 1,
  decision_count: 3,
  decision_summary: {
    rejected_count: 1,
    needs_data_review_count: 1,
    approved_for_paper_research_count: 1,
  },
  included_sections: ["review_queue", "decisions", "decision_index"],
  checksums: {
    queue_checksum: "1111111111111111111111111111111111111111111111111111111111111111",
    decision_checksums: [
      "2222222222222222222222222222222222222222222222222222222222222222",
      "3333333333333333333333333333333333333333333333333333333333333333",
      "4444444444444444444444444444444444444444444444444444444444444444",
    ],
    index_checksum: "5555555555555555555555555555555555555555555555555555555555555555",
    packet_checksum: "6666666666666666666666666666666666666666666666666666666666666666",
  },
  reproducibility_hash: "7777777777777777777777777777777777777777777777777777777777777777",
  warnings: [
    "Fallback packet is read-only UI metadata. It does not approve paper execution or live trading, rank strategies, call brokers, or claim performance.",
  ],
  research_only: true,
  execution_eligible: false,
  order_created: false,
  broker_api_called: false,
  risk_engine_called: false,
  oms_called: false,
  performance_claim: false,
  simulated_metrics_only: true,
  external_data_downloaded: false,
  ranking_generated: false,
  best_strategy_selected: false,
  approval_for_live: false,
  approval_for_paper_execution: false,
  persisted: false,
};

async function fetchJson<T>(path: string, fallback: T): Promise<LoadState<T>> {
  try {
    const response = await fetch(`${backendUrl}${path}`, {
      cache: "no-store",
      signal: AbortSignal.timeout(2000),
    });
    if (!response.ok) {
      return { available: false, error: `Backend returned HTTP ${response.status}`, data: fallback };
    }
    return { available: true, data: (await response.json()) as T };
  } catch (error) {
    return {
      available: false,
      error: error instanceof Error ? error.message : "Backend is unavailable",
      data: fallback,
    };
  }
}

type HomeProps = {
  searchParams?: Promise<{
    lang?: string | string[];
  }>;
};

export default async function Home({ searchParams }: HomeProps) {
  const params = searchParams ? await searchParams : {};
  const language = resolveLanguage(params.lang);
  const copy = dashboardCopy[language];

  const [
    health,
    roadmap,
    contractsResponse,
    paperStatus,
    paperExecutionStatus,
    paperExecutionPersistence,
    paperBrokerSimulationReadiness,
    paperOmsReliability,
    paperOmsProductionReadiness,
    paperOmsOutbox,
    paperTimeoutCandidates,
    paperAuditIntegrityStatus,
    paperAuditIntegrityVerification,
    paperAuditWormReadiness,
    paperRiskStatus,
    paperRiskCrossAccountReadiness,
    paperExecutionRuns,
    paperApprovalStatus,
    paperComplianceApprovalReadiness,
    paperApprovalQueue,
    paperApprovalHistory,
    releaseBaseline,
    hostedPaperEnvironment,
    hostedPaperReadiness,
    hostedPaperIdentityReadiness,
    hostedPaperMockSession,
    hostedPaperTenant,
    reviewPacket,
  ] =
    await Promise.all([
      fetchJson<HealthResponse>("/health", fallbackHealth),
      fetchJson<PhaseStatus[]>("/api/roadmap", fallbackRoadmap),
      fetchJson<{ contracts: ContractSpec[] }>("/api/contracts", { contracts: fallbackContracts }),
      fetchJson<PaperStatus>("/api/risk/paper-status", fallbackPaperStatus),
      fetchJson<PaperExecutionStatus>(
        "/api/paper-execution/status",
        fallbackPaperExecutionStatus,
      ),
      fetchJson<PaperExecutionPersistenceStatus>(
        "/api/paper-execution/persistence/status",
        fallbackPaperExecutionPersistenceStatus,
      ),
      fetchJson<PaperBrokerSimulationReadiness>(
        "/api/paper-execution/broker-simulation/readiness",
        fallbackPaperBrokerSimulationReadiness,
      ),
      fetchJson<PaperOmsReliabilityStatus>(
        "/api/paper-execution/reliability/status",
        fallbackPaperOmsReliabilityStatus,
      ),
      fetchJson<PaperOmsProductionReadiness>(
        "/api/paper-execution/reliability/production-readiness",
        fallbackPaperOmsProductionReadiness,
      ),
      fetchJson<PaperOmsOutboxItem[]>(
        "/api/paper-execution/outbox?limit=5",
        fallbackPaperOmsOutboxItems,
      ),
      fetchJson<PaperOrderTimeoutCandidate[]>(
        "/api/paper-execution/reliability/timeout-candidates?timeout_seconds=30",
        fallbackPaperTimeoutCandidates,
      ),
      fetchJson<PaperAuditIntegrityStatus>(
        "/api/paper-execution/audit-integrity/status",
        fallbackPaperAuditIntegrityStatus,
      ),
      fetchJson<PaperAuditIntegrityVerification>(
        "/api/paper-execution/audit-integrity/verify",
        fallbackPaperAuditIntegrityVerification,
      ),
      fetchJson<PaperAuditWormReadiness>(
        "/api/paper-execution/audit-integrity/worm-readiness",
        fallbackPaperAuditWormReadiness,
      ),
      fetchJson<PaperRiskStatus>("/api/paper-risk/status", fallbackPaperRiskStatus),
      fetchJson<PaperRiskCrossAccountReadiness>(
        "/api/paper-risk/cross-account-readiness",
        fallbackPaperRiskCrossAccountReadiness,
      ),
      fetchJson<PaperExecutionRunRecord[]>(
        "/api/paper-execution/runs?limit=5",
        fallbackPaperExecutionRuns,
      ),
      fetchJson<PaperApprovalStatus>(
        "/api/paper-execution/approvals/status",
        fallbackPaperApprovalStatus,
      ),
      fetchJson<PaperComplianceApprovalReadiness>(
        "/api/paper-execution/approvals/compliance-readiness",
        fallbackPaperComplianceApprovalReadiness,
      ),
      fetchJson<PaperApprovalHistory[]>(
        "/api/paper-execution/approvals/queue?limit=5",
        fallbackPaperApprovalQueue,
      ),
      fetchJson<PaperApprovalHistory[]>(
        "/api/paper-execution/approvals/history?limit=8",
        fallbackPaperApprovalHistory,
      ),
      fetchJson<ReleaseBaseline>("/api/release/baseline", fallbackReleaseBaseline),
      fetchJson<HostedPaperEnvironment>(
        "/api/hosted-paper/environment",
        fallbackHostedPaperEnvironment,
      ),
      fetchJson<HostedPaperReadiness>(
        "/api/hosted-paper/readiness",
        fallbackHostedPaperReadiness,
      ),
      fetchJson<HostedPaperIdentityReadiness>(
        "/api/hosted-paper/identity-readiness",
        fallbackHostedPaperIdentityReadiness,
      ),
      fetchJson<HostedPaperMockSession>(
        "/api/hosted-paper/session",
        fallbackHostedPaperMockSession,
      ),
      fetchJson<HostedPaperTenantContext>(
        "/api/hosted-paper/tenants/current",
        fallbackHostedPaperTenant,
      ),
      fetchJson<ResearchReviewPacket>(
        "/api/strategy/research-review/packet/sample",
        fallbackResearchReviewPacket,
      ),
    ]);

  const contracts = contractsResponse.data.contracts;
  const selectedPaperRunId = paperExecutionRuns.data[0]?.workflow_run_id;
  const selectedPaperOrderId = paperExecutionRuns.data[0]?.order_id;
  const [paperOmsEvents, paperAuditEvents] = selectedPaperRunId
    ? await Promise.all([
        fetchJson<PaperOmsEventRecord[]>(
          `/api/paper-execution/runs/${selectedPaperRunId}/oms-events`,
          fallbackPaperOmsEvents,
        ),
        fetchJson<PaperAuditEventRecord[]>(
          `/api/paper-execution/runs/${selectedPaperRunId}/audit-events`,
          fallbackPaperAuditEvents,
        ),
      ])
    : [
        { available: true as const, data: fallbackPaperOmsEvents },
        { available: true as const, data: fallbackPaperAuditEvents },
      ];
  const paperExecutionReports = selectedPaperOrderId
    ? await fetchJson<PaperExecutionReport[]>(
        `/api/paper-execution/orders/${selectedPaperOrderId}/execution-reports`,
        fallbackPaperExecutionReports,
      )
    : { available: true as const, data: fallbackPaperExecutionReports };
  const paperRecordsAvailable =
    paperExecutionRuns.available && paperOmsEvents.available && paperAuditEvents.available;
  const paperRecordsError = [
    paperExecutionRuns.available ? undefined : paperExecutionRuns.error,
    paperOmsEvents.available ? undefined : paperOmsEvents.error,
    paperAuditEvents.available ? undefined : paperAuditEvents.error,
  ]
    .filter(Boolean)
    .join("; ");
  const backendIssues = [
    health.available ? undefined : `health: ${health.error}`,
    roadmap.available ? undefined : `roadmap: ${roadmap.error}`,
    contractsResponse.available ? undefined : `contracts: ${contractsResponse.error}`,
    paperStatus.available ? undefined : `paper status: ${paperStatus.error}`,
    paperExecutionStatus.available
      ? undefined
      : `paper execution: ${paperExecutionStatus.error}`,
    paperExecutionPersistence.available
      ? undefined
      : `paper persistence: ${paperExecutionPersistence.error}`,
    paperBrokerSimulationReadiness.available
      ? undefined
      : `paper broker simulation readiness: ${paperBrokerSimulationReadiness.error}`,
    paperOmsReliability.available
      ? undefined
      : `paper reliability: ${paperOmsReliability.error}`,
    paperOmsProductionReadiness.available
      ? undefined
      : `paper OMS production readiness: ${paperOmsProductionReadiness.error}`,
    paperOmsOutbox.available ? undefined : `paper outbox: ${paperOmsOutbox.error}`,
    paperTimeoutCandidates.available
      ? undefined
      : `paper timeout candidates: ${paperTimeoutCandidates.error}`,
    paperAuditIntegrityStatus.available
      ? undefined
      : `paper audit integrity status: ${paperAuditIntegrityStatus.error}`,
    paperAuditIntegrityVerification.available
      ? undefined
      : `paper audit integrity verification: ${paperAuditIntegrityVerification.error}`,
    paperAuditWormReadiness.available
      ? undefined
      : `paper audit WORM readiness: ${paperAuditWormReadiness.error}`,
    paperRiskStatus.available ? undefined : `paper risk: ${paperRiskStatus.error}`,
    paperRiskCrossAccountReadiness.available
      ? undefined
      : `paper risk cross-account readiness: ${paperRiskCrossAccountReadiness.error}`,
    paperExecutionReports.available
      ? undefined
      : `paper execution reports: ${paperExecutionReports.error}`,
    paperExecutionRuns.available ? undefined : `paper records: ${paperExecutionRuns.error}`,
    paperApprovalStatus.available
      ? undefined
      : `paper approval status: ${paperApprovalStatus.error}`,
    paperComplianceApprovalReadiness.available
      ? undefined
      : `paper compliance approval readiness: ${paperComplianceApprovalReadiness.error}`,
    paperApprovalQueue.available
      ? undefined
      : `paper approval queue: ${paperApprovalQueue.error}`,
    paperApprovalHistory.available
      ? undefined
      : `paper approval history: ${paperApprovalHistory.error}`,
    releaseBaseline.available ? undefined : `release baseline: ${releaseBaseline.error}`,
    hostedPaperEnvironment.available
      ? undefined
      : `hosted paper environment: ${hostedPaperEnvironment.error}`,
    hostedPaperReadiness.available
      ? undefined
      : `hosted paper readiness: ${hostedPaperReadiness.error}`,
    hostedPaperMockSession.available
      ? undefined
      : `hosted paper mock session: ${hostedPaperMockSession.error}`,
    hostedPaperTenant.available
      ? undefined
      : `hosted paper current tenant: ${hostedPaperTenant.error}`,
    reviewPacket.available ? undefined : `research packet: ${reviewPacket.error}`,
  ].filter((issue): issue is string => Boolean(issue));
  const backendAvailable = backendIssues.length === 0;

  return (
    <main className="shell" lang={copy.htmlLang}>
      <section className="hero" aria-labelledby="page-title">
        <div>
          <div className="hero-meta">
            <p className="eyebrow">{copy.hero.eyebrow}</p>
            <nav className="language-toggle" aria-label={copy.languageToggleLabel}>
              <a className={language === "en" ? "active" : undefined} href="/?lang=en">
                {copy.languageOptions.en}
              </a>
              <a className={language === "zh" ? "active" : undefined} href="/?lang=zh">
                {copy.languageOptions.zh}
              </a>
            </nav>
          </div>
          <h1 id="page-title">{copy.hero.title}</h1>
          <p className="lead">{copy.hero.lead}</p>
        </div>
        <div className="status-strip" aria-label={copy.hero.safetyAria}>
          <span className="status-pill safe">
            {copy.hero.tradingModePrefix}={paperStatus.data.trading_mode}
          </span>
          <span className="status-pill">{copy.hero.liveDisabled}</span>
          <span className="status-pill">
            {copy.hero.brokerPrefix}: {paperStatus.data.broker_provider}
          </span>
        </div>
      </section>

      <section className="summary-grid" aria-label={copy.summary.ariaLabel}>
        <article className="card">
          <p className="card-kicker">{copy.summary.backendHealth.kicker}</p>
          <h2>
            {health.available
              ? copy.summary.backendHealth.connected
              : copy.summary.backendHealth.fallback}
          </h2>
          <p>{health.available ? health.data.service : health.error}</p>
          <span className={health.available ? "metric ok" : "metric warn"}>{health.data.status}</span>
        </article>

        <article className="card">
          <p className="card-kicker">{copy.summary.safetyMode.kicker}</p>
          <h2>
            {paperStatus.data.live_trading_enabled
              ? copy.summary.safetyMode.reviewRequired
              : copy.summary.safetyMode.paperOnly}
          </h2>
          <p>{paperStatus.data.message}</p>
          <span className={paperStatus.data.live_trading_enabled ? "metric danger" : "metric ok"}>
            ENABLE_LIVE_TRADING={String(paperStatus.data.live_trading_enabled)}
          </span>
        </article>

        <article className="card">
          <p className="card-kicker">{copy.summary.riskDefaults.kicker}</p>
          <h2>{copy.summary.riskDefaults.title}</h2>
          <p>{copy.summary.riskDefaults.text}</p>
          <span className="metric ok">
            MAX_TX_EQUIVALENT_EXPOSURE={paperStatus.data.max_tx_equivalent_exposure}
          </span>
        </article>
      </section>

      <DemoGuidePanel copy={copy.demoGuide} />

      <CommandCenterTabs
        backendAvailable={backendAvailable}
        backendIssues={backendIssues}
        copy={copy.interactions}
        release={
          <>
            <ReleaseBaselinePanel
              available={releaseBaseline.available}
              baseline={releaseBaseline.data}
              copy={copy.release}
              error={releaseBaseline.available ? undefined : releaseBaseline.error}
            />
            <DeploymentDataBoundaryPanel copy={copy.deploymentDataBoundary} />
            <HostedPaperEnvironmentPanel
              available={hostedPaperEnvironment.available}
              copy={copy.hostedPaperEnvironment}
              environment={hostedPaperEnvironment.data}
              error={
                hostedPaperEnvironment.available
                  ? undefined
                  : hostedPaperEnvironment.error
              }
            />
            <HostedPaperReadinessPanel
              available={hostedPaperReadiness.available}
              copy={copy.hostedPaperReadiness}
              error={hostedPaperReadiness.available ? undefined : hostedPaperReadiness.error}
              readiness={hostedPaperReadiness.data}
            />
            <HostedPaperIdentityReadinessPanel
              available={hostedPaperIdentityReadiness.available}
              copy={copy.hostedPaperIdentityReadiness}
              error={
                hostedPaperIdentityReadiness.available
                  ? undefined
                  : hostedPaperIdentityReadiness.error
              }
              readiness={hostedPaperIdentityReadiness.data}
            />
            <HostedPaperMockSessionPanel
              available={hostedPaperMockSession.available && hostedPaperTenant.available}
              copy={copy.hostedPaperSession}
              error={
                [
                  hostedPaperMockSession.available
                    ? undefined
                    : hostedPaperMockSession.error,
                  hostedPaperTenant.available ? undefined : hostedPaperTenant.error,
                ]
                  .filter(Boolean)
                  .join("; ") || undefined
              }
              session={hostedPaperMockSession.data}
              tenant={hostedPaperTenant.data}
            />
            <HostedPaperTenantBoundaryEvidencePanel copy={copy} />
            <LocalBackendDemoModePanel copy={copy.localBackendMode} />
            <LocalDemoSetupPanel copy={copy.localDemoSetup} />
          </>
        }
        paper={
          <>
            <section className="paper-workflow" aria-labelledby="paper-workflow-title">
              <div className="section-heading">
                <p className="eyebrow">{copy.paperExecution.eyebrow}</p>
                <h2 id="paper-workflow-title">{copy.paperExecution.title}</h2>
                <p>{copy.paperExecution.description}</p>
                {!paperExecutionStatus.available ? (
                  <p className="notice">
                    {copy.paperExecution.fallbackPrefix} {paperExecutionStatus.error}
                  </p>
                ) : null}
              </div>
              <div className="paper-workflow-grid">
                <article className="paper-workflow-card">
                  <p className="card-kicker">{copy.paperExecution.approvalKicker}</p>
                  <h3>{copy.paperExecution.approvalTitle}</h3>
                  <ul className="workflow-list">
                    {paperExecutionStatus.data.workflow_statuses.map((status) => (
                      <li key={status}>
                        {copy.paperExecution.statusLabels[
                          status as keyof typeof copy.paperExecution.statusLabels
                        ] ?? status}
                      </li>
                    ))}
                  </ul>
                </article>

                <article className="paper-workflow-card">
                  <p className="card-kicker">{copy.paperExecution.pathKicker}</p>
                  <h3>{copy.paperExecution.pathTitle}</h3>
                  <ol className="workflow-list ordered">
                    {paperExecutionStatus.data.order_path.map((step) => (
                      <li key={step}>
                        {copy.paperExecution.pathLabels[
                          step as keyof typeof copy.paperExecution.pathLabels
                        ] ?? step}
                      </li>
                    ))}
                  </ol>
                </article>

                <article className="paper-workflow-card safety">
                  <p className="card-kicker">{copy.paperExecution.safetyKicker}</p>
                  <h3>{copy.paperExecution.safetyTitle}</h3>
                  <p>{copy.paperExecution.safetyText}</p>
                  <div className="workflow-metrics">
                    <span className="metric ok">
                      TRADING_MODE={paperExecutionStatus.data.trading_mode}
                    </span>
                    <span className="metric ok">
                      ENABLE_LIVE_TRADING=
                      {String(paperExecutionStatus.data.live_trading_enabled)}
                    </span>
                    <span className="metric ok">
                      BROKER_PROVIDER={paperExecutionStatus.data.broker_provider}
                    </span>
                    <span className="metric ok">
                      {copy.paperExecution.brokerApiCalled}=
                      {String(paperExecutionStatus.data.broker_api_called)}
                    </span>
                    <span
                      className={paperExecutionPersistence.data.enabled ? "metric ok" : "metric warn"}
                    >
                      {copy.paperExecution.persistenceBackend}:{" "}
                      {paperExecutionPersistence.data.backend}
                    </span>
                    <span className="metric ok">
                      {copy.paperExecution.localOnly}=
                      {String(paperExecutionPersistence.data.local_only)}
                    </span>
                  </div>
                </article>
              </div>
              <div className="persistence-strip" aria-label={copy.paperExecution.persistenceAria}>
                <span>
                  {copy.paperExecution.runs}: {paperExecutionPersistence.data.runs_count}
                </span>
                <span>
                  {copy.paperExecution.omsEvents}:{" "}
                  {paperExecutionPersistence.data.oms_events_count}
                </span>
                <span>
                  {copy.paperExecution.auditEvents}:{" "}
                  {paperExecutionPersistence.data.audit_events_count}
                </span>
                <span>
                  {copy.paperExecution.executionReports}:{" "}
                  {paperExecutionPersistence.data.execution_reports_count}
                </span>
                <span>
                  {copy.paperExecution.outboxItems}:{" "}
                  {paperExecutionPersistence.data.outbox_items_count}
                </span>
                <span>
                  {copy.paperExecution.productionOmsReady}:{" "}
                  {String(paperExecutionPersistence.data.production_oms_ready)}
                </span>
                <span>
                  {copy.paperExecution.dbPath}: {paperExecutionPersistence.data.db_path}
                </span>
              </div>
            </section>

            <PaperRiskGuardrailsPanel
              available={paperRiskStatus.available}
              copy={copy}
              error={paperRiskStatus.available ? undefined : paperRiskStatus.error}
              status={paperRiskStatus.data}
            />

            <PaperRiskCrossAccountReadinessPanel
              available={paperRiskCrossAccountReadiness.available}
              copy={copy.paperRiskCrossAccountReadiness}
              error={
                paperRiskCrossAccountReadiness.available
                  ? undefined
                  : paperRiskCrossAccountReadiness.error
              }
              readiness={paperRiskCrossAccountReadiness.data}
            />

            <PaperApprovalQueuePanel
              available={
                paperApprovalStatus.available &&
                paperApprovalQueue.available &&
                paperApprovalHistory.available
              }
              copy={copy}
              error={
                [
                  paperApprovalStatus.available ? undefined : paperApprovalStatus.error,
                  paperApprovalQueue.available ? undefined : paperApprovalQueue.error,
                  paperApprovalHistory.available ? undefined : paperApprovalHistory.error,
                ]
                  .filter(Boolean)
                  .join("; ") || undefined
              }
              history={paperApprovalHistory.data}
              queue={paperApprovalQueue.data}
              status={paperApprovalStatus.data}
            />

            <PaperComplianceApprovalReadinessPanel
              available={paperComplianceApprovalReadiness.available}
              copy={copy.paperComplianceApprovalReadiness}
              error={
                paperComplianceApprovalReadiness.available
                  ? undefined
                  : paperComplianceApprovalReadiness.error
              }
              readiness={paperComplianceApprovalReadiness.data}
            />

            <PaperApprovalRequestPanel
              available={paperApprovalStatus.available}
              copy={copy}
            />

            <PaperApprovalDecisionPanel
              available={
                paperApprovalStatus.available &&
                paperApprovalQueue.available &&
                paperApprovalHistory.available
              }
              copy={copy}
              queue={paperApprovalQueue.data}
            />

            <PaperSimulationSubmitPanel
              approvalHistories={paperApprovalHistory.data}
              copy={copy}
            />

            <PaperBrokerSimulationModelPanel copy={copy} />

            <PaperBrokerSimulationReadinessPanel
              available={paperBrokerSimulationReadiness.available}
              copy={copy.paperBrokerSimulationReadiness}
              error={
                paperBrokerSimulationReadiness.available
                  ? undefined
                  : paperBrokerSimulationReadiness.error
              }
              readiness={paperBrokerSimulationReadiness.data}
            />

            <PaperBrokerSimulationEvidencePanel copy={copy} />

            <PaperExecutionRecordsPanel
              available={paperRecordsAvailable}
              copy={copy}
              error={paperRecordsError || undefined}
              auditEvents={paperAuditEvents.data}
              omsEvents={paperOmsEvents.data}
              runs={paperExecutionRuns.data}
            />

            <PaperOmsReliabilityPanel
              available={
                paperOmsReliability.available &&
                paperOmsOutbox.available &&
                paperTimeoutCandidates.available &&
                paperExecutionReports.available
              }
              copy={copy}
              error={
                [
                  paperOmsReliability.available ? undefined : paperOmsReliability.error,
                  paperOmsOutbox.available ? undefined : paperOmsOutbox.error,
                  paperTimeoutCandidates.available ? undefined : paperTimeoutCandidates.error,
                  paperExecutionReports.available ? undefined : paperExecutionReports.error,
                ]
                  .filter(Boolean)
                  .join("; ") || undefined
              }
              executionReports={paperExecutionReports.data}
              latestOrderId={selectedPaperOrderId}
              outboxItems={paperOmsOutbox.data}
              reliability={paperOmsReliability.data}
              timeoutCandidates={paperTimeoutCandidates.data}
            />

            <PaperOmsProductionReadinessPanel
              available={paperOmsProductionReadiness.available}
              copy={copy.paperOmsProductionReadiness}
              error={
                paperOmsProductionReadiness.available
                  ? undefined
                  : paperOmsProductionReadiness.error
              }
              readiness={paperOmsProductionReadiness.data}
            />

            <PaperAuditIntegrityPanel
              available={
                paperAuditIntegrityStatus.available &&
                paperAuditIntegrityVerification.available
              }
              copy={copy}
              error={
                [
                  paperAuditIntegrityStatus.available
                    ? undefined
                    : paperAuditIntegrityStatus.error,
                  paperAuditIntegrityVerification.available
                    ? undefined
                    : paperAuditIntegrityVerification.error,
                ]
                  .filter(Boolean)
                  .join("; ") || undefined
              }
              status={paperAuditIntegrityStatus.data}
              verification={paperAuditIntegrityVerification.data}
            />

            <PaperAuditWormReadinessPanel
              available={paperAuditWormReadiness.available}
              copy={copy.paperAuditWormReadiness}
              error={
                paperAuditWormReadiness.available
                  ? undefined
                  : paperAuditWormReadiness.error
              }
              readiness={paperAuditWormReadiness.data}
            />

            <PaperAuditIntegrityEvidencePanel copy={copy} />

            <PaperDemoEvidencePanel copy={copy} />
          </>
        }
        packet={
          <ResearchReviewPacketJsonLoader
            copy={copy}
            key={language}
            initialAvailable={reviewPacket.available}
            initialError={reviewPacket.available ? undefined : reviewPacket.error}
            initialPacket={reviewPacket.data}
            safeSamplePacket={fallbackResearchReviewPacket}
          />
        }
        contracts={
          <>
            <section className="module-section" aria-labelledby="roadmap-title">
              <div className="section-heading">
                <p className="eyebrow">{copy.roadmap.eyebrow}</p>
                <h2 id="roadmap-title">{copy.roadmap.title}</h2>
              </div>
              <div className="phase-grid">
                {roadmap.data.map((phase) => (
                  <article className="module-card" key={phase.phase}>
                    <span className="phase-number">
                      {copy.roadmap.phasePrefix} {phase.phase}
                    </span>
                    <h3>
                      {copy.roadmap.names[
                        phase.phase as keyof typeof copy.roadmap.names
                      ] ?? phase.name}
                    </h3>
                    <p>
                      {copy.roadmap.statusPrefix}:{" "}
                      {copy.roadmap.statuses[
                        phase.status as keyof typeof copy.roadmap.statuses
                      ] ?? phase.status}
                    </p>
                    <span className="metric ok">{phase.safety_mode}</span>
                  </article>
                ))}
              </div>
            </section>

            <section className="dashboard-grid" aria-label={copy.contracts.ariaLabel}>
              <article className="panel">
                <div className="section-heading compact">
                  <p className="eyebrow">{copy.contracts.eyebrow}</p>
                  <h2>{copy.contracts.title}</h2>
                </div>
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>{copy.contracts.headers.symbol}</th>
                        <th>{copy.contracts.headers.pointValue}</th>
                        <th>{copy.contracts.headers.txEquivalent}</th>
                        <th>{copy.contracts.headers.description}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {contracts.map((contract) => (
                        <tr key={contract.symbol}>
                          <td>{contract.symbol}</td>
                          <td>{contract.point_value_twd} TWD</td>
                          <td>{contract.tx_equivalent_ratio}</td>
                          <td>
                            {copy.contracts.descriptions[contract.symbol] ??
                              contract.description}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </article>

              <article className="panel paper-panel">
                <div className="section-heading compact">
                  <p className="eyebrow">{copy.paperPanel.eyebrow}</p>
                  <h2>{copy.paperPanel.title}</h2>
                </div>
                <p>{copy.paperPanel.text}</p>
                <pre>{`POST /api/paper/orders
{
  "symbol": "TMF",
  "side": "BUY",
  "quantity": 1,
  "tx_equivalent_exposure": 0.05,
  "paper_only": true
}`}</pre>
              </article>
            </section>

            <section className="module-section" aria-labelledby="module-roadmap">
              <div className="section-heading">
                <p className="eyebrow">{copy.modules.eyebrow}</p>
                <h2 id="module-roadmap">{copy.modules.title}</h2>
              </div>
              <div className="module-grid">
                {copy.modules.cards.map(([title, text]) => (
                  <article className="module-card" key={title}>
                    <h3>{title}</h3>
                    <p>{text}</p>
                  </article>
                ))}
              </div>
            </section>
          </>
        }
      />
    </main>
  );
}
