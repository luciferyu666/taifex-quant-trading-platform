"use client";

import { useState } from "react";

import { commandCenterApiBaseUrl } from "../apiBase";
import type { DashboardCopy } from "../i18n";
import {
  PaperAuditTimelinePanel,
  type PaperAuditEventRecord,
} from "./PaperAuditTimelinePanel";
import {
  PaperOmsTimelinePanel,
  type PaperOmsEventRecord,
} from "./PaperOmsTimelinePanel";

export type PaperExecutionRunRecord = {
  workflow_run_id: string;
  approval_id: string;
  approval_decision: string;
  order_id: string | null;
  source_signal_id: string | null;
  strategy_id: string | null;
  strategy_version: string | null;
  final_oms_status: string | null;
  paper_only: boolean;
  live_trading_enabled: boolean;
  broker_api_called: boolean;
  paper_broker_gateway_called: boolean;
  persisted_at: string;
};

type PaperExecutionRecordsPanelProps = {
  copy: DashboardCopy;
  available: boolean;
  error?: string;
  runs: PaperExecutionRunRecord[];
  omsEvents: PaperOmsEventRecord[];
  auditEvents: PaperAuditEventRecord[];
};

const backendUrl = commandCenterApiBaseUrl;

export function PaperExecutionRecordsPanel({
  copy,
  available,
  error,
  runs,
  omsEvents,
  auditEvents,
}: PaperExecutionRecordsPanelProps) {
  const [selectedRunId, setSelectedRunId] = useState<string>(
    runs[0]?.workflow_run_id ?? "",
  );
  const [currentOmsEvents, setCurrentOmsEvents] =
    useState<PaperOmsEventRecord[]>(omsEvents);
  const [currentAuditEvents, setCurrentAuditEvents] =
    useState<PaperAuditEventRecord[]>(auditEvents);
  const [timelineError, setTimelineError] = useState<string>("");
  const [isLoadingTimeline, setIsLoadingTimeline] = useState(false);
  const [copyStatus, setCopyStatus] = useState<string>("");

  const selectedRun =
    runs.find((run) => run.workflow_run_id === selectedRunId) ?? runs[0];

  async function selectRun(run: PaperExecutionRunRecord) {
    setSelectedRunId(run.workflow_run_id);
    setTimelineError("");
    setIsLoadingTimeline(true);
    try {
      const [nextOmsEvents, nextAuditEvents] = await Promise.all([
        fetchReadOnlyJson<PaperOmsEventRecord[]>(
          `/api/paper-execution/runs/${run.workflow_run_id}/oms-events`,
        ),
        fetchReadOnlyJson<PaperAuditEventRecord[]>(
          `/api/paper-execution/runs/${run.workflow_run_id}/audit-events`,
        ),
      ]);
      setCurrentOmsEvents(nextOmsEvents);
      setCurrentAuditEvents(nextAuditEvents);
    } catch (fetchError) {
      setTimelineError(
        fetchError instanceof Error ? fetchError.message : copy.paperRecords.timelineError,
      );
      setCurrentOmsEvents([]);
      setCurrentAuditEvents([]);
    } finally {
      setIsLoadingTimeline(false);
    }
  }

  async function copyValue(label: string, value: string | null) {
    if (!value) {
      return;
    }
    try {
      await navigator.clipboard.writeText(value);
      setCopyStatus(`${label}: ${copy.paperRecords.copied}`);
    } catch {
      setCopyStatus(copy.paperRecords.copyFailed);
    }
  }

  return (
    <section className="paper-records-section" aria-labelledby="paper-records-title">
      <div className="section-heading">
        <p className="eyebrow">{copy.paperRecords.eyebrow}</p>
        <h2 id="paper-records-title">{copy.paperRecords.title}</h2>
        <p>{copy.paperRecords.description}</p>
      </div>
      {!available ? (
        <p className="notice">
          {copy.paperRecords.fallbackPrefix} {error}
        </p>
      ) : null}

      <div className="paper-records-layout">
        <article className="paper-record-panel">
          <div>
            <p className="card-kicker">{copy.paperRecords.runsKicker}</p>
            <h3>{copy.paperRecords.runsTitle}</h3>
          </div>
          {runs.length === 0 ? (
            <p className="empty-state">{copy.paperRecords.empty}</p>
          ) : (
            <div className="paper-run-list">
              {runs.map((run) => (
                <button
                  aria-pressed={selectedRun?.workflow_run_id === run.workflow_run_id}
                  className={
                    selectedRun?.workflow_run_id === run.workflow_run_id
                      ? "paper-run-row active"
                      : "paper-run-row"
                  }
                  key={run.workflow_run_id}
                  type="button"
                  onClick={() => void selectRun(run)}
                >
                  <div>
                    <strong>{run.workflow_run_id}</strong>
                    <span>{formatDate(run.persisted_at)}</span>
                  </div>
                  <dl>
                    <div>
                      <dt>{copy.paperRecords.approvalDecision}</dt>
                      <dd>{run.approval_decision}</dd>
                    </div>
                    <div>
                      <dt>{copy.paperRecords.orderId}</dt>
                      <dd>{run.order_id ?? copy.paperRecords.none}</dd>
                    </div>
                    <div>
                      <dt>{copy.paperRecords.finalStatus}</dt>
                      <dd>{run.final_oms_status ?? copy.paperRecords.none}</dd>
                    </div>
                  </dl>
                </button>
              ))}
            </div>
          )}
        </article>

        <article className="paper-record-panel selected-run">
          <div>
            <p className="card-kicker">{copy.paperRecords.selectedKicker}</p>
            <h3>{copy.paperRecords.selectedTitle}</h3>
          </div>
          {selectedRun ? (
            <dl className="detail-list">
              <div>
                <dt>{copy.paperRecords.workflowRunId}</dt>
                <dd>
                  <span>{selectedRun.workflow_run_id}</span>
                  <button
                    className="inline-copy-button"
                    type="button"
                    onClick={() =>
                      void copyValue(copy.paperRecords.workflowRunId, selectedRun.workflow_run_id)
                    }
                  >
                    {copy.paperRecords.copyWorkflow}
                  </button>
                </dd>
              </div>
              <div>
                <dt>{copy.paperRecords.approvalId}</dt>
                <dd>{selectedRun.approval_id}</dd>
              </div>
              <div>
                <dt>{copy.paperRecords.sourceSignal}</dt>
                <dd>{selectedRun.source_signal_id ?? copy.paperRecords.none}</dd>
              </div>
              <div>
                <dt>{copy.paperRecords.strategy}</dt>
                <dd>
                  {selectedRun.strategy_id
                    ? `${selectedRun.strategy_id}@${selectedRun.strategy_version ?? "unknown"}`
                    : copy.paperRecords.none}
                </dd>
              </div>
              <div>
                <dt>{copy.paperRecords.paperOnly}</dt>
                <dd>{String(selectedRun.paper_only)}</dd>
              </div>
              <div>
                <dt>{copy.paperRecords.brokerApiCalled}</dt>
                <dd>{String(selectedRun.broker_api_called)}</dd>
              </div>
              <div>
                <dt>{copy.paperRecords.orderId}</dt>
                <dd>
                  <span>{selectedRun.order_id ?? copy.paperRecords.none}</span>
                  {selectedRun.order_id ? (
                    <button
                      className="inline-copy-button"
                      type="button"
                      onClick={() =>
                        void copyValue(copy.paperRecords.orderId, selectedRun.order_id)
                      }
                    >
                      {copy.paperRecords.copyOrder}
                    </button>
                  ) : null}
                </dd>
              </div>
            </dl>
          ) : (
            <p className="empty-state">{copy.paperRecords.noSelectedRun}</p>
          )}
        </article>
      </div>

      <div className="timeline-toolbar">
        <span className={isLoadingTimeline ? "metric warn" : "metric ok"}>
          {isLoadingTimeline
            ? copy.paperRecords.timelineLoading
            : copy.paperRecords.timelineReady}
        </span>
        {selectedRun ? (
          <button
            className="action-button secondary"
            type="button"
            onClick={() => void selectRun(selectedRun)}
          >
            {copy.paperRecords.refreshTimelines}
          </button>
        ) : null}
      </div>
      {timelineError ? <p className="notice">{timelineError}</p> : null}
      {copyStatus ? <p className="loader-status ok">{copyStatus}</p> : null}

      <div className="paper-timeline-layout">
        <PaperOmsTimelinePanel copy={copy.paperOmsTimeline} events={currentOmsEvents} />
        <PaperAuditTimelinePanel copy={copy.paperAuditTimeline} events={currentAuditEvents} />
      </div>

      <p className="read-only-note">{copy.paperRecords.readOnlyNote}</p>
    </section>
  );
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toISOString();
}

async function fetchReadOnlyJson<T>(path: string): Promise<T> {
  const response = await fetch(`${backendUrl}${path}`, {
    cache: "no-store",
    signal: AbortSignal.timeout(5000),
  });
  if (!response.ok) {
    throw new Error(`Backend returned HTTP ${response.status}`);
  }
  return (await response.json()) as T;
}
