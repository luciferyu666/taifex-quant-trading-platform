import type { DashboardCopy } from "../i18n";

export type HostedPaperSandboxOnboardingReadiness = {
  service: string;
  readiness_state: string;
  summary: string;
  customer_onboarding_goal: string;
  current_blockers: string[];
  capabilities: Record<string, boolean>;
  guided_demo_dataset_contract: {
    dataset_id: string;
    dataset_status: string;
    intended_use: string;
    records_included: string[];
    hosted_persistence_enabled: boolean;
    generated_from_real_account: boolean;
    external_market_data_downloaded: boolean;
    warnings: string[];
  };
  required_onboarding_steps: Array<{
    sequence: number;
    step: string;
    current_status: string;
    required_before_customer_self_service: boolean;
    notes: string[];
  }>;
  safety_defaults: {
    trading_mode: string;
    enable_live_trading: boolean;
    broker_provider: string;
  };
  safety_flags: Record<string, boolean | string>;
  docs: Record<string, string>;
  warnings: string[];
};

type HostedPaperSandboxOnboardingPanelProps = {
  readiness: HostedPaperSandboxOnboardingReadiness;
  available: boolean;
  copy: DashboardCopy["hostedPaperSandboxOnboarding"];
  error?: string;
};

const CAPABILITY_ORDER = [
  "online_sandbox_tenant_enabled",
  "browser_only_customer_onboarding_enabled",
  "hosted_backend_enabled",
  "managed_datastore_enabled",
  "real_login_enabled",
  "tenant_isolation_enforced",
  "guided_demo_data_contract_defined",
  "guided_demo_data_hosted",
  "paper_only_boundary_visible",
  "live_trading_controls_visible",
] as const;

const SAFETY_FLAG_ORDER = [
  "paper_only",
  "read_only",
  "live_trading_enabled",
  "broker_provider",
  "online_sandbox_tenant_created",
  "customer_account_created",
  "login_enabled",
  "session_cookie_issued",
  "tenant_record_created",
  "hosted_datastore_written",
  "external_db_written",
  "broker_api_called",
  "broker_credentials_collected",
  "order_created",
  "real_money_visible",
  "production_customer_onboarding_ready",
  "production_trading_ready",
] as const;

function labelFor(labels: Readonly<Record<string, string>>, key: string): string {
  return labels[key] ?? key;
}

export function HostedPaperSandboxOnboardingPanel({
  readiness,
  available,
  copy,
  error,
}: HostedPaperSandboxOnboardingPanelProps) {
  const demo = readiness.guided_demo_dataset_contract;

  return (
    <section
      className="release-section hosted-paper-sandbox-onboarding-panel"
      aria-labelledby="hosted-paper-sandbox-onboarding-title"
    >
      <div className="section-heading">
        <p className="eyebrow">{copy.eyebrow}</p>
        <h2 id="hosted-paper-sandbox-onboarding-title">{copy.title}</h2>
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
          <h3>GET /api/hosted-paper/sandbox-tenant/onboarding-readiness</h3>
          <p>{readiness.summary}</p>
          <p>
            <strong>{copy.goalLabel}: </strong>
            {readiness.customer_onboarding_goal}
          </p>
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
          <div className="flag-grid">
            <span className="flag ok">
              <span>TRADING_MODE</span>
              <strong>{readiness.safety_defaults.trading_mode}</strong>
            </span>
            <span
              className={
                readiness.safety_defaults.enable_live_trading
                  ? "flag danger"
                  : "flag ok"
              }
            >
              <span>ENABLE_LIVE_TRADING</span>
              <strong>
                {String(readiness.safety_defaults.enable_live_trading)}
              </strong>
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
        <article className="release-card release-gaps">
          <p className="card-kicker">{copy.blockersLabel}</p>
          <ul className="warning-list">
            {readiness.current_blockers.map((blocker) => (
              <li key={blocker}>{labelFor(copy.blockerLabels, blocker)}</li>
            ))}
          </ul>
        </article>

        <article className="release-card release-gaps">
          <p className="card-kicker">{copy.guidedDemoLabel}</p>
          <h3>{demo.dataset_id}</h3>
          <p>
            {copy.datasetStatusLabel}:{" "}
            <strong>{labelFor(copy.datasetStatusLabels, demo.dataset_status)}</strong>
          </p>
          <p>{labelFor(copy.intentLabels, demo.intended_use)}</p>
          <div className="validation-list">
            <span className="validation-row">
              <span>hosted_persistence_enabled</span>
              <strong>{String(demo.hosted_persistence_enabled)}</strong>
            </span>
            <span className="validation-row">
              <span>generated_from_real_account</span>
              <strong>{String(demo.generated_from_real_account)}</strong>
            </span>
            <span className="validation-row">
              <span>external_market_data_downloaded</span>
              <strong>{String(demo.external_market_data_downloaded)}</strong>
            </span>
          </div>
        </article>
      </div>

      <article className="release-card">
        <p className="card-kicker">{copy.recordsLabel}</p>
        <div className="tag-row">
          {demo.records_included.map((record) => (
            <span className="status-pill" key={record}>
              {labelFor(copy.recordLabels, record)}
            </span>
          ))}
        </div>
      </article>

      <article className="release-card">
        <p className="card-kicker">{copy.requiredStepsLabel}</p>
        <div className="roadmap-mini-list">
          {readiness.required_onboarding_steps.map((step) => (
            <div className="roadmap-mini-item" key={step.step}>
              <span className="step-index">{step.sequence}</span>
              <div>
                <strong>{labelFor(copy.stepLabels, step.step)}</strong>
                <p>
                  {copy.currentStatusLabel}:{" "}
                  {labelFor(copy.statusLabels, step.current_status)}
                </p>
                <p>
                  {copy.requiredBeforeSelfServiceLabel}:{" "}
                  {String(step.required_before_customer_self_service)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </article>

      <div className="release-grid">
        <article className="release-card release-gaps">
          <p className="card-kicker">{copy.demoWarningLabel}</p>
          <ul className="warning-list">
            {demo.warnings.map((warning) => (
              <li key={warning}>{labelFor(copy.demoWarningLabels, warning)}</li>
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
