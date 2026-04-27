import type { DashboardCopy } from "../i18n";

type DecisionSummary = {
  rejected_count: number;
  needs_data_review_count: number;
  approved_for_paper_research_count: number;
};

type DecisionSummaryPanelProps = {
  copy: DashboardCopy["decisionSummary"];
  decisionCount: number;
  summary: DecisionSummary;
};

export function DecisionSummaryPanel({
  copy,
  decisionCount,
  summary,
}: DecisionSummaryPanelProps) {
  return (
    <article className="packet-subpanel" aria-labelledby="decision-summary-title">
      <div>
        <p className="card-kicker">{copy.kicker}</p>
        <h3 id="decision-summary-title">{copy.title}</h3>
      </div>
      <dl className="decision-summary-grid">
        <div>
          <dt>{copy.total}</dt>
          <dd>{decisionCount}</dd>
        </div>
        <div>
          <dt>{copy.rejected}</dt>
          <dd>{summary.rejected_count}</dd>
        </div>
        <div>
          <dt>{copy.needsDataReview}</dt>
          <dd>{summary.needs_data_review_count}</dd>
        </div>
        <div>
          <dt>{copy.paperResearchOnly}</dt>
          <dd>{summary.approved_for_paper_research_count}</dd>
        </div>
      </dl>
    </article>
  );
}
