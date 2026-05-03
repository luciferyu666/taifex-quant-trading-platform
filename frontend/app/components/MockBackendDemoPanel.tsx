"use client";

import { useEffect, useMemo, useState } from "react";

import { commandCenterApiBaseUrl } from "../apiBase";
import type { DashboardCopy } from "../i18n";

type SymbolCode = "TX" | "MTX" | "TMF";
type SignalDirection = "LONG" | "SHORT" | "FLAT";

type MockBackendSafetyFlags = {
  paper_only: boolean;
  mock_backend: boolean;
  deterministic_data: boolean;
  live_trading_enabled: boolean;
  broker_api_called: boolean;
  external_market_data_downloaded: boolean;
  real_order_created: boolean;
  credentials_collected: boolean;
  production_trading_ready: boolean;
  investment_advice: boolean;
};

type MockMarketDataPoint = {
  symbol: SymbolCode;
  tick: number;
  bid: number;
  ask: number;
  last: number;
  previous_last: number;
  change_points: number;
  bid_size: number;
  ask_size: number;
  quote_age_seconds: number;
  liquidity_score: number;
  paper_only: boolean;
  external_market_data_downloaded: boolean;
};

type MockMarketDataPreview = {
  generated_at: string;
  tick: number;
  price_path: string;
  snapshots: MockMarketDataPoint[];
  safety_flags: MockBackendSafetyFlags;
  warnings: string[];
};

type MockStrategySignal = {
  signal_id: string;
  strategy_id: string;
  strategy_version: string;
  timestamp: string;
  direction: SignalDirection;
  target_tx_equivalent: number;
  confidence: number;
  reason: Record<string, boolean | number | string>;
};

type MockStrategyRunResponse = {
  signal: MockStrategySignal;
  market_snapshot: MockMarketDataPoint;
  safety_flags: MockBackendSafetyFlags;
  warnings: string[];
};

type MockOrderSimulationResponse = {
  workflow_run_id: string;
  signal: MockStrategySignal;
  market_snapshot: MockMarketDataPoint;
  paper_order_intent: {
    order_id: string;
    idempotency_key: string;
    symbol: SymbolCode;
    side: "BUY" | "SELL";
    quantity: number;
    paper_only: boolean;
  };
  risk_evaluation: {
    approved: boolean;
    reason: string;
    checks: Record<string, boolean>;
  };
  oms_state: {
    order_id: string;
    status: string;
    history: Array<{
      event_id: string;
      event_type: string;
      reason: string | null;
    }>;
  };
  paper_broker_ack: {
    broker_order_id: string;
    broker_provider: string;
    status: string;
    message: string;
    broker_api_called: boolean;
  } | null;
  paper_broker_simulation_result: {
    simulation_outcome: string;
    simulated_fill_quantity: number;
    simulated_fill_price: number | null;
    remaining_quantity: number;
    reason: string;
    broker_api_called: boolean;
  } | null;
  portfolio: {
    symbol: string | null;
    position_contracts: number;
    tx_equivalent_position: number;
    average_price: number | null;
    mark_price: number | null;
    unrealized_pnl_twd: number;
    realized_pnl_twd: number;
    cash_twd: number;
    equity_twd: number;
    paper_only: boolean;
    real_money: boolean;
  };
  safety_flags: MockBackendSafetyFlags;
  warnings: string[];
};

type MockBackendStatus = {
  service: string;
  status: string;
  trading_mode: string;
  broker_provider: string;
  capabilities: string[];
  safety_flags: MockBackendSafetyFlags;
  warnings: string[];
};

type MockDemoSession = {
  session_id: string;
  current_tick: number;
  market_data: MockMarketDataPreview;
  latest_signal: MockStrategySignal | null;
  latest_order: MockOrderSimulationResponse | null;
  safety_flags: MockBackendSafetyFlags;
  warnings: string[];
};

const backendUrl = commandCenterApiBaseUrl;

export function MockBackendDemoPanel({
  copy,
}: {
  copy: DashboardCopy["mockBackendDemo"];
}) {
  const [symbol, setSymbol] = useState<SymbolCode>("TMF");
  const [quantity, setQuantity] = useState(1);
  const [tick, setTick] = useState(1);
  const [status, setStatus] = useState<MockBackendStatus | null>(null);
  const [marketData, setMarketData] = useState<MockMarketDataPreview | null>(null);
  const [strategyResult, setStrategyResult] = useState<MockStrategyRunResponse | null>(null);
  const [orderResult, setOrderResult] = useState<MockOrderSimulationResponse | null>(null);
  const [session, setSession] = useState<MockDemoSession | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>(copy.initialMessage);
  const [errorMessage, setErrorMessage] = useState("");
  const [isWorking, setIsWorking] = useState(false);

  const activeSnapshot = useMemo(
    () => marketData?.snapshots.find((snapshot) => snapshot.symbol === symbol) ?? null,
    [marketData, symbol],
  );

  useEffect(() => {
    void loadInitialState();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadInitialState() {
    setIsWorking(true);
    setErrorMessage("");
    try {
      const [statusPayload, marketPayload, sessionPayload] = await Promise.all([
        fetchJson<MockBackendStatus>("/api/mock-backend/status"),
        fetchJson<MockMarketDataPreview>(`/api/mock-backend/market-data/preview?tick=${tick}`),
        fetchJson<MockDemoSession>("/api/mock-backend/demo-session"),
      ]);
      assertSafeFlags(statusPayload.safety_flags);
      assertSafeFlags(marketPayload.safety_flags);
      assertSafeFlags(sessionPayload.safety_flags);
      setStatus(statusPayload);
      setMarketData(marketPayload);
      setSession(sessionPayload);
      setStrategyResult(
        sessionPayload.latest_signal
          ? {
              signal: sessionPayload.latest_signal,
              market_snapshot: marketPayload.snapshots[0],
              safety_flags: sessionPayload.safety_flags,
              warnings: sessionPayload.warnings,
            }
          : null,
      );
      setOrderResult(sessionPayload.latest_order);
      setStatusMessage(copy.readyMessage);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : copy.unknownError);
      setStatusMessage(copy.backendUnavailable);
    } finally {
      setIsWorking(false);
    }
  }

  async function generateNextTick() {
    const nextTick = tick + 1;
    await runAction(copy.messages.generatingTick, async () => {
      const payload = await fetchJson<MockMarketDataPreview>(
        `/api/mock-backend/market-data/preview?tick=${nextTick}`,
      );
      assertSafeFlags(payload.safety_flags);
      setTick(nextTick);
      setMarketData(payload);
      setStatusMessage(copy.messages.tickReady);
    });
  }

  async function runMockStrategy() {
    await runAction(copy.messages.runningStrategy, async () => {
      const payload = await postJson<MockStrategyRunResponse>("/api/mock-backend/strategy/run", {
        symbol,
        tick,
        paper_only: true,
      });
      assertSafeFlags(payload.safety_flags);
      setStrategyResult(payload);
      setStatusMessage(copy.messages.signalReady);
    });
  }

  async function simulatePaperOrder() {
    await runAction(copy.messages.simulatingOrder, async () => {
      const direction = strategyResult?.signal.direction === "SHORT" ? "SHORT" : "LONG";
      const payload = await postJson<MockOrderSimulationResponse>(
        "/api/mock-backend/order/simulate",
        {
          symbol,
          tick,
          quantity,
          direction,
          strategy_signal: strategyResult?.signal ?? null,
          paper_only: true,
        },
      );
      assertSafeFlags(payload.safety_flags);
      setOrderResult(payload);
      setSession(await fetchJson<MockDemoSession>("/api/mock-backend/demo-session"));
      setStatusMessage(copy.messages.orderReady);
    });
  }

  async function resetDemoSession() {
    await runAction(copy.messages.resetting, async () => {
      const payload = await postJson<MockDemoSession>("/api/mock-backend/demo-session/reset", {});
      assertSafeFlags(payload.safety_flags);
      setTick(payload.current_tick + 1);
      setMarketData(payload.market_data);
      setStrategyResult(null);
      setOrderResult(null);
      setSession(payload);
      setStatusMessage(copy.messages.resetReady);
    });
  }

  async function runAction(message: string, action: () => Promise<void>) {
    setIsWorking(true);
    setErrorMessage("");
    setStatusMessage(message);
    try {
      await action();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : copy.unknownError);
      setStatusMessage("");
    } finally {
      setIsWorking(false);
    }
  }

  const warnings = [
    ...(status?.warnings ?? []),
    ...(marketData?.warnings ?? []),
    ...(strategyResult?.warnings ?? []),
    ...(orderResult?.warnings ?? []),
  ];

  return (
    <section className="paper-record-panel" aria-labelledby="mock-backend-demo-title">
      <div className="section-heading">
        <p className="eyebrow">{copy.eyebrow}</p>
        <h2 id="mock-backend-demo-title">{copy.title}</h2>
        <p>{copy.description}</p>
      </div>

      <div className="paper-submit-banner">
        <span className="metric ok">{copy.badges.paperOnly}</span>
        <span className="metric ok">{copy.badges.mockBackend}</span>
        <span className="metric ok">{copy.badges.noBroker}</span>
        <span className="metric ok">{copy.badges.noRealMoney}</span>
        <span className="metric ok">{copy.badges.noLiveTrading}</span>
        <span className="metric ok">{copy.badges.notAdvice}</span>
      </div>

      <div className="paper-submit-grid">
        <label>
          <span>{copy.fields.symbol}</span>
          <select value={symbol} onChange={(event) => setSymbol(event.target.value as SymbolCode)}>
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
          <input readOnly value={tick} />
        </label>
      </div>

      <div className="button-row">
        <button disabled={isWorking} onClick={generateNextTick} type="button">
          {copy.actions.nextTick}
        </button>
        <button disabled={isWorking} onClick={runMockStrategy} type="button">
          {copy.actions.runStrategy}
        </button>
        <button disabled={isWorking} onClick={simulatePaperOrder} type="button">
          {copy.actions.simulateOrder}
        </button>
        <button disabled={isWorking} onClick={resetDemoSession} type="button">
          {copy.actions.resetSession}
        </button>
      </div>

      {statusMessage ? <p className="notice">{statusMessage}</p> : null}
      {errorMessage ? <p className="notice danger">{errorMessage}</p> : null}

      <div className="paper-reliability-grid">
        <article className="paper-evidence-section">
          <p className="card-kicker">{copy.sections.marketKicker}</p>
          <h3>{copy.sections.marketTitle}</h3>
          <div className="paper-table-wrapper">
            <table className="paper-record-table">
              <thead>
                <tr>
                  <th>{copy.fields.symbol}</th>
                  <th>{copy.fields.bid}</th>
                  <th>{copy.fields.ask}</th>
                  <th>{copy.fields.last}</th>
                  <th>{copy.fields.change}</th>
                  <th>{copy.fields.quoteAge}</th>
                </tr>
              </thead>
              <tbody>
                {(marketData?.snapshots ?? []).map((snapshot) => (
                  <tr key={snapshot.symbol}>
                    <td>{snapshot.symbol}</td>
                    <td>{snapshot.bid}</td>
                    <td>{snapshot.ask}</td>
                    <td>{snapshot.last}</td>
                    <td>{snapshot.change_points}</td>
                    <td>{snapshot.quote_age_seconds}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {activeSnapshot ? (
            <p className="read-only-note">
              {copy.fields.activeSnapshot}: {activeSnapshot.symbol} {activeSnapshot.last}
            </p>
          ) : null}
        </article>

        <article className="paper-evidence-section">
          <p className="card-kicker">{copy.sections.signalKicker}</p>
          <h3>{copy.sections.signalTitle}</h3>
          {strategyResult ? (
            <dl className="detail-list">
              <div>
                <dt>{copy.fields.signalId}</dt>
                <dd>{strategyResult.signal.signal_id}</dd>
              </div>
              <div>
                <dt>{copy.fields.direction}</dt>
                <dd>{strategyResult.signal.direction}</dd>
              </div>
              <div>
                <dt>{copy.fields.targetExposure}</dt>
                <dd>{strategyResult.signal.target_tx_equivalent}</dd>
              </div>
              <div>
                <dt>{copy.fields.confidence}</dt>
                <dd>{strategyResult.signal.confidence}</dd>
              </div>
            </dl>
          ) : (
            <p>{copy.emptySignal}</p>
          )}
        </article>

        <article className="paper-evidence-section">
          <p className="card-kicker">{copy.sections.orderKicker}</p>
          <h3>{copy.sections.orderTitle}</h3>
          {orderResult ? (
            <dl className="detail-list">
              <div>
                <dt>{copy.fields.workflowRunId}</dt>
                <dd>{orderResult.workflow_run_id}</dd>
              </div>
              <div>
                <dt>{copy.fields.orderId}</dt>
                <dd>{orderResult.paper_order_intent.order_id}</dd>
              </div>
              <div>
                <dt>{copy.fields.riskApproved}</dt>
                <dd>{String(orderResult.risk_evaluation.approved)}</dd>
              </div>
              <div>
                <dt>{copy.fields.omsStatus}</dt>
                <dd>{orderResult.oms_state.status}</dd>
              </div>
              <div>
                <dt>{copy.fields.fillQuantity}</dt>
                <dd>
                  {orderResult.paper_broker_simulation_result?.simulated_fill_quantity ?? 0}
                </dd>
              </div>
            </dl>
          ) : (
            <p>{copy.emptyOrder}</p>
          )}
        </article>

        <article className="paper-evidence-section">
          <p className="card-kicker">{copy.sections.portfolioKicker}</p>
          <h3>{copy.sections.portfolioTitle}</h3>
          <dl className="detail-list">
            <div>
              <dt>{copy.fields.position}</dt>
              <dd>{orderResult?.portfolio.position_contracts ?? 0}</dd>
            </div>
            <div>
              <dt>{copy.fields.averagePrice}</dt>
              <dd>{orderResult?.portfolio.average_price ?? "N/A"}</dd>
            </div>
            <div>
              <dt>{copy.fields.unrealizedPnl}</dt>
              <dd>{orderResult?.portfolio.unrealized_pnl_twd ?? 0}</dd>
            </div>
            <div>
              <dt>{copy.fields.equity}</dt>
              <dd>{orderResult?.portfolio.equity_twd ?? 1_000_000}</dd>
            </div>
          </dl>
        </article>
      </div>

      {orderResult ? (
        <article className="paper-evidence-section">
          <p className="card-kicker">{copy.sections.omsKicker}</p>
          <h3>{copy.sections.omsTitle}</h3>
          <ol className="timeline-list">
            {orderResult.oms_state.history.map((event) => (
              <li key={event.event_id}>
                <strong>{event.event_type}</strong>
                {event.reason ? <span>{event.reason}</span> : null}
              </li>
            ))}
          </ol>
        </article>
      ) : null}

      <article className="paper-evidence-section">
        <p className="card-kicker">{copy.sections.safetyKicker}</p>
        <h3>{copy.sections.safetyTitle}</h3>
        <div className="flag-grid">
          {Object.entries(
            orderResult?.safety_flags ??
              strategyResult?.safety_flags ??
              marketData?.safety_flags ??
              status?.safety_flags ??
              fallbackSafeFlags(),
          ).map(([key, value]) => (
            <span className={value ? "metric ok" : "metric"} key={key}>
              {key}={String(value)}
            </span>
          ))}
        </div>
        <p className="read-only-note">{copy.readOnlyNote}</p>
      </article>

      <article className="paper-evidence-section">
        <p className="card-kicker">{copy.sections.warningsKicker}</p>
        <h3>{copy.sections.warningsTitle}</h3>
        <ul className="detail-list">
          {[...new Set(warnings.length > 0 ? warnings : session?.warnings ?? [])].map((warning) => (
            <li key={warning}>{warning}</li>
          ))}
        </ul>
      </article>
    </section>
  );
}

async function fetchJson<T>(path: string): Promise<T> {
  const response = await fetch(`${backendUrl}${path}`);
  const payload: unknown = await response.json();
  if (!response.ok) {
    throw new Error(extractErrorDetail(payload, response.status));
  }
  return payload as T;
}

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${backendUrl}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const payload: unknown = await response.json();
  if (!response.ok) {
    throw new Error(extractErrorDetail(payload, response.status));
  }
  return payload as T;
}

function extractErrorDetail(payload: unknown, status: number): string {
  if (
    typeof payload === "object" &&
    payload !== null &&
    "detail" in payload &&
    typeof payload.detail === "string"
  ) {
    return payload.detail;
  }
  return `HTTP ${status}`;
}

function assertSafeFlags(flags: MockBackendSafetyFlags) {
  if (flags.paper_only !== true) {
    throw new Error("paper_only must be true");
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
  if (flags.production_trading_ready !== false) {
    throw new Error("production_trading_ready must be false");
  }
}

function fallbackSafeFlags(): MockBackendSafetyFlags {
  return {
    paper_only: true,
    mock_backend: true,
    deterministic_data: true,
    live_trading_enabled: false,
    broker_api_called: false,
    external_market_data_downloaded: false,
    real_order_created: false,
    credentials_collected: false,
    production_trading_ready: false,
    investment_advice: false,
  };
}
