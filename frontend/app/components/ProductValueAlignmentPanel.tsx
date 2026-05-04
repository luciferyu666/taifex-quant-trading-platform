import type { DashboardCopy } from "../i18n";

type ProductValueAlignmentPanelProps = {
  copy: DashboardCopy["productValueAlignment"];
};

export function ProductValueAlignmentPanel({ copy }: ProductValueAlignmentPanelProps) {
  return (
    <section className="product-value-panel" aria-labelledby="product-value-title">
      <div className="section-heading compact">
        <p className="eyebrow">{copy.eyebrow}</p>
        <h2 id="product-value-title">{copy.title}</h2>
        <p>{copy.description}</p>
      </div>

      <div className="product-value-grid">
        {copy.cards.map((card) => (
          <article className="product-value-card" key={card.title}>
            <p className="card-kicker">{card.kicker}</p>
            <h3>{card.title}</h3>
            <dl>
              <div>
                <dt>{copy.featureLabel}</dt>
                <dd>{card.feature}</dd>
              </div>
              <div>
                <dt>{copy.benefitLabel}</dt>
                <dd>{card.benefit}</dd>
              </div>
            </dl>
          </article>
        ))}
      </div>

      <div className="product-value-flow" aria-label={copy.flowAriaLabel}>
        <div>
          <p className="card-kicker">{copy.flowKicker}</p>
          <h3>{copy.flowTitle}</h3>
        </div>
        <ol>
          {copy.flowSteps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </div>

      <div className="product-value-safety">
        <p className="card-kicker">{copy.safetyKicker}</p>
        <h3>{copy.safetyTitle}</h3>
        <ul>
          {copy.safetyItems.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
