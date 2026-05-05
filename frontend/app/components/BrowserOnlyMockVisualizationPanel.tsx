"use client";

import type { DashboardCopy } from "../i18n";
import {
  buildBrowserOnlyVisualizationData,
  type BrowserMockMarketDataPoint,
  type BrowserMockSymbol,
  type BrowserOnlyMockSession,
} from "./browserOnlyMockRuntime";

type BrowserOnlyMockVisualizationPanelProps = {
  copy: DashboardCopy["browserOnlyMockDemo"]["visualization"];
  session: BrowserOnlyMockSession;
  symbol: BrowserMockSymbol;
};

const chartWidth = 360;
const chartHeight = 140;
const chartPadding = 14;

export function BrowserOnlyMockVisualizationPanel({
  copy,
  session,
  symbol,
}: BrowserOnlyMockVisualizationPanelProps) {
  const visualization = buildBrowserOnlyVisualizationData(session, symbol);
  const pricePolyline = buildPolyline(visualization.price_path, "last");
  const bidPolyline = buildPolyline(visualization.price_path, "bid");
  const askPolyline = buildPolyline(visualization.price_path, "ask");
  const latestOrder = visualization.latest_order;
  const fillRatio = latestOrder
    ? latestOrder.simulated_fill_quantity / Math.max(1, latestOrder.quantity)
    : 0;
  const remainingRatio = latestOrder
    ? latestOrder.remaining_quantity / Math.max(1, latestOrder.quantity)
    : 0;

  return (
    <section className="browser-visualization-panel" aria-labelledby="browser-visualization-title">
      <div className="section-heading">
        <p className="eyebrow">{copy.eyebrow}</p>
        <h3 id="browser-visualization-title">{copy.title}</h3>
        <p>{copy.description}</p>
      </div>

      <div className="browser-visualization-grid">
        <article className="browser-chart-card">
          <div className="browser-chart-header">
            <div>
              <p className="card-kicker">{copy.pricePathKicker}</p>
              <h4>{copy.pricePathTitle}</h4>
            </div>
            <span className="metric ok">
              {copy.fields.currentTick}: {visualization.current_tick}
            </span>
          </div>
          <svg
            aria-label={copy.priceChartLabel}
            className="browser-price-chart"
            role="img"
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          >
            <polyline className="quote-band ask-line" points={askPolyline} />
            <polyline className="quote-band bid-line" points={bidPolyline} />
            <polyline className="price-line" points={pricePolyline} />
          </svg>
          <div className="regime-strip" aria-label={copy.regimeStripLabel}>
            {visualization.price_path.map((point) => (
              <span
                className={`regime-chip regime-${point.market_regime}`}
                key={`${point.symbol}-${point.tick}-${point.market_regime}`}
                title={`${copy.fields.tick} ${point.tick}: ${point.market_regime}`}
              >
                {point.tick}
              </span>
            ))}
          </div>
          <p className="read-only-note">
            {copy.latestSnapshot}: {visualization.latest_snapshot.symbol}{" "}
            {visualization.latest_snapshot.last} · {copy.fields.marketRegime}:{" "}
            {visualization.latest_snapshot.market_regime}
          </p>
        </article>

        <article className="browser-chart-card">
          <p className="card-kicker">{copy.microstructureKicker}</p>
          <h4>{copy.microstructureTitle}</h4>
          <div className="microstructure-list">
            <MetricBar
              label={copy.fields.spread}
              max={5}
              value={visualization.latest_snapshot.spread_points}
            />
            <MetricBar
              label={copy.fields.liquidity}
              max={1}
              value={visualization.latest_snapshot.liquidity_score}
            />
            <MetricBar
              label={copy.fields.quoteAge}
              max={10}
              value={visualization.latest_snapshot.quote_age_seconds}
            />
            <MetricBar
              label={copy.fields.slippage}
              max={3}
              value={visualization.latest_snapshot.slippage_points_estimate}
            />
          </div>
          <p className="read-only-note">{copy.microstructureNote}</p>
        </article>

        <article className="browser-chart-card">
          <p className="card-kicker">{copy.orderOutcomeKicker}</p>
          <h4>{copy.orderOutcomeTitle}</h4>
          {latestOrder ? (
            <>
              <div className="order-outcome-rail" aria-label={copy.orderRailLabel}>
                <span
                  className="order-fill-segment filled"
                  style={{ width: `${Math.round(fillRatio * 100)}%` }}
                />
                <span
                  className="order-fill-segment remaining"
                  style={{ width: `${Math.round(remainingRatio * 100)}%` }}
                />
              </div>
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
                  <dt>{copy.fields.fillReason}</dt>
                  <dd>{latestOrder.reason}</dd>
                </div>
              </dl>
            </>
          ) : (
            <p className="read-only-note">{copy.noOrderYet}</p>
          )}
        </article>

        <article className="browser-chart-card">
          <p className="card-kicker">{copy.portfolioKicker}</p>
          <h4>{copy.portfolioTitle}</h4>
          <dl className="detail-list compact">
            <div>
              <dt>{copy.fields.position}</dt>
              <dd>{visualization.portfolio.position_contracts}</dd>
            </div>
            <div>
              <dt>{copy.fields.unrealizedPnl}</dt>
              <dd>{visualization.performance.unrealized_pnl_twd}</dd>
            </div>
            <div>
              <dt>{copy.fields.equity}</dt>
              <dd>{visualization.performance.equity_twd}</dd>
            </div>
          </dl>
          <div className="browser-safety-row">
            <span className="metric ok">{copy.safety.browserOnly}</span>
            <span className="metric ok">{copy.safety.noExternalData}</span>
            <span className="metric ok">{copy.safety.noBroker}</span>
            <span className="metric ok">{copy.safety.noRealOrder}</span>
          </div>
        </article>
      </div>
    </section>
  );
}

function MetricBar({ label, max, value }: { label: string; max: number; value: number }) {
  const width = Math.max(0, Math.min(100, Math.round((value / max) * 100)));
  return (
    <div className="microstructure-row">
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
      <div className="bar-track" aria-label={`${label}: ${value}`}>
        <span className="bar-fill" style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}

function buildPolyline(
  points: BrowserMockMarketDataPoint[],
  field: "bid" | "ask" | "last",
): string {
  if (points.length === 0) {
    return "";
  }
  const values = points.flatMap((point) => [point.bid, point.ask, point.last]);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = Math.max(0.01, max - min);
  const usableWidth = chartWidth - chartPadding * 2;
  const usableHeight = chartHeight - chartPadding * 2;
  const xStep = points.length <= 1 ? 0 : usableWidth / (points.length - 1);
  return points
    .map((point, index) => {
      const x = chartPadding + xStep * index;
      const y = chartPadding + usableHeight - ((point[field] - min) / range) * usableHeight;
      return `${round1(x)},${round1(y)}`;
    })
    .join(" ");
}

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}
