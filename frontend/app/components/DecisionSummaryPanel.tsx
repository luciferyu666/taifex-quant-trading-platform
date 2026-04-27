type DecisionSummary = {
  rejected_count: number;
  needs_data_review_count: number;
  approved_for_paper_research_count: number;
};

type DecisionSummaryPanelProps = {
  decisionCount: number;
  summary: DecisionSummary;
};

export function DecisionSummaryPanel({
  decisionCount,
  summary,
}: DecisionSummaryPanelProps) {
  return (
    <article className="packet-subpanel" aria-labelledby="decision-summary-title">
      <div>
        <p className="card-kicker">Review Status</p>
        <h3 id="decision-summary-title">Decision summary</h3>
      </div>
      <dl className="decision-summary-grid">
        <div>
          <dt>Total decisions</dt>
          <dd>{decisionCount}</dd>
        </div>
        <div>
          <dt>Rejected</dt>
          <dd>{summary.rejected_count}</dd>
        </div>
        <div>
          <dt>Needs data review</dt>
          <dd>{summary.needs_data_review_count}</dd>
        </div>
        <div>
          <dt>Paper research only</dt>
          <dd>{summary.approved_for_paper_research_count}</dd>
        </div>
      </dl>
    </article>
  );
}
