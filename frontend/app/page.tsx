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
  HostedPaperDatastoreReadinessPanel,
  type HostedPaperDatastoreReadiness,
} from "./components/HostedPaperDatastoreReadinessPanel";
import {
  HostedPaperProductionDatastoreReadinessPanel,
  type HostedPaperProductionDatastoreReadiness,
} from "./components/HostedPaperProductionDatastoreReadinessPanel";
import {
  HostedPaperEnvironmentPanel,
  type HostedPaperEnvironment,
} from "./components/HostedPaperEnvironmentPanel";
import {
  HostedPaperReadinessPanel,
  type HostedPaperReadiness,
} from "./components/HostedPaperReadinessPanel";
import {
  HostedWebCommandCenterPanel,
  type HostedWebCommandCenterReadiness,
} from "./components/HostedWebCommandCenterPanel";
import {
  HostedPaperIdentityReadinessPanel,
  type HostedPaperIdentityReadiness,
} from "./components/HostedPaperIdentityReadinessPanel";
import {
  HostedPaperIdentityAccessContractPanel,
  type HostedPaperIdentityAccessContract,
} from "./components/HostedPaperIdentityAccessContractPanel";
import {
  HostedPaperAuthProviderSelectionPanel,
  type HostedPaperAuthProviderSelection,
} from "./components/HostedPaperAuthProviderSelectionPanel";
import {
  HostedPaperSecurityOperationsPanel,
  type HostedPaperSecurityOperationsReadiness,
} from "./components/HostedPaperSecurityOperationsPanel";
import {
  HostedPaperSandboxOnboardingPanel,
  type HostedPaperSandboxOnboardingReadiness,
} from "./components/HostedPaperSandboxOnboardingPanel";
import {
  HostedPaperMockSessionPanel,
  type HostedPaperMockSession,
  type HostedPaperTenantContext,
} from "./components/HostedPaperMockSessionPanel";
import { HostedPaperTenantBoundaryEvidencePanel } from "./components/HostedPaperTenantBoundaryEvidencePanel";
import { LocalBackendDemoModePanel } from "./components/LocalBackendDemoModePanel";
import { LocalDemoSetupPanel } from "./components/LocalDemoSetupPanel";
import { BrowserOnlyMockDemoPanel } from "./components/BrowserOnlyMockDemoPanel";
import { MockBackendDemoPanel } from "./components/MockBackendDemoPanel";
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
import { getCommandCenterApiConfig } from "./apiBase";
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

const commandCenterApiConfig = getCommandCenterApiConfig();
const backendUrl = commandCenterApiConfig.apiBaseUrl;

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

const fallbackHostedPaperDatastoreReadiness: HostedPaperDatastoreReadiness = {
  service: "hosted-paper-managed-datastore-readiness",
  readiness_state: "schema_only_no_hosted_datastore",
  summary:
    "Hosted paper managed datastore is not enabled. This response defines future tenant-scoped paper record models, migration boundary, retention requirements, and audit requirements as read-only metadata.",
  tenant_key: "tenant_id",
  capabilities: {
    managed_datastore_enabled: false,
    hosted_records_writable: false,
    hosted_records_readable: false,
    tenant_key_enforced: false,
    migrations_apply_enabled: false,
    retention_policy_enforced: false,
    audit_append_only_enforced: false,
    local_sqlite_replacement_required: true,
  },
  record_models: [
    {
      record_name: "Paper approval request",
      table_name: "hosted_paper_approval_requests",
      tenant_key: "tenant_id",
      tenant_key_required: true,
      primary_identifiers: ["tenant_id", "approval_request_id"],
      required_fields: [
        "tenant_id",
        "approval_request_id",
        "signal_id",
        "strategy_id",
        "strategy_version",
        "status",
      ],
      audit_requirements: [
        "append-only request creation event",
        "hash-chain reference",
      ],
      retention_class: "paper_approval_governance",
      notes: "Future hosted approval requests must be tenant-scoped.",
    },
    {
      record_name: "Paper workflow run",
      table_name: "hosted_paper_workflow_runs",
      tenant_key: "tenant_id",
      tenant_key_required: true,
      primary_identifiers: ["tenant_id", "workflow_run_id"],
      required_fields: [
        "tenant_id",
        "workflow_run_id",
        "approval_request_id",
        "order_id",
        "idempotency_key",
        "final_oms_status",
      ],
      audit_requirements: [
        "risk evaluation reference",
        "OMS event sequence reference",
      ],
      retention_class: "paper_execution_workflow",
      notes: "Future hosted paper workflow runs remain Paper Only.",
    },
    {
      record_name: "Paper audit event",
      table_name: "hosted_paper_audit_events",
      tenant_key: "tenant_id",
      tenant_key_required: true,
      primary_identifiers: ["tenant_id", "audit_event_id"],
      required_fields: [
        "tenant_id",
        "audit_event_id",
        "workflow_run_id",
        "actor_user_id",
        "previous_hash",
        "event_hash",
      ],
      audit_requirements: [
        "append-only write path",
        "hash-chain continuity",
      ],
      retention_class: "paper_audit_trail",
      notes: "Future hosted audit events must support integrity verification.",
    },
  ],
  migration_boundary: {
    migration_mode: "schema_contract_only",
    dry_run_only: true,
    apply_enabled: false,
    database_url_required_before_apply: true,
    automatic_migration_apply: false,
    connection_attempted: false,
    required_controls_before_apply: [
      "approved managed datastore selection",
      "tenant_id required on every hosted paper table",
      "migration dry-run output reviewed",
      "backup and restore plan documented",
      "retention policy approved",
      "security review completed",
    ],
  },
  retention_requirements: [
    {
      record_group: "approval_records",
      minimum_policy: "retain through customer evaluation window plus review hold",
      delete_behavior: "soft-delete metadata only until retention review",
      export_required: true,
      audit_required: true,
    },
    {
      record_group: "paper_workflow_records",
      minimum_policy: "retain through paper evaluation and audit review period",
      delete_behavior: "tenant-scoped archival before deletion",
      export_required: true,
      audit_required: true,
    },
    {
      record_group: "audit_events",
      minimum_policy: "append-only retention policy required before hosted use",
      delete_behavior: "no direct user deletion path",
      export_required: true,
      audit_required: true,
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
    hosted_paper_datastore: "docs/hosted-paper-managed-datastore-readiness.md",
    hosted_paper_saas_foundation: "docs/hosted-paper-saas-foundation-roadmap.md",
    hosted_paper_environment: "GET /api/hosted-paper/environment",
    auth_boundary: "docs/hosted-paper-auth-boundary-spec.md",
    local_demo: "docs/customer-self-service-demo.md",
  },
  warnings: [
    "This endpoint is a schema-only datastore readiness contract.",
    "No hosted database connection is configured or attempted.",
    "No hosted records are read or written.",
    "Local SQLite remains for local demo mode only.",
    "Production Trading Platform remains NOT READY.",
    "Live trading remains disabled by default.",
  ],
};

const fallbackHostedPaperProductionDatastoreReadiness: HostedPaperProductionDatastoreReadiness = {
  service: "hosted-paper-production-datastore-readiness",
  readiness_state: "contract_only_no_production_datastore",
  summary:
    "Production datastore is not enabled. This contract defines the future managed database, migration, backup, retention, restore, and tenant boundary required before hosted paper records can move beyond local SQLite demo mode.",
  recommended_datastore_pattern: "managed_postgres_via_marketplace_candidate",
  tenant_key: "tenant_id",
  capabilities: {
    production_datastore_enabled: false,
    managed_postgres_selected: false,
    marketplace_provisioning_enabled: false,
    hosted_records_writable: false,
    hosted_records_readable: false,
    migrations_apply_enabled: false,
    backup_policy_configured: false,
    point_in_time_recovery_required: true,
    restore_drill_verified: false,
    retention_policy_enforced: false,
    local_sqlite_allowed_for_production: false,
  },
  record_groups: [
    {
      record_group: "paper_approval",
      table_names: [
        "hosted_paper_approval_requests",
        "hosted_paper_approval_decisions",
      ],
      tenant_key: "tenant_id",
      required_identifiers: [
        "tenant_id",
        "approval_request_id",
        "approval_decision_id",
        "reviewer_user_id",
      ],
      required_controls: [
        "authenticated reviewer identity",
        "tenant-scoped RBAC and ABAC",
        "append-only decision audit trail",
      ],
      backup_required: true,
      retention_required: true,
      restore_required: true,
      local_sqlite_allowed: false,
    },
    {
      record_group: "paper_order",
      table_names: [
        "hosted_paper_workflow_runs",
        "hosted_paper_orders",
        "hosted_paper_risk_evaluations",
      ],
      tenant_key: "tenant_id",
      required_identifiers: [
        "tenant_id",
        "workflow_run_id",
        "order_id",
        "idempotency_key",
      ],
      required_controls: [
        "completed approval_request_id",
        "risk evaluation reference",
        "duplicate order prevention across sessions",
      ],
      backup_required: true,
      retention_required: true,
      restore_required: true,
      local_sqlite_allowed: false,
    },
    {
      record_group: "oms_event",
      table_names: [
        "hosted_paper_oms_events",
        "hosted_paper_execution_reports",
        "hosted_paper_outbox_events",
      ],
      tenant_key: "tenant_id",
      required_identifiers: [
        "tenant_id",
        "workflow_run_id",
        "order_id",
        "event_id",
        "sequence",
      ],
      required_controls: [
        "durable queue/outbox design",
        "deterministic event ordering",
        "timeout and retry metadata",
      ],
      backup_required: true,
      retention_required: true,
      restore_required: true,
      local_sqlite_allowed: false,
    },
    {
      record_group: "audit_event",
      table_names: [
        "hosted_paper_audit_events",
        "hosted_paper_audit_integrity_snapshots",
        "hosted_paper_evidence_exports",
      ],
      tenant_key: "tenant_id",
      required_identifiers: [
        "tenant_id",
        "audit_event_id",
        "actor_user_id",
        "previous_hash",
        "event_hash",
      ],
      required_controls: [
        "append-only audit write path",
        "hash-chain verification",
        "retention and legal hold metadata",
      ],
      backup_required: true,
      retention_required: true,
      restore_required: true,
      local_sqlite_allowed: false,
    },
  ],
  migration_boundary: {
    migration_mode: "contract_only_no_database_connection",
    dry_run_only: true,
    database_url_read: false,
    connection_attempted: false,
    apply_enabled: false,
    automatic_apply_enabled: false,
    backup_before_apply_required: true,
    restore_drill_before_customer_pilot_required: true,
    required_controls_before_apply: [
      "managed Postgres provider selected and security-reviewed",
      "dev/staging/production database separation documented",
      "tenant_id required on every hosted paper table",
      "migration dry-run reviewed",
      "backup policy documented",
      "restore drill documented",
      "retention policy approved",
      "audit integrity requirements reviewed",
    ],
  },
  retention_boundaries: [
    {
      record_group: "paper_approval",
      minimum_requirement:
        "retain through customer evaluation, dispute review, and audit hold",
      delete_behavior: "soft delete request metadata only after retention review",
      export_required: true,
      audit_required: true,
      legal_hold_required_before_delete: true,
    },
    {
      record_group: "paper_order",
      minimum_requirement:
        "retain through paper workflow review and customer evidence export",
      delete_behavior: "archive before deletion; no direct user hard delete",
      export_required: true,
      audit_required: true,
      legal_hold_required_before_delete: true,
    },
    {
      record_group: "oms_event",
      minimum_requirement:
        "retain full event timeline through workflow lifecycle and audit review",
      delete_behavior: "append corrective events instead of mutating history",
      export_required: true,
      audit_required: true,
      legal_hold_required_before_delete: true,
    },
    {
      record_group: "audit_event",
      minimum_requirement: "append-only retention with integrity verification",
      delete_behavior: "no user deletion path before legal and compliance review",
      export_required: true,
      audit_required: true,
      legal_hold_required_before_delete: true,
    },
  ],
  local_sqlite_boundary:
    "Local SQLite remains allowed only for demo and developer workflows. It is not allowed as the production hosted paper datastore.",
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
    production_datastore: "docs/hosted-paper-production-datastore-readiness.md",
    managed_datastore: "docs/hosted-paper-managed-datastore-readiness.md",
    migration_plan: "docs/hosted-paper-managed-datastore-migration-plan.md",
    saas_roadmap: "docs/hosted-paper-saas-foundation-roadmap.md",
    local_data_boundary: "docs/production-local-data-boundary.md",
  },
  warnings: [
    "This endpoint is read-only production datastore readiness metadata.",
    "No production database is selected, provisioned, connected, or written.",
    "No DATABASE_URL is read by this contract.",
    "Local SQLite remains for demo and development only.",
    "Backup, retention, and restore controls are required before hosted use.",
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

const fallbackHostedWebCommandCenterReadiness: HostedWebCommandCenterReadiness = {
  service: "hosted-web-command-center-readiness",
  readiness_state: "environment_aware_connection_contract_only",
  summary:
    "Fallback Web Command Center hosted backend connectivity metadata. The UI can use NEXT_PUBLIC_HOSTED_BACKEND_API_BASE_URL for a future hosted paper backend, but no real hosted auth, hosted datastore, broker access, or live trading is enabled.",
  api_base_url_contract: {
    primary_public_env_var: "NEXT_PUBLIC_HOSTED_BACKEND_API_BASE_URL",
    local_fallback_public_env_var: "NEXT_PUBLIC_BACKEND_URL",
    mode_public_env_var: "NEXT_PUBLIC_COMMAND_CENTER_API_MODE",
    default_local_base_url: "http://localhost:8000",
    server_side_fetch_supported: true,
    browser_fetch_supported_for_read_only_panels: true,
    hosted_backend_requires_https: true,
    secrets_allowed_in_public_env: false,
    broker_credentials_allowed_in_public_env: false,
  },
  identity_display: {
    login_status_displayed: true,
    tenant_displayed: true,
    roles_displayed: true,
    permissions_displayed: true,
    current_identity_source: "mock_session_contract_only",
    real_login_enabled: false,
    customer_account_enabled: false,
    reviewer_login_enabled: false,
    rbac_abac_enforced: false,
    tenant_isolation_enforced: false,
  },
  capabilities: {
    environment_aware_api_base_url_supported: true,
    production_vercel_hosted_backend_connectivity_configurable: true,
    local_backend_fallback_supported: true,
    fallback_sample_mode_supported: true,
    hosted_backend_runtime_enabled: false,
    hosted_paper_customer_workspace_enabled: false,
    hosted_mutations_enabled: false,
    real_auth_provider_enabled: false,
    managed_datastore_enabled: false,
    broker_api_enabled: false,
    credential_collection_enabled: false,
    production_trading_ready: false,
  },
  required_read_endpoints: [
    {
      path: "/health",
      purpose: "Backend health and paper-safe runtime status.",
      read_only: true,
      requires_real_login_before_customer_use: false,
      requires_tenant_isolation_before_customer_use: false,
      mutation: false,
    },
    {
      path: "/api/hosted-paper/session",
      purpose: "Mock session contract for login status, role, and permission display.",
      read_only: true,
      requires_real_login_before_customer_use: true,
      requires_tenant_isolation_before_customer_use: true,
      mutation: false,
    },
    {
      path: "/api/hosted-paper/tenants/current",
      purpose: "Mock tenant context for tenant boundary display.",
      read_only: true,
      requires_real_login_before_customer_use: true,
      requires_tenant_isolation_before_customer_use: true,
      mutation: false,
    },
    {
      path: "/api/hosted-paper/web-command-center/readiness",
      purpose: "Web Command Center hosted backend connectivity contract.",
      read_only: true,
      requires_real_login_before_customer_use: true,
      requires_tenant_isolation_before_customer_use: true,
      mutation: false,
    },
  ],
  safety_defaults: {
    trading_mode: "paper",
    enable_live_trading: false,
    broker_provider: "paper",
  },
  safety_flags: {
    paper_only: true,
    read_only_contract: true,
    live_trading_enabled: false,
    broker_provider: "paper",
    broker_api_called: false,
    order_created: false,
    credentials_collected: false,
    broker_credentials_collected: false,
    auth_provider_enabled: false,
    session_cookie_issued: false,
    customer_account_created: false,
    hosted_datastore_written: false,
    external_db_written: false,
    live_approval_granted: false,
    production_trading_ready: false,
  },
  required_before_customer_hosted_use: [
    "Deploy a reviewed hosted backend runtime for paper-only staging.",
    "Configure NEXT_PUBLIC_HOSTED_BACKEND_API_BASE_URL for the frontend deployment.",
    "Add real login, logout, session validation, and reviewer/customer identity.",
    "Enforce tenant isolation on every hosted request and hosted record.",
    "Enforce RBAC/ABAC before any hosted mutation or paper workflow submit.",
  ],
  docs: {
    hosted_web_command_center: "docs/hosted-web-command-center.md",
    hosted_backend_foundation: "docs/hosted-backend-api-deployment-foundation.md",
    hosted_paper_saas_foundation: "docs/hosted-paper-saas-foundation-roadmap.md",
  },
  warnings: [
    "Fallback hosted Web Command Center metadata. Backend is unavailable.",
    "A public API base URL is configuration, not authentication.",
    "No real login, session cookie, customer account, or tenant record is created.",
    "Production Trading Platform remains NOT READY.",
    "Live trading remains disabled by default.",
  ],
};

const fallbackHostedPaperSecurityOperationsReadiness: HostedPaperSecurityOperationsReadiness = {
  service: "hosted-paper-security-operations-readiness",
  readiness_state: "readiness_contract_only_not_operational",
  summary:
    "Fallback security and operations readiness metadata. Required controls are documented for future hosted paper SaaS, but no secret store, rate limiter, audit monitor, observability pipeline, staging smoke gate, load test, abuse test, or auth boundary test is enabled.",
  capabilities: {
    secrets_management_enabled: false,
    vault_or_managed_secret_store_enabled: false,
    static_secret_scan_gate_enabled: true,
    rate_limiting_enabled: false,
    audit_monitoring_enabled: false,
    observability_pipeline_enabled: false,
    ci_release_readiness_gate_enabled: true,
    production_smoke_gate_enabled: true,
    staging_smoke_gate_enabled: false,
    load_test_gate_enabled: false,
    abuse_test_gate_enabled: false,
    auth_boundary_test_gate_enabled: false,
    incident_runbook_enabled: false,
    production_operations_ready: false,
  },
  controls: [
    {
      control: "secrets_management",
      purpose: "Store hosted credentials and signing material outside source code.",
      current_status: "contract_only_no_secret_store_connected",
      enabled: false,
      required_before_hosted_customer_use: true,
      required_before_production_trading: true,
      notes: [],
    },
    {
      control: "rate_limiting",
      purpose: "Protect hosted paper endpoints from accidental or abusive traffic.",
      current_status: "not_enabled_rate_limit_policy_required",
      enabled: false,
      required_before_hosted_customer_use: true,
      required_before_production_trading: true,
      notes: [],
    },
    {
      control: "audit_monitoring",
      purpose: "Alert on suspicious approval, OMS, audit, and integrity events.",
      current_status: "not_enabled_monitoring_rules_required",
      enabled: false,
      required_before_hosted_customer_use: true,
      required_before_production_trading: true,
      notes: [],
    },
    {
      control: "observability",
      purpose: "Trace paper request flow and collect logs/metrics safely.",
      current_status: "placeholder_only_no_hosted_pipeline",
      enabled: false,
      required_before_hosted_customer_use: true,
      required_before_production_trading: true,
      notes: [],
    },
    {
      control: "ci_cd_deployment_gates",
      purpose: "Block unsafe releases and verify production-facing safety copy.",
      current_status: "release_readiness_and_production_smoke_gate_enabled",
      enabled: true,
      required_before_hosted_customer_use: false,
      required_before_production_trading: true,
      notes: [],
    },
    {
      control: "staging_smoke_test",
      purpose: "Verify a staging hosted backend before customer-facing rollout.",
      current_status: "not_enabled_staging_backend_required",
      enabled: false,
      required_before_hosted_customer_use: true,
      required_before_production_trading: true,
      notes: [],
    },
    {
      control: "basic_load_abuse_testing",
      purpose: "Exercise rate limits, denial paths, and read-only endpoint resilience.",
      current_status: "not_executed_test_plan_required",
      enabled: false,
      required_before_hosted_customer_use: true,
      required_before_production_trading: true,
      notes: [],
    },
    {
      control: "auth_boundary_testing",
      purpose: "Verify unauthenticated, cross-tenant, and role-denied paths.",
      current_status: "not_enabled_real_auth_required",
      enabled: false,
      required_before_hosted_customer_use: true,
      required_before_production_trading: true,
      notes: [],
    },
  ],
  required_next_slices: [
    "Select managed secrets store and define rotation policy.",
    "Add non-production rate limit middleware and denial evidence.",
    "Define audit monitoring alerts for paper approval and OMS events.",
    "Wire OpenTelemetry/log drain preview in staging only.",
    "Add staging smoke test against a non-production hosted backend.",
    "Add basic load and abuse tests against read-only endpoints.",
    "Add auth boundary negative tests before any real login provider.",
    "Create incident response and rollback runbooks.",
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
    broker_provider: "paper",
    secrets_stored: false,
    credentials_collected: false,
    broker_credentials_collected: false,
    auth_provider_enabled: false,
    customer_account_created: false,
    hosted_datastore_written: false,
    external_db_written: false,
    broker_api_called: false,
    order_created: false,
    load_test_executed: false,
    abuse_test_executed: false,
    production_security_approval: false,
    production_trading_ready: false,
  },
  docs: {
    security_operations_readiness:
      "docs/hosted-paper-security-operations-readiness.md",
    security_vault_asvs: "docs/security-vault-asvs.md",
    observability_dr_event_sourcing: "docs/observability-dr-event-sourcing.md",
    hosted_backend_foundation: "docs/hosted-backend-api-deployment-foundation.md",
    hosted_paper_saas_foundation: "docs/hosted-paper-saas-foundation-roadmap.md",
  },
  warnings: [
    "Fallback security operations metadata. Backend is unavailable.",
    "No real secret store, rate limiter, hosted audit monitor, or log drain is enabled.",
    "No load, abuse, or real auth boundary test was executed by this endpoint.",
    "Hosted paper SaaS remains NOT READY for customer production use.",
    "Production Trading Platform remains NOT READY.",
    "Live trading remains disabled by default.",
  ],
};

const fallbackHostedPaperSandboxOnboardingReadiness: HostedPaperSandboxOnboardingReadiness = {
  service: "hosted-paper-sandbox-onboarding-readiness",
  readiness_state: "contract_only_no_online_sandbox_tenant",
  summary:
    "Fallback sandbox onboarding readiness metadata. Customer self-service should eventually use a browser-only Paper Only sandbox tenant with guided demo data, but no online sandbox tenant, login, hosted datastore, broker call, or live trading path is enabled.",
  customer_onboarding_goal:
    "Provide an online Paper Only sandbox tenant with guided demo data, visible safety boundaries, and no live-trading controls.",
  current_blockers: [
    "No hosted sandbox tenant provisioning exists.",
    "No customer login or session provider is enabled.",
    "No tenant-isolated managed datastore is connected.",
    "No hosted paper approval, OMS, audit, or evidence records are written.",
    "Production Vercel remains a read-only UI surface unless connected to a reviewed hosted backend.",
  ],
  capabilities: {
    online_sandbox_tenant_enabled: false,
    browser_only_customer_onboarding_enabled: false,
    hosted_backend_enabled: false,
    managed_datastore_enabled: false,
    real_login_enabled: false,
    tenant_isolation_enforced: false,
    guided_demo_data_contract_defined: true,
    guided_demo_data_hosted: false,
    paper_only_boundary_visible: true,
    live_trading_controls_visible: false,
  },
  guided_demo_dataset_contract: {
    dataset_id: "hosted-paper-guided-demo-contract-v1",
    dataset_status: "contract_only_not_hosted",
    intended_use:
      "Future guided customer demo data for paper approval requests, paper-only reviewer decisions, controlled paper submit, OMS timeline, audit timeline, risk evidence, and broker simulation evidence.",
    records_included: [
      "sample_paper_approval_request",
      "sample_reviewer_decisions",
      "sample_paper_workflow_run",
      "sample_oms_events",
      "sample_audit_events",
      "sample_risk_evaluation",
      "sample_broker_simulation_preview",
      "sample_readiness_evidence",
    ],
    hosted_persistence_enabled: false,
    generated_from_real_account: false,
    external_market_data_downloaded: false,
    warnings: [
      "Guided demo data is a contract only and is not hosted by this release.",
      "Future demo records must remain simulated, Paper Only, and clearly labeled.",
      "Future demo records must not contain broker credentials, real account data, or investment advice.",
    ],
  },
  required_onboarding_steps: [
    {
      sequence: 1,
      step: "hosted_backend_staging",
      current_status: "contract_only",
      required_before_customer_self_service: true,
      notes: [],
    },
    {
      sequence: 2,
      step: "managed_tenant_datastore",
      current_status: "migration_plan_only",
      required_before_customer_self_service: true,
      notes: [],
    },
    {
      sequence: 3,
      step: "customer_login_session",
      current_status: "provider_not_selected",
      required_before_customer_self_service: true,
      notes: [],
    },
    {
      sequence: 4,
      step: "sandbox_tenant_provisioning",
      current_status: "not_enabled",
      required_before_customer_self_service: true,
      notes: [],
    },
    {
      sequence: 5,
      step: "guided_demo_data",
      current_status: "contract_only",
      required_before_customer_self_service: true,
      notes: [],
    },
    {
      sequence: 6,
      step: "customer_browser_demo_flow",
      current_status: "local_demo_required_today",
      required_before_customer_self_service: true,
      notes: [],
    },
    {
      sequence: 7,
      step: "security_operations_gate",
      current_status: "readiness_contract_only",
      required_before_customer_self_service: true,
      notes: [],
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
    broker_provider: "paper",
    online_sandbox_tenant_created: false,
    customer_account_created: false,
    login_enabled: false,
    session_cookie_issued: false,
    tenant_record_created: false,
    hosted_datastore_written: false,
    external_db_written: false,
    broker_api_called: false,
    broker_credentials_collected: false,
    order_created: false,
    real_money_visible: false,
    production_customer_onboarding_ready: false,
    production_trading_ready: false,
  },
  docs: {
    sandbox_onboarding_readiness:
      "docs/hosted-paper-sandbox-tenant-onboarding-readiness.md",
    hosted_paper_saas_foundation: "docs/hosted-paper-saas-foundation-roadmap.md",
    hosted_paper_environment: "docs/hosted-backend-api-deployment-foundation.md",
    customer_self_service_demo: "docs/customer-self-service-demo.md",
    paper_shadow_live_boundary: "docs/paper-shadow-live-boundary.md",
  },
  warnings: [
    "Fallback sandbox onboarding metadata. Backend is unavailable.",
    "No online sandbox tenant is created.",
    "No customer account, reviewer account, login, or session is created.",
    "No hosted datastore is written.",
    "No broker API is called and no broker credentials are collected.",
    "No order is created and no live trading approval exists.",
    "Production Trading Platform remains NOT READY.",
    "Live trading remains disabled by default.",
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

const fallbackHostedPaperIdentityAccessContract: HostedPaperIdentityAccessContract = {
  service: "hosted-paper-identity-access-contract",
  contract_state: "contract_only_not_implemented",
  summary:
    "Read-only contract for the future hosted paper identity layer. It separates customer, reviewer, operator, and admin roles, but does not enable real login, sessions, RBAC/ABAC enforcement, tenant writes, credentials, broker access, or live trading.",
  identity_provider: {
    provider_required: true,
    provider_selected: false,
    provider_name: "none",
    real_login_enabled: false,
    customer_signup_enabled: false,
    reviewer_login_enabled: false,
    session_issuance_enabled: false,
    session_cookie_issued: false,
    mfa_required_for_privileged_roles: true,
    mfa_enabled: false,
  },
  session_boundary: {
    required_claims: [
      "user_id",
      "tenant_id",
      "session_id",
      "roles",
      "permissions",
      "paper_only",
      "environment",
    ],
    session_lifecycle_required: ["issue", "expire", "rotate", "revoke", "logout"],
    session_storage: "future_secure_http_only_cookie_or_token",
    session_validation_enabled: false,
    session_audit_required: true,
  },
  tenant_boundary: {
    tenant_id_required_on_every_request: true,
    tenant_id_required_on_every_record: true,
    membership_required: true,
    cross_tenant_access_allowed: false,
    tenant_isolation_enforced: false,
    tenant_admin_role_required_for_membership_changes: true,
    local_sqlite_allowed_for_hosted_tenant_records: false,
  },
  role_permission_matrix: [
    {
      role: "customer",
      purpose:
        "Future tenant member who can read the customer's own paper workspace, paper evidence, and demo status.",
      allowed_read_permissions: [
        "read_own_tenant_readiness",
        "read_own_paper_records",
        "read_own_evidence",
      ],
      allowed_future_mutations: [],
      denied_permissions: [
        "record_reviewer_decision",
        "submit_approved_paper_workflow",
        "manage_tenant_members",
        "enable_live_trading",
        "upload_broker_credentials",
        "create_real_order",
        "connect_real_broker",
        "cross_tenant_access",
      ],
      requires_mfa: false,
      requires_dual_review: false,
      can_enable_live_trading: false,
      can_upload_broker_credentials: false,
    },
    {
      role: "reviewer",
      purpose:
        "Future paper-only reviewer for research and risk decisions inside one tenant boundary.",
      allowed_read_permissions: [
        "read_tenant_readiness",
        "read_tenant_approval_queue",
        "read_tenant_paper_records",
        "read_tenant_evidence",
      ],
      allowed_future_mutations: [
        "record_research_review_decision",
        "record_risk_review_decision",
      ],
      denied_permissions: [
        "submit_approved_paper_workflow",
        "manage_tenant_members",
        "enable_live_trading",
        "upload_broker_credentials",
        "create_real_order",
        "connect_real_broker",
        "cross_tenant_access",
      ],
      requires_mfa: true,
      requires_dual_review: false,
      can_enable_live_trading: false,
      can_upload_broker_credentials: false,
    },
    {
      role: "operator",
      purpose:
        "Future paper-only operator who can submit a paper workflow only after completed approval sequence.",
      allowed_read_permissions: [
        "read_tenant_readiness",
        "read_completed_approval_requests",
        "read_tenant_paper_records",
      ],
      allowed_future_mutations: ["submit_approved_paper_workflow"],
      denied_permissions: [
        "record_reviewer_decision",
        "manage_tenant_members",
        "enable_live_trading",
        "upload_broker_credentials",
        "create_real_order",
        "connect_real_broker",
        "cross_tenant_access",
      ],
      requires_mfa: true,
      requires_dual_review: true,
      can_enable_live_trading: false,
      can_upload_broker_credentials: false,
    },
    {
      role: "admin",
      purpose:
        "Future tenant administrator for paper-only tenant membership and configuration review.",
      allowed_read_permissions: [
        "read_tenant_readiness",
        "read_tenant_members",
        "read_tenant_paper_records",
        "read_tenant_audit_events",
      ],
      allowed_future_mutations: ["manage_tenant_members", "rotate_tenant_reviewers"],
      denied_permissions: [
        "submit_approved_paper_workflow_without_review",
        "enable_live_trading",
        "upload_broker_credentials",
        "create_real_order",
        "connect_real_broker",
        "cross_tenant_access",
      ],
      requires_mfa: true,
      requires_dual_review: false,
      can_enable_live_trading: false,
      can_upload_broker_credentials: false,
    },
  ],
  abac_policies: [
    {
      policy: "paper_only_mode",
      required_attributes: ["paper_only=true", "live_trading_enabled=false"],
      enforcement_target: "all hosted paper requests",
      enabled: false,
    },
    {
      policy: "tenant_scope",
      required_attributes: ["tenant_id", "membership_status=active"],
      enforcement_target: "all tenant record reads and future writes",
      enabled: false,
    },
    {
      policy: "environment_scope",
      required_attributes: ["environment in dev|staging", "production_trading_ready=false"],
      enforcement_target: "hosted paper API routing",
      enabled: false,
    },
    {
      policy: "approval_state",
      required_attributes: [
        "approval_request_id",
        "required_review_sequence=complete",
        "approval_for_live=false",
      ],
      enforcement_target: "future paper workflow submission",
      enabled: false,
    },
  ],
  blocked_until_real_identity: [
    "Hosted customer account login.",
    "Reviewer login and session issuance.",
    "Tenant membership management.",
    "RBAC enforcement for reviewer, admin, customer, and operator roles.",
    "ABAC enforcement for paper-only mode, tenant scope, environment, and approval state.",
    "Hosted paper approval mutations.",
    "Hosted paper workflow submission.",
    "Hosted tenant paper record queries backed by managed datastore.",
  ],
  implementation_sequence: [
    "Select and security-review an authentication provider.",
    "Implement tenant and membership datastore models.",
    "Implement real login, logout, session issue, session rotation, and session expiry.",
    "Attach tenant_id, roles, permissions, and attributes to every hosted request.",
    "Enforce RBAC for reviewer, admin, customer, and operator permissions.",
    "Enforce ABAC for paper-only mode, tenant scope, environment, and approval state.",
    "Add identity and authorization audit events.",
    "Run security review before hosted customer pilot.",
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
    broker_provider: "paper",
    auth_provider_enabled: false,
    real_login_enabled: false,
    customer_account_created: false,
    reviewer_login_created: false,
    admin_login_created: false,
    operator_login_created: false,
    session_cookie_issued: false,
    rbac_enforced: false,
    abac_enforced: false,
    tenant_isolation_enforced: false,
    hosted_datastore_written: false,
    external_db_written: false,
    credentials_collected: false,
    broker_credentials_collected: false,
    broker_api_called: false,
    order_created: false,
    production_trading_ready: false,
  },
  docs: {
    identity_access_contract: "docs/hosted-paper-identity-access-contract.md",
    auth_boundary: "docs/hosted-paper-auth-boundary-spec.md",
    identity_readiness: "docs/hosted-paper-identity-rbac-tenant-readiness.md",
    saas_roadmap: "docs/hosted-paper-saas-foundation-roadmap.md",
  },
  warnings: [
    "This is a read-only identity access contract, not a login system.",
    "No customer account, reviewer login, admin login, operator login, or session is created.",
    "RBAC and ABAC are required for hosted SaaS but are not enforced by this slice.",
    "No credentials are collected, no hosted datastore is written, no broker is called, and no order is created.",
    "Production Trading Platform remains NOT READY.",
    "Live trading remains disabled by default.",
  ],
};

const fallbackHostedPaperAuthProviderSelection: HostedPaperAuthProviderSelection = {
  service: "hosted-paper-auth-provider-selection",
  selection_state: "selection_matrix_only",
  summary:
    "Read-only provider selection matrix for future hosted paper identity. It compares Clerk, Auth0, Descope, and Vercel OIDC / Sign in with Vercel against paper-only SaaS needs without selecting, installing, or enabling any provider.",
  candidates: [
    {
      provider: "Clerk",
      category: "Vercel Marketplace auth platform",
      fit_summary:
        "Strong candidate for a fast hosted paper SaaS pilot on Vercel when prebuilt UI, session management, and lower integration overhead are more important than deep enterprise identity customization.",
      strengths: [],
      watch_items: [],
      paper_saas_fit: "strong_pilot_candidate",
      recommended_use: "Shortlist for first hosted paper customer pilot evaluation.",
      integration_enabled: false,
      credentials_required_now: false,
      secrets_added: false,
      customer_accounts_created: false,
    },
    {
      provider: "Auth0",
      category: "Enterprise identity platform",
      fit_summary:
        "Strong candidate when enterprise SSO, mature identity governance, custom claims, and large organization requirements dominate.",
      strengths: [],
      watch_items: [],
      paper_saas_fit: "strong_enterprise_candidate",
      recommended_use: "Shortlist for enterprise or broker-partner paper SaaS pilots.",
      integration_enabled: false,
      credentials_required_now: false,
      secrets_added: false,
      customer_accounts_created: false,
    },
    {
      provider: "Descope",
      category: "Passwordless and workflow-oriented auth platform",
      fit_summary:
        "Candidate for passwordless customer onboarding and guided identity flows where visual flow configuration is useful.",
      strengths: [],
      watch_items: [],
      paper_saas_fit: "pilot_candidate",
      recommended_use: "Evaluate if passwordless onboarding is a product priority.",
      integration_enabled: false,
      credentials_required_now: false,
      secrets_added: false,
      customer_accounts_created: false,
    },
    {
      provider: "Vercel OIDC / Sign in with Vercel",
      category: "Developer-facing OAuth/OIDC identity",
      fit_summary:
        "Useful for developer/operator tooling where users already have Vercel accounts, but not a default fit for general customer SaaS login.",
      strengths: [],
      watch_items: [],
      paper_saas_fit: "internal_operator_candidate",
      recommended_use: "Keep as an internal/admin tooling option, not customer default.",
      integration_enabled: false,
      credentials_required_now: false,
      secrets_added: false,
      customer_accounts_created: false,
    },
  ],
  criteria: [
    {
      criterion: "tenant_boundary",
      why_it_matters: "Every hosted paper record and request must be scoped by tenant_id.",
      required_before_customer_pilot: true,
    },
    {
      criterion: "role_mapping",
      why_it_matters: "Customer, reviewer, operator, and admin permissions must remain separate.",
      required_before_customer_pilot: true,
    },
    {
      criterion: "session_security",
      why_it_matters: "Sessions need expiry, rotation, revocation, logout, and audit events.",
      required_before_customer_pilot: true,
    },
  ],
  non_goals: [
    "Do not install provider SDKs in this slice.",
    "Do not create login or signup pages.",
    "Do not create customer accounts.",
    "Do not issue session cookies.",
    "Do not add secrets or environment variables.",
    "Do not write hosted datastore records.",
    "Do not collect broker credentials.",
    "Do not call brokers or create orders.",
    "Do not enable live trading.",
  ],
  recommended_next_steps: [
    "Review product requirements for customer, reviewer, operator, and admin roles.",
    "Confirm tenant membership and audit requirements before choosing a provider.",
    "Run a security review of shortlisted provider data handling and session behavior.",
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
    broker_provider: "paper",
    provider_selected: false,
    integration_enabled: false,
    auth_provider_enabled: false,
    customer_account_created: false,
    reviewer_login_created: false,
    session_cookie_issued: false,
    credentials_collected: false,
    secrets_added: false,
    hosted_datastore_written: false,
    broker_api_called: false,
    order_created: false,
    production_trading_ready: false,
  },
  docs: {
    auth_provider_selection: "docs/hosted-paper-auth-provider-selection-matrix.md",
    identity_access_contract: "docs/hosted-paper-identity-access-contract.md",
    auth_boundary: "docs/hosted-paper-auth-boundary-spec.md",
    saas_roadmap: "docs/hosted-paper-saas-foundation-roadmap.md",
  },
  warnings: [
    "This is a read-only selection matrix, not an authentication integration.",
    "No provider is selected or enabled by this slice.",
    "No credentials, secrets, customer accounts, sessions, hosted records, broker calls, or orders are created.",
    "Production Trading Platform remains NOT READY.",
    "Live trading remains disabled by default.",
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
    hostedPaperDatastoreReadiness,
    hostedPaperProductionDatastoreReadiness,
    hostedPaperReadiness,
    hostedWebCommandCenterReadiness,
    hostedPaperIdentityReadiness,
    hostedPaperIdentityAccessContract,
    hostedPaperAuthProviderSelection,
    hostedPaperSecurityOperationsReadiness,
    hostedPaperSandboxOnboardingReadiness,
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
      fetchJson<HostedPaperDatastoreReadiness>(
        "/api/hosted-paper/datastore-readiness",
        fallbackHostedPaperDatastoreReadiness,
      ),
      fetchJson<HostedPaperProductionDatastoreReadiness>(
        "/api/hosted-paper/production-datastore/readiness",
        fallbackHostedPaperProductionDatastoreReadiness,
      ),
      fetchJson<HostedPaperReadiness>(
        "/api/hosted-paper/readiness",
        fallbackHostedPaperReadiness,
      ),
      fetchJson<HostedWebCommandCenterReadiness>(
        "/api/hosted-paper/web-command-center/readiness",
        fallbackHostedWebCommandCenterReadiness,
      ),
      fetchJson<HostedPaperIdentityReadiness>(
        "/api/hosted-paper/identity-readiness",
        fallbackHostedPaperIdentityReadiness,
      ),
      fetchJson<HostedPaperIdentityAccessContract>(
        "/api/hosted-paper/identity-access-contract",
        fallbackHostedPaperIdentityAccessContract,
      ),
      fetchJson<HostedPaperAuthProviderSelection>(
        "/api/hosted-paper/auth-provider-selection",
        fallbackHostedPaperAuthProviderSelection,
      ),
      fetchJson<HostedPaperSecurityOperationsReadiness>(
        "/api/hosted-paper/security-operations/readiness",
        fallbackHostedPaperSecurityOperationsReadiness,
      ),
      fetchJson<HostedPaperSandboxOnboardingReadiness>(
        "/api/hosted-paper/sandbox-tenant/onboarding-readiness",
        fallbackHostedPaperSandboxOnboardingReadiness,
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
    hostedPaperDatastoreReadiness.available
      ? undefined
      : `hosted paper datastore: ${hostedPaperDatastoreReadiness.error}`,
    hostedPaperReadiness.available
      ? undefined
      : `hosted paper readiness: ${hostedPaperReadiness.error}`,
    hostedWebCommandCenterReadiness.available
      ? undefined
      : `hosted Web Command Center: ${hostedWebCommandCenterReadiness.error}`,
    hostedPaperSecurityOperationsReadiness.available
      ? undefined
      : `hosted paper security operations: ${hostedPaperSecurityOperationsReadiness.error}`,
    hostedPaperSandboxOnboardingReadiness.available
      ? undefined
      : `hosted paper sandbox onboarding: ${hostedPaperSandboxOnboardingReadiness.error}`,
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
            <HostedWebCommandCenterPanel
              apiConfig={commandCenterApiConfig}
              backendAvailable={health.available}
              backendError={health.available ? undefined : health.error}
              copy={copy.hostedWebCommandCenter}
              readiness={hostedWebCommandCenterReadiness.data}
              readinessAvailable={hostedWebCommandCenterReadiness.available}
              readinessError={
                hostedWebCommandCenterReadiness.available
                  ? undefined
                  : hostedWebCommandCenterReadiness.error
              }
              session={hostedPaperMockSession.data}
              sessionAvailable={hostedPaperMockSession.available}
              tenant={hostedPaperTenant.data}
              tenantAvailable={hostedPaperTenant.available}
            />
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
            <HostedPaperDatastoreReadinessPanel
              available={hostedPaperDatastoreReadiness.available}
              copy={copy.hostedPaperDatastore}
              error={
                hostedPaperDatastoreReadiness.available
                  ? undefined
                  : hostedPaperDatastoreReadiness.error
              }
              readiness={hostedPaperDatastoreReadiness.data}
            />
            <HostedPaperProductionDatastoreReadinessPanel
              available={hostedPaperProductionDatastoreReadiness.available}
              copy={copy.hostedPaperProductionDatastore}
              error={
                hostedPaperProductionDatastoreReadiness.available
                  ? undefined
                  : hostedPaperProductionDatastoreReadiness.error
              }
              readiness={hostedPaperProductionDatastoreReadiness.data}
            />
            <HostedPaperReadinessPanel
              available={hostedPaperReadiness.available}
              copy={copy.hostedPaperReadiness}
              error={hostedPaperReadiness.available ? undefined : hostedPaperReadiness.error}
              readiness={hostedPaperReadiness.data}
            />
            <HostedPaperSandboxOnboardingPanel
              available={hostedPaperSandboxOnboardingReadiness.available}
              copy={copy.hostedPaperSandboxOnboarding}
              error={
                hostedPaperSandboxOnboardingReadiness.available
                  ? undefined
                  : hostedPaperSandboxOnboardingReadiness.error
              }
              readiness={hostedPaperSandboxOnboardingReadiness.data}
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
            <HostedPaperIdentityAccessContractPanel
              available={hostedPaperIdentityAccessContract.available}
              contract={hostedPaperIdentityAccessContract.data}
              copy={copy.hostedPaperIdentityAccessContract}
              error={
                hostedPaperIdentityAccessContract.available
                  ? undefined
                  : hostedPaperIdentityAccessContract.error
              }
            />
            <HostedPaperAuthProviderSelectionPanel
              available={hostedPaperAuthProviderSelection.available}
              copy={copy.hostedPaperAuthProviderSelection}
              error={
                hostedPaperAuthProviderSelection.available
                  ? undefined
                  : hostedPaperAuthProviderSelection.error
              }
              selection={hostedPaperAuthProviderSelection.data}
            />
            <HostedPaperSecurityOperationsPanel
              available={hostedPaperSecurityOperationsReadiness.available}
              copy={copy.hostedPaperSecurityOperations}
              error={
                hostedPaperSecurityOperationsReadiness.available
                  ? undefined
                  : hostedPaperSecurityOperationsReadiness.error
              }
              readiness={hostedPaperSecurityOperationsReadiness.data}
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

            <BrowserOnlyMockDemoPanel copy={copy.browserOnlyMockDemo} />

            <MockBackendDemoPanel copy={copy.mockBackendDemo} />

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
