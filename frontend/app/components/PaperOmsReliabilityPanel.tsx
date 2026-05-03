"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { commandCenterApiBaseUrl } from "../apiBase";
import type { DashboardCopy } from "../i18n";

export type PaperOmsReliabilityStatus = {
  paper_only: boolean;
  live_trading_enabled: boolean;
  broker_api_called: boolean;
  production_oms_ready: boolean;
  local_sqlite_only: boolean;
  async_order_processing_enabled: boolean;
  durable_outbox_metadata_enabled: boolean;
  duplicate_order_prevention_enabled: boolean;
  timeout_candidate_scan_enabled: boolean;
  execution_report_model_enabled: boolean;
  amend_replace_enabled: boolean;
  reconciliation_loop_enabled: boolean;
  outbox_items_count: number;
  idempotency_keys_count: number;
  execution_reports_count: number;
  timeout_candidates_count: number;
  known_gaps: string[];
  message: string;
};

export type PaperOmsOutboxItem = {
  outbox_id: string;
  workflow_run_id: string;
  order_id: string;
  idempotency_key: string;
  action: string;
  status: string;
  attempts: number;
  created_at: string;
  available_at: string;
  processed_at: string | null;
  paper_only: boolean;
  live_trading_enabled: boolean;
  broker_api_called: boolean;
  payload: Record<string, unknown>;
};

export type PaperExecutionReport = {
  report_id: string;
  workflow_run_id: string;
  order_id: string;
  idempotency_key: string;
  execution_type: string;
  order_status: string;
  last_quantity: number;
  cumulative_filled_quantity: number;
  leaves_quantity: number;
  average_fill_price: number | null;
  event_id: string;
  timestamp: string;
  paper_only: boolean;
  live_trading_enabled: boolean;
  broker_api_called: boolean;
  payload: Record<string, unknown>;
};

export type PaperOrderTimeoutCandidate = {
  workflow_run_id: string;
  order_id: string;
  final_oms_status: string;
  persisted_at: string;
  age_seconds: number;
  timeout_seconds: number;
  paper_only: boolean;
  live_trading_enabled: boolean;
  broker_api_called: boolean;
  message: string;
};

type PaperOrderTimeoutMarkResponse = {
  workflow_run_id: string;
  order_id: string;
  previous_status: string;
  new_status: string;
  timeout_seconds: number;
  age_seconds: number;
  persisted: boolean;
  paper_only: boolean;
  live_trading_enabled: boolean;
  broker_api_called: boolean;
  production_oms_ready: boolean;
  oms_event: {
    event_id: string;
    event_type: string;
    status_after: string;
  };
  audit_event: {
    audit_id: string;
    action: string;
  };
  execution_report: {
    report_id: string;
    execution_type: string;
  };
  warnings: string[];
  message: string;
};

type PaperOmsReliabilityPanelProps = {
  available: boolean;
  copy: DashboardCopy;
  error?: string;
  executionReports: PaperExecutionReport[];
  latestOrderId?: string | null;
  outboxItems: PaperOmsOutboxItem[];
  reliability: PaperOmsReliabilityStatus;
  timeoutCandidates: PaperOrderTimeoutCandidate[];
};

const backendUrl = commandCenterApiBaseUrl;

const trueIsSafe = new Set([
  "paper_only",
  "local_sqlite_only",
  "durable_outbox_metadata_enabled",
  "duplicate_order_prevention_enabled",
  "timeout_candidate_scan_enabled",
  "execution_report_model_enabled",
]);

const falseIsSafe = new Set([
  "live_trading_enabled",
  "broker_api_called",
  "production_oms_ready",
  "async_order_processing_enabled",
  "amend_replace_enabled",
  "reconciliation_loop_enabled",
]);

export function PaperOmsReliabilityPanel({
  available,
  copy,
  error,
  executionReports,
  latestOrderId,
  outboxItems,
  reliability,
  timeoutCandidates,
}: PaperOmsReliabilityPanelProps) {
  const labels = copy.paperReliability;
  const router = useRouter();
  const [previewResult, setPreviewResult] =
    useState<PaperOrderTimeoutMarkResponse | null>(null);
  const [markResult, setMarkResult] = useState<PaperOrderTimeoutMarkResponse | null>(
    null,
  );
  const [actionError, setActionError] = useState<string>("");
  const [pendingActionKey, setPendingActionKey] = useState<string>("");

  async function previewTimeout(candidate: PaperOrderTimeoutCandidate) {
    await runTimeoutAction(
      "/api/paper-execution/reliability/timeout-preview",
      candidate,
      (payload) => {
        setPreviewResult(payload);
        setMarkResult(null);
      },
    );
  }

  async function markTimeout(candidate: PaperOrderTimeoutCandidate) {
    await runTimeoutAction(
      "/api/paper-execution/reliability/timeout-mark",
      candidate,
      (payload) => {
        setMarkResult(payload);
        setPreviewResult(null);
        router.refresh();
      },
    );
  }

  async function runTimeoutAction(
    path: string,
    candidate: PaperOrderTimeoutCandidate,
    onSuccess: (payload: PaperOrderTimeoutMarkResponse) => void,
  ) {
    const actionKey = `${path}:${candidate.workflow_run_id}:${candidate.order_id}`;
    setPendingActionKey(actionKey);
    setActionError("");
    try {
      const response = await fetch(`${backendUrl}${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workflow_run_id: candidate.workflow_run_id,
          order_id: candidate.order_id,
          timeout_seconds: candidate.timeout_seconds,
          actor_id: "command-center-timeout-reviewer",
          reason: labels.timeoutActionReason,
          paper_only: true,
        }),
      });
      if (!response.ok) {
        const errorPayload = (await response.json().catch(() => null)) as
          | { detail?: string }
          | null;
        throw new Error(errorPayload?.detail ?? `HTTP ${response.status}`);
      }
      onSuccess((await response.json()) as PaperOrderTimeoutMarkResponse);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : labels.actionError);
    } finally {
      setPendingActionKey("");
    }
  }

  return (
    <section className="paper-reliability-section" aria-labelledby="paper-reliability-title">
      <div className="section-heading">
        <p className="eyebrow">{labels.eyebrow}</p>
        <h2 id="paper-reliability-title">{labels.title}</h2>
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
          <p>{reliability.message}</p>
          <div className="reliability-metrics">
            <span className="metric ok">
              {labels.outboxItems}: {reliability.outbox_items_count}
            </span>
            <span className="metric ok">
              {labels.idempotencyKeys}: {reliability.idempotency_keys_count}
            </span>
            <span className="metric ok">
              {labels.executionReports}: {reliability.execution_reports_count}
            </span>
            <span className="metric warn">
              {labels.timeoutCandidates}: {reliability.timeout_candidates_count}
            </span>
          </div>
        </article>

        <article className="paper-record-panel">
          <p className="card-kicker">{labels.safetyKicker}</p>
          <h3>{labels.safetyTitle}</h3>
          <div className="flag-grid reliability-flags">
            {renderFlag(labels, "paper_only", reliability.paper_only)}
            {renderFlag(labels, "live_trading_enabled", reliability.live_trading_enabled)}
            {renderFlag(labels, "broker_api_called", reliability.broker_api_called)}
            {renderFlag(labels, "production_oms_ready", reliability.production_oms_ready)}
            {renderFlag(labels, "local_sqlite_only", reliability.local_sqlite_only)}
            {renderFlag(
              labels,
              "async_order_processing_enabled",
              reliability.async_order_processing_enabled,
            )}
          </div>
        </article>
      </div>

      <div className="paper-reliability-grid secondary">
        <article className="paper-record-panel">
          <p className="card-kicker">{labels.capabilitiesKicker}</p>
          <h3>{labels.capabilitiesTitle}</h3>
          <div className="flag-grid reliability-flags">
            {renderFlag(
              labels,
              "durable_outbox_metadata_enabled",
              reliability.durable_outbox_metadata_enabled,
            )}
            {renderFlag(
              labels,
              "duplicate_order_prevention_enabled",
              reliability.duplicate_order_prevention_enabled,
            )}
            {renderFlag(
              labels,
              "timeout_candidate_scan_enabled",
              reliability.timeout_candidate_scan_enabled,
            )}
            {renderFlag(
              labels,
              "execution_report_model_enabled",
              reliability.execution_report_model_enabled,
            )}
            {renderFlag(labels, "amend_replace_enabled", reliability.amend_replace_enabled)}
            {renderFlag(
              labels,
              "reconciliation_loop_enabled",
              reliability.reconciliation_loop_enabled,
            )}
          </div>
        </article>

        <article className="paper-record-panel reliability-wide">
          <p className="card-kicker">{labels.gapsKicker}</p>
          <h3>{labels.gapsTitle}</h3>
          {reliability.known_gaps.length === 0 ? (
            <p className="empty-state">{labels.noKnownGaps}</p>
          ) : (
            <ul className="warning-list">
              {reliability.known_gaps.map((gap) => (
                <li key={gap}>{gap}</li>
              ))}
            </ul>
          )}
        </article>
      </div>

      <div className="paper-reliability-grid tertiary">
        <article className="paper-record-panel">
          <p className="card-kicker">{labels.outboxKicker}</p>
          <h3>{labels.outboxTitle}</h3>
          {outboxItems.length === 0 ? (
            <p className="empty-state">{labels.emptyOutbox}</p>
          ) : (
            <ol className="reliability-list">
              {outboxItems.map((item) => (
                <li key={item.outbox_id}>
                  <strong>{item.status}</strong>
                  <dl className="detail-list compact">
                    <Detail label={labels.fields.outboxId} value={item.outbox_id} />
                    <Detail label={labels.fields.workflowRunId} value={item.workflow_run_id} />
                    <Detail label={labels.fields.orderId} value={item.order_id} />
                    <Detail label={labels.fields.idempotencyKey} value={item.idempotency_key} />
                    <Detail label={labels.fields.action} value={item.action} />
                    <Detail label={labels.fields.attempts} value={String(item.attempts)} />
                  </dl>
                </li>
              ))}
            </ol>
          )}
        </article>

        <article className="paper-record-panel">
          <p className="card-kicker">{labels.executionReportsKicker}</p>
          <h3>{labels.executionReportsTitle}</h3>
          <p className="muted-copy">
            {labels.latestOrder}: {latestOrderId ?? labels.none}
          </p>
          {executionReports.length === 0 ? (
            <p className="empty-state">{labels.emptyExecutionReports}</p>
          ) : (
            <ol className="reliability-list">
              {executionReports.map((report) => (
                <li key={report.report_id}>
                  <strong>{report.execution_type}</strong>
                  <dl className="detail-list compact">
                    <Detail label={labels.fields.reportId} value={report.report_id} />
                    <Detail label={labels.fields.orderStatus} value={report.order_status} />
                    <Detail
                      label={labels.fields.lastQuantity}
                      value={String(report.last_quantity)}
                    />
                    <Detail
                      label={labels.fields.cumulativeFilled}
                      value={String(report.cumulative_filled_quantity)}
                    />
                    <Detail label={labels.fields.leaves} value={String(report.leaves_quantity)} />
                    <Detail label={labels.fields.timestamp} value={formatDate(report.timestamp)} />
                  </dl>
                </li>
              ))}
            </ol>
          )}
        </article>

        <article className="paper-record-panel">
          <p className="card-kicker">{labels.timeoutKicker}</p>
          <h3>{labels.timeoutTitle}</h3>
          <p className="muted-copy">{labels.timeoutActionNote}</p>
          {timeoutCandidates.length === 0 ? (
            <p className="empty-state">{labels.emptyTimeouts}</p>
          ) : (
            <ol className="reliability-list">
              {timeoutCandidates.map((candidate) => (
                <li key={candidateKey(candidate)}>
                  <strong>{candidate.final_oms_status}</strong>
                  <dl className="detail-list compact">
                    <Detail label={labels.fields.workflowRunId} value={candidate.workflow_run_id} />
                    <Detail label={labels.fields.orderId} value={candidate.order_id} />
                    <Detail
                      label={labels.fields.ageSeconds}
                      value={candidate.age_seconds.toFixed(1)}
                    />
                    <Detail
                      label={labels.fields.timeoutSeconds}
                      value={String(candidate.timeout_seconds)}
                    />
                    <Detail label={labels.fields.message} value={candidate.message} />
                  </dl>
                  <div className="timeout-action-row">
                    <button
                      className="action-button secondary"
                      disabled={
                        pendingActionKey ===
                        `/api/paper-execution/reliability/timeout-preview:${candidateKey(candidate)}`
                      }
                      type="button"
                      onClick={() => void previewTimeout(candidate)}
                    >
                      {pendingActionKey ===
                      `/api/paper-execution/reliability/timeout-preview:${candidateKey(candidate)}`
                        ? labels.previewing
                        : labels.previewTimeout}
                    </button>
                    <button
                      className="action-button"
                      disabled={
                        !isPreviewForCandidate(previewResult, candidate) ||
                        pendingActionKey ===
                          `/api/paper-execution/reliability/timeout-mark:${candidateKey(candidate)}`
                      }
                      type="button"
                      onClick={() => void markTimeout(candidate)}
                    >
                      {pendingActionKey ===
                      `/api/paper-execution/reliability/timeout-mark:${candidateKey(candidate)}`
                        ? labels.marking
                        : labels.markTimeout}
                    </button>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </article>
      </div>

      {actionError ? <p className="loader-status error">{actionError}</p> : null}
      {previewResult ? (
        <TimeoutActionResult
          labels={labels}
          result={previewResult}
          statusText={labels.previewReady}
        />
      ) : null}
      {markResult ? (
        <TimeoutActionResult
          labels={labels}
          result={markResult}
          statusText={labels.markSuccess}
        />
      ) : null}

      <p className="read-only-note">{labels.readOnlyNote}</p>
    </section>
  );
}

function TimeoutActionResult({
  labels,
  result,
  statusText,
}: {
  labels: DashboardCopy["paperReliability"];
  result: PaperOrderTimeoutMarkResponse;
  statusText: string;
}) {
  return (
    <article className="paper-record-panel timeout-action-result">
      <p className="card-kicker">{labels.actionResultKicker}</p>
      <h3>{labels.actionResultTitle}</h3>
      <p className={result.persisted ? "loader-status ok" : "loader-status"}>
        {statusText} {result.message}
      </p>
      <dl className="detail-list compact">
        <Detail label={labels.fields.workflowRunId} value={result.workflow_run_id} />
        <Detail label={labels.fields.orderId} value={result.order_id} />
        <Detail label={labels.fields.previousStatus} value={result.previous_status} />
        <Detail label={labels.fields.newStatus} value={result.new_status} />
        <Detail label={labels.fields.persisted} value={String(result.persisted)} />
        <Detail label={labels.fields.eventId} value={result.oms_event.event_id} />
        <Detail label={labels.fields.auditId} value={result.audit_event.audit_id} />
        <Detail label={labels.fields.reportId} value={result.execution_report.report_id} />
        <Detail label={labels.fields.paperOnly} value={String(result.paper_only)} />
        <Detail
          label={labels.fields.brokerApiCalled}
          value={String(result.broker_api_called)}
        />
        <Detail
          label={labels.fields.productionOmsReady}
          value={String(result.production_oms_ready)}
        />
      </dl>
      <ul className="warning-list">
        {result.warnings.map((warning) => (
          <li key={warning}>{warning}</li>
        ))}
      </ul>
    </article>
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
  labels: DashboardCopy["paperReliability"],
  key: keyof DashboardCopy["paperReliability"]["flagLabels"],
  value: boolean,
) {
  return (
    <span className={isSafeReliabilityFlag(key, value) ? "flag ok" : "flag danger"} key={key}>
      {labels.flagLabels[key]}
      <strong>{String(value)}</strong>
    </span>
  );
}

function isSafeReliabilityFlag(key: string, value: boolean): boolean {
  if (trueIsSafe.has(key)) {
    return value === true;
  }
  if (falseIsSafe.has(key)) {
    return value === false;
  }
  return false;
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toISOString();
}

function candidateKey(candidate: PaperOrderTimeoutCandidate): string {
  return `${candidate.workflow_run_id}:${candidate.order_id}`;
}

function isPreviewForCandidate(
  previewResult: PaperOrderTimeoutMarkResponse | null,
  candidate: PaperOrderTimeoutCandidate,
): boolean {
  return (
    previewResult?.workflow_run_id === candidate.workflow_run_id &&
    previewResult?.order_id === candidate.order_id &&
    previewResult.persisted === false
  );
}
