import type { DashboardCopy } from "../i18n";

export type HostedPaperSecurityOperationsReadiness = {
  service: string;
  readiness_state: string;
  summary: string;
  capabilities: Record<string, boolean>;
  controls: Array<{
    control: string;
    purpose: string;
    current_status: string;
    enabled: boolean;
    required_before_hosted_customer_use: boolean;
    required_before_production_trading: boolean;
    notes: string[];
  }>;
  required_next_slices: string[];
  safety_defaults: {
    trading_mode: string;
    enable_live_trading: boolean;
    broker_provider: string;
  };
  safety_flags: Record<string, boolean | string>;
  docs: Record<string, string>;
  warnings: string[];
};

type HostedPaperSecurityOperationsPanelProps = {
  readiness: HostedPaperSecurityOperationsReadiness;
  available: boolean;
  copy: DashboardCopy["hostedPaperSecurityOperations"];
  error?: string;
};

const CAPABILITY_ORDER = [
  "static_secret_scan_gate_enabled",
  "ci_release_readiness_gate_enabled",
  "production_smoke_gate_enabled",
  "secrets_management_enabled",
  "vault_or_managed_secret_store_enabled",
  "rate_limiting_enabled",
  "audit_monitoring_enabled",
  "observability_pipeline_enabled",
  "staging_smoke_gate_enabled",
  "load_test_gate_enabled",
  "abuse_test_gate_enabled",
  "auth_boundary_test_gate_enabled",
  "incident_runbook_enabled",
  "production_operations_ready",
] as const;

const SAFETY_FLAG_ORDER = [
  "paper_only",
  "read_only",
  "live_trading_enabled",
  "broker_provider",
  "secrets_stored",
  "credentials_collected",
  "broker_credentials_collected",
  "auth_provider_enabled",
  "customer_account_created",
  "hosted_datastore_written",
  "external_db_written",
  "broker_api_called",
  "order_created",
  "load_test_executed",
  "abuse_test_executed",
  "production_security_approval",
  "production_trading_ready",
] as const;

function labelFor(labels: Readonly<Record<string, string>>, key: string): string {
  return labels[key] ?? key;
}

export function HostedPaperSecurityOperationsPanel({
  readiness,
  available,
  copy,
  error,
}: HostedPaperSecurityOperationsPanelProps) {
  return (
    <section
      className="release-section"
      aria-labelledby="hosted-paper-security-operations-title"
    >
      <div className="section-heading">
        <p className="eyebrow">{copy.eyebrow}</p>
        <h2 id="hosted-paper-security-operations-title">{copy.title}</h2>
        <p>{copy.description}</p>
      </div>
      {!available ? (
        <p className="notice warn">
          {copy.fallbackPrefix} {error}
        </p>
      ) : null}

      <div className="release-hero panel">
        <div>
          <p className="card-kicker">{copy.endpointLabel}</p>
          <h3>GET /api/hosted-paper/security-operations/readiness</h3>
          <p>{readiness.summary}</p>
        </div>
        <span className="metric warn">
          {copy.stateLabel}: {readiness.readiness_state}
        </span>
      </div>

      <div className="release-grid">
        <article className="release-card">
          <p className="card-kicker">{copy.capabilitiesLabel}</p>
          <div className="validation-list">
            {CAPABILITY_ORDER.map((key) => (
              <span className="validation-row" key={key}>
                <span>{labelFor(copy.capabilityLabels, key)}</span>
                <strong>{String(readiness.capabilities[key])}</strong>
              </span>
            ))}
          </div>
        </article>

        <article className="release-card">
          <p className="card-kicker">{copy.safetyDefaultsLabel}</p>
          <dl className="detail-list">
            <div>
              <dt>TRADING_MODE</dt>
              <dd>{readiness.safety_defaults.trading_mode}</dd>
            </div>
            <div>
              <dt>ENABLE_LIVE_TRADING</dt>
              <dd>{String(readiness.safety_defaults.enable_live_trading)}</dd>
            </div>
            <div>
              <dt>BROKER_PROVIDER</dt>
              <dd>{readiness.safety_defaults.broker_provider}</dd>
            </div>
          </dl>
        </article>

        <article className="release-card">
          <p className="card-kicker">{copy.safetyFlagsLabel}</p>
          <div className="validation-list">
            {SAFETY_FLAG_ORDER.map((key) => (
              <span className="validation-row" key={key}>
                <span>{labelFor(copy.safetyFlagLabels, key)}</span>
                <strong>{String(readiness.safety_flags[key])}</strong>
              </span>
            ))}
          </div>
        </article>
      </div>

      <div className="release-grid">
        {readiness.controls.map((control) => (
          <article className="release-card" key={control.control}>
            <p className="card-kicker">{copy.controlLabel}</p>
            <h3>{labelFor(copy.controlLabels, control.control)}</h3>
            <p>{labelFor(copy.purposeLabels, control.purpose)}</p>
            <div className="validation-list">
              <span className="validation-row">
                <span>{copy.currentStatusLabel}</span>
                <strong>{labelFor(copy.statusLabels, control.current_status)}</strong>
              </span>
              <span className="validation-row">
                <span>{copy.enabledLabel}</span>
                <strong>{String(control.enabled)}</strong>
              </span>
              <span className="validation-row">
                <span>{copy.requiredBeforeHostedUseLabel}</span>
                <strong>{String(control.required_before_hosted_customer_use)}</strong>
              </span>
            </div>
          </article>
        ))}
      </div>

      <div className="release-grid">
        <article className="release-card release-gaps">
          <p className="card-kicker">{copy.requiredNextSlicesLabel}</p>
          <ul className="warning-list">
            {readiness.required_next_slices.map((item) => (
              <li key={item}>{labelFor(copy.requiredNextSliceLabels, item)}</li>
            ))}
          </ul>
        </article>

        <article className="release-card release-gaps">
          <p className="card-kicker">{copy.warningLabel}</p>
          <ul className="warning-list">
            {readiness.warnings.map((warning) => (
              <li key={warning}>{labelFor(copy.warningLabels, warning)}</li>
            ))}
          </ul>
        </article>
      </div>
    </section>
  );
}
