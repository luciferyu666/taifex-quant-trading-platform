import type { DashboardCopy } from "../i18n";

type SafetyDefaults = {
  trading_mode: string;
  enable_live_trading: boolean;
  broker_provider: string;
};

type PaperRiskCrossAccountReadinessCapabilities = {
  local_paper_guardrails_enabled: boolean;
  local_paper_state_enabled: boolean;
  single_account_demo_state_enabled: boolean;
  risk_evaluation_detail_enabled: boolean;
  duplicate_idempotency_local_check_enabled: boolean;
  cross_account_aggregation_enabled: boolean;
  account_hierarchy_enabled: boolean;
  tenant_isolated_risk_state_enabled: boolean;
  real_account_margin_feed_enabled: boolean;
  broker_position_feed_enabled: boolean;
  centralized_risk_limits_enabled: boolean;
  distributed_kill_switch_enabled: boolean;
  durable_risk_state_store_enabled: boolean;
  real_time_equity_pnl_tracking_enabled: boolean;
  production_cross_account_risk_system: boolean;
};

type PaperRiskCrossAccountReadinessSafetyFlags = {
  paper_only: boolean;
  read_only: boolean;
  live_trading_enabled: boolean;
  broker_provider: string;
  broker_api_called: boolean;
  external_account_data_loaded: boolean;
  real_account_data_loaded: boolean;
  order_created: boolean;
  credentials_collected: boolean;
  database_written: boolean;
  hosted_datastore_written: boolean;
  production_risk_approval: boolean;
  production_cross_account_risk: boolean;
  production_trading_ready: boolean;
};

export type PaperRiskCrossAccountReadiness = {
  service: string;
  readiness_state: string;
  summary: string;
  capabilities: PaperRiskCrossAccountReadinessCapabilities;
  safety_defaults: SafetyDefaults;
  safety_flags: PaperRiskCrossAccountReadinessSafetyFlags;
  current_scope: string[];
  missing_for_cross_account_risk: string[];
  required_before_cross_account_risk: string[];
  docs: Record<string, string>;
  warnings: string[];
};

type PaperRiskCrossAccountReadinessPanelProps = {
  available: boolean;
  copy: DashboardCopy["paperRiskCrossAccountReadiness"];
  error?: string;
  readiness: PaperRiskCrossAccountReadiness;
};

const safeTrueFlags = new Set(["paper_only", "read_only"]);
const safeFalseFlags = new Set([
  "live_trading_enabled",
  "broker_api_called",
  "external_account_data_loaded",
  "real_account_data_loaded",
  "order_created",
  "credentials_collected",
  "database_written",
  "hosted_datastore_written",
  "production_risk_approval",
  "production_cross_account_risk",
  "production_trading_ready",
]);

export function PaperRiskCrossAccountReadinessPanel({
  available,
  copy,
  error,
  readiness,
}: PaperRiskCrossAccountReadinessPanelProps) {
  return (
    <section
      className="paper-reliability-section"
      aria-labelledby="paper-risk-cross-account-readiness-title"
    >
      <div className="section-heading">
        <p className="eyebrow">{copy.eyebrow}</p>
        <h2 id="paper-risk-cross-account-readiness-title">{copy.title}</h2>
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
              {copy.productionCrossAccountRisk}:{" "}
              {String(readiness.capabilities.production_cross_account_risk_system)}
            </span>
            <span className="metric ok">
              {copy.localPaperState}:{" "}
              {String(readiness.capabilities.local_paper_state_enabled)}
            </span>
            <span className="metric ok">
              {copy.paperGuardrails}:{" "}
              {String(readiness.capabilities.local_paper_guardrails_enabled)}
            </span>
          </div>
        </article>

        <article className="paper-record-panel">
          <p className="card-kicker">{copy.capabilitiesKicker}</p>
          <h3>{copy.capabilitiesTitle}</h3>
          <div className="flag-grid reliability-flags">
            {renderCapability(
              copy,
              "local_paper_guardrails_enabled",
              readiness.capabilities.local_paper_guardrails_enabled,
              true,
            )}
            {renderCapability(
              copy,
              "local_paper_state_enabled",
              readiness.capabilities.local_paper_state_enabled,
              true,
            )}
            {renderCapability(
              copy,
              "single_account_demo_state_enabled",
              readiness.capabilities.single_account_demo_state_enabled,
              true,
            )}
            {renderCapability(
              copy,
              "risk_evaluation_detail_enabled",
              readiness.capabilities.risk_evaluation_detail_enabled,
              true,
            )}
            {renderCapability(
              copy,
              "duplicate_idempotency_local_check_enabled",
              readiness.capabilities.duplicate_idempotency_local_check_enabled,
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
              "cross_account_aggregation_enabled",
              readiness.capabilities.cross_account_aggregation_enabled,
              false,
            )}
            {renderCapability(
              copy,
              "account_hierarchy_enabled",
              readiness.capabilities.account_hierarchy_enabled,
              false,
            )}
            {renderCapability(
              copy,
              "tenant_isolated_risk_state_enabled",
              readiness.capabilities.tenant_isolated_risk_state_enabled,
              false,
            )}
            {renderCapability(
              copy,
              "real_account_margin_feed_enabled",
              readiness.capabilities.real_account_margin_feed_enabled,
              false,
            )}
            {renderCapability(
              copy,
              "broker_position_feed_enabled",
              readiness.capabilities.broker_position_feed_enabled,
              false,
            )}
            {renderCapability(
              copy,
              "centralized_risk_limits_enabled",
              readiness.capabilities.centralized_risk_limits_enabled,
              false,
            )}
            {renderCapability(
              copy,
              "distributed_kill_switch_enabled",
              readiness.capabilities.distributed_kill_switch_enabled,
              false,
            )}
            {renderCapability(
              copy,
              "durable_risk_state_store_enabled",
              readiness.capabilities.durable_risk_state_store_enabled,
              false,
            )}
            {renderCapability(
              copy,
              "real_time_equity_pnl_tracking_enabled",
              readiness.capabilities.real_time_equity_pnl_tracking_enabled,
              false,
            )}
            {renderCapability(
              copy,
              "production_cross_account_risk_system",
              readiness.capabilities.production_cross_account_risk_system,
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
            {readiness.missing_for_cross_account_risk.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>

        <article className="paper-record-panel">
          <p className="card-kicker">{copy.requiredKicker}</p>
          <h3>{copy.requiredTitle}</h3>
          <ul className="warning-list">
            {readiness.required_before_cross_account_risk.map((item) => (
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
            "external_account_data_loaded",
            readiness.safety_flags.external_account_data_loaded,
          )}
          {renderSafetyFlag(
            copy,
            "real_account_data_loaded",
            readiness.safety_flags.real_account_data_loaded,
          )}
          {renderSafetyFlag(copy, "order_created", readiness.safety_flags.order_created)}
          {renderSafetyFlag(
            copy,
            "credentials_collected",
            readiness.safety_flags.credentials_collected,
          )}
          {renderSafetyFlag(copy, "database_written", readiness.safety_flags.database_written)}
          {renderSafetyFlag(
            copy,
            "hosted_datastore_written",
            readiness.safety_flags.hosted_datastore_written,
          )}
          {renderSafetyFlag(
            copy,
            "production_risk_approval",
            readiness.safety_flags.production_risk_approval,
          )}
          {renderSafetyFlag(
            copy,
            "production_cross_account_risk",
            readiness.safety_flags.production_cross_account_risk,
          )}
        </div>
      </article>

      <p className="read-only-note">{copy.readOnlyNote}</p>
    </section>
  );
}

function renderCapability(
  copy: DashboardCopy["paperRiskCrossAccountReadiness"],
  key: keyof DashboardCopy["paperRiskCrossAccountReadiness"]["capabilityLabels"],
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
  copy: DashboardCopy["paperRiskCrossAccountReadiness"],
  key: keyof DashboardCopy["paperRiskCrossAccountReadiness"]["safetyLabels"],
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
