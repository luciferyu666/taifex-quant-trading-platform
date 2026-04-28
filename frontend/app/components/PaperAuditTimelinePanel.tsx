import type { DashboardCopy } from "../i18n";

export type PaperAuditEventRecord = {
  workflow_run_id: string;
  audit_id: string;
  actor: string;
  action: string;
  resource: string;
  timestamp: string;
  paper_only: boolean;
  metadata: Record<string, unknown>;
};

type PaperAuditTimelinePanelProps = {
  copy: DashboardCopy["paperAuditTimeline"];
  events: PaperAuditEventRecord[];
};

export function PaperAuditTimelinePanel({ copy, events }: PaperAuditTimelinePanelProps) {
  return (
    <article className="paper-record-panel" aria-labelledby="paper-audit-title">
      <div>
        <p className="card-kicker">{copy.kicker}</p>
        <h3 id="paper-audit-title">{copy.title}</h3>
      </div>
      {events.length === 0 ? (
        <p className="empty-state">{copy.empty}</p>
      ) : (
        <ol className="event-timeline audit">
          {events.map((event, index) => (
            <li key={event.audit_id}>
              <div className="event-marker">{index + 1}</div>
              <div className="event-body">
                <div className="event-heading">
                  <strong>{event.action}</strong>
                  <span>{copy.paperOnly}={String(event.paper_only)}</span>
                </div>
                <dl className="event-detail-list">
                  <div>
                    <dt>{copy.actor}</dt>
                    <dd>{event.actor}</dd>
                  </div>
                  <div>
                    <dt>{copy.resource}</dt>
                    <dd>{event.resource}</dd>
                  </div>
                  <div>
                    <dt>{copy.timestamp}</dt>
                    <dd>{formatDate(event.timestamp)}</dd>
                  </div>
                </dl>
              </div>
            </li>
          ))}
        </ol>
      )}
    </article>
  );
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toISOString();
}
