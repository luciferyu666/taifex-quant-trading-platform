import type { DashboardCopy } from "../i18n";

type WorkflowStandardizationPanelProps = {
  copy: DashboardCopy["workflowStandardization"];
};

export function WorkflowStandardizationPanel({ copy }: WorkflowStandardizationPanelProps) {
  return (
    <section className="workflow-standardization-panel" aria-labelledby="workflow-standardization-title">
      <div className="section-heading compact">
        <p className="eyebrow">{copy.eyebrow}</p>
        <h2 id="workflow-standardization-title">{copy.title}</h2>
        <p>{copy.description}</p>
      </div>

      <div className="workflow-standardization-grid">
        {copy.steps.map((step, index) => (
          <article className="workflow-standardization-card" key={step.title}>
            <span className="workflow-standardization-index">{index + 1}</span>
            <div>
              <p className="card-kicker">{step.kicker}</p>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
              <dl>
                <div>
                  <dt>{copy.demoActionLabel}</dt>
                  <dd>{step.demoAction}</dd>
                </div>
                <div>
                  <dt>{copy.standardLabel}</dt>
                  <dd>{step.standard}</dd>
                </div>
              </dl>
            </div>
          </article>
        ))}
      </div>

      <div className="workflow-standardization-safety">
        <div>
          <p className="card-kicker">{copy.safetyKicker}</p>
          <h3>{copy.safetyTitle}</h3>
          <p>{copy.safetyDescription}</p>
        </div>
        <ul>
          {copy.safetyItems.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
