import type { DashboardCopy } from "../i18n";

export type PaperAuditIntegrityEventCheck = {
  workflow_run_id: string;
  audit_id: string;
  sequence: number;
  timestamp: string;
  stored_previous_hash: string | null;
  expected_previous_hash: string;
  stored_event_hash: string | null;
  expected_event_hash: string;
  previous_hash_valid: boolean;
  event_hash_valid: boolean;
  workflow_continuity_valid: boolean;
  duplicate_audit_id: boolean;
  paper_only: boolean;
  verified: boolean;
  message: string;
};

export type PaperAuditIntegrityVerification = {
  verified: boolean;
  workflow_run_id: string | null;
  generated_at: string;
  db_path: string;
  audit_events_count: number;
  workflows_checked: number;
  missing_hash_count: number;
  broken_chain_count: number;
  duplicate_audit_ids_count: number;
  paper_only: boolean;
  live_trading_enabled: boolean;
  broker_api_called: boolean;
  local_sqlite_only: boolean;
  worm_ledger: boolean;
  immutable_audit_log: boolean;
  centralized_audit_service: boolean;
  production_audit_compliance: boolean;
  checks: PaperAuditIntegrityEventCheck[];
  warnings: string[];
  message: string;
};

export type PaperAuditIntegrityStatus = {
  enabled: boolean;
  db_path: string;
  local_sqlite_only: boolean;
  paper_only: boolean;
  live_trading_enabled: boolean;
  broker_api_called: boolean;
  worm_ledger: boolean;
  immutable_audit_log: boolean;
  centralized_audit_service: boolean;
  production_audit_compliance: boolean;
  audit_events_count: number;
  workflows_checked: number;
  latest_verification: PaperAuditIntegrityVerification | null;
  known_gaps: string[];
  message: string;
};

type PaperAuditIntegrityPanelProps = {
  available: boolean;
  copy: DashboardCopy;
  error?: string;
  status: PaperAuditIntegrityStatus;
  verification: PaperAuditIntegrityVerification;
};

const trueIsSafe = new Set(["paper_only", "local_sqlite_only"]);
const falseIsSafe = new Set([
  "live_trading_enabled",
  "broker_api_called",
  "worm_ledger",
  "immutable_audit_log",
  "centralized_audit_service",
  "production_audit_compliance",
]);

export function PaperAuditIntegrityPanel({
  available,
  copy,
  error,
  status,
  verification,
}: PaperAuditIntegrityPanelProps) {
  const labels = copy.paperAuditIntegrity;
  const latestChecks = verification.checks.slice(0, 6);

  return (
    <section className="paper-reliability-section" aria-labelledby="paper-audit-integrity-title">
      <div className="section-heading">
        <p className="eyebrow">{labels.eyebrow}</p>
        <h2 id="paper-audit-integrity-title">{labels.title}</h2>
        <p>{labels.description}</p>
        {!available ? (
          <p className="notice">
            {labels.fallbackPrefix} {error}
          </p>
        ) : null}
      </div>

      <div className="paper-reliability-grid">
        <article className="paper-record-panel selected-run">
          <p className="card-kicker">{labels.statusKicker}</p>
          <h3>{labels.statusTitle}</h3>
          <p>{verification.message || status.message}</p>
          <div className="reliability-metrics">
            <span className={verification.verified ? "metric ok" : "metric danger"}>
              {labels.verified}: {String(verification.verified)}
            </span>
            <span className="metric ok">
              {labels.auditEvents}: {verification.audit_events_count}
            </span>
            <span className="metric warn">
              {labels.brokenChains}: {verification.broken_chain_count}
            </span>
            <span className="metric warn">
              {labels.missingHashes}: {verification.missing_hash_count}
            </span>
          </div>
        </article>

        <article className="paper-record-panel">
          <p className="card-kicker">{labels.safetyKicker}</p>
          <h3>{labels.safetyTitle}</h3>
          <div className="flag-grid reliability-flags">
            {renderFlag(labels, "paper_only", verification.paper_only)}
            {renderFlag(labels, "local_sqlite_only", verification.local_sqlite_only)}
            {renderFlag(labels, "live_trading_enabled", verification.live_trading_enabled)}
            {renderFlag(labels, "broker_api_called", verification.broker_api_called)}
            {renderFlag(labels, "worm_ledger", verification.worm_ledger)}
            {renderFlag(
              labels,
              "centralized_audit_service",
              verification.centralized_audit_service,
            )}
          </div>
        </article>
      </div>

      <div className="paper-reliability-grid secondary">
        <article className="paper-record-panel reliability-wide">
          <p className="card-kicker">{labels.checksKicker}</p>
          <h3>{labels.checksTitle}</h3>
          {latestChecks.length === 0 ? (
            <p className="empty-state">{labels.emptyChecks}</p>
          ) : (
            <ol className="reliability-list">
              {latestChecks.map((check) => (
                <li key={`${check.workflow_run_id}:${check.audit_id}`}>
                  <strong>{check.verified ? labels.checkPassed : labels.checkFailed}</strong>
                  <dl className="detail-list compact">
                    <Detail label={labels.fields.workflowRunId} value={check.workflow_run_id} />
                    <Detail label={labels.fields.auditId} value={check.audit_id} />
                    <Detail label={labels.fields.sequence} value={String(check.sequence)} />
                    <Detail
                      label={labels.fields.previousHashValid}
                      value={String(check.previous_hash_valid)}
                    />
                    <Detail
                      label={labels.fields.eventHashValid}
                      value={String(check.event_hash_valid)}
                    />
                    <Detail
                      label={labels.fields.duplicateAuditId}
                      value={String(check.duplicate_audit_id)}
                    />
                  </dl>
                </li>
              ))}
            </ol>
          )}
        </article>

        <article className="paper-record-panel">
          <p className="card-kicker">{labels.gapsKicker}</p>
          <h3>{labels.gapsTitle}</h3>
          <ul className="warning-list">
            {status.known_gaps.map((gap) => (
              <li key={gap}>{gap}</li>
            ))}
          </ul>
        </article>

        <article className="paper-record-panel">
          <p className="card-kicker">{labels.warningsKicker}</p>
          <h3>{labels.warningsTitle}</h3>
          <ul className="warning-list">
            {verification.warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </article>
      </div>

      <p className="read-only-note">{labels.readOnlyNote}</p>
    </section>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function renderFlag(
  labels: DashboardCopy["paperAuditIntegrity"],
  key: keyof DashboardCopy["paperAuditIntegrity"]["flagLabels"],
  value: boolean,
) {
  return (
    <span className={isSafeFlag(key, value) ? "flag ok" : "flag danger"} key={key}>
      {labels.flagLabels[key]}
      <strong>{String(value)}</strong>
    </span>
  );
}

function isSafeFlag(key: string, value: boolean): boolean {
  if (trueIsSafe.has(key)) {
    return value === true;
  }
  if (falseIsSafe.has(key)) {
    return value === false;
  }
  return false;
}
