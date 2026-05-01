import type { DashboardCopy } from "../i18n";

type DeploymentDataBoundaryPanelProps = {
  copy: DashboardCopy["deploymentDataBoundary"];
};

export function DeploymentDataBoundaryPanel({ copy }: DeploymentDataBoundaryPanelProps) {
  return (
    <section className="deployment-boundary-panel" aria-labelledby="deployment-boundary-title">
      <div className="section-heading">
        <p className="eyebrow">{copy.eyebrow}</p>
        <h2 id="deployment-boundary-title">{copy.title}</h2>
        <p>{copy.description}</p>
      </div>

      <div className="deployment-boundary-grid">
        {copy.modes.map((mode) => (
          <article className="deployment-boundary-card" key={mode.title}>
            <p className="card-kicker">{mode.kicker}</p>
            <h3>{mode.title}</h3>
            <dl className="boundary-facts">
              <div>
                <dt>{copy.canShowLabel}</dt>
                <dd>{mode.canShow}</dd>
              </div>
              <div>
                <dt>{copy.requiresLabel}</dt>
                <dd>{mode.requires}</dd>
              </div>
              <div>
                <dt>{copy.cannotDoLabel}</dt>
                <dd>{mode.cannotDo}</dd>
              </div>
            </dl>
          </article>
        ))}
      </div>

      <div className="boundary-callout">
        <div>
          <p className="card-kicker">{copy.operatorKicker}</p>
          <h3>{copy.operatorTitle}</h3>
          <p>{copy.operatorText}</p>
        </div>
        <div className="workflow-metrics" aria-label={copy.safetyLabel}>
          <span className="metric ok">TRADING_MODE=paper</span>
          <span className="metric ok">ENABLE_LIVE_TRADING=false</span>
          <span className="metric ok">BROKER_PROVIDER=paper</span>
          <span className="metric warn">PRODUCTION_SQLITE_ACCESS=false</span>
          <span className="metric warn">LOCAL_BACKEND_REQUIRED_FOR_RECORDS=true</span>
        </div>
      </div>
    </section>
  );
}
