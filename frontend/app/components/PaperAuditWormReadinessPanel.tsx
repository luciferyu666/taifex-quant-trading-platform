import type { DashboardCopy } from "../i18n";

type SafetyDefaults = {
  trading_mode: string;
  enable_live_trading: boolean;
  broker_provider: string;
};

type PaperAuditWormStorageStatus = {
  local_sqlite_audit_enabled: boolean;
  local_hash_chain_enabled: boolean;
  worm_storage_enabled: boolean;
  immutable_ledger_enabled: boolean;
  append_only_enforced_by_storage: boolean;
  centralized_audit_service_enabled: boolean;
  object_lock_enabled: boolean;
  external_timestamping_enabled: boolean;
  cryptographic_signing_enabled: boolean;
  retention_policy_enforced: boolean;
  legal_hold_enabled: boolean;
  audit_export_reviewed: boolean;
  production_audit_compliance: boolean;
};

type PaperAuditWormSafetyFlags = {
  paper_only: boolean;
  read_only: boolean;
  live_trading_enabled: boolean;
  broker_provider: string;
  broker_api_called: boolean;
  order_created: boolean;
  credentials_collected: boolean;
  database_written: boolean;
  external_db_written: boolean;
  worm_compliance_claim: boolean;
  production_audit_compliance: boolean;
  production_trading_ready: boolean;
};

export type PaperAuditWormReadiness = {
  service: string;
  readiness_state: string;
  summary: string;
  storage: PaperAuditWormStorageStatus;
  safety_defaults: SafetyDefaults;
  safety_flags: PaperAuditWormSafetyFlags;
  current_scope: string[];
  missing_for_production_worm: string[];
  required_before_worm_claim: string[];
  docs: Record<string, string>;
  warnings: string[];
};

type PaperAuditWormReadinessPanelProps = {
  available: boolean;
  copy: DashboardCopy["paperAuditWormReadiness"];
  error?: string;
  readiness: PaperAuditWormReadiness;
};

const safeTrueFlags = new Set(["paper_only", "read_only"]);
const safeFalseFlags = new Set([
  "live_trading_enabled",
  "broker_api_called",
  "order_created",
  "credentials_collected",
  "database_written",
  "external_db_written",
  "worm_compliance_claim",
  "production_audit_compliance",
  "production_trading_ready",
]);

export function PaperAuditWormReadinessPanel({
  available,
  copy,
  error,
  readiness,
}: PaperAuditWormReadinessPanelProps) {
  return (
    <section className="paper-reliability-section" aria-labelledby="paper-audit-worm-title">
      <div className="section-heading">
        <p className="eyebrow">{copy.eyebrow}</p>
        <h2 id="paper-audit-worm-title">{copy.title}</h2>
        <p>{copy.description}</p>
        {!available ? (
          <p className="notice">
            {copy.fallbackPrefix} {error}
          </p>
        ) : null}
      </div>

      <div className="paper-reliability-grid">
        <article className="paper-record-panel selected-run">
          <p className="card-kicker">{copy.statusKicker}</p>
          <h3>{copy.statusTitle}</h3>
          <p>{readiness.summary}</p>
          <div className="reliability-metrics">
            <span className="metric warn">
              {copy.readinessState}: {readiness.readiness_state}
            </span>
            <span className="metric ok">
              {copy.localSqlite}: {String(readiness.storage.local_sqlite_audit_enabled)}
            </span>
            <span className="metric ok">
              {copy.localHashChain}: {String(readiness.storage.local_hash_chain_enabled)}
            </span>
            <span className="metric danger">
              {copy.wormStorage}: {String(readiness.storage.worm_storage_enabled)}
            </span>
          </div>
        </article>

        <article className="paper-record-panel">
          <p className="card-kicker">{copy.storageKicker}</p>
          <h3>{copy.storageTitle}</h3>
          <div className="flag-grid reliability-flags">
            {renderStorageFlag(copy, "worm_storage_enabled", readiness.storage.worm_storage_enabled)}
            {renderStorageFlag(
              copy,
              "immutable_ledger_enabled",
              readiness.storage.immutable_ledger_enabled,
            )}
            {renderStorageFlag(
              copy,
              "append_only_enforced_by_storage",
              readiness.storage.append_only_enforced_by_storage,
            )}
            {renderStorageFlag(
              copy,
              "centralized_audit_service_enabled",
              readiness.storage.centralized_audit_service_enabled,
            )}
            {renderStorageFlag(copy, "object_lock_enabled", readiness.storage.object_lock_enabled)}
            {renderStorageFlag(
              copy,
              "external_timestamping_enabled",
              readiness.storage.external_timestamping_enabled,
            )}
            {renderStorageFlag(
              copy,
              "cryptographic_signing_enabled",
              readiness.storage.cryptographic_signing_enabled,
            )}
            {renderStorageFlag(
              copy,
              "retention_policy_enforced",
              readiness.storage.retention_policy_enforced,
            )}
          </div>
        </article>
      </div>

      <div className="paper-reliability-grid secondary">
        <article className="paper-record-panel">
          <p className="card-kicker">{copy.currentScopeKicker}</p>
          <h3>{copy.currentScopeTitle}</h3>
          <ul className="warning-list">
            {readiness.current_scope.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>

        <article className="paper-record-panel">
          <p className="card-kicker">{copy.missingKicker}</p>
          <h3>{copy.missingTitle}</h3>
          <ul className="warning-list">
            {readiness.missing_for_production_worm.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>

        <article className="paper-record-panel">
          <p className="card-kicker">{copy.requiredKicker}</p>
          <h3>{copy.requiredTitle}</h3>
          <ul className="warning-list">
            {readiness.required_before_worm_claim.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
      </div>

      <div className="paper-reliability-grid secondary">
        <article className="paper-record-panel reliability-wide">
          <p className="card-kicker">{copy.safetyKicker}</p>
          <h3>{copy.safetyTitle}</h3>
          <div className="flag-grid reliability-flags">
            {renderSafetyFlag(copy, "paper_only", readiness.safety_flags.paper_only)}
            {renderSafetyFlag(copy, "read_only", readiness.safety_flags.read_only)}
            {renderSafetyFlag(
              copy,
              "live_trading_enabled",
              readiness.safety_flags.live_trading_enabled,
            )}
            {renderSafetyFlag(
              copy,
              "broker_api_called",
              readiness.safety_flags.broker_api_called,
            )}
            {renderSafetyFlag(copy, "order_created", readiness.safety_flags.order_created)}
            {renderSafetyFlag(
              copy,
              "credentials_collected",
              readiness.safety_flags.credentials_collected,
            )}
            {renderSafetyFlag(
              copy,
              "database_written",
              readiness.safety_flags.database_written,
            )}
            {renderSafetyFlag(
              copy,
              "worm_compliance_claim",
              readiness.safety_flags.worm_compliance_claim,
            )}
            {renderSafetyFlag(
              copy,
              "production_audit_compliance",
              readiness.safety_flags.production_audit_compliance,
            )}
          </div>
        </article>

        <article className="paper-record-panel">
          <p className="card-kicker">{copy.warningsKicker}</p>
          <h3>{copy.warningsTitle}</h3>
          <ul className="warning-list">
            {readiness.warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </article>
      </div>

      <p className="read-only-note">{copy.readOnlyNote}</p>
    </section>
  );
}

function renderStorageFlag(
  copy: DashboardCopy["paperAuditWormReadiness"],
  key: keyof DashboardCopy["paperAuditWormReadiness"]["storageLabels"],
  value: boolean,
) {
  return (
    <span className={value ? "flag danger" : "flag ok"} key={key}>
      {copy.storageLabels[key]}
      <strong>{String(value)}</strong>
    </span>
  );
}

function renderSafetyFlag(
  copy: DashboardCopy["paperAuditWormReadiness"],
  key: keyof DashboardCopy["paperAuditWormReadiness"]["safetyLabels"],
  value: boolean,
) {
  const safe =
    (value && safeTrueFlags.has(key)) || (!value && safeFalseFlags.has(key));
  return (
    <span className={safe ? "flag ok" : "flag danger"} key={key}>
      {copy.safetyLabels[key]}
      <strong>{String(value)}</strong>
    </span>
  );
}
