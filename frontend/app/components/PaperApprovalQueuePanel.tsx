import type { DashboardCopy } from "../i18n";

export type PaperApprovalStatus = {
  trading_mode: string;
  live_trading_enabled: boolean;
  broker_provider: string;
  approval_mode: string;
  supported_decisions: string[];
  reviewer_roles: string[];
  dual_review_required: boolean;
  immutable_record_policy: string;
  broker_api_called: boolean;
  message: string;
};

export type PaperApprovalSignalPayload = {
  signal_id: string;
  strategy_id: string;
  strategy_version: string;
  timestamp: string;
  symbol_group: string;
  direction: "LONG" | "SHORT" | "FLAT";
  target_tx_equivalent: number;
  confidence: number;
  stop_distance_points: number | null;
  reason: Record<string, unknown>;
};

export type PaperApprovalRequestRecord = {
  approval_request_id: string;
  signal_id: string;
  strategy_id: string;
  strategy_version: string;
  requested_action: "paper_simulation";
  requester_id: string;
  request_reason: string;
  created_at: string;
  status: string;
  required_review_count: number;
  required_decision_sequence: string[];
  paper_only: boolean;
  approval_for_live: boolean;
  live_execution_eligible: boolean;
  broker_api_called: boolean;
  request_hash: string;
  latest_chain_hash: string;
  payload?: {
    signal?: PaperApprovalSignalPayload;
  };
};

export type PaperApprovalDecisionRecord = {
  approval_decision_id: string;
  approval_request_id: string;
  sequence: number;
  decision: string;
  reviewer_id: string;
  reviewer_role: string;
  decision_reason: string;
  decided_at: string;
  paper_only: boolean;
  approval_for_live: boolean;
  broker_api_called: boolean;
  previous_chain_hash: string;
  decision_hash: string;
};

export type PaperApprovalHistory = {
  request: PaperApprovalRequestRecord;
  decisions: PaperApprovalDecisionRecord[];
  current_status: string;
  pending_second_review: boolean;
  paper_simulation_approved: boolean;
  approval_for_live: boolean;
  live_execution_eligible: boolean;
  broker_api_called: boolean;
  immutable_record_policy: string;
  message: string;
};

type PaperApprovalQueuePanelProps = {
  available: boolean;
  copy: DashboardCopy;
  error?: string;
  history: PaperApprovalHistory[];
  queue: PaperApprovalHistory[];
  status: PaperApprovalStatus;
};

export function PaperApprovalQueuePanel({
  available,
  copy,
  error,
  history,
  queue,
  status,
}: PaperApprovalQueuePanelProps) {
  return (
    <section className="paper-approval-section" aria-labelledby="paper-approval-title">
      <div className="section-heading">
        <p className="eyebrow">{copy.paperApprovals.eyebrow}</p>
        <h2 id="paper-approval-title">{copy.paperApprovals.title}</h2>
        <p>{copy.paperApprovals.description}</p>
      </div>
      {!available ? (
        <p className="notice">
          {copy.paperApprovals.fallbackPrefix} {error}
        </p>
      ) : null}

      <div className="paper-approval-grid">
        <article className="paper-approval-panel status">
          <p className="card-kicker">{copy.paperApprovals.statusKicker}</p>
          <h3>{copy.paperApprovals.statusTitle}</h3>
          <p>{status.message}</p>
          <div className="workflow-metrics">
            <span className="metric ok">TRADING_MODE={status.trading_mode}</span>
            <span className="metric ok">
              ENABLE_LIVE_TRADING={String(status.live_trading_enabled)}
            </span>
            <span className="metric ok">BROKER_PROVIDER={status.broker_provider}</span>
            <span className="metric ok">
              {copy.paperApprovals.dualReview}={String(status.dual_review_required)}
            </span>
            <span className="metric ok">
              {copy.paperApprovals.brokerApiCalled}={String(status.broker_api_called)}
            </span>
          </div>
          <dl className="detail-list compact">
            <div>
              <dt>{copy.paperApprovals.approvalMode}</dt>
              <dd>{status.approval_mode}</dd>
            </div>
            <div>
              <dt>{copy.paperApprovals.reviewerRoles}</dt>
              <dd>{status.reviewer_roles.join(", ")}</dd>
            </div>
            <div>
              <dt>{copy.paperApprovals.supportedDecisions}</dt>
              <dd>{status.supported_decisions.join(", ")}</dd>
            </div>
            <div>
              <dt>{copy.paperApprovals.recordPolicy}</dt>
              <dd>{status.immutable_record_policy}</dd>
            </div>
          </dl>
        </article>

        <article className="paper-approval-panel queue">
          <p className="card-kicker">{copy.paperApprovals.queueKicker}</p>
          <h3>{copy.paperApprovals.queueTitle}</h3>
          {queue.length === 0 ? (
            <p className="empty-state">{copy.paperApprovals.emptyQueue}</p>
          ) : (
            <div className="approval-request-list">
              {queue.map((item) => (
                <ApprovalRequestSummary
                  copy={copy.paperApprovals}
                  item={item}
                  key={item.request.approval_request_id}
                />
              ))}
            </div>
          )}
        </article>
      </div>

      <article className="paper-approval-panel history">
        <p className="card-kicker">{copy.paperApprovals.historyKicker}</p>
        <h3>{copy.paperApprovals.historyTitle}</h3>
        {history.length === 0 ? (
          <p className="empty-state">{copy.paperApprovals.emptyHistory}</p>
        ) : (
          <div className="approval-history-list">
            {history.map((item) => (
              <ApprovalHistoryCard
                copy={copy.paperApprovals}
                item={item}
                key={item.request.approval_request_id}
              />
            ))}
          </div>
        )}
      </article>

      <p className="read-only-note">{copy.paperApprovals.readOnlyNote}</p>
    </section>
  );
}

function ApprovalRequestSummary({
  copy,
  item,
}: {
  copy: DashboardCopy["paperApprovals"];
  item: PaperApprovalHistory;
}) {
  return (
    <div className="approval-request-card">
      <div className="approval-request-heading">
        <strong>{item.request.approval_request_id}</strong>
        <span className={item.paper_simulation_approved ? "metric ok" : "metric warn"}>
          {item.current_status}
        </span>
      </div>
      <dl className="detail-list compact">
        <div>
          <dt>{copy.strategy}</dt>
          <dd>
            {item.request.strategy_id}@{item.request.strategy_version}
          </dd>
        </div>
        <div>
          <dt>{copy.signal}</dt>
          <dd>{item.request.signal_id}</dd>
        </div>
        <div>
          <dt>{copy.requiredSequence}</dt>
          <dd>{item.request.required_decision_sequence.join(" -> ")}</dd>
        </div>
        <div>
          <dt>{copy.createdAt}</dt>
          <dd>{formatDate(item.request.created_at)}</dd>
        </div>
        <div>
          <dt>{copy.hashChain}</dt>
          <dd>
            {copy.requestHash}: {formatChecksum(item.request.request_hash)}
            <br />
            {copy.latestHash}: {formatChecksum(item.request.latest_chain_hash)}
          </dd>
        </div>
      </dl>
      <SafetyFlagStrip copy={copy} item={item} />
    </div>
  );
}

function ApprovalHistoryCard({
  copy,
  item,
}: {
  copy: DashboardCopy["paperApprovals"];
  item: PaperApprovalHistory;
}) {
  return (
    <div className="approval-history-card">
      <div className="approval-request-heading">
        <strong>{item.request.approval_request_id}</strong>
        <span className={item.paper_simulation_approved ? "metric ok" : "metric warn"}>
          {item.current_status}
        </span>
      </div>
      <p>{item.message}</p>
      <dl className="detail-list compact">
        <div>
          <dt>{copy.requiredSequence}</dt>
          <dd>{item.request.required_decision_sequence.join(" -> ")}</dd>
        </div>
        <div>
          <dt>{copy.pendingSecondReview}</dt>
          <dd>{String(item.pending_second_review)}</dd>
        </div>
        <div>
          <dt>{copy.hashChain}</dt>
          <dd>
            {copy.requestHash}: {formatChecksum(item.request.request_hash)}
            <br />
            {copy.latestHash}: {formatChecksum(item.request.latest_chain_hash)}
          </dd>
        </div>
      </dl>
      {item.decisions.length === 0 ? (
        <p className="empty-state">{copy.noDecisions}</p>
      ) : (
        <ol className="approval-decision-list">
          {item.decisions.map((decision) => (
            <li key={decision.approval_decision_id}>
              <div className="event-heading">
                <strong>
                  {decision.sequence}. {decision.decision}
                </strong>
                <span>{formatDate(decision.decided_at)}</span>
              </div>
              <dl className="event-detail-list">
                <div>
                  <dt>{copy.reviewer}</dt>
                  <dd>
                    {decision.reviewer_id} / {decision.reviewer_role}
                  </dd>
                </div>
                <div>
                  <dt>{copy.reason}</dt>
                  <dd>{decision.decision_reason}</dd>
                </div>
                <div>
                  <dt>{copy.hashChain}</dt>
                  <dd>
                    {copy.previousHash}: {formatChecksum(decision.previous_chain_hash)}
                    <br />
                    {copy.decisionHash}: {formatChecksum(decision.decision_hash)}
                  </dd>
                </div>
              </dl>
            </li>
          ))}
        </ol>
      )}
      <SafetyFlagStrip copy={copy} item={item} />
    </div>
  );
}

function SafetyFlagStrip({
  copy,
  item,
}: {
  copy: DashboardCopy["paperApprovals"];
  item: PaperApprovalHistory;
}) {
  return (
    <div className="approval-safety-strip" aria-label={copy.safetyFlags}>
      <span className="metric ok">{copy.paperOnly}={String(item.request.paper_only)}</span>
      <span className="metric ok">
        {copy.noLiveApproval}={String(item.approval_for_live)}
      </span>
      <span className="metric ok">
        {copy.executionEligible}={String(item.live_execution_eligible)}
      </span>
      <span className="metric ok">
        {copy.brokerApiCalled}={String(item.broker_api_called)}
      </span>
    </div>
  );
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toISOString();
}

function formatChecksum(value: string): string {
  if (value.length <= 16) {
    return value;
  }
  return `${value.slice(0, 12)}...${value.slice(-8)}`;
}
