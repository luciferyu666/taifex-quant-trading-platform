"use client";

import { useState, type ChangeEvent } from "react";

import type { DashboardCopy } from "../i18n";

type PaperDemoEvidenceSafetyFlags = {
  paper_only: boolean;
  live_trading_enabled: boolean;
  broker_api_called: boolean;
  paper_broker_gateway_called?: boolean;
  local_sqlite_only?: boolean;
  external_db_written?: boolean;
  broker_credentials_collected?: boolean;
  real_order_created: boolean;
  approval_for_live: boolean;
  investment_advice?: boolean;
};

type PaperDemoEvidenceDecision = {
  approval_decision_id?: string;
  approval_request_id: string;
  sequence: number;
  decision: string;
  reviewer_id: string;
  reviewer_role: string;
  decision_reason?: string;
  decided_at: string;
  paper_only: boolean;
  approval_for_live: boolean;
  broker_api_called: boolean;
  decision_hash?: string;
};

type PaperDemoEvidence = {
  evidence_type: "paper_demo_evidence";
  generated_at: string;
  approval_request_id: string;
  reviewer_decisions: PaperDemoEvidenceDecision[];
  workflow_run_id: string;
  order_id: string;
  final_oms_status: string;
  oms_event_count: number;
  audit_event_count: number;
  local_sqlite_path: string;
  safety_flags: PaperDemoEvidenceSafetyFlags;
  warnings: string[];
};

type ValidationResult =
  | { ok: true; evidence: PaperDemoEvidence }
  | { ok: false; reason: string };

type PaperDemoEvidencePanelProps = {
  copy: DashboardCopy;
};

const maxLocalEvidenceBytes = 500_000;

export function PaperDemoEvidencePanel({ copy }: PaperDemoEvidencePanelProps) {
  const [evidence, setEvidence] = useState<PaperDemoEvidence | null>(null);
  const [loaderMessage, setLoaderMessage] = useState<string>(
    copy.paperEvidence.initialMessage,
  );
  const [loaderState, setLoaderState] = useState<"idle" | "ok" | "error">("idle");
  const [sourceLabel, setSourceLabel] = useState<string>(copy.paperEvidence.noSource);

  async function handleEvidenceFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) {
      return;
    }

    if (!file.name.toLowerCase().endsWith(".json")) {
      setLoaderState("error");
      setLoaderMessage(copy.paperEvidence.rejectExtension);
      return;
    }

    if (file.size > maxLocalEvidenceBytes) {
      setLoaderState("error");
      setLoaderMessage(copy.paperEvidence.rejectSize);
      return;
    }

    try {
      const parsed = JSON.parse(await file.text()) as unknown;
      const validation = validatePaperDemoEvidence(parsed);
      if (!validation.ok) {
        setLoaderState("error");
        setLoaderMessage(`${copy.paperEvidence.rejectPrefix}: ${validation.reason}`);
        setEvidence(null);
        setSourceLabel(copy.paperEvidence.noSource);
        return;
      }

      setEvidence(validation.evidence);
      setSourceLabel(`${copy.paperEvidence.loadedPrefix}: ${file.name}`);
      setLoaderState("ok");
      setLoaderMessage(copy.paperEvidence.loadedMessage);
    } catch (error) {
      setLoaderState("error");
      setLoaderMessage(
        error instanceof Error
          ? `${copy.paperEvidence.rejectPrefix}: ${error.message}`
          : copy.paperEvidence.invalidJson,
      );
      setEvidence(null);
      setSourceLabel(copy.paperEvidence.noSource);
    }
  }

  function clearEvidence() {
    setEvidence(null);
    setSourceLabel(copy.paperEvidence.noSource);
    setLoaderState("idle");
    setLoaderMessage(copy.paperEvidence.clearMessage);
  }

  return (
    <section className="paper-evidence-section" aria-labelledby="paper-evidence-title">
      <div className="paper-evidence-loader panel">
        <div>
          <p className="card-kicker">{copy.paperEvidence.eyebrow}</p>
          <h2 id="paper-evidence-title">{copy.paperEvidence.title}</h2>
          <p>{copy.paperEvidence.description}</p>
          <p>
            {copy.paperEvidence.currentSource}: <strong>{sourceLabel}</strong>
          </p>
        </div>
        <label className="file-picker">
          <span>{copy.paperEvidence.selectFile}</span>
          <input
            accept=".json,application/json"
            aria-describedby="paper-evidence-loader-status"
            onChange={handleEvidenceFileChange}
            type="file"
          />
        </label>
        <div className="packet-loader-actions">
          <button className="action-button secondary" type="button" onClick={clearEvidence}>
            {copy.paperEvidence.clearLocalJson}
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
          id="paper-evidence-loader-status"
        >
          {loaderMessage}
        </p>
      </div>

      {evidence ? (
        <div className="paper-evidence-layout">
          <article className="paper-record-panel selected-run">
            <p className="card-kicker">{copy.paperEvidence.identityKicker}</p>
            <h3>{copy.paperEvidence.identityTitle}</h3>
            <dl className="detail-list">
              <Detail label={copy.paperEvidence.fields.approvalRequestId} value={evidence.approval_request_id} />
              <Detail label={copy.paperEvidence.fields.workflowRunId} value={evidence.workflow_run_id} />
              <Detail label={copy.paperEvidence.fields.orderId} value={evidence.order_id} />
              <Detail label={copy.paperEvidence.fields.finalStatus} value={evidence.final_oms_status} />
              <Detail label={copy.paperEvidence.fields.omsEventCount} value={String(evidence.oms_event_count)} />
              <Detail label={copy.paperEvidence.fields.auditEventCount} value={String(evidence.audit_event_count)} />
              <Detail label={copy.paperEvidence.fields.localSqlitePath} value={evidence.local_sqlite_path} />
              <Detail label={copy.paperEvidence.fields.generatedAt} value={evidence.generated_at} />
            </dl>
          </article>

          <article className="paper-record-panel">
            <p className="card-kicker">{copy.paperEvidence.decisionsKicker}</p>
            <h3>{copy.paperEvidence.decisionsTitle}</h3>
            <ol className="approval-decision-list">
              {evidence.reviewer_decisions.map((decision) => (
                <li key={`${decision.sequence}-${decision.reviewer_id}`}>
                  <strong>{decision.decision}</strong>
                  <dl className="detail-list compact">
                    <Detail label={copy.paperEvidence.fields.reviewer} value={decision.reviewer_id} />
                    <Detail label={copy.paperEvidence.fields.reviewerRole} value={decision.reviewer_role} />
                    <Detail label={copy.paperEvidence.fields.decidedAt} value={decision.decided_at} />
                    <Detail label={copy.paperEvidence.fields.decisionHash} value={formatLongValue(decision.decision_hash)} />
                  </dl>
                </li>
              ))}
            </ol>
          </article>

          <article className="paper-record-panel">
            <p className="card-kicker">{copy.paperEvidence.safetyKicker}</p>
            <h3>{copy.paperEvidence.safetyTitle}</h3>
            <div className="flag-grid">
              {Object.entries(evidence.safety_flags).map(([key, value]) => (
                <span className={isSafeEvidenceFlag(key, value) ? "flag ok" : "flag danger"} key={key}>
                  {copy.paperEvidence.safetyLabels[
                    key as keyof typeof copy.paperEvidence.safetyLabels
                  ] ?? key}
                  <strong>{String(value)}</strong>
                </span>
              ))}
            </div>
          </article>

          <article className="paper-record-panel paper-evidence-wide">
            <p className="card-kicker">{copy.paperEvidence.warningsKicker}</p>
            <h3>{copy.paperEvidence.warningsTitle}</h3>
            <ul className="warning-list">
              {evidence.warnings.map((warning) => (
                <li key={warning}>{warning}</li>
              ))}
            </ul>
            <p className="read-only-note">{copy.paperEvidence.readOnlyNote}</p>
          </article>
        </div>
      ) : (
        <p className="empty-state">{copy.paperEvidence.empty}</p>
      )}
    </section>
  );
}

function validatePaperDemoEvidence(payload: unknown): ValidationResult {
  if (!isRecord(payload)) {
    return { ok: false, reason: "evidence payload must be a JSON object" };
  }
  if (payload.evidence_type !== "paper_demo_evidence") {
    return { ok: false, reason: "evidence_type must be paper_demo_evidence" };
  }

  for (const field of [
    "generated_at",
    "approval_request_id",
    "workflow_run_id",
    "order_id",
    "final_oms_status",
    "local_sqlite_path",
  ] as const) {
    if (!isNonEmptyString(payload[field])) {
      return { ok: false, reason: `${field} is required` };
    }
  }

  if (!isNonNegativeInteger(payload.oms_event_count)) {
    return { ok: false, reason: "oms_event_count must be a non-negative integer" };
  }
  if (!isNonNegativeInteger(payload.audit_event_count)) {
    return { ok: false, reason: "audit_event_count must be a non-negative integer" };
  }

  const decisions = payload.reviewer_decisions;
  if (!Array.isArray(decisions) || decisions.length === 0) {
    return { ok: false, reason: "reviewer_decisions must be a non-empty array" };
  }
  for (const decision of decisions) {
    if (!isRecord(decision)) {
      return { ok: false, reason: "reviewer decision must be an object" };
    }
    if (
      !isNonNegativeInteger(decision.sequence) ||
      !isNonEmptyString(decision.decision) ||
      !isNonEmptyString(decision.reviewer_id) ||
      !isNonEmptyString(decision.reviewer_role) ||
      !isNonEmptyString(decision.decided_at)
    ) {
      return { ok: false, reason: "reviewer decision fields are incomplete" };
    }
    if (decision.paper_only !== true) {
      return { ok: false, reason: "reviewer decision paper_only must be true" };
    }
    if (decision.approval_for_live !== false) {
      return { ok: false, reason: "reviewer decision approval_for_live must be false" };
    }
    if (decision.broker_api_called !== false) {
      return { ok: false, reason: "reviewer decision broker_api_called must be false" };
    }
  }

  const warnings = payload.warnings;
  if (!Array.isArray(warnings) || warnings.some((item) => typeof item !== "string")) {
    return { ok: false, reason: "warnings must be a string array" };
  }

  const safetyFlags = payload.safety_flags;
  if (!isRecord(safetyFlags)) {
    return { ok: false, reason: "safety_flags object is required" };
  }
  const requiredFlags = {
    paper_only: true,
    live_trading_enabled: false,
    broker_api_called: false,
    approval_for_live: false,
    real_order_created: false,
  } as const;
  for (const [flag, expected] of Object.entries(requiredFlags)) {
    if (safetyFlags[flag] !== expected) {
      return {
        ok: false,
        reason: `safety_flags.${flag} must be ${String(expected)}`,
      };
    }
  }

  return { ok: true, evidence: payload as PaperDemoEvidence };
}

function Detail({ label, value }: { label: string; value: string | undefined }) {
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

function isSafeEvidenceFlag(key: string, value: unknown): boolean {
  if (key === "paper_only" || key === "local_sqlite_only" || key === "paper_broker_gateway_called") {
    return value === true;
  }
  return value === false;
}

function formatLongValue(value: string | undefined): string {
  if (!value) {
    return "n/a";
  }
  if (value.length <= 24) {
    return value;
  }
  return `${value.slice(0, 12)}...${value.slice(-8)}`;
}
