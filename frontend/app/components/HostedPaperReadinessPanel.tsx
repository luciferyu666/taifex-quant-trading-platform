import type { DashboardCopy } from "../i18n";

export type HostedPaperReadiness = {
  service: string;
  readiness_state: string;
  summary: string;
  safety_defaults: {
    trading_mode: string;
    enable_live_trading: boolean;
    broker_provider: string;
  };
  safety_flags: {
    paper_only: boolean;
    live_trading_enabled: boolean;
    broker_api_called: boolean;
    order_created: boolean;
    database_written: boolean;
    external_db_written: boolean;
    broker_credentials_collected: boolean;
    production_trading_ready: boolean;
  };
  capabilities: {
    customer_login_enabled: boolean;
    hosted_backend_enabled: boolean;
    hosted_datastore_enabled: boolean;
    rbac_abac_enabled: boolean;
    paper_workflow_online_enabled: boolean;
    local_demo_mode_primary: boolean;
  };
  current_customer_path: string[];
  unavailable_until_hosted_backend: string[];
  future_requirements: string[];
  docs: Record<string, string>;
  warnings: string[];
};

type HostedPaperReadinessPanelProps = {
  readiness: HostedPaperReadiness;
  available: boolean;
  copy: DashboardCopy["hostedPaperReadiness"];
  error?: string;
};

function labelFor(labels: Readonly<Record<string, string>>, key: string): string {
  return labels[key] ?? key;
}

export function HostedPaperReadinessPanel({
  readiness,
  available,
  copy,
  error,
}: HostedPaperReadinessPanelProps) {
  return (
    <section className="release-section" aria-labelledby="hosted-paper-readiness-title">
      <div className="section-heading">
        <p className="eyebrow">{copy.eyebrow}</p>
        <h2 id="hosted-paper-readiness-title">{copy.title}</h2>
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
          <h3>GET /api/hosted-paper/readiness</h3>
          <p>{readiness.summary}</p>
        </div>
        <span
          className={
            readiness.capabilities.hosted_backend_enabled ? "metric warn" : "metric ok"
          }
        >
          {copy.stateLabel}: {readiness.readiness_state}
        </span>
      </div>

      <div className="release-grid">
        <article className="release-card">
          <p className="card-kicker">{copy.capabilitiesLabel}</p>
          <dl className="detail-list">
            {Object.entries(readiness.capabilities).map(([key, value]) => (
              <div key={key}>
                <dt>
                  {copy.capabilityLabels[key as keyof typeof copy.capabilityLabels] ?? key}
                </dt>
                <dd>{String(value)}</dd>
              </div>
            ))}
          </dl>
        </article>

        <article className="release-card">
          <p className="card-kicker">{copy.safetyDefaultsLabel}</p>
          <div className="flag-grid">
            <span className="flag ok">
              <span>TRADING_MODE</span>
              <strong>{readiness.safety_defaults.trading_mode}</strong>
            </span>
            <span
              className={
                readiness.safety_defaults.enable_live_trading ? "flag danger" : "flag ok"
              }
            >
              <span>ENABLE_LIVE_TRADING</span>
              <strong>{String(readiness.safety_defaults.enable_live_trading)}</strong>
            </span>
            <span className="flag ok">
              <span>BROKER_PROVIDER</span>
              <strong>{readiness.safety_defaults.broker_provider}</strong>
            </span>
          </div>
        </article>

        <article className="release-card">
          <p className="card-kicker">{copy.safetyFlagsLabel}</p>
          <div className="validation-list">
            {Object.entries(readiness.safety_flags).map(([key, value]) => (
              <span className="validation-row" key={key}>
                <span>{copy.safetyFlagLabels[key as keyof typeof copy.safetyFlagLabels] ?? key}</span>
                <strong>{String(value)}</strong>
              </span>
            ))}
          </div>
        </article>
      </div>

      <div className="release-grid">
        <article className="release-card release-gaps">
          <p className="card-kicker">{copy.currentPathLabel}</p>
          <ul className="warning-list">
            {readiness.current_customer_path.map((item) => (
              <li key={item}>{labelFor(copy.customerPathLabels, item)}</li>
            ))}
          </ul>
        </article>

        <article className="release-card release-gaps">
          <p className="card-kicker">{copy.unavailableLabel}</p>
          <ul className="warning-list">
            {readiness.unavailable_until_hosted_backend.map((item) => (
              <li key={item}>{labelFor(copy.unavailableLabels, item)}</li>
            ))}
          </ul>
        </article>

        <article className="release-card release-gaps">
          <p className="card-kicker">{copy.futureRequirementsLabel}</p>
          <ul className="warning-list">
            {readiness.future_requirements.map((item) => (
              <li key={item}>{labelFor(copy.futureRequirementLabels, item)}</li>
            ))}
          </ul>
        </article>
      </div>

      <article className="release-card release-gaps">
        <p className="card-kicker">{copy.warningLabel}</p>
        <ul className="warning-list">
          {readiness.warnings.map((warning) => (
            <li key={warning}>{labelFor(copy.warningLabels, warning)}</li>
          ))}
        </ul>
      </article>
    </section>
  );
}
