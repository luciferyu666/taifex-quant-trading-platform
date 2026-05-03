import type { CommandCenterApiConfig } from "../apiBase";
import type { DashboardCopy } from "../i18n";
import type {
  HostedPaperMockSession,
  HostedPaperTenantContext,
} from "./HostedPaperMockSessionPanel";

export type HostedWebCommandCenterEndpointContract = {
  path: string;
  purpose: string;
  read_only: boolean;
  requires_real_login_before_customer_use: boolean;
  requires_tenant_isolation_before_customer_use: boolean;
  mutation: boolean;
};

export type HostedWebCommandCenterReadiness = {
  service: string;
  readiness_state: string;
  summary: string;
  api_base_url_contract: {
    primary_public_env_var: string;
    local_fallback_public_env_var: string;
    mode_public_env_var: string;
    default_local_base_url: string;
    server_side_fetch_supported: boolean;
    browser_fetch_supported_for_read_only_panels: boolean;
    hosted_backend_requires_https: boolean;
    secrets_allowed_in_public_env: boolean;
    broker_credentials_allowed_in_public_env: boolean;
  };
  identity_display: {
    login_status_displayed: boolean;
    tenant_displayed: boolean;
    roles_displayed: boolean;
    permissions_displayed: boolean;
    current_identity_source: string;
    real_login_enabled: boolean;
    customer_account_enabled: boolean;
    reviewer_login_enabled: boolean;
    rbac_abac_enforced: boolean;
    tenant_isolation_enforced: boolean;
  };
  capabilities: Record<string, boolean>;
  required_read_endpoints: HostedWebCommandCenterEndpointContract[];
  safety_defaults: {
    trading_mode: string;
    enable_live_trading: boolean;
    broker_provider: string;
  };
  safety_flags: Record<string, boolean | string>;
  required_before_customer_hosted_use: string[];
  docs: Record<string, string>;
  warnings: string[];
};

type HostedWebCommandCenterPanelProps = {
  apiConfig: CommandCenterApiConfig;
  backendAvailable: boolean;
  backendError?: string;
  readiness: HostedWebCommandCenterReadiness;
  readinessAvailable: boolean;
  readinessError?: string;
  session: HostedPaperMockSession;
  sessionAvailable: boolean;
  tenant: HostedPaperTenantContext;
  tenantAvailable: boolean;
  copy: DashboardCopy["hostedWebCommandCenter"];
};

function labelFor(labels: Readonly<Record<string, string>>, key: string): string {
  return labels[key] ?? key;
}

export function HostedWebCommandCenterPanel({
  apiConfig,
  backendAvailable,
  backendError,
  readiness,
  readinessAvailable,
  readinessError,
  session,
  sessionAvailable,
  tenant,
  tenantAvailable,
  copy,
}: HostedWebCommandCenterPanelProps) {
  const grantedPermissions = session.permission_schema.filter(
    (permission) => permission.granted_in_mock_session,
  );
  const deniedMutations = session.permission_schema.filter(
    (permission) => permission.mutation && !permission.granted_in_mock_session,
  );
  const connectionAvailable = backendAvailable && readinessAvailable;
  const connectionIssue = [
    backendAvailable ? undefined : backendError,
    readinessAvailable ? undefined : readinessError,
  ]
    .filter(Boolean)
    .join("; ");

  return (
    <section className="release-section" aria-labelledby="hosted-web-command-center-title">
      <div className="section-heading">
        <p className="eyebrow">{copy.eyebrow}</p>
        <h2 id="hosted-web-command-center-title">{copy.title}</h2>
        <p>{copy.description}</p>
      </div>
      {!connectionAvailable ? (
        <p className="notice warn">
          {copy.fallbackPrefix} {connectionIssue}
        </p>
      ) : null}

      <div className="release-hero panel">
        <div>
          <p className="card-kicker">{copy.endpointLabel}</p>
          <h3>GET /api/hosted-paper/web-command-center/readiness</h3>
          <p>{readiness.summary}</p>
        </div>
        <span
          className={
            apiConfig.hostedBackendConfigured && connectionAvailable
              ? "metric ok"
              : "metric warn"
          }
        >
          {copy.connectionStateLabel}:{" "}
          {apiConfig.hostedBackendConfigured
            ? copy.connectionStates.hosted
            : copy.connectionStates.localOrFallback}
        </span>
      </div>

      <div className="release-grid">
        <article className="release-card">
          <p className="card-kicker">{copy.apiBaseLabel}</p>
          <dl className="detail-list">
            <div>
              <dt>{copy.fields.apiBaseUrl}</dt>
              <dd>{apiConfig.apiBaseUrl}</dd>
            </div>
            <div>
              <dt>{copy.fields.apiBaseSource}</dt>
              <dd>{labelFor(copy.sourceLabels, apiConfig.apiBaseUrlSource)}</dd>
            </div>
            <div>
              <dt>{copy.fields.apiMode}</dt>
              <dd>{apiConfig.commandCenterApiMode}</dd>
            </div>
            <div>
              <dt>{copy.fields.hostedConfigured}</dt>
              <dd>{String(apiConfig.hostedBackendConfigured)}</dd>
            </div>
            <div>
              <dt>{copy.fields.usesLocalDefault}</dt>
              <dd>{String(apiConfig.usesLocalDefault)}</dd>
            </div>
          </dl>
        </article>

        <article className="release-card">
          <p className="card-kicker">{copy.publicEnvLabel}</p>
          <dl className="detail-list">
            <div>
              <dt>{readiness.api_base_url_contract.primary_public_env_var}</dt>
              <dd>{apiConfig.publicEnvVars.hostedBackendApiBaseUrl || copy.notConfigured}</dd>
            </div>
            <div>
              <dt>{readiness.api_base_url_contract.local_fallback_public_env_var}</dt>
              <dd>{apiConfig.publicEnvVars.backendUrl || copy.notConfigured}</dd>
            </div>
            <div>
              <dt>{readiness.api_base_url_contract.mode_public_env_var}</dt>
              <dd>{apiConfig.publicEnvVars.commandCenterApiMode}</dd>
            </div>
          </dl>
        </article>

        <article className="release-card">
          <p className="card-kicker">{copy.identityLabel}</p>
          <dl className="detail-list">
            <div>
              <dt>{copy.fields.authenticated}</dt>
              <dd>{String(session.session.authenticated)}</dd>
            </div>
            <div>
              <dt>{copy.fields.authenticationProvider}</dt>
              <dd>{session.session.authentication_provider}</dd>
            </div>
            <div>
              <dt>{copy.fields.authenticationMode}</dt>
              <dd>{session.session.authentication_mode}</dd>
            </div>
            <div>
              <dt>{copy.fields.roles}</dt>
              <dd>{session.session.roles.join(", ")}</dd>
            </div>
            <div>
              <dt>{copy.fields.sessionAvailable}</dt>
              <dd>{String(sessionAvailable)}</dd>
            </div>
          </dl>
        </article>
      </div>

      <div className="release-grid">
        <article className="release-card">
          <p className="card-kicker">{copy.tenantLabel}</p>
          <dl className="detail-list">
            <div>
              <dt>{copy.fields.tenantId}</dt>
              <dd>{tenant.tenant_id}</dd>
            </div>
            <div>
              <dt>{copy.fields.tenantMode}</dt>
              <dd>{tenant.tenant_mode}</dd>
            </div>
            <div>
              <dt>{copy.fields.tenantIsolation}</dt>
              <dd>{String(tenant.tenant_isolation_required)}</dd>
            </div>
            <div>
              <dt>{copy.fields.hostedDatastore}</dt>
              <dd>{String(tenant.hosted_datastore_enabled)}</dd>
            </div>
            <div>
              <dt>{copy.fields.tenantAvailable}</dt>
              <dd>{String(tenantAvailable)}</dd>
            </div>
          </dl>
        </article>

        <article className="release-card">
          <p className="card-kicker">{copy.grantedPermissionsLabel}</p>
          <ul className="warning-list">
            {grantedPermissions.map((permission) => (
              <li key={permission.permission}>
                {labelFor(copy.permissionLabels, permission.permission)}
              </li>
            ))}
          </ul>
        </article>

        <article className="release-card">
          <p className="card-kicker">{copy.deniedMutationsLabel}</p>
          <ul className="warning-list">
            {deniedMutations.map((permission) => (
              <li key={permission.permission}>
                {labelFor(copy.permissionLabels, permission.permission)}
              </li>
            ))}
          </ul>
        </article>
      </div>

      <div className="release-grid">
        <article className="release-card release-gaps">
          <p className="card-kicker">{copy.endpointsLabel}</p>
          <ul className="warning-list">
            {readiness.required_read_endpoints.map((endpoint) => (
              <li key={endpoint.path}>
                <strong>{endpoint.path}</strong>: {labelFor(copy.endpointPurposeLabels, endpoint.purpose)}
              </li>
            ))}
          </ul>
        </article>

        <article className="release-card release-gaps">
          <p className="card-kicker">{copy.safetyFlagsLabel}</p>
          <div className="validation-list">
            {Object.entries(readiness.safety_flags).map(([key, value]) => (
              <span className="validation-row" key={key}>
                <span>{labelFor(copy.safetyFlagLabels, key)}</span>
                <strong>{String(value)}</strong>
              </span>
            ))}
          </div>
        </article>

        <article className="release-card release-gaps">
          <p className="card-kicker">{copy.requiredBeforeUseLabel}</p>
          <ul className="warning-list">
            {readiness.required_before_customer_hosted_use.map((item) => (
              <li key={item}>{labelFor(copy.requiredBeforeUseLabels, item)}</li>
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
