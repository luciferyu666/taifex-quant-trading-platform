import type { DashboardCopy } from "../i18n";

export type PaperComplianceApprovalReadiness = {
  service: string;
  readiness_state: string;
  summary: string;
  scaffolding: {
    local_paper_approval_queue_enabled: boolean;
    local_sqlite_persistence_enabled: boolean;
    paper_only_decisions_supported: string[];
    local_dual_review_rule_enabled: boolean;
    formal_compliance_approval_enabled: boolean;
    production_approval_authority: boolean;
    reviewer_identity_verified: boolean;
    rbac_abac_enforced: boolean;
    segregation_of_duties_enforced: boolean;
    compliance_policy_engine_enabled: boolean;
    approval_policy_versioning_enabled: boolean;
    tenant_scoped_approval_records_enabled: boolean;
    legal_retention_policy_enforced: boolean;
  };
  audit: {
    local_hash_chain_enabled: boolean;
    worm_ledger_enabled: boolean;
    immutable_audit_log_enabled: boolean;
    centralized_audit_service_enabled: boolean;
    signed_approval_records_enabled: boolean;
    external_timestamping_enabled: boolean;
    retention_policy_enforced: boolean;
    production_compliance_archive_enabled: boolean;
  };
  safety_defaults: {
    trading_mode: string;
    enable_live_trading: boolean;
    broker_provider: string;
  };
  safety_flags: Record<string, boolean | string>;
  current_scope: string[];
  missing_for_formal_compliance: string[];
  required_before_formal_approval: string[];
  docs: Record<string, string>;
  warnings: string[];
};

type PaperComplianceApprovalReadinessPanelProps = {
  readiness: PaperComplianceApprovalReadiness;
  available: boolean;
  copy: DashboardCopy["paperComplianceApprovalReadiness"];
  error?: string;
};

const SCAFFOLDING_KEYS = [
  "local_paper_approval_queue_enabled",
  "local_sqlite_persistence_enabled",
  "local_dual_review_rule_enabled",
  "formal_compliance_approval_enabled",
  "production_approval_authority",
  "reviewer_identity_verified",
  "rbac_abac_enforced",
  "segregation_of_duties_enforced",
  "compliance_policy_engine_enabled",
  "approval_policy_versioning_enabled",
  "tenant_scoped_approval_records_enabled",
  "legal_retention_policy_enforced",
] as const;

const AUDIT_KEYS = [
  "local_hash_chain_enabled",
  "worm_ledger_enabled",
  "immutable_audit_log_enabled",
  "centralized_audit_service_enabled",
  "signed_approval_records_enabled",
  "external_timestamping_enabled",
  "retention_policy_enforced",
  "production_compliance_archive_enabled",
] as const;

const SAFETY_FLAG_ORDER = [
  "paper_only",
  "read_only",
  "live_trading_enabled",
  "broker_provider",
  "broker_api_called",
  "order_created",
  "credentials_collected",
  "broker_credentials_collected",
  "database_written",
  "external_db_written",
  "production_compliance_approval",
  "live_approval_granted",
  "paper_execution_approval_granted",
  "production_trading_ready",
] as const;

function labelFor(labels: Readonly<Record<string, string>>, key: string): string {
  return labels[key] ?? key;
}

export function PaperComplianceApprovalReadinessPanel({
  readiness,
  available,
  copy,
  error,
}: PaperComplianceApprovalReadinessPanelProps) {
  return (
    <section className="release-section" aria-labelledby="paper-compliance-approval-title">
      <div className="section-heading">
        <p className="eyebrow">{copy.eyebrow}</p>
        <h2 id="paper-compliance-approval-title">{copy.title}</h2>
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
          <h3>GET /api/paper-execution/approvals/compliance-readiness</h3>
          <p>{readiness.summary}</p>
        </div>
        <span className="metric warn">
          {copy.stateLabel}: {readiness.readiness_state}
        </span>
      </div>

      <div className="release-grid">
        <article className="release-card">
          <p className="card-kicker">{copy.scaffoldingLabel}</p>
          <div className="validation-list">
            {SCAFFOLDING_KEYS.map((key) => (
              <span className="validation-row" key={key}>
                <span>{labelFor(copy.scaffoldingLabels, key)}</span>
                <strong>{String(readiness.scaffolding[key])}</strong>
              </span>
            ))}
          </div>
        </article>

        <article className="release-card">
          <p className="card-kicker">{copy.auditLabel}</p>
          <div className="validation-list">
            {AUDIT_KEYS.map((key) => (
              <span className="validation-row" key={key}>
                <span>{labelFor(copy.auditLabels, key)}</span>
                <strong>{String(readiness.audit[key])}</strong>
              </span>
            ))}
          </div>
        </article>

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
      </div>

      <div className="release-grid">
        <article className="release-card">
          <p className="card-kicker">{copy.currentScopeLabel}</p>
          <ul className="warning-list">
            {readiness.current_scope.map((item) => (
              <li key={item}>{labelFor(copy.currentScopeLabels, item)}</li>
            ))}
          </ul>
        </article>

        <article className="release-card">
          <p className="card-kicker">{copy.missingLabel}</p>
          <ul className="warning-list">
            {readiness.missing_for_formal_compliance.map((item) => (
              <li key={item}>{labelFor(copy.missingLabels, item)}</li>
            ))}
          </ul>
        </article>

        <article className="release-card">
          <p className="card-kicker">{copy.requiredLabel}</p>
          <ul className="warning-list">
            {readiness.required_before_formal_approval.map((item) => (
              <li key={item}>{labelFor(copy.requiredLabels, item)}</li>
            ))}
          </ul>
        </article>
      </div>

      <div className="release-grid">
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
          <p className="card-kicker">{copy.decisionsLabel}</p>
          <ul className="warning-list">
            {readiness.scaffolding.paper_only_decisions_supported.map((decision) => (
              <li key={decision}>{decision}</li>
            ))}
          </ul>
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
