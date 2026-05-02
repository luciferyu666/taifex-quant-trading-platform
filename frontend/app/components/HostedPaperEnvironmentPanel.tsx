import type { DashboardCopy } from "../i18n";

export type HostedPaperEnvironmentMode = {
  mode: string;
  label: string;
  state: string;
  can_read_actual_paper_records: boolean;
  can_write_paper_records: boolean;
  auth_required: boolean;
  tenant_isolation_required: boolean;
  managed_datastore_required: boolean;
  local_sqlite_allowed: boolean;
  description: string;
  limitations: string[];
};

export type HostedPaperSaasRoadmapStep = {
  sequence: number;
  capability: string;
  current_status: string;
  required_before_customer_saas: boolean;
  notes: string;
};

export type HostedPaperEnvironment = {
  service: string;
  contract_version: string;
  deployment_model: string;
  current_customer_mode: string;
  local_demo_mode: HostedPaperEnvironmentMode;
  hosted_paper_mode: HostedPaperEnvironmentMode;
  production_trading_platform: HostedPaperEnvironmentMode;
  saas_foundation_path: HostedPaperSaasRoadmapStep[];
  safety_defaults: {
    trading_mode: string;
    enable_live_trading: boolean;
    broker_provider: string;
  };
  safety_flags: Record<string, boolean>;
  docs: Record<string, string>;
  warnings: string[];
};

type HostedPaperEnvironmentPanelProps = {
  environment: HostedPaperEnvironment;
  available: boolean;
  copy: DashboardCopy["hostedPaperEnvironment"];
  error?: string;
};

function modeClassName(mode: HostedPaperEnvironmentMode): string {
  if (mode.state === "primary_local_demo") return "release-card mode-primary";
  if (mode.state === "not_ready") return "release-card mode-danger";
  return "release-card mode-muted";
}

function translate(
  labels: Readonly<Record<string, string>>,
  value: string,
): string {
  return labels[value] ?? value;
}

export function HostedPaperEnvironmentPanel({
  environment,
  available,
  copy,
  error,
}: HostedPaperEnvironmentPanelProps) {
  const modes = [
    environment.local_demo_mode,
    environment.hosted_paper_mode,
    environment.production_trading_platform,
  ];

  return (
    <section
      className="release-section hosted-paper-environment-panel"
      aria-labelledby="hosted-paper-environment-title"
    >
      <div className="section-heading">
        <p className="eyebrow">{copy.eyebrow}</p>
        <h2 id="hosted-paper-environment-title">{copy.title}</h2>
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
          <h3>GET /api/hosted-paper/environment</h3>
          <p>
            {copy.currentModeLabel}:{" "}
            <strong>
              {translate(copy.currentModeLabels, environment.current_customer_mode)}
            </strong>
          </p>
          <p>
            {copy.deploymentModelLabel}:{" "}
            <code>{environment.deployment_model}</code>
          </p>
        </div>
        <span className="metric warn">
          {copy.productionStateLabel}:{" "}
          {translate(
            copy.stateLabels,
            environment.production_trading_platform.state,
          )}
        </span>
      </div>

      <div className="release-grid">
        {modes.map((mode) => (
          <article className={modeClassName(mode)} key={mode.mode}>
            <p className="card-kicker">
              {copy.modeLabel}: {translate(copy.modeLabels, mode.mode)}
            </p>
            <h3>{translate(copy.modeTitleLabels, mode.label)}</h3>
            <p>{translate(copy.descriptionLabels, mode.description)}</p>
            <span
              className={
                mode.state === "primary_local_demo" ? "metric ok" : "metric warn"
              }
            >
              {copy.stateLabel}: {translate(copy.stateLabels, mode.state)}
            </span>
            <dl className="detail-list">
              <div>
                <dt>{copy.canReadLabel}</dt>
                <dd>{String(mode.can_read_actual_paper_records)}</dd>
              </div>
              <div>
                <dt>{copy.canWriteLabel}</dt>
                <dd>{String(mode.can_write_paper_records)}</dd>
              </div>
              <div>
                <dt>{copy.authRequiredLabel}</dt>
                <dd>{String(mode.auth_required)}</dd>
              </div>
              <div>
                <dt>{copy.tenantRequiredLabel}</dt>
                <dd>{String(mode.tenant_isolation_required)}</dd>
              </div>
              <div>
                <dt>{copy.managedDatastoreLabel}</dt>
                <dd>{String(mode.managed_datastore_required)}</dd>
              </div>
              <div>
                <dt>{copy.localSqliteLabel}</dt>
                <dd>{String(mode.local_sqlite_allowed)}</dd>
              </div>
            </dl>
            <p className="card-kicker">{copy.limitationsLabel}</p>
            <ul className="warning-list">
              {mode.limitations.map((limitation) => (
                <li key={limitation}>
                  {translate(copy.limitationLabels, limitation)}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>

      <article className="release-card">
        <p className="card-kicker">{copy.roadmapLabel}</p>
        <div className="roadmap-mini-list">
          {environment.saas_foundation_path.map((step) => (
            <div className="roadmap-mini-item" key={step.sequence}>
              <span className="step-index">{step.sequence}</span>
              <div>
                <strong>{translate(copy.capabilityLabels, step.capability)}</strong>
                <p>
                  {copy.statusLabel}:{" "}
                  {translate(copy.statusLabels, step.current_status)}
                </p>
                <p>{translate(copy.notesLabels, step.notes)}</p>
              </div>
            </div>
          ))}
        </div>
      </article>

      <div className="release-grid">
        <article className="release-card">
          <p className="card-kicker">{copy.safetyDefaultsLabel}</p>
          <div className="flag-grid">
            <span className="flag ok">
              <span>TRADING_MODE</span>
              <strong>{environment.safety_defaults.trading_mode}</strong>
            </span>
            <span
              className={
                environment.safety_defaults.enable_live_trading
                  ? "flag danger"
                  : "flag ok"
              }
            >
              <span>ENABLE_LIVE_TRADING</span>
              <strong>
                {String(environment.safety_defaults.enable_live_trading)}
              </strong>
            </span>
            <span className="flag ok">
              <span>BROKER_PROVIDER</span>
              <strong>{environment.safety_defaults.broker_provider}</strong>
            </span>
          </div>
        </article>

        <article className="release-card">
          <p className="card-kicker">{copy.safetyFlagsLabel}</p>
          <div className="validation-list">
            {Object.entries(environment.safety_flags).map(([key, value]) => (
              <span className="validation-row" key={key}>
                <span>{translate(copy.safetyFlagLabels, key)}</span>
                <strong>{String(value)}</strong>
              </span>
            ))}
          </div>
        </article>

        <article className="release-card release-gaps">
          <p className="card-kicker">{copy.warningLabel}</p>
          <ul className="warning-list">
            {environment.warnings.map((warning) => (
              <li key={warning}>{translate(copy.warningLabels, warning)}</li>
            ))}
          </ul>
        </article>
      </div>
    </section>
  );
}
