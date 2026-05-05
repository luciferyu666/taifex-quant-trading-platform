"use client";

import type { DashboardCopy } from "../i18n";
import {
  buildBrowserOnlyVisualizationData,
  type BrowserMockMarketRegime,
  type BrowserMockSymbol,
  type BrowserOnlyMockSession,
} from "./browserOnlyMockRuntime";

type MarketRealismVisualizationPanelProps = {
  copy: DashboardCopy["browserOnlyMockDemo"]["marketRealismVisualization"];
  session: BrowserOnlyMockSession;
  symbol: BrowserMockSymbol;
};

const regimeOrder: BrowserMockMarketRegime[] = [
  "normal",
  "trending",
  "volatile",
  "illiquid",
  "stale_quote",
];

export function MarketRealismVisualizationPanel({
  copy,
  session,
  symbol,
}: MarketRealismVisualizationPanelProps) {
  const visualization = buildBrowserOnlyVisualizationData(session, symbol);
  const latest = visualization.latest_snapshot;
  const latestOrder = visualization.latest_order;
  const orderRealism = latestOrder?.market_realism ?? null;
  const spread = orderRealism?.spread_points ?? latest.spread_points;
  const liquidity = orderRealism?.liquidity_score ?? latest.liquidity_score;
  const quoteAge = orderRealism?.quote_age_seconds ?? latest.quote_age_seconds;
  const slippage = orderRealism?.slippage_points_estimate ?? latest.slippage_points_estimate;
  const fillReason = orderRealism?.fill_reason ?? copy.emptyFillReason;

  return (
    <section className="market-realism-panel" aria-labelledby="market-realism-title">
      <div className="section-heading">
        <p className="eyebrow">{copy.eyebrow}</p>
        <h3 id="market-realism-title">{copy.title}</h3>
        <p>{copy.description}</p>
      </div>

      <div className="market-realism-grid">
        <article className="market-realism-card regime-card">
          <div className="browser-chart-header">
            <div>
              <p className="card-kicker">{copy.regimeKicker}</p>
              <h4>{copy.regimeTitle}</h4>
            </div>
            <span className={`regime-pill regime-${latest.market_regime}`}>
              {latest.market_regime}
            </span>
          </div>

          <div className="market-regime-timeline" aria-label={copy.regimeTimelineLabel}>
            {visualization.price_path.map((point) => (
              <span
                className={`market-regime-step regime-${point.market_regime}`}
                key={`${point.symbol}-${point.tick}-${point.market_regime}`}
                title={`${copy.fields.tick} ${point.tick}: ${point.market_regime}`}
              >
                <span>{point.tick}</span>
                <strong>{point.market_regime}</strong>
              </span>
            ))}
          </div>

          <div className="regime-legend-grid">
            {regimeOrder.map((regime) => (
              <div className="regime-legend-item" key={regime}>
                <span className={`regime-dot regime-${regime}`} />
                <div>
                  <strong>{copy.regimes[regime].label}</strong>
                  <p>{copy.regimes[regime].description}</p>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="market-realism-card">
          <p className="card-kicker">{copy.microstructureKicker}</p>
          <h4>{copy.microstructureTitle}</h4>
          <div className="market-quality-grid">
            <QualityMeter label={copy.fields.spread} value={spread} max={8} tone="amber" />
            <QualityMeter label={copy.fields.liquidity} value={liquidity} max={1} tone="green" />
            <QualityMeter label={copy.fields.quoteAge} value={quoteAge} max={10} tone="red" />
            <QualityMeter label={copy.fields.slippage} value={slippage} max={4} tone="blue" />
          </div>
          <dl className="detail-list compact">
            <div>
              <dt>{copy.fields.bidSize}</dt>
              <dd>{latest.bid_size}</dd>
            </div>
            <div>
              <dt>{copy.fields.askSize}</dt>
              <dd>{latest.ask_size}</dd>
            </div>
            <div>
              <dt>{copy.fields.volatility}</dt>
              <dd>{latest.volatility_points}</dd>
            </div>
          </dl>
        </article>

        <article className="market-realism-card explanation-card">
          <p className="card-kicker">{copy.fillKicker}</p>
          <h4>{copy.fillTitle}</h4>
          {latestOrder ? (
            <dl className="detail-list compact">
              <div>
                <dt>{copy.fields.outcome}</dt>
                <dd>{latestOrder.simulation_outcome}</dd>
              </div>
              <div>
                <dt>{copy.fields.fillQuantity}</dt>
                <dd>
                  {latestOrder.simulated_fill_quantity}/{latestOrder.quantity}
                </dd>
              </div>
              <div>
                <dt>{copy.fields.fillPrice}</dt>
                <dd>{latestOrder.simulated_fill_price ?? "N/A"}</dd>
              </div>
              <div>
                <dt>{copy.fields.remainingQuantity}</dt>
                <dd>{latestOrder.remaining_quantity}</dd>
              </div>
            </dl>
          ) : (
            <p className="read-only-note">{copy.noOrderYet}</p>
          )}
          <div className="fill-explanation-box">
            <strong>{copy.fields.fillReason}</strong>
            <p>{fillReason}</p>
          </div>
        </article>

        <article className="market-realism-card">
          <p className="card-kicker">{copy.pnlKicker}</p>
          <h4>{copy.pnlTitle}</h4>
          <dl className="detail-list compact">
            <div>
              <dt>{copy.fields.position}</dt>
              <dd>{visualization.portfolio.position_contracts}</dd>
            </div>
            <div>
              <dt>{copy.fields.averagePrice}</dt>
              <dd>{visualization.portfolio.average_price ?? "N/A"}</dd>
            </div>
            <div>
              <dt>{copy.fields.markPrice}</dt>
              <dd>{visualization.portfolio.mark_price ?? latest.last}</dd>
            </div>
            <div>
              <dt>{copy.fields.unrealizedPnl}</dt>
              <dd>{visualization.performance.unrealized_pnl_twd}</dd>
            </div>
          </dl>
          <p className="read-only-note">{copy.pnlNote}</p>
        </article>
      </div>

      <div className="market-realism-safety-row">
        {copy.safety.map((item) => (
          <span className="metric ok" key={item}>
            {item}
          </span>
        ))}
      </div>
    </section>
  );
}

function QualityMeter({
  label,
  max,
  tone,
  value,
}: {
  label: string;
  max: number;
  tone: "amber" | "blue" | "green" | "red";
  value: number;
}) {
  const width = Math.max(0, Math.min(100, Math.round((value / max) * 100)));
  return (
    <div className="market-quality-meter">
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
      <div className="bar-track" aria-label={`${label}: ${value}`}>
        <span className={`bar-fill tone-${tone}`} style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}
