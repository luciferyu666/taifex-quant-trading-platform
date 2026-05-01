import type { DashboardCopy } from "../i18n";

export type HostedPaperTenantContext = {
  tenant_id: string;
  tenant_name: string;
  tenant_mode: string;
  tenant_isolation_required: boolean;
  hosted_datastore_enabled: boolean;
  local_sqlite_access: boolean;
  live_trading_enabled: boolean;
  broker_provider: string;
};

export type HostedPaperRoleDefinition = {
  role: string;
  description: string;
  paper_only: boolean;
  can_enable_live_trading: boolean;
  can_upload_broker_credentials: boolean;
};

export type HostedPaperPermissionDefinition = {
  permission: string;
  description: string;
  granted_in_mock_session: boolean;
  mutation: boolean;
  requires_rbac: boolean;
  requires_abac: boolean;
  requires_completed_approval_request: boolean;
};

export type HostedPaperMockSession = {
  service: string;
  contract_state: string;
  summary: string;
  session: {
    user_id: string;
    session_id: string;
    authenticated: boolean;
    authentication_provider: string;
    authentication_mode: string;
    roles: string[];
    attributes: Record<string, string | boolean | number | null>;
  };
  tenant: HostedPaperTenantContext;
  role_schema: HostedPaperRoleDefinition[];
  permission_schema: HostedPaperPermissionDefinition[];
  safety_defaults: {
    trading_mode: string;
    enable_live_trading: boolean;
    broker_provider: string;
  };
  safety_flags: {
    paper_only: boolean;
    read_only: boolean;
    live_trading_enabled: boolean;
    broker_api_called: boolean;
    order_created: boolean;
    credentials_collected: boolean;
    broker_credentials_collected: boolean;
    hosted_auth_provider_enabled: boolean;
    session_cookie_issued: boolean;
    hosted_datastore_written: boolean;
    external_db_written: boolean;
    production_trading_ready: boolean;
  };
  docs: Record<string, string>;
  warnings: string[];
};

type HostedPaperMockSessionPanelProps = {
  session: HostedPaperMockSession;
  tenant: HostedPaperTenantContext;
  available: boolean;
  copy: DashboardCopy["hostedPaperSession"];
  error?: string;
};

function labelFor(labels: Readonly<Record<string, string>>, key: string): string {
  return labels[key] ?? key;
}

export function HostedPaperMockSessionPanel({
  session,
  tenant,
  available,
  copy,
  error,
}: HostedPaperMockSessionPanelProps) {
  const grantedPermissions = session.permission_schema.filter(
    (permission) => permission.granted_in_mock_session,
  );
  const deniedMutationPermissions = session.permission_schema.filter(
    (permission) => permission.mutation && !permission.granted_in_mock_session,
  );

  return (
    <section className="release-section" aria-labelledby="hosted-paper-session-title">
      <div className="section-heading">
        <p className="eyebrow">{copy.eyebrow}</p>
        <h2 id="hosted-paper-session-title">{copy.title}</h2>
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
          <h3>GET /api/hosted-paper/session</h3>
          <p>{session.summary}</p>
        </div>
        <span className="metric ok">
          {copy.stateLabel}: {session.contract_state}
        </span>
      </div>

      <div className="release-grid">
        <article className="release-card">
          <p className="card-kicker">{copy.sessionLabel}</p>
          <dl className="detail-list">
            <div>
              <dt>{copy.fields.userId}</dt>
              <dd>{session.session.user_id}</dd>
            </div>
            <div>
              <dt>{copy.fields.sessionId}</dt>
              <dd>{session.session.session_id}</dd>
            </div>
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
          </dl>
        </article>

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
              <dt>{copy.fields.localSqliteAccess}</dt>
              <dd>{String(tenant.local_sqlite_access)}</dd>
            </div>
          </dl>
        </article>

        <article className="release-card">
          <p className="card-kicker">{copy.safetyFlagsLabel}</p>
          <div className="validation-list">
            {Object.entries(session.safety_flags).map(([key, value]) => (
              <span className="validation-row" key={key}>
                <span>{labelFor(copy.safetyFlagLabels, key)}</span>
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
            {session.role_schema.map((role) => (
              <li key={role.role}>
                <strong>{labelFor(copy.roleLabels, role.role)}</strong>:{" "}
                {labelFor(copy.roleDescriptionLabels, role.description)}
              </li>
            ))}
          </ul>
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
          <p className="card-kicker">{copy.deniedMutationPermissionsLabel}</p>
          <ul className="warning-list">
            {deniedMutationPermissions.map((permission) => (
              <li key={permission.permission}>
                {labelFor(copy.permissionLabels, permission.permission)}
              </li>
            ))}
          </ul>
        </article>
      </div>

      <article className="release-card release-gaps">
        <p className="card-kicker">{copy.warningLabel}</p>
        <ul className="warning-list">
          {session.warnings.map((warning) => (
            <li key={warning}>{labelFor(copy.warningLabels, warning)}</li>
          ))}
        </ul>
      </article>
    </section>
  );
}
