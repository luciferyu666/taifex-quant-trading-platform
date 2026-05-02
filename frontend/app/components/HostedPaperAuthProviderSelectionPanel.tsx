import type { DashboardCopy } from "../i18n";

export type HostedPaperAuthProviderSelection = {
  service: string;
  selection_state: string;
  summary: string;
  candidates: Array<{
    provider: string;
    category: string;
    fit_summary: string;
    strengths: string[];
    watch_items: string[];
    paper_saas_fit: string;
    recommended_use: string;
    integration_enabled: boolean;
    credentials_required_now: boolean;
    secrets_added: boolean;
    customer_accounts_created: boolean;
  }>;
  criteria: Array<{
    criterion: string;
    why_it_matters: string;
    required_before_customer_pilot: boolean;
  }>;
  non_goals: string[];
  recommended_next_steps: string[];
  safety_defaults: {
    trading_mode: string;
    enable_live_trading: boolean;
    broker_provider: string;
  };
  safety_flags: Record<string, boolean | string>;
  docs: Record<string, string>;
  warnings: string[];
};

type HostedPaperAuthProviderSelectionPanelProps = {
  selection: HostedPaperAuthProviderSelection;
  available: boolean;
  copy: DashboardCopy["hostedPaperAuthProviderSelection"];
  error?: string;
};

const SAFETY_FLAG_ORDER = [
  "paper_only",
  "read_only",
  "live_trading_enabled",
  "broker_provider",
  "provider_selected",
  "integration_enabled",
  "auth_provider_enabled",
  "customer_account_created",
  "reviewer_login_created",
  "session_cookie_issued",
  "credentials_collected",
  "secrets_added",
  "hosted_datastore_written",
  "broker_api_called",
  "order_created",
  "production_trading_ready",
] as const;

function labelFor(labels: Readonly<Record<string, string>>, key: string): string {
  return labels[key] ?? key;
}

export function HostedPaperAuthProviderSelectionPanel({
  selection,
  available,
  copy,
  error,
}: HostedPaperAuthProviderSelectionPanelProps) {
  return (
    <section
      className="release-section"
      aria-labelledby="hosted-paper-auth-provider-selection-title"
    >
      <div className="section-heading">
        <p className="eyebrow">{copy.eyebrow}</p>
        <h2 id="hosted-paper-auth-provider-selection-title">{copy.title}</h2>
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
          <h3>GET /api/hosted-paper/auth-provider-selection</h3>
          <p>{selection.summary}</p>
        </div>
        <span className="metric warn">
          {copy.stateLabel}: {selection.selection_state}
        </span>
      </div>

      <div className="release-grid">
        {selection.candidates.map((candidate) => (
          <article className="release-card" key={candidate.provider}>
            <p className="card-kicker">{labelFor(copy.providerLabels, candidate.provider)}</p>
            <h3>{candidate.provider}</h3>
            <p>{labelFor(copy.fitSummaryLabels, candidate.fit_summary)}</p>
            <div className="validation-list">
              <span className="validation-row">
                <span>{copy.categoryLabel}</span>
                <strong>{labelFor(copy.categoryLabels, candidate.category)}</strong>
              </span>
              <span className="validation-row">
                <span>{copy.paperSaasFitLabel}</span>
                <strong>{labelFor(copy.fitLabels, candidate.paper_saas_fit)}</strong>
              </span>
              <span className="validation-row">
                <span>{copy.integrationEnabledLabel}</span>
                <strong>{String(candidate.integration_enabled)}</strong>
              </span>
              <span className="validation-row">
                <span>{copy.secretsAddedLabel}</span>
                <strong>{String(candidate.secrets_added)}</strong>
              </span>
            </div>
            <p className="card-kicker">{copy.recommendedUseLabel}</p>
            <p>{labelFor(copy.recommendedUseLabels, candidate.recommended_use)}</p>
          </article>
        ))}
      </div>

      <div className="release-grid">
        <article className="release-card">
          <p className="card-kicker">{copy.criteriaLabel}</p>
          <ul className="warning-list">
            {selection.criteria.map((criterion) => (
              <li key={criterion.criterion}>
                <strong>{labelFor(copy.criterionLabels, criterion.criterion)}</strong>:{" "}
                {labelFor(copy.criterionReasonLabels, criterion.why_it_matters)}
              </li>
            ))}
          </ul>
        </article>

        <article className="release-card">
          <p className="card-kicker">{copy.nonGoalsLabel}</p>
          <ul className="warning-list">
            {selection.non_goals.map((item) => (
              <li key={item}>{labelFor(copy.nonGoalLabels, item)}</li>
            ))}
          </ul>
        </article>

        <article className="release-card">
          <p className="card-kicker">{copy.nextStepsLabel}</p>
          <ol className="warning-list">
            {selection.recommended_next_steps.map((item) => (
              <li key={item}>{labelFor(copy.nextStepLabels, item)}</li>
            ))}
          </ol>
        </article>
      </div>

      <div className="release-grid">
        <article className="release-card">
          <p className="card-kicker">{copy.safetyDefaultsLabel}</p>
          <div className="validation-list">
            <span className="validation-row">
              <span>TRADING_MODE</span>
              <strong>{selection.safety_defaults.trading_mode}</strong>
            </span>
            <span className="validation-row">
              <span>ENABLE_LIVE_TRADING</span>
              <strong>{String(selection.safety_defaults.enable_live_trading)}</strong>
            </span>
            <span className="validation-row">
              <span>BROKER_PROVIDER</span>
              <strong>{selection.safety_defaults.broker_provider}</strong>
            </span>
          </div>
        </article>

        <article className="release-card">
          <p className="card-kicker">{copy.safetyFlagsLabel}</p>
          <div className="validation-list">
            {SAFETY_FLAG_ORDER.map((key) => (
              <span className="validation-row" key={key}>
                <span>{labelFor(copy.safetyFlagLabels, key)}</span>
                <strong>{String(selection.safety_flags[key])}</strong>
              </span>
            ))}
          </div>
        </article>

        <article className="release-card">
          <p className="card-kicker">{copy.warningLabel}</p>
          <ul className="warning-list">
            {selection.warnings.map((warning) => (
              <li key={warning}>{labelFor(copy.warningLabels, warning)}</li>
            ))}
          </ul>
        </article>
      </div>
    </section>
  );
}
