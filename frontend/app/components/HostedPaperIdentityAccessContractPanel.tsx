import type { DashboardCopy } from "../i18n";

export type HostedPaperIdentityAccessContract = {
  service: string;
  contract_state: string;
  summary: string;
  identity_provider: {
    provider_required: boolean;
    provider_selected: boolean;
    provider_name: string;
    real_login_enabled: boolean;
    customer_signup_enabled: boolean;
    reviewer_login_enabled: boolean;
    session_issuance_enabled: boolean;
    session_cookie_issued: boolean;
    mfa_required_for_privileged_roles: boolean;
    mfa_enabled: boolean;
  };
  session_boundary: {
    required_claims: string[];
    session_lifecycle_required: string[];
    session_storage: string;
    session_validation_enabled: boolean;
    session_audit_required: boolean;
  };
  tenant_boundary: {
    tenant_id_required_on_every_request: boolean;
    tenant_id_required_on_every_record: boolean;
    membership_required: boolean;
    cross_tenant_access_allowed: boolean;
    tenant_isolation_enforced: boolean;
    tenant_admin_role_required_for_membership_changes: boolean;
    local_sqlite_allowed_for_hosted_tenant_records: boolean;
  };
  role_permission_matrix: Array<{
    role: string;
    purpose: string;
    allowed_read_permissions: string[];
    allowed_future_mutations: string[];
    denied_permissions: string[];
    requires_mfa: boolean;
    requires_dual_review: boolean;
    can_enable_live_trading: boolean;
    can_upload_broker_credentials: boolean;
  }>;
  abac_policies: Array<{
    policy: string;
    required_attributes: string[];
    enforcement_target: string;
    enabled: boolean;
  }>;
  blocked_until_real_identity: string[];
  implementation_sequence: string[];
  safety_defaults: {
    trading_mode: string;
    enable_live_trading: boolean;
    broker_provider: string;
  };
  safety_flags: Record<string, boolean | string>;
  docs: Record<string, string>;
  warnings: string[];
};

type HostedPaperIdentityAccessContractPanelProps = {
  contract: HostedPaperIdentityAccessContract;
  available: boolean;
  copy: DashboardCopy["hostedPaperIdentityAccessContract"];
  error?: string;
};

const SAFETY_FLAG_ORDER = [
  "paper_only",
  "read_only",
  "live_trading_enabled",
  "broker_provider",
  "auth_provider_enabled",
  "real_login_enabled",
  "customer_account_created",
  "reviewer_login_created",
  "admin_login_created",
  "operator_login_created",
  "session_cookie_issued",
  "rbac_enforced",
  "abac_enforced",
  "tenant_isolation_enforced",
  "hosted_datastore_written",
  "external_db_written",
  "credentials_collected",
  "broker_credentials_collected",
  "broker_api_called",
  "order_created",
  "production_trading_ready",
] as const;

function labelFor(labels: Readonly<Record<string, string>>, key: string): string {
  return labels[key] ?? key;
}

export function HostedPaperIdentityAccessContractPanel({
  contract,
  available,
  copy,
  error,
}: HostedPaperIdentityAccessContractPanelProps) {
  return (
    <section
      className="release-section"
      aria-labelledby="hosted-paper-identity-access-title"
    >
      <div className="section-heading">
        <p className="eyebrow">{copy.eyebrow}</p>
        <h2 id="hosted-paper-identity-access-title">{copy.title}</h2>
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
          <h3>GET /api/hosted-paper/identity-access-contract</h3>
          <p>{contract.summary}</p>
        </div>
        <span className="metric warn">
          {copy.stateLabel}: {contract.contract_state}
        </span>
      </div>

      <div className="release-grid">
        <article className="release-card">
          <p className="card-kicker">{copy.providerLabel}</p>
          <div className="validation-list">
            {Object.entries(contract.identity_provider).map(([key, value]) => (
              <span className="validation-row" key={key}>
                <span>{labelFor(copy.providerLabels, key)}</span>
                <strong>{String(value)}</strong>
              </span>
            ))}
          </div>
        </article>

        <article className="release-card">
          <p className="card-kicker">{copy.sessionBoundaryLabel}</p>
          <dl className="detail-list">
            <div>
              <dt>{copy.requiredClaimsLabel}</dt>
              <dd>{contract.session_boundary.required_claims.join(", ")}</dd>
            </div>
            <div>
              <dt>{copy.sessionLifecycleLabel}</dt>
              <dd>{contract.session_boundary.session_lifecycle_required.join(", ")}</dd>
            </div>
            <div>
              <dt>{copy.sessionValidationLabel}</dt>
              <dd>{String(contract.session_boundary.session_validation_enabled)}</dd>
            </div>
            <div>
              <dt>{copy.sessionAuditLabel}</dt>
              <dd>{String(contract.session_boundary.session_audit_required)}</dd>
            </div>
          </dl>
        </article>

        <article className="release-card">
          <p className="card-kicker">{copy.tenantBoundaryLabel}</p>
          <div className="validation-list">
            {Object.entries(contract.tenant_boundary).map(([key, value]) => (
              <span className="validation-row" key={key}>
                <span>{labelFor(copy.tenantLabels, key)}</span>
                <strong>{String(value)}</strong>
              </span>
            ))}
          </div>
        </article>
      </div>

      <div className="release-grid">
        {contract.role_permission_matrix.map((role) => (
          <article className="release-card" key={role.role}>
            <p className="card-kicker">{copy.roleLabel}</p>
            <h3>{labelFor(copy.roleLabels, role.role)}</h3>
            <p>{labelFor(copy.rolePurposeLabels, role.purpose)}</p>
            <div className="validation-list">
              <span className="validation-row">
                <span>{copy.requiresMfaLabel}</span>
                <strong>{String(role.requires_mfa)}</strong>
              </span>
              <span className="validation-row">
                <span>{copy.requiresDualReviewLabel}</span>
                <strong>{String(role.requires_dual_review)}</strong>
              </span>
              <span className="validation-row">
                <span>{copy.livePermissionLabel}</span>
                <strong>{String(role.can_enable_live_trading)}</strong>
              </span>
            </div>
            <p className="card-kicker">{copy.futureMutationsLabel}</p>
            <ul className="warning-list">
              {(role.allowed_future_mutations.length > 0
                ? role.allowed_future_mutations
                : [copy.noneLabel]
              ).map((permission) => (
                <li key={permission}>{labelFor(copy.permissionLabels, permission)}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>

      <div className="release-grid">
        <article className="release-card">
          <p className="card-kicker">{copy.abacPoliciesLabel}</p>
          <ul className="warning-list">
            {contract.abac_policies.map((policy) => (
              <li key={policy.policy}>
                <strong>{labelFor(copy.abacPolicyLabels, policy.policy)}</strong>:{" "}
                {labelFor(copy.enforcementTargetLabels, policy.enforcement_target)} (
                {copy.enabledLabel}: {String(policy.enabled)})
              </li>
            ))}
          </ul>
        </article>

        <article className="release-card">
          <p className="card-kicker">{copy.blockedLabel}</p>
          <ul className="warning-list">
            {contract.blocked_until_real_identity.map((item) => (
              <li key={item}>{labelFor(copy.blockedLabels, item)}</li>
            ))}
          </ul>
        </article>

        <article className="release-card">
          <p className="card-kicker">{copy.implementationSequenceLabel}</p>
          <ol className="warning-list">
            {contract.implementation_sequence.map((item) => (
              <li key={item}>{labelFor(copy.implementationLabels, item)}</li>
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
              <strong>{contract.safety_defaults.trading_mode}</strong>
            </span>
            <span className="validation-row">
              <span>ENABLE_LIVE_TRADING</span>
              <strong>{String(contract.safety_defaults.enable_live_trading)}</strong>
            </span>
            <span className="validation-row">
              <span>BROKER_PROVIDER</span>
              <strong>{contract.safety_defaults.broker_provider}</strong>
            </span>
          </div>
        </article>

        <article className="release-card">
          <p className="card-kicker">{copy.safetyFlagsLabel}</p>
          <div className="validation-list">
            {SAFETY_FLAG_ORDER.map((key) => (
              <span className="validation-row" key={key}>
                <span>{labelFor(copy.safetyFlagLabels, key)}</span>
                <strong>{String(contract.safety_flags[key])}</strong>
              </span>
            ))}
          </div>
        </article>

        <article className="release-card">
          <p className="card-kicker">{copy.warningLabel}</p>
          <ul className="warning-list">
            {contract.warnings.map((warning) => (
              <li key={warning}>{labelFor(copy.warningLabels, warning)}</li>
            ))}
          </ul>
        </article>
      </div>
    </section>
  );
}
