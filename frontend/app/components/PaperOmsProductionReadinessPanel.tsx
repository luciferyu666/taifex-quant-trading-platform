import type { DashboardCopy } from "../i18n";

type SafetyDefaults = {
  trading_mode: string;
  enable_live_trading: boolean;
  broker_provider: string;
};

type PaperOmsProductionReadinessCapabilities = {
  order_state_machine_enabled: boolean;
  local_sqlite_persistence_enabled: boolean;
  local_outbox_metadata_enabled: boolean;
  duplicate_idempotency_metadata_enabled: boolean;
  execution_report_metadata_enabled: boolean;
  timeout_candidate_scan_enabled: boolean;
  explicit_paper_timeout_mark_enabled: boolean;
  asynchronous_order_processing_enabled: boolean;
  distributed_durable_queue_enabled: boolean;
  outbox_worker_enabled: boolean;
  full_timeout_worker_enabled: boolean;
  amend_replace_enabled: boolean;
  production_partial_fill_accounting_enabled: boolean;
  broker_execution_report_ingestion_enabled: boolean;
  formal_reconciliation_loop_enabled: boolean;
  production_oms_ready: boolean;
};

type PaperOmsProductionReadinessSafetyFlags = {
  paper_only: boolean;
  read_only: boolean;
  live_trading_enabled: boolean;
  broker_provider: string;
  broker_api_called: boolean;
  order_created: boolean;
  credentials_collected: boolean;
  database_written: boolean;
  external_db_written: boolean;
  production_oms_ready: boolean;
  live_approval_granted: boolean;
  production_trading_ready: boolean;
};

export type PaperOmsProductionReadiness = {
  service: string;
  readiness_state: string;
  summary: string;
  capabilities: PaperOmsProductionReadinessCapabilities;
  safety_defaults: SafetyDefaults;
  safety_flags: PaperOmsProductionReadinessSafetyFlags;
  current_scope: string[];
  missing_for_production_oms: string[];
  required_before_production_oms: string[];
  docs: Record<string, string>;
  warnings: string[];
};

type PaperOmsProductionReadinessPanelProps = {
  available: boolean;
  copy: DashboardCopy["paperOmsProductionReadiness"];
  error?: string;
  readiness: PaperOmsProductionReadiness;
};

const safeTrueFlags = new Set(["paper_only", "read_only"]);
const safeFalseFlags = new Set([
  "live_trading_enabled",
  "broker_api_called",
  "order_created",
  "credentials_collected",
  "database_written",
  "external_db_written",
  "production_oms_ready",
  "live_approval_granted",
  "production_trading_ready",
]);

export function PaperOmsProductionReadinessPanel({
  available,
  copy,
  error,
  readiness,
}: PaperOmsProductionReadinessPanelProps) {
  return (
    <section className="paper-reliability-section" aria-labelledby="paper-oms-production-title">
      <div className="section-heading">
        <p className="eyebrow">{copy.eyebrow}</p>
        <h2 id="paper-oms-production-title">{copy.title}</h2>
        <p>{copy.description}</p>
        {!available ? (
          <p className="notice">
            {copy.fallbackPrefix} {error}
          </p>
        ) : null}
      </div>

      <div className="paper-reliability-grid">
        <article className="paper-record-panel selected-run">
          <p className="card-kicker">{copy.statusKicker}</p>
          <h3>{copy.statusTitle}</h3>
          <p>{readiness.summary}</p>
          <div className="reliability-metrics">
            <span className="metric warn">
              {copy.readinessState}: {readiness.readiness_state}
            </span>
            <span className="metric danger">
              {copy.productionOmsReady}: {String(readiness.capabilities.production_oms_ready)}
            </span>
            <span className="metric ok">
              {copy.localSqlite}: {String(readiness.capabilities.local_sqlite_persistence_enabled)}
            </span>
            <span className="metric ok">
              {copy.stateMachine}: {String(readiness.capabilities.order_state_machine_enabled)}
            </span>
          </div>
        </article>

        <article className="paper-record-panel">
          <p className="card-kicker">{copy.capabilitiesKicker}</p>
          <h3>{copy.capabilitiesTitle}</h3>
          <div className="flag-grid reliability-flags">
            {renderCapability(
              copy,
              "order_state_machine_enabled",
              readiness.capabilities.order_state_machine_enabled,
              true,
            )}
            {renderCapability(
              copy,
              "local_outbox_metadata_enabled",
              readiness.capabilities.local_outbox_metadata_enabled,
              true,
            )}
            {renderCapability(
              copy,
              "duplicate_idempotency_metadata_enabled",
              readiness.capabilities.duplicate_idempotency_metadata_enabled,
              true,
            )}
            {renderCapability(
              copy,
              "execution_report_metadata_enabled",
              readiness.capabilities.execution_report_metadata_enabled,
              true,
            )}
            {renderCapability(
              copy,
              "timeout_candidate_scan_enabled",
              readiness.capabilities.timeout_candidate_scan_enabled,
              true,
            )}
            {renderCapability(
              copy,
              "explicit_paper_timeout_mark_enabled",
              readiness.capabilities.explicit_paper_timeout_mark_enabled,
              true,
            )}
          </div>
        </article>
      </div>

      <div className="paper-reliability-grid secondary">
        <article className="paper-record-panel reliability-wide">
          <p className="card-kicker">{copy.gapsKicker}</p>
          <h3>{copy.gapsTitle}</h3>
          <div className="flag-grid reliability-flags">
            {renderCapability(
              copy,
              "asynchronous_order_processing_enabled",
              readiness.capabilities.asynchronous_order_processing_enabled,
              false,
            )}
            {renderCapability(
              copy,
              "distributed_durable_queue_enabled",
              readiness.capabilities.distributed_durable_queue_enabled,
              false,
            )}
            {renderCapability(
              copy,
              "outbox_worker_enabled",
              readiness.capabilities.outbox_worker_enabled,
              false,
            )}
            {renderCapability(
              copy,
              "full_timeout_worker_enabled",
              readiness.capabilities.full_timeout_worker_enabled,
              false,
            )}
            {renderCapability(
              copy,
              "amend_replace_enabled",
              readiness.capabilities.amend_replace_enabled,
              false,
            )}
            {renderCapability(
              copy,
              "broker_execution_report_ingestion_enabled",
              readiness.capabilities.broker_execution_report_ingestion_enabled,
              false,
            )}
            {renderCapability(
              copy,
              "formal_reconciliation_loop_enabled",
              readiness.capabilities.formal_reconciliation_loop_enabled,
              false,
            )}
          </div>
        </article>

        <article className="paper-record-panel">
          <p className="card-kicker">{copy.currentScopeKicker}</p>
          <h3>{copy.currentScopeTitle}</h3>
          <ul className="warning-list">
            {readiness.current_scope.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
      </div>

      <div className="paper-reliability-grid secondary">
        <article className="paper-record-panel">
          <p className="card-kicker">{copy.missingKicker}</p>
          <h3>{copy.missingTitle}</h3>
          <ul className="warning-list">
            {readiness.missing_for_production_oms.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>

        <article className="paper-record-panel">
          <p className="card-kicker">{copy.requiredKicker}</p>
          <h3>{copy.requiredTitle}</h3>
          <ul className="warning-list">
            {readiness.required_before_production_oms.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>

        <article className="paper-record-panel">
          <p className="card-kicker">{copy.warningsKicker}</p>
          <h3>{copy.warningsTitle}</h3>
          <ul className="warning-list">
            {readiness.warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </article>
      </div>

      <article className="paper-record-panel reliability-wide">
        <p className="card-kicker">{copy.safetyKicker}</p>
        <h3>{copy.safetyTitle}</h3>
        <div className="flag-grid reliability-flags">
          {renderSafetyFlag(copy, "paper_only", readiness.safety_flags.paper_only)}
          {renderSafetyFlag(copy, "read_only", readiness.safety_flags.read_only)}
          {renderSafetyFlag(
            copy,
            "live_trading_enabled",
            readiness.safety_flags.live_trading_enabled,
          )}
          {renderSafetyFlag(copy, "broker_api_called", readiness.safety_flags.broker_api_called)}
          {renderSafetyFlag(copy, "order_created", readiness.safety_flags.order_created)}
          {renderSafetyFlag(
            copy,
            "credentials_collected",
            readiness.safety_flags.credentials_collected,
          )}
          {renderSafetyFlag(copy, "database_written", readiness.safety_flags.database_written)}
          {renderSafetyFlag(
            copy,
            "production_oms_ready",
            readiness.safety_flags.production_oms_ready,
          )}
          {renderSafetyFlag(
            copy,
            "live_approval_granted",
            readiness.safety_flags.live_approval_granted,
          )}
        </div>
      </article>

      <p className="read-only-note">{copy.readOnlyNote}</p>
    </section>
  );
}

function renderCapability(
  copy: DashboardCopy["paperOmsProductionReadiness"],
  key: keyof DashboardCopy["paperOmsProductionReadiness"]["capabilityLabels"],
  value: boolean,
  expectedSafeValue: boolean,
) {
  return (
    <span className={value === expectedSafeValue ? "flag ok" : "flag danger"} key={key}>
      {copy.capabilityLabels[key]}
      <strong>{String(value)}</strong>
    </span>
  );
}

function renderSafetyFlag(
  copy: DashboardCopy["paperOmsProductionReadiness"],
  key: keyof DashboardCopy["paperOmsProductionReadiness"]["safetyLabels"],
  value: boolean,
) {
  const safe =
    (value && safeTrueFlags.has(key)) || (!value && safeFalseFlags.has(key));
  return (
    <span className={safe ? "flag ok" : "flag danger"} key={key}>
      {copy.safetyLabels[key]}
      <strong>{String(value)}</strong>
    </span>
  );
}
