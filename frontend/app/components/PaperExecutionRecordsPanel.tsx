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

export function PaperExecutionRecordsPanel({
  copy,
  available,
  error,
  runs,
  omsEvents,
  auditEvents,
}: PaperExecutionRecordsPanelProps) {
  const selectedRun = runs[0];

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
                <div className="paper-run-row" key={run.workflow_run_id}>
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
                </div>
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
                <dd>{selectedRun.workflow_run_id}</dd>
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
            </dl>
          ) : (
            <p className="empty-state">{copy.paperRecords.noSelectedRun}</p>
          )}
        </article>
      </div>

      <div className="paper-timeline-layout">
        <PaperOmsTimelinePanel copy={copy.paperOmsTimeline} events={omsEvents} />
        <PaperAuditTimelinePanel copy={copy.paperAuditTimeline} events={auditEvents} />
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
