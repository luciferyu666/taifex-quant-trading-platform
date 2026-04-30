"use client";

import { useState, type ChangeEvent } from "react";

import type { DashboardCopy } from "../i18n";
import type {
  PaperAuditIntegrityEventCheck,
  PaperAuditIntegrityVerification,
} from "./PaperAuditIntegrityPanel";

type PaperAuditIntegrityEvidenceSafetyFlags = {
  paper_only: boolean;
  local_sqlite_only: boolean;
  live_trading_enabled: boolean;
  broker_api_called: boolean;
  database_written: boolean;
  external_db_written: boolean;
  worm_ledger: boolean;
  immutable_audit_log: boolean;
  centralized_audit_service: boolean;
  production_audit_compliance: boolean;
  broker_credentials_collected: boolean;
};

type PaperAuditIntegrityEvidence = PaperAuditIntegrityVerification & {
  evidence_type: "paper_audit_integrity_verification";
  safety_flags: PaperAuditIntegrityEvidenceSafetyFlags;
};

type ValidationResult =
  | { ok: true; evidence: PaperAuditIntegrityEvidence }
  | { ok: false; reason: string };

const maxLocalEvidenceBytes = 500_000;

export function PaperAuditIntegrityEvidencePanel({ copy }: { copy: DashboardCopy }) {
  const labels = copy.paperAuditIntegrityEvidence;
  const [evidence, setEvidence] = useState<PaperAuditIntegrityEvidence | null>(null);
  const [loaderMessage, setLoaderMessage] = useState<string>(labels.initialMessage);
  const [loaderState, setLoaderState] = useState<"idle" | "ok" | "error">("idle");
  const [sourceLabel, setSourceLabel] = useState<string>(labels.noSource);

  async function handleEvidenceFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) {
      return;
    }

    if (!file.name.toLowerCase().endsWith(".json")) {
      reject(labels.rejectExtension);
      return;
    }

    if (file.size > maxLocalEvidenceBytes) {
      reject(labels.rejectSize);
      return;
    }

    try {
      const parsed = JSON.parse(await file.text()) as unknown;
      const validation = validatePaperAuditIntegrityEvidence(parsed);
      if (!validation.ok) {
        reject(`${labels.rejectPrefix}: ${validation.reason}`);
        return;
      }

      setEvidence(validation.evidence);
      setSourceLabel(`${labels.loadedPrefix}: ${file.name}`);
      setLoaderState("ok");
      setLoaderMessage(labels.loadedMessage);
    } catch (error) {
      reject(
        error instanceof Error
          ? `${labels.rejectPrefix}: ${error.message}`
          : labels.invalidJson,
      );
    }
  }

  function reject(message: string) {
    setLoaderState("error");
    setLoaderMessage(message);
    setEvidence(null);
    setSourceLabel(labels.noSource);
  }

  function clearEvidence() {
    setEvidence(null);
    setSourceLabel(labels.noSource);
    setLoaderState("idle");
    setLoaderMessage(labels.clearMessage);
  }

  const latestChecks = evidence?.checks.slice(0, 6) ?? [];

  return (
    <section
      className="paper-evidence-section paper-audit-integrity-evidence-section"
      aria-labelledby="paper-audit-integrity-evidence-title"
    >
      <div className="paper-evidence-loader panel">
        <div>
          <p className="card-kicker">{labels.eyebrow}</p>
          <h2 id="paper-audit-integrity-evidence-title">{labels.title}</h2>
          <p>{labels.description}</p>
          <p>
            {labels.currentSource}: <strong>{sourceLabel}</strong>
          </p>
        </div>
        <label className="file-picker">
          <span>{labels.selectFile}</span>
          <input
            accept=".json,application/json"
            aria-describedby="paper-audit-integrity-evidence-loader-status"
            onChange={handleEvidenceFileChange}
            type="file"
          />
        </label>
        <div className="packet-loader-actions">
          <button className="action-button secondary" type="button" onClick={clearEvidence}>
            {labels.clearLocalJson}
          </button>
        </div>
        <p
          className={
            loaderState === "error"
              ? "loader-status error"
              : loaderState === "ok"
                ? "loader-status ok"
                : "loader-status"
          }
          id="paper-audit-integrity-evidence-loader-status"
        >
          {loaderMessage}
        </p>
      </div>

      {evidence ? (
        <div className="paper-evidence-layout">
          <article className="paper-record-panel selected-run">
            <p className="card-kicker">{labels.identityKicker}</p>
            <h3>{labels.identityTitle}</h3>
            <dl className="detail-list">
              <Detail label={labels.fields.generatedAt} value={evidence.generated_at} />
              <Detail label={labels.fields.workflowRunId} value={evidence.workflow_run_id ?? labels.none} />
              <Detail label={labels.fields.dbPath} value={evidence.db_path} />
              <Detail label={labels.fields.message} value={evidence.message} />
            </dl>
          </article>

          <article className="paper-record-panel">
            <p className="card-kicker">{labels.summaryKicker}</p>
            <h3>{labels.summaryTitle}</h3>
            <div className="reliability-metrics">
              <span className={evidence.verified ? "metric ok" : "metric danger"}>
                {labels.fields.verified}: {String(evidence.verified)}
              </span>
              <span className="metric ok">
                {labels.fields.auditEvents}: {evidence.audit_events_count}
              </span>
              <span className="metric warn">
                {labels.fields.brokenChains}: {evidence.broken_chain_count}
              </span>
              <span className="metric warn">
                {labels.fields.duplicateAuditIds}: {evidence.duplicate_audit_ids_count}
              </span>
            </div>
          </article>

          <article className="paper-record-panel">
            <p className="card-kicker">{labels.safetyKicker}</p>
            <h3>{labels.safetyTitle}</h3>
            <div className="flag-grid">
              {Object.entries(evidence.safety_flags).map(([key, value]) => (
                <span className={isSafeEvidenceFlag(key, value) ? "flag ok" : "flag danger"} key={key}>
                  {labels.safetyLabels[key as keyof typeof labels.safetyLabels] ?? key}
                  <strong>{String(value)}</strong>
                </span>
              ))}
            </div>
          </article>

          <article className="paper-record-panel paper-evidence-wide">
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

          <article className="paper-record-panel paper-evidence-wide">
            <p className="card-kicker">{labels.warningsKicker}</p>
            <h3>{labels.warningsTitle}</h3>
            <ul className="warning-list">
              {evidence.warnings.map((warning) => (
                <li key={warning}>{warning}</li>
              ))}
            </ul>
            <p className="read-only-note">{labels.readOnlyNote}</p>
          </article>
        </div>
      ) : (
        <p className="empty-state">{labels.empty}</p>
      )}
    </section>
  );
}

function validatePaperAuditIntegrityEvidence(payload: unknown): ValidationResult {
  if (!isRecord(payload)) {
    return { ok: false, reason: "evidence payload must be a JSON object" };
  }
  if (payload.evidence_type !== "paper_audit_integrity_verification") {
    return {
      ok: false,
      reason: "evidence_type must be paper_audit_integrity_verification",
    };
  }

  for (const field of ["generated_at", "db_path", "message"] as const) {
    if (!isNonEmptyString(payload[field])) {
      return { ok: false, reason: `${field} is required` };
    }
  }

  for (const field of [
    "audit_events_count",
    "workflows_checked",
    "missing_hash_count",
    "broken_chain_count",
    "duplicate_audit_ids_count",
  ] as const) {
    if (!isNonNegativeInteger(payload[field])) {
      return { ok: false, reason: `${field} must be a non-negative integer` };
    }
  }

  if (typeof payload.verified !== "boolean") {
    return { ok: false, reason: "verified must be boolean" };
  }
  if (payload.workflow_run_id !== null && payload.workflow_run_id !== undefined) {
    if (!isNonEmptyString(payload.workflow_run_id)) {
      return { ok: false, reason: "workflow_run_id must be null or a non-empty string" };
    }
  }

  const rootFlags = {
    paper_only: true,
    local_sqlite_only: true,
    live_trading_enabled: false,
    broker_api_called: false,
    worm_ledger: false,
    immutable_audit_log: false,
    centralized_audit_service: false,
    production_audit_compliance: false,
  } as const;
  for (const [flag, expected] of Object.entries(rootFlags)) {
    if (payload[flag] !== expected) {
      return { ok: false, reason: `${flag} must be ${String(expected)}` };
    }
  }

  if (!isRecord(payload.safety_flags)) {
    return { ok: false, reason: "safety_flags object is required" };
  }
  const safetyFlags = {
    ...rootFlags,
    database_written: false,
    external_db_written: false,
    broker_credentials_collected: false,
  } as const;
  for (const [flag, expected] of Object.entries(safetyFlags)) {
    if (payload.safety_flags[flag] !== expected) {
      return { ok: false, reason: `safety_flags.${flag} must be ${String(expected)}` };
    }
  }

  if (!Array.isArray(payload.checks)) {
    return { ok: false, reason: "checks must be an array" };
  }
  for (const check of payload.checks) {
    if (!validateEventCheck(check)) {
      return { ok: false, reason: "checks contain an invalid audit integrity check" };
    }
  }

  if (!Array.isArray(payload.warnings) || payload.warnings.some((item) => typeof item !== "string")) {
    return { ok: false, reason: "warnings must be a string array" };
  }

  return { ok: true, evidence: payload as PaperAuditIntegrityEvidence };
}

function validateEventCheck(payload: unknown): payload is PaperAuditIntegrityEventCheck {
  if (!isRecord(payload)) {
    return false;
  }
  return (
    isNonEmptyString(payload.workflow_run_id) &&
    isNonEmptyString(payload.audit_id) &&
    isNonNegativeInteger(payload.sequence) &&
    isNonEmptyString(payload.timestamp) &&
    (payload.stored_previous_hash === null || isHashString(payload.stored_previous_hash)) &&
    isHashString(payload.expected_previous_hash) &&
    (payload.stored_event_hash === null || isHashString(payload.stored_event_hash)) &&
    isHashString(payload.expected_event_hash) &&
    typeof payload.previous_hash_valid === "boolean" &&
    typeof payload.event_hash_valid === "boolean" &&
    typeof payload.workflow_continuity_valid === "boolean" &&
    typeof payload.duplicate_audit_id === "boolean" &&
    payload.paper_only === true &&
    typeof payload.verified === "boolean" &&
    isNonEmptyString(payload.message)
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt>{label}</dt>
      <dd>{value || "n/a"}</dd>
    </div>
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isNonNegativeInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 0;
}

function isHashString(value: unknown): value is string {
  return typeof value === "string" && /^[a-f0-9]{64}$/i.test(value);
}

function isSafeEvidenceFlag(key: string, value: unknown): boolean {
  if (key === "paper_only" || key === "local_sqlite_only") {
    return value === true;
  }
  return value === false;
}
