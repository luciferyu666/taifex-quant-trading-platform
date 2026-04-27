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

const labels: Record<keyof ResearchReviewSafetyFlags, string> = {
  research_only: "Research only",
  execution_eligible: "Execution eligible",
  order_created: "Order created",
  broker_api_called: "Broker API called",
  risk_engine_called: "Risk Engine called",
  oms_called: "OMS called",
  performance_claim: "Performance claim",
  simulated_metrics_only: "Simulated metrics only",
  external_data_downloaded: "External data downloaded",
  ranking_generated: "Ranking generated",
  best_strategy_selected: "Best strategy selected",
  approval_for_live: "Live approval",
  approval_for_paper_execution: "Paper execution approval",
  persisted: "Persisted",
};

type SafetyFlagsPanelProps = {
  flags: ResearchReviewSafetyFlags;
};

export function SafetyFlagsPanel({ flags }: SafetyFlagsPanelProps) {
  const entries = Object.entries(labels) as [keyof ResearchReviewSafetyFlags, string][];

  return (
    <article className="packet-subpanel" aria-labelledby="safety-flags-title">
      <div>
        <p className="card-kicker">Guardrails</p>
        <h3 id="safety-flags-title">Read-only safety flags</h3>
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
