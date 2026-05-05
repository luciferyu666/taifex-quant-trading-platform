"use client";

import { useEffect, useMemo, useState } from "react";

import type { DashboardCopy } from "../i18n";
import {
  BrowserOnlyMockDemoGuide,
  type BrowserOnlyGuideAction,
} from "./BrowserOnlyMockDemoGuide";
import { BrowserOnlyMockVisualizationPanel } from "./BrowserOnlyMockVisualizationPanel";
import {
  advanceBrowserOnlyMockTick,
  browserOnlyMockSeed,
  createInitialBrowserOnlyMockSession,
  isBrowserOnlyMockSession,
  resetBrowserOnlyMockSession,
  runBrowserOnlyMockStrategy,
  simulateBrowserOnlyPaperOrder,
  type BrowserMockSymbol,
  type BrowserOnlyMockSession,
} from "./browserOnlyMockRuntime";

const storageKey = "taifex-browser-only-mock-demo-session-v1";

export function BrowserOnlyMockDemoPanel({
  copy,
}: {
  copy: DashboardCopy["browserOnlyMockDemo"];
}) {
  const [session, setSession] = useState<BrowserOnlyMockSession>(() =>
    createInitialBrowserOnlyMockSession(),
  );
  const [symbol, setSymbol] = useState<BrowserMockSymbol>("TMF");
  const [quantity, setQuantity] = useState(1);
  const [statusMessage, setStatusMessage] = useState<string>(copy.initialMessage);
  const [activeGuideStep, setActiveGuideStep] = useState(0);

  useEffect(() => {
    const stored = loadStoredSession();
    if (stored) {
      setSession(stored);
      setSymbol(stored.selected_symbol);
      setStatusMessage(copy.restoredMessage);
    }
  }, [copy.restoredMessage]);

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(session));
  }, [session]);

  const activeSnapshot = useMemo(
    () => session.market_data.find((snapshot) => snapshot.symbol === symbol) ?? null,
    [session.market_data, symbol],
  );

  function updateSession(nextSession: BrowserOnlyMockSession, message: string) {
    assertBrowserOnlySafety(nextSession);
    setSession(nextSession);
    setStatusMessage(message);
  }

  function generateNextTick() {
    updateSession(advanceBrowserOnlyMockTick(session), copy.messages.tickReady);
    setActiveGuideStep((current) => Math.max(current, 1));
  }

  function runMockStrategy() {
    updateSession(runBrowserOnlyMockStrategy(session, symbol), copy.messages.signalReady);
    setActiveGuideStep((current) => Math.max(current, 2));
  }

  function simulatePaperOrder() {
    updateSession(
      simulateBrowserOnlyPaperOrder(session, symbol, quantity),
      copy.messages.orderReady,
    );
    setActiveGuideStep((current) => Math.max(current, 3));
  }

  function resetDemoSession() {
    const nextSession = resetBrowserOnlyMockSession();
    window.localStorage.removeItem(storageKey);
    setSymbol(nextSession.selected_symbol);
    updateSession(nextSession, copy.messages.resetReady);
    setActiveGuideStep(0);
  }

  function clearDemoState() {
    const nextSession = createInitialBrowserOnlyMockSession();
    window.localStorage.removeItem(storageKey);
    setSymbol(nextSession.selected_symbol);
    updateSession(nextSession, copy.messages.clearReady);
    setActiveGuideStep(0);
  }

  function handleGuideAction(action: BrowserOnlyGuideAction) {
    if (action === "next_tick") {
      generateNextTick();
      return;
    }
    if (action === "run_strategy") {
      runMockStrategy();
      return;
    }
    if (action === "simulate_order") {
      simulatePaperOrder();
      return;
    }
    if (action === "review_oms") {
      setStatusMessage(copy.messages.reviewOmsReady);
      setActiveGuideStep(4);
      return;
    }
    if (action === "review_portfolio") {
      setStatusMessage(copy.messages.reviewPortfolioReady);
      setActiveGuideStep(5);
      return;
    }
    resetDemoSession();
  }

  async function copyDemoSummary() {
    try {
      await navigator.clipboard.writeText(buildDemoSummary(session, copy));
      setStatusMessage(copy.messages.summaryCopied);
    } catch {
      setStatusMessage(copy.messages.copyFailed);
    }
  }

  async function copyEvidenceJson() {
    try {
      await navigator.clipboard.writeText(
        JSON.stringify(buildEvidencePayload(session), null, 2),
      );
      setStatusMessage(copy.messages.evidenceCopied);
    } catch {
      setStatusMessage(copy.messages.copyFailed);
    }
  }

  return (
    <section className="paper-record-panel selected-run" aria-labelledby="browser-mock-demo-title">
      <div className="section-heading">
        <p className="eyebrow">{copy.eyebrow}</p>
        <h2 id="browser-mock-demo-title">{copy.title}</h2>
        <p>{copy.description}</p>
      </div>

      <div className="paper-submit-banner">
        <span className="metric ok">{copy.badges.paperOnly}</span>
        <span className="metric ok">{copy.badges.browserOnly}</span>
        <span className="metric ok">{copy.badges.noBackendRequired}</span>
        <span className="metric ok">{copy.badges.noBroker}</span>
        <span className="metric ok">{copy.badges.noRealMoney}</span>
        <span className="metric ok">{copy.badges.noLiveTrading}</span>
        <span className="metric ok">{copy.badges.notAdvice}</span>
      </div>

      <BrowserOnlyMockDemoGuide
        activeStep={activeGuideStep}
        copy={copy.guide}
        session={session}
        onAction={handleGuideAction}
        onStepChange={setActiveGuideStep}
      />

      <BrowserOnlyMockVisualizationPanel
        copy={copy.visualization}
        session={session}
        symbol={symbol}
      />

      <div className="paper-submit-grid">
        <label>
          <span>{copy.fields.symbol}</span>
          <select value={symbol} onChange={(event) => setSymbol(event.target.value as BrowserMockSymbol)}>
            <option value="TX">TX</option>
            <option value="MTX">MTX</option>
            <option value="TMF">TMF</option>
          </select>
        </label>

        <label>
          <span>{copy.fields.quantity}</span>
          <input
            min={1}
            max={20}
            step={1}
            type="number"
            value={quantity}
            onChange={(event) => setQuantity(Number(event.target.value))}
          />
        </label>

        <label>
          <span>{copy.fields.tick}</span>
          <input readOnly value={session.current_tick} />
        </label>
      </div>

      <div className="button-row">
        <button className="action-button" type="button" onClick={generateNextTick}>
          {copy.actions.nextTick}
        </button>
        <button className="action-button" type="button" onClick={runMockStrategy}>
          {copy.actions.runStrategy}
        </button>
        <button className="action-button" type="button" onClick={simulatePaperOrder}>
          {copy.actions.simulateOrder}
        </button>
        <button className="action-button secondary" type="button" onClick={resetDemoSession}>
          {copy.actions.resetSession}
        </button>
        <button className="action-button secondary" type="button" onClick={clearDemoState}>
          {copy.actions.clearState}
        </button>
        <button className="action-button secondary" type="button" onClick={copyDemoSummary}>
          {copy.actions.copySummary}
        </button>
        <button className="action-button secondary" type="button" onClick={copyEvidenceJson}>
          {copy.actions.copyEvidence}
        </button>
      </div>

      <p className="notice">{statusMessage}</p>

      <article className="paper-evidence-section browser-demo-session-card">
        <p className="card-kicker">{copy.sections.sessionKicker}</p>
        <h3>{copy.sections.sessionTitle}</h3>
        <dl className="detail-list">
          <div>
            <dt>{copy.fields.sessionId}</dt>
            <dd>{session.session_id}</dd>
          </div>
          <div>
            <dt>{copy.fields.mockSeed}</dt>
            <dd>{session.mock_seed}</dd>
          </div>
          <div>
            <dt>{copy.fields.storageKey}</dt>
            <dd>{storageKey}</dd>
          </div>
        </dl>
      </article>

      <div className="paper-reliability-grid">
        <article className="paper-evidence-section">
          <p className="card-kicker">{copy.sections.marketKicker}</p>
          <h3>{copy.sections.marketTitle}</h3>
          <p className="read-only-note">{copy.sections.regimeLegend}</p>
          <div className="paper-table-wrapper">
            <table className="paper-record-table">
              <thead>
                <tr>
                  <th>{copy.fields.symbol}</th>
                  <th>{copy.fields.marketRegime}</th>
                  <th>{copy.fields.bid}</th>
                  <th>{copy.fields.ask}</th>
                  <th>{copy.fields.spread}</th>
                  <th>{copy.fields.last}</th>
                  <th>{copy.fields.change}</th>
                  <th>{copy.fields.quoteAge}</th>
                  <th>{copy.fields.liquidity}</th>
                </tr>
              </thead>
              <tbody>
                {session.market_data.map((snapshot) => (
                  <tr key={snapshot.symbol}>
                    <td>{snapshot.symbol}</td>
                    <td>{snapshot.market_regime ?? "normal"}</td>
                    <td>{snapshot.bid}</td>
                    <td>{snapshot.ask}</td>
                    <td>{snapshot.spread_points ?? snapshot.ask - snapshot.bid}</td>
                    <td>{snapshot.last}</td>
                    <td>{snapshot.change_points}</td>
                    <td>{snapshot.quote_age_seconds}</td>
                    <td>{snapshot.liquidity_score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {activeSnapshot ? (
            <p className="read-only-note">
              {copy.fields.activeSnapshot}: {activeSnapshot.symbol} {activeSnapshot.last} ·{" "}
              {copy.fields.marketRegime}: {activeSnapshot.market_regime ?? "normal"} ·{" "}
              {copy.fields.spread}: {activeSnapshot.spread_points ?? activeSnapshot.ask - activeSnapshot.bid} ·{" "}
              {copy.fields.liquidity}: {activeSnapshot.liquidity_score} ·{" "}
              {copy.fields.quoteAge}: {activeSnapshot.quote_age_seconds}
            </p>
          ) : null}
        </article>

        <article className="paper-evidence-section">
          <p className="card-kicker">{copy.sections.signalKicker}</p>
          <h3>{copy.sections.signalTitle}</h3>
          {session.latest_signal ? (
            <dl className="detail-list">
              <div>
                <dt>{copy.fields.signalId}</dt>
                <dd>{session.latest_signal.signal_id}</dd>
              </div>
              <div>
                <dt>{copy.fields.direction}</dt>
                <dd>{session.latest_signal.direction}</dd>
              </div>
              <div>
                <dt>{copy.fields.targetExposure}</dt>
                <dd>{session.latest_signal.target_tx_equivalent}</dd>
              </div>
              <div>
                <dt>{copy.fields.confidence}</dt>
                <dd>{session.latest_signal.confidence}</dd>
              </div>
            </dl>
          ) : (
            <p>{copy.emptySignal}</p>
          )}
        </article>

        <article className="paper-evidence-section">
          <p className="card-kicker">{copy.sections.orderKicker}</p>
          <h3>{copy.sections.orderTitle}</h3>
          {session.latest_order ? (
            <dl className="detail-list">
              <div>
                <dt>{copy.fields.workflowRunId}</dt>
                <dd>{session.latest_order.workflow_run_id}</dd>
              </div>
              <div>
                <dt>{copy.fields.orderId}</dt>
                <dd>{session.latest_order.order_id}</dd>
              </div>
              <div>
                <dt>{copy.fields.riskApproved}</dt>
                <dd>{String(session.latest_order.risk_evaluation.approved)}</dd>
              </div>
              <div>
                <dt>{copy.fields.omsStatus}</dt>
                <dd>{session.latest_order.oms_status}</dd>
              </div>
              <div>
                <dt>{copy.fields.fillQuantity}</dt>
                <dd>{session.latest_order.simulated_fill_quantity}</dd>
              </div>
              <div>
                <dt>{copy.fields.fillPrice}</dt>
                <dd>{session.latest_order.simulated_fill_price ?? "N/A"}</dd>
              </div>
              <div>
                <dt>{copy.fields.remainingQuantity}</dt>
                <dd>{session.latest_order.remaining_quantity}</dd>
              </div>
              <div>
                <dt>{copy.fields.slippage}</dt>
                <dd>{session.latest_order.simulated_slippage_points ?? "N/A"}</dd>
              </div>
              <div>
                <dt>{copy.fields.fillReason}</dt>
                <dd>{session.latest_order.reason}</dd>
              </div>
            </dl>
          ) : (
            <p>{copy.emptyOrder}</p>
          )}
        </article>

        <article className="paper-evidence-section">
          <p className="card-kicker">{copy.sections.realismKicker}</p>
          <h3>{copy.sections.realismTitle}</h3>
          <dl className="detail-list">
            <div>
              <dt>{copy.fields.marketRegime}</dt>
              <dd>
                {session.latest_order?.market_realism?.market_regime ??
                  activeSnapshot?.market_regime ??
                  "normal"}
              </dd>
            </div>
            <div>
              <dt>{copy.fields.spread}</dt>
              <dd>
                {session.latest_order?.market_realism?.spread_points ??
                  activeSnapshot?.spread_points ??
                  "N/A"}
              </dd>
            </div>
            <div>
              <dt>{copy.fields.liquidity}</dt>
              <dd>
                {session.latest_order?.market_realism?.liquidity_score ??
                  activeSnapshot?.liquidity_score ??
                  "N/A"}
              </dd>
            </div>
            <div>
              <dt>{copy.fields.volatility}</dt>
              <dd>{activeSnapshot?.volatility_points ?? "N/A"}</dd>
            </div>
            <div>
              <dt>{copy.fields.slippage}</dt>
              <dd>
                {session.latest_order?.market_realism?.slippage_points_estimate ??
                  activeSnapshot?.slippage_points_estimate ??
                  "N/A"}
              </dd>
            </div>
            <div>
              <dt>{copy.fields.fillReason}</dt>
              <dd>{session.latest_order?.market_realism?.fill_reason ?? copy.emptyOrder}</dd>
            </div>
          </dl>
        </article>

        <article className="paper-evidence-section">
          <p className="card-kicker">{copy.sections.performanceKicker}</p>
          <h3>{copy.sections.performanceTitle}</h3>
          <dl className="detail-list">
            <div>
              <dt>{copy.fields.position}</dt>
              <dd>{session.portfolio.position_contracts}</dd>
            </div>
            <div>
              <dt>{copy.fields.averagePrice}</dt>
              <dd>{session.portfolio.average_price ?? "N/A"}</dd>
            </div>
            <div>
              <dt>{copy.fields.unrealizedPnl}</dt>
              <dd>{session.performance.unrealized_pnl_twd}</dd>
            </div>
            <div>
              <dt>{copy.fields.equity}</dt>
              <dd>{session.performance.equity_twd}</dd>
            </div>
            <div>
              <dt>{copy.fields.performanceClaim}</dt>
              <dd>{String(session.performance.performance_claim)}</dd>
            </div>
          </dl>
        </article>
      </div>

      {session.latest_order ? (
        <article className="paper-evidence-section">
          <p className="card-kicker">{copy.sections.omsKicker}</p>
          <h3>{copy.sections.omsTitle}</h3>
          <ol className="timeline-list">
            {session.latest_order.oms_timeline.map((event) => (
              <li key={event.event_id}>
                <strong>{event.event_type}</strong>
                <span>{event.status}</span>
                <span>{event.reason}</span>
              </li>
            ))}
          </ol>
        </article>
      ) : null}

      <div className="paper-reliability-grid secondary">
        <article className="paper-evidence-section">
          <p className="card-kicker">{copy.sections.timelineKicker}</p>
          <h3>{copy.sections.timelineTitle}</h3>
          <ol className="timeline-list">
            {session.timeline.slice(-8).map((event) => (
              <li key={event.event_id}>
                <strong>{event.event_type}</strong>
                <span>{event.message}</span>
              </li>
            ))}
          </ol>
        </article>

        <article className="paper-evidence-section">
          <p className="card-kicker">{copy.sections.safetyKicker}</p>
          <h3>{copy.sections.safetyTitle}</h3>
          <div className="flag-grid">
            {Object.entries(session.safety_flags).map(([key, value]) => (
              <span className={value ? "metric ok" : "metric"} key={key}>
                {key}={String(value)}
              </span>
            ))}
          </div>
          <p className="read-only-note">{copy.readOnlyNote}</p>
        </article>
      </div>

      <article className="paper-evidence-section">
        <p className="card-kicker">{copy.sections.warningsKicker}</p>
        <h3>{copy.sections.warningsTitle}</h3>
        <ul className="detail-list">
          {session.warnings.map((warning) => (
            <li key={warning}>{warning}</li>
          ))}
        </ul>
      </article>
    </section>
  );
}

function loadStoredSession(): BrowserOnlyMockSession | null {
  try {
    const stored = window.localStorage.getItem(storageKey);
    if (!stored) {
      return null;
    }
    const parsed: unknown = JSON.parse(stored);
    if (!isBrowserOnlyMockSession(parsed)) {
      return null;
    }
    return {
      ...parsed,
      mock_seed: parsed.mock_seed ?? browserOnlyMockSeed,
      safety_flags: {
        ...parsed.safety_flags,
        performance_claim: false,
      },
    };
  } catch {
    return null;
  }
}

function assertBrowserOnlySafety(session: BrowserOnlyMockSession) {
  const flags = session.safety_flags;
  if (flags.paper_only !== true) {
    throw new Error("paper_only must be true");
  }
  if (flags.browser_only !== true) {
    throw new Error("browser_only must be true");
  }
  if (flags.live_trading_enabled !== false) {
    throw new Error("live_trading_enabled must be false");
  }
  if (flags.broker_api_called !== false) {
    throw new Error("broker_api_called must be false");
  }
  if (flags.external_market_data_downloaded !== false) {
    throw new Error("external_market_data_downloaded must be false");
  }
  if (flags.real_order_created !== false) {
    throw new Error("real_order_created must be false");
  }
  if (flags.credentials_collected !== false) {
    throw new Error("credentials_collected must be false");
  }
  if (flags.database_written !== false) {
    throw new Error("database_written must be false");
  }
  if (flags.performance_claim !== false) {
    throw new Error("performance_claim must be false");
  }
}

function buildDemoSummary(
  session: BrowserOnlyMockSession,
  copy: DashboardCopy["browserOnlyMockDemo"],
) {
  const selectedSnapshot =
    session.market_data.find((snapshot) => snapshot.symbol === session.selected_symbol) ?? null;
  return [
    copy.summary.title,
    `${copy.fields.sessionId}: ${session.session_id}`,
    `${copy.fields.mockSeed}: ${session.mock_seed}`,
    `${copy.fields.tick}: ${session.current_tick}`,
    `${copy.fields.symbol}: ${session.selected_symbol}`,
    `${copy.fields.marketRegime}: ${
      session.latest_order?.market_realism?.market_regime ??
      selectedSnapshot?.market_regime ??
      "N/A"
    }`,
    `${copy.fields.spread}: ${
      session.latest_order?.market_realism?.spread_points ??
      selectedSnapshot?.spread_points ??
      "N/A"
    }`,
    `${copy.fields.liquidity}: ${
      session.latest_order?.market_realism?.liquidity_score ??
      selectedSnapshot?.liquidity_score ??
      "N/A"
    }`,
    `${copy.fields.slippage}: ${
      session.latest_order?.market_realism?.slippage_points_estimate ??
      selectedSnapshot?.slippage_points_estimate ??
      "N/A"
    }`,
    `${copy.fields.signalId}: ${session.latest_signal?.signal_id ?? "N/A"}`,
    `${copy.fields.orderId}: ${session.latest_order?.order_id ?? "N/A"}`,
    `${copy.fields.omsStatus}: ${session.latest_order?.oms_status ?? "N/A"}`,
    `${copy.fields.fillReason}: ${session.latest_order?.reason ?? "N/A"}`,
    `${copy.fields.position}: ${session.portfolio.position_contracts}`,
    `${copy.fields.unrealizedPnl}: ${session.performance.unrealized_pnl_twd}`,
    `${copy.fields.equity}: ${session.performance.equity_twd}`,
    copy.summary.safetyLine,
  ].join("\n");
}

function buildEvidencePayload(session: BrowserOnlyMockSession) {
  const selectedSnapshot =
    session.market_data.find((snapshot) => snapshot.symbol === session.selected_symbol) ?? null;
  return {
    evidence_id: `browser-only-evidence-${session.current_tick}`,
    evidence_type: "browser_only_mock_demo",
    generated_at: new Date().toISOString(),
    session_id: session.session_id,
    mock_seed: session.mock_seed,
    current_tick: session.current_tick,
    selected_symbol: session.selected_symbol,
    market_realism: {
      selected_snapshot: selectedSnapshot,
      latest_order_realism: session.latest_order?.market_realism ?? null,
      deterministic_fill_model: "deterministic_spread_liquidity_v1",
      supported_regimes: ["normal", "trending", "volatile", "illiquid", "stale_quote"],
      external_market_data_downloaded: false,
      production_execution_model: false,
    },
    market_data: session.market_data,
    latest_signal: session.latest_signal,
    latest_order: session.latest_order,
    portfolio: session.portfolio,
    performance: session.performance,
    timeline: session.timeline,
    safety_flags: session.safety_flags,
    warnings: session.warnings,
    persisted: false,
    uploaded: false,
    local_storage_only: true,
  };
}
