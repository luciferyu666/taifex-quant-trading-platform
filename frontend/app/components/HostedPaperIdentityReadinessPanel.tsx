import type { DashboardCopy } from "../i18n";

export type HostedPaperIdentityReadiness = {
  service: string;
  readiness_state: string;
  summary: string;
  identity: {
    reviewer_login_enabled: boolean;
    customer_accounts_enabled: boolean;
    authentication_provider: string;
    session_issuance_enabled: boolean;
    session_cookie_issued: boolean;
    mfa_enabled: boolean;
  };
  access_control: {
    rbac_enabled: boolean;
    abac_enabled: boolean;
    roles_defined: string[];
    permissions_defined: string[];
    mutation_permissions_granted: boolean;
    live_permissions_granted: boolean;
    dual_review_required_for_future: boolean;
  };
  tenant_isolation: {
    tenant_isolation_required: boolean;
    tenant_isolation_enforced: boolean;
    hosted_tenant_datastore_enabled: boolean;
    hosted_tenant_records_enabled: boolean;
    tenant_created: boolean;
    local_sqlite_access_from_production_vercel: boolean;
  };
  safety_defaults: {
    trading_mode: string;
    enable_live_trading: boolean;
    broker_provider: string;
  };
  safety_flags: Record<string, boolean | string>;
  current_customer_path: string[];
  blocked_until_identity_layer: string[];
  future_requirements: string[];
  docs: Record<string, string>;
  warnings: string[];
};

type HostedPaperIdentityReadinessPanelProps = {
  readiness: HostedPaperIdentityReadiness;
  available: boolean;
  copy: DashboardCopy["hostedPaperIdentityReadiness"];
  error?: string;
};

const SAFETY_FLAG_ORDER = [
  "paper_only",
  "read_only",
  "live_trading_enabled",
  "broker_provider",
  "broker_api_called",
  "order_created",
  "credentials_collected",
  "broker_credentials_collected",
  "hosted_auth_provider_enabled",
  "reviewer_login_created",
  "customer_account_created",
  "session_cookie_issued",
  "hosted_datastore_written",
  "external_db_written",
  "rbac_abac_enforced",
  "tenant_isolation_enforced",
  "production_trading_ready",
] as const;

function labelFor(labels: Readonly<Record<string, string>>, key: string): string {
  return labels[key] ?? key;
}

export function HostedPaperIdentityReadinessPanel({
  readiness,
  available,
  copy,
  error,
}: HostedPaperIdentityReadinessPanelProps) {
  return (
    <section className="release-section" aria-labelledby="hosted-paper-identity-title">
      <div className="section-heading">
        <p className="eyebrow">{copy.eyebrow}</p>
        <h2 id="hosted-paper-identity-title">{copy.title}</h2>
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
          <h3>GET /api/hosted-paper/identity-readiness</h3>
          <p>{readiness.summary}</p>
        </div>
        <span className="metric warn">
          {copy.stateLabel}: {readiness.readiness_state}
        </span>
      </div>

      <div className="release-grid">
        <article className="release-card">
          <p className="card-kicker">{copy.identityLabel}</p>
          <div className="validation-list">
            {Object.entries(readiness.identity).map(([key, value]) => (
              <span className="validation-row" key={key}>
                <span>{labelFor(copy.identityLabels, key)}</span>
                <strong>{String(value)}</strong>
              </span>
            ))}
          </div>
        </article>

        <article className="release-card">
          <p className="card-kicker">{copy.accessControlLabel}</p>
          <div className="validation-list">
            <span className="validation-row">
              <span>{copy.accessControlLabels.rbac_enabled}</span>
              <strong>{String(readiness.access_control.rbac_enabled)}</strong>
            </span>
            <span className="validation-row">
              <span>{copy.accessControlLabels.abac_enabled}</span>
              <strong>{String(readiness.access_control.abac_enabled)}</strong>
            </span>
            <span className="validation-row">
              <span>{copy.accessControlLabels.mutation_permissions_granted}</span>
              <strong>{String(readiness.access_control.mutation_permissions_granted)}</strong>
            </span>
            <span className="validation-row">
              <span>{copy.accessControlLabels.live_permissions_granted}</span>
              <strong>{String(readiness.access_control.live_permissions_granted)}</strong>
            </span>
          </div>
        </article>

        <article className="release-card">
          <p className="card-kicker">{copy.tenantIsolationLabel}</p>
          <div className="validation-list">
            {Object.entries(readiness.tenant_isolation).map(([key, value]) => (
              <span className="validation-row" key={key}>
                <span>{labelFor(copy.tenantLabels, key)}</span>
                <strong>{String(value)}</strong>
              </span>
            ))}
          </div>
        </article>
      </div>

      <div className="release-grid">
        <article className="release-card">
          <p className="card-kicker">{copy.rolesLabel}</p>
          <ul className="warning-list">
            {readiness.access_control.roles_defined.map((role) => (
              <li key={role}>{labelFor(copy.roleLabels, role)}</li>
            ))}
          </ul>
        </article>

        <article className="release-card">
          <p className="card-kicker">{copy.blockedLabel}</p>
          <ul className="warning-list">
            {readiness.blocked_until_identity_layer.map((item) => (
              <li key={item}>{labelFor(copy.blockedLabels, item)}</li>
            ))}
          </ul>
        </article>

        <article className="release-card">
          <p className="card-kicker">{copy.futureRequirementsLabel}</p>
          <ul className="warning-list">
            {readiness.future_requirements.map((item) => (
              <li key={item}>{labelFor(copy.futureRequirementLabels, item)}</li>
            ))}
          </ul>
        </article>
      </div>

      <div className="release-grid">
        <article className="release-card">
          <p className="card-kicker">{copy.safetyDefaultsLabel}</p>
          <div className="validation-list">
            <span className="validation-row">
              <span>TRADING_MODE</span>
              <strong>{readiness.safety_defaults.trading_mode}</strong>
            </span>
            <span className="validation-row">
              <span>ENABLE_LIVE_TRADING</span>
              <strong>{String(readiness.safety_defaults.enable_live_trading)}</strong>
            </span>
            <span className="validation-row">
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

        <article className="release-card">
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
