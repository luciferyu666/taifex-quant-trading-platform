import type { DashboardCopy } from "../i18n";

export type ResearchReviewSafetyFlags = {
  research_only: boolean;
  execution_eligible: boolean;
  order_created: boolean;
  broker_api_called: boolean;
  risk_engine_called: boolean;
  oms_called: boolean;
  performance_claim: boolean;
  simulated_metrics_only: boolean;
  external_data_downloaded: boolean;
  ranking_generated: boolean;
  best_strategy_selected: boolean;
  approval_for_live: boolean;
  approval_for_paper_execution: boolean;
  persisted: boolean;
};

const expectedSafeValues: ResearchReviewSafetyFlags = {
  research_only: true,
  execution_eligible: false,
  order_created: false,
  broker_api_called: false,
  risk_engine_called: false,
  oms_called: false,
  performance_claim: false,
  simulated_metrics_only: true,
  external_data_downloaded: false,
  ranking_generated: false,
  best_strategy_selected: false,
  approval_for_live: false,
  approval_for_paper_execution: false,
  persisted: false,
};

type SafetyFlagsPanelProps = {
  copy: DashboardCopy["safetyFlags"];
  flags: ResearchReviewSafetyFlags;
};

export function SafetyFlagsPanel({ copy, flags }: SafetyFlagsPanelProps) {
  const entries = Object.entries(copy.labels) as [keyof ResearchReviewSafetyFlags, string][];

  return (
    <article className="packet-subpanel" aria-labelledby="safety-flags-title">
      <div>
        <p className="card-kicker">{copy.kicker}</p>
        <h3 id="safety-flags-title">{copy.title}</h3>
      </div>
      <div className="flag-grid">
        {entries.map(([key, label]) => {
          const safe = flags[key] === expectedSafeValues[key];
          return (
            <span className={safe ? "flag ok" : "flag danger"} key={key}>
              <span>{label}</span>
              <strong>{String(flags[key])}</strong>
            </span>
          );
        })}
      </div>
    </article>
  );
}
