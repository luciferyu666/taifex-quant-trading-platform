import type { DashboardCopy } from "../i18n";

type SafetyDefaults = {
  trading_mode: string;
  enable_live_trading: boolean;
  broker_provider: string;
};

type PaperBrokerSimulationReadinessCapabilities = {
  deterministic_broker_simulation_enabled: boolean;
  local_quote_snapshot_preview_enabled: boolean;
  paper_ack_reject_partial_fill_fill_cancel_enabled: boolean;
  caller_provided_quote_only: boolean;
  real_market_matching_engine_enabled: boolean;
  exchange_order_book_replay_enabled: boolean;
  broker_execution_report_model_enabled: boolean;
  latency_queue_position_model_enabled: boolean;
  slippage_liquidity_calibration_enabled: boolean;
  real_account_reconciliation_enabled: boolean;
  production_execution_model: boolean;
};

type PaperBrokerSimulationReadinessSafetyFlags = {
  paper_only: boolean;
  read_only: boolean;
  live_trading_enabled: boolean;
  broker_provider: string;
  broker_api_called: boolean;
  external_market_data_downloaded: boolean;
  real_order_created: boolean;
  order_created: boolean;
  credentials_collected: boolean;
  database_written: boolean;
  external_db_written: boolean;
  production_execution_model: boolean;
  production_trading_ready: boolean;
};

export type PaperBrokerSimulationReadiness = {
  service: string;
  readiness_state: string;
  summary: string;
  capabilities: PaperBrokerSimulationReadinessCapabilities;
  safety_defaults: SafetyDefaults;
  safety_flags: PaperBrokerSimulationReadinessSafetyFlags;
  current_scope: string[];
  missing_for_production_execution_model: string[];
  required_before_production_execution_model: string[];
  docs: Record<string, string>;
  warnings: string[];
};

type PaperBrokerSimulationReadinessPanelProps = {
  available: boolean;
  copy: DashboardCopy["paperBrokerSimulationReadiness"];
  error?: string;
  readiness: PaperBrokerSimulationReadiness;
};

const safeTrueFlags = new Set(["paper_only", "read_only"]);
const safeFalseFlags = new Set([
  "live_trading_enabled",
  "broker_api_called",
  "external_market_data_downloaded",
  "real_order_created",
  "order_created",
  "credentials_collected",
  "database_written",
  "external_db_written",
  "production_execution_model",
  "production_trading_ready",
]);

export function PaperBrokerSimulationReadinessPanel({
  available,
  copy,
  error,
  readiness,
}: PaperBrokerSimulationReadinessPanelProps) {
  return (
    <section
      className="paper-reliability-section"
      aria-labelledby="paper-broker-simulation-readiness-title"
    >
      <div className="section-heading">
        <p className="eyebrow">{copy.eyebrow}</p>
        <h2 id="paper-broker-simulation-readiness-title">{copy.title}</h2>
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
              {copy.productionExecutionModel}:{" "}
              {String(readiness.capabilities.production_execution_model)}
            </span>
            <span className="metric ok">
              {copy.localQuotePreview}:{" "}
              {String(readiness.capabilities.local_quote_snapshot_preview_enabled)}
            </span>
            <span className="metric ok">
              {copy.deterministicSimulation}:{" "}
              {String(readiness.capabilities.deterministic_broker_simulation_enabled)}
            </span>
          </div>
        </article>

        <article className="paper-record-panel">
          <p className="card-kicker">{copy.capabilitiesKicker}</p>
          <h3>{copy.capabilitiesTitle}</h3>
          <div className="flag-grid reliability-flags">
            {renderCapability(
              copy,
              "deterministic_broker_simulation_enabled",
              readiness.capabilities.deterministic_broker_simulation_enabled,
              true,
            )}
            {renderCapability(
              copy,
              "local_quote_snapshot_preview_enabled",
              readiness.capabilities.local_quote_snapshot_preview_enabled,
              true,
            )}
            {renderCapability(
              copy,
              "paper_ack_reject_partial_fill_fill_cancel_enabled",
              readiness.capabilities.paper_ack_reject_partial_fill_fill_cancel_enabled,
              true,
            )}
            {renderCapability(
              copy,
              "caller_provided_quote_only",
              readiness.capabilities.caller_provided_quote_only,
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
              "real_market_matching_engine_enabled",
              readiness.capabilities.real_market_matching_engine_enabled,
              false,
            )}
            {renderCapability(
              copy,
              "exchange_order_book_replay_enabled",
              readiness.capabilities.exchange_order_book_replay_enabled,
              false,
            )}
            {renderCapability(
              copy,
              "broker_execution_report_model_enabled",
              readiness.capabilities.broker_execution_report_model_enabled,
              false,
            )}
            {renderCapability(
              copy,
              "latency_queue_position_model_enabled",
              readiness.capabilities.latency_queue_position_model_enabled,
              false,
            )}
            {renderCapability(
              copy,
              "slippage_liquidity_calibration_enabled",
              readiness.capabilities.slippage_liquidity_calibration_enabled,
              false,
            )}
            {renderCapability(
              copy,
              "real_account_reconciliation_enabled",
              readiness.capabilities.real_account_reconciliation_enabled,
              false,
            )}
            {renderCapability(
              copy,
              "production_execution_model",
              readiness.capabilities.production_execution_model,
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
            {readiness.missing_for_production_execution_model.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>

        <article className="paper-record-panel">
          <p className="card-kicker">{copy.requiredKicker}</p>
          <h3>{copy.requiredTitle}</h3>
          <ul className="warning-list">
            {readiness.required_before_production_execution_model.map((item) => (
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
          {renderSafetyFlag(
            copy,
            "external_market_data_downloaded",
            readiness.safety_flags.external_market_data_downloaded,
          )}
          {renderSafetyFlag(copy, "real_order_created", readiness.safety_flags.real_order_created)}
          {renderSafetyFlag(copy, "order_created", readiness.safety_flags.order_created)}
          {renderSafetyFlag(
            copy,
            "credentials_collected",
            readiness.safety_flags.credentials_collected,
          )}
          {renderSafetyFlag(copy, "database_written", readiness.safety_flags.database_written)}
          {renderSafetyFlag(
            copy,
            "production_execution_model",
            readiness.safety_flags.production_execution_model,
          )}
        </div>
      </article>

      <p className="read-only-note">{copy.readOnlyNote}</p>
    </section>
  );
}

function renderCapability(
  copy: DashboardCopy["paperBrokerSimulationReadiness"],
  key: keyof DashboardCopy["paperBrokerSimulationReadiness"]["capabilityLabels"],
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
  copy: DashboardCopy["paperBrokerSimulationReadiness"],
  key: keyof DashboardCopy["paperBrokerSimulationReadiness"]["safetyLabels"],
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
