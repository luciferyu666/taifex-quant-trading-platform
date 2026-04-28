import type { DashboardCopy } from "../i18n";

export type PaperOmsEventRecord = {
  workflow_run_id: string;
  order_id: string;
  event_id: string;
  sequence: number;
  event_type: string;
  status_after: string;
  timestamp: string;
  reason: string | null;
  payload: Record<string, unknown>;
};

type PaperOmsTimelinePanelProps = {
  copy: DashboardCopy["paperOmsTimeline"];
  events: PaperOmsEventRecord[];
};

export function PaperOmsTimelinePanel({ copy, events }: PaperOmsTimelinePanelProps) {
  return (
    <article className="paper-record-panel" aria-labelledby="paper-oms-title">
      <div>
        <p className="card-kicker">{copy.kicker}</p>
        <h3 id="paper-oms-title">{copy.title}</h3>
      </div>
      {events.length === 0 ? (
        <p className="empty-state">{copy.empty}</p>
      ) : (
        <ol className="event-timeline">
          {events.map((event) => (
            <li key={event.event_id}>
              <div className="event-marker">{event.sequence}</div>
              <div className="event-body">
                <div className="event-heading">
                  <strong>{event.event_type}</strong>
                  <span>{event.status_after}</span>
                </div>
                <dl className="event-detail-list">
                  <div>
                    <dt>{copy.orderId}</dt>
                    <dd>{event.order_id}</dd>
                  </div>
                  <div>
                    <dt>{copy.timestamp}</dt>
                    <dd>{formatDate(event.timestamp)}</dd>
                  </div>
                  {event.reason ? (
                    <div>
                      <dt>{copy.reason}</dt>
                      <dd>{event.reason}</dd>
                    </div>
                  ) : null}
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
