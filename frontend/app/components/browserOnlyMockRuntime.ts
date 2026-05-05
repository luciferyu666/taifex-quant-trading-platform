export type BrowserMockSymbol = "TX" | "MTX" | "TMF";
export type BrowserMockDirection = "LONG" | "SHORT" | "FLAT";
export type BrowserMockSide = "BUY" | "SELL";
export type BrowserMockMarketRegime =
  | "normal"
  | "trending"
  | "volatile"
  | "illiquid"
  | "stale_quote";

export type BrowserOnlySafetyFlags = {
  paper_only: boolean;
  browser_only: boolean;
  mock_backend: boolean;
  deterministic_data: boolean;
  live_trading_enabled: boolean;
  broker_api_called: boolean;
  external_market_data_downloaded: boolean;
  real_order_created: boolean;
  credentials_collected: boolean;
  production_trading_ready: boolean;
  investment_advice: boolean;
  database_written: boolean;
  performance_claim: boolean;
};

export type BrowserMockMarketDataPoint = {
  symbol: BrowserMockSymbol;
  tick: number;
  market_regime: BrowserMockMarketRegime;
  bid: number;
  ask: number;
  last: number;
  previous_last: number;
  change_points: number;
  spread_points: number;
  bid_size: number;
  ask_size: number;
  quote_age_seconds: number;
  liquidity_score: number;
  volatility_points: number;
  slippage_points_estimate: number;
  paper_only: boolean;
  external_market_data_downloaded: boolean;
};

export type BrowserMockStrategySignal = {
  signal_id: string;
  strategy_id: string;
  strategy_version: string;
  timestamp: string;
  direction: BrowserMockDirection;
  target_tx_equivalent: number;
  confidence: number;
  reason: Record<string, boolean | number | string>;
};

export type BrowserMockRiskEvaluation = {
  approved: boolean;
  reason: string;
  checks: Record<string, boolean>;
};

export type BrowserMockOmsEvent = {
  event_id: string;
  event_type: string;
  status: string;
  reason: string;
};

export type BrowserMockMarketRealism = {
  market_regime: BrowserMockMarketRegime;
  spread_points: number;
  liquidity_score: number;
  quote_age_seconds: number;
  available_size: number;
  slippage_points_estimate: number;
  fill_model: string;
  fill_reason: string;
};

export type BrowserMockOrderSimulation = {
  workflow_run_id: string;
  order_id: string;
  idempotency_key: string;
  symbol: BrowserMockSymbol;
  side: BrowserMockSide;
  quantity: number;
  signal: BrowserMockStrategySignal;
  market_snapshot: BrowserMockMarketDataPoint;
  risk_evaluation: BrowserMockRiskEvaluation;
  oms_status: string;
  oms_timeline: BrowserMockOmsEvent[];
  simulation_outcome: "FILLED" | "PARTIALLY_FILLED" | "REJECTED";
  simulated_fill_quantity: number;
  simulated_fill_price: number | null;
  simulated_slippage_points: number;
  remaining_quantity: number;
  market_realism: BrowserMockMarketRealism;
  reason: string;
  paper_only: boolean;
  real_order_created: boolean;
};

type BrowserMockFillResult = {
  outcome: "FILLED" | "PARTIALLY_FILLED" | "REJECTED";
  fillQuantity: number;
  fillPrice: number | null;
  slippagePoints: number;
  remainingQuantity: number;
  marketRealism: BrowserMockMarketRealism;
  reason: string;
};

export type BrowserMockPortfolio = {
  account_id: string;
  symbol: BrowserMockSymbol | null;
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

export type BrowserMockPerformanceSummary = {
  simulated_orders: number;
  simulated_fills: number;
  simulated_rejects: number;
  simulated_partial_fills: number;
  unrealized_pnl_twd: number;
  realized_pnl_twd: number;
  equity_twd: number;
  simulated_metrics_only: boolean;
  performance_claim: boolean;
};

export type BrowserMockTimelineEvent = {
  event_id: string;
  event_type: string;
  message: string;
};

export type BrowserOnlyMockSession = {
  session_id: string;
  mock_seed: string;
  current_tick: number;
  market_data: BrowserMockMarketDataPoint[];
  selected_symbol: BrowserMockSymbol;
  latest_signal: BrowserMockStrategySignal | null;
  latest_order: BrowserMockOrderSimulation | null;
  portfolio: BrowserMockPortfolio;
  performance: BrowserMockPerformanceSummary;
  timeline: BrowserMockTimelineEvent[];
  safety_flags: BrowserOnlySafetyFlags;
  warnings: string[];
};

export type BrowserOnlyVisualizationSnapshot = BrowserMockMarketDataPoint & {
  is_current_tick: boolean;
};

export type BrowserOnlyVisualizationData = {
  symbol: BrowserMockSymbol;
  current_tick: number;
  price_path: BrowserOnlyVisualizationSnapshot[];
  latest_snapshot: BrowserOnlyVisualizationSnapshot;
  latest_order: BrowserMockOrderSimulation | null;
  portfolio: BrowserMockPortfolio;
  performance: BrowserMockPerformanceSummary;
  safety_flags: BrowserOnlySafetyFlags;
  no_external_market_data: boolean;
  no_broker: boolean;
  no_real_order: boolean;
};

const pointValueTwd: Record<BrowserMockSymbol, number> = {
  TX: 200,
  MTX: 50,
  TMF: 10,
};

const txEquivalentRatio: Record<BrowserMockSymbol, number> = {
  TX: 1,
  MTX: 0.25,
  TMF: 0.05,
};

const maxTxEquivalentExposure = 0.25;
const startingCashTwd = 1_000_000;

export const browserOnlyMockSeed = "taifex-browser-only-seed-v1";

export function createInitialBrowserOnlyMockSession(): BrowserOnlyMockSession {
  return {
    session_id: "browser-only-mock-demo-session",
    mock_seed: browserOnlyMockSeed,
    current_tick: 0,
    market_data: marketDataForTick(0),
    selected_symbol: "TMF",
    latest_signal: null,
    latest_order: null,
    portfolio: emptyPortfolio(),
    performance: emptyPerformance(),
    timeline: [
      {
        event_id: "browser-demo-start",
        event_type: "SESSION_START",
        message: "Browser-only mock demo initialized. No backend, broker, DB, or live trading path was used.",
      },
    ],
    safety_flags: browserOnlySafetyFlags(),
    warnings: browserOnlyWarnings(),
  };
}

export function advanceBrowserOnlyMockTick(
  session: BrowserOnlyMockSession,
): BrowserOnlyMockSession {
  const nextTick = session.current_tick + 1;
  const marketData = marketDataForTick(nextTick);
  const portfolio = markPortfolio(session.portfolio, marketData);
  return {
    ...session,
    current_tick: nextTick,
    market_data: marketData,
    portfolio,
    performance: performanceFromSession(session, portfolio),
    timeline: [
      ...session.timeline,
      {
        event_id: `browser-tick-${nextTick}`,
        event_type: "MARKET_TICK",
        message: `Generated deterministic browser-only tick ${nextTick}.`,
      },
    ],
  };
}

export function runBrowserOnlyMockStrategy(
  session: BrowserOnlyMockSession,
  symbol: BrowserMockSymbol,
): BrowserOnlyMockSession {
  const snapshot = snapshotForSymbol(session.market_data, symbol);
  const direction = directionFromSnapshot(snapshot);
  const signal: BrowserMockStrategySignal = {
    signal_id: `browser-signal-${stableHash(`${symbol}-${session.current_tick}-${direction}`)}`,
    strategy_id: "browser-only-momentum-demo",
    strategy_version: "0.1.0",
    timestamp: deterministicTimestamp(session.current_tick),
    direction,
    target_tx_equivalent:
      direction === "FLAT" ? 0 : Math.min(txEquivalentRatio[symbol], maxTxEquivalentExposure),
    confidence: direction === "FLAT" ? 0.2 : 0.65,
    reason: {
      source: "browser_only_deterministic_price_path",
      signals_only: true,
      order_created: false,
      broker_api_called: false,
      risk_engine_called: false,
      oms_called: false,
      external_market_data_downloaded: false,
      not_investment_advice: true,
    },
  };

  return {
    ...session,
    selected_symbol: symbol,
    latest_signal: signal,
    timeline: [
      ...session.timeline,
      {
        event_id: signal.signal_id,
        event_type: "STRATEGY_SIGNAL",
        message: `Generated ${direction} StrategySignal for ${symbol}. Strategy did not create an order.`,
      },
    ],
  };
}

export function simulateBrowserOnlyPaperOrder(
  session: BrowserOnlyMockSession,
  symbol: BrowserMockSymbol,
  quantity: number,
): BrowserOnlyMockSession {
  const boundedQuantity = Math.max(1, Math.min(20, Math.trunc(quantity || 1)));
  const strategySession =
    session.selected_symbol === symbol &&
    session.latest_signal?.strategy_id === "browser-only-momentum-demo" &&
    session.latest_signal.reason.source === "browser_only_deterministic_price_path"
      ? session
      : runBrowserOnlyMockStrategy(session, symbol);
  const signal =
    strategySession.latest_signal ?? runBrowserOnlyMockStrategy(strategySession, symbol).latest_signal;
  if (!signal) {
    return strategySession;
  }

  const snapshot = snapshotForSymbol(strategySession.market_data, symbol);
  const side: BrowserMockSide = signal.direction === "SHORT" ? "SELL" : "BUY";
  const digest = stableHash(`${symbol}-${strategySession.current_tick}-${side}-${boundedQuantity}`);
  const riskEvaluation = evaluateRisk(snapshot, symbol, boundedQuantity, signal.direction);
  const orderId = `browser-paper-order-${digest.slice(0, 12)}`;
  const workflowRunId = `browser-workflow-${digest.slice(12, 24)}`;
  const idempotencyKey = `browser-idem-${digest.slice(24, 32)}`;
  const fill = riskEvaluation.approved
    ? simulateFill(snapshot, side, boundedQuantity)
    : {
        outcome: "REJECTED" as const,
        fillQuantity: 0,
        fillPrice: null,
        slippagePoints: 0,
        remainingQuantity: boundedQuantity,
        marketRealism: buildMarketRealism(snapshot, side, boundedQuantity, riskEvaluation.reason),
        reason: riskEvaluation.reason,
      };
  const omsTimeline = buildOmsTimeline(orderId, riskEvaluation, fill);
  const order: BrowserMockOrderSimulation = {
    workflow_run_id: workflowRunId,
    order_id: orderId,
    idempotency_key: idempotencyKey,
    symbol,
    side,
    quantity: boundedQuantity,
    signal,
    market_snapshot: snapshot,
    risk_evaluation: riskEvaluation,
    oms_status: omsTimeline[omsTimeline.length - 1]?.status ?? "UNKNOWN",
    oms_timeline: omsTimeline,
    simulation_outcome: fill.outcome,
    simulated_fill_quantity: fill.fillQuantity,
    simulated_fill_price: fill.fillPrice,
    simulated_slippage_points: fill.slippagePoints,
    remaining_quantity: fill.remainingQuantity,
    market_realism: fill.marketRealism,
    reason: fill.reason,
    paper_only: true,
    real_order_created: false,
  };
  const portfolio = applyOrderToPortfolio(strategySession.portfolio, order);

  return {
    ...strategySession,
    selected_symbol: symbol,
    latest_order: order,
    portfolio,
    performance: performanceFromOrder(strategySession.performance, order, portfolio),
    timeline: [
      ...strategySession.timeline,
      {
        event_id: `${workflowRunId}-intent`,
        event_type: "PAPER_ORDER_INTENT",
        message: `Created platform-owned PaperOrderIntent for ${symbol}; no real order was created.`,
      },
      ...omsTimeline.map((event) => ({
        event_id: event.event_id,
        event_type: `OMS_${event.event_type}`,
        message: event.reason,
      })),
    ],
  };
}

export function resetBrowserOnlyMockSession(): BrowserOnlyMockSession {
  return createInitialBrowserOnlyMockSession();
}

export function buildBrowserOnlyVisualizationData(
  session: BrowserOnlyMockSession,
  symbol: BrowserMockSymbol,
  lookbackTicks = 12,
): BrowserOnlyVisualizationData {
  const boundedLookback = Math.max(4, Math.min(24, Math.trunc(lookbackTicks || 12)));
  const startTick = Math.max(0, session.current_tick - boundedLookback + 1);
  const pricePath = Array.from({ length: session.current_tick - startTick + 1 }, (_, index) => {
    const tick = startTick + index;
    return {
      ...snapshotForSymbol(marketDataForTick(tick), symbol),
      is_current_tick: tick === session.current_tick,
    };
  });
  const latestSnapshot =
    pricePath[pricePath.length - 1] ??
    ({
      ...snapshotForSymbol(session.market_data, symbol),
      is_current_tick: true,
    } as BrowserOnlyVisualizationSnapshot);

  return {
    symbol,
    current_tick: session.current_tick,
    price_path: pricePath,
    latest_snapshot: latestSnapshot,
    latest_order: session.latest_order?.symbol === symbol ? session.latest_order : null,
    portfolio: session.portfolio,
    performance: session.performance,
    safety_flags: session.safety_flags,
    no_external_market_data: session.safety_flags.external_market_data_downloaded === false,
    no_broker: session.safety_flags.broker_api_called === false,
    no_real_order: session.safety_flags.real_order_created === false,
  };
}

export function isBrowserOnlyMockSession(value: unknown): value is BrowserOnlyMockSession {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const candidate = value as Partial<BrowserOnlyMockSession>;
  return (
    candidate.safety_flags?.paper_only === true &&
    candidate.safety_flags.browser_only === true &&
    candidate.safety_flags.live_trading_enabled === false &&
    candidate.safety_flags.broker_api_called === false &&
    candidate.safety_flags.real_order_created === false &&
    candidate.safety_flags.performance_claim !== true &&
    Array.isArray(candidate.market_data) &&
    Array.isArray(candidate.timeline) &&
    (candidate.mock_seed === browserOnlyMockSeed || candidate.mock_seed === undefined)
  );
}

function browserOnlySafetyFlags(): BrowserOnlySafetyFlags {
  return {
    paper_only: true,
    browser_only: true,
    mock_backend: true,
    deterministic_data: true,
    live_trading_enabled: false,
    broker_api_called: false,
    external_market_data_downloaded: false,
    real_order_created: false,
    credentials_collected: false,
    production_trading_ready: false,
    investment_advice: false,
    database_written: false,
    performance_claim: false,
  };
}

function browserOnlyWarnings(): string[] {
  return [
    "Browser-only mock demo uses deterministic local state in this browser.",
    "No backend, broker SDK, external market data, database write, credentials, real order, or live trading path is used.",
    "Simulated PnL is for product workflow demonstration only and is not investment advice or a performance claim.",
  ];
}

function marketDataForTick(tick: number): BrowserMockMarketDataPoint[] {
  return [marketSnapshot("TX", tick), marketSnapshot("MTX", tick), marketSnapshot("TMF", tick)];
}

function marketSnapshot(symbol: BrowserMockSymbol, tick: number): BrowserMockMarketDataPoint {
  const safeTick = Math.max(0, tick);
  const previousTick = Math.max(0, safeTick - 1);
  const marketRegime = marketRegimeForTick(safeTick);
  const config = marketRegimeConfig[marketRegime];
  const baseSpread = { TX: 1, MTX: 0.5, TMF: 0.2 }[symbol];
  const last = lastPriceForTick(symbol, safeTick);
  const previousLast = lastPriceForTick(symbol, previousTick);
  const spread = round2(baseSpread * config.spreadMultiplier + baseSpread * ((safeTick % 3) * 0.15));
  const bidSize = Math.max(0, config.bidSizeBase + (safeTick % 3) - (symbol === "TX" ? 1 : 0));
  const askSize = Math.max(0, config.askSizeBase + ((safeTick + 1) % 3) - (symbol === "TX" ? 1 : 0));
  const liquidityScore = round2(
    Math.max(0.04, Math.min(0.95, config.liquidityBase - (symbol === "TX" ? 0.04 : 0))),
  );
  const slippageEstimate = round2(spread * (1 - liquidityScore) * config.slippageMultiplier);
  return {
    symbol,
    tick: safeTick,
    market_regime: marketRegime,
    bid: round2(last - spread / 2),
    ask: round2(last + spread / 2),
    last,
    previous_last: previousLast,
    change_points: round2(last - previousLast),
    spread_points: spread,
    bid_size: bidSize,
    ask_size: askSize,
    quote_age_seconds: config.quoteAgeSeconds + (marketRegime === "stale_quote" ? safeTick % 2 : 0),
    liquidity_score: liquidityScore,
    volatility_points: config.volatilityPoints,
    slippage_points_estimate: slippageEstimate,
    paper_only: true,
    external_market_data_downloaded: false,
  };
}

const marketRegimeOrder: BrowserMockMarketRegime[] = [
  "normal",
  "trending",
  "normal",
  "volatile",
  "illiquid",
  "stale_quote",
  "trending",
  "volatile",
];

const marketRegimeConfig: Record<
  BrowserMockMarketRegime,
  {
    wave: number[];
    driftStep: number;
    spreadMultiplier: number;
    bidSizeBase: number;
    askSizeBase: number;
    quoteAgeSeconds: number;
    liquidityBase: number;
    volatilityPoints: number;
    slippageMultiplier: number;
  }
> = {
  normal: {
    wave: [0, 2.5, 4, 1.5, -1.5, -3],
    driftStep: 1.2,
    spreadMultiplier: 1,
    bidSizeBase: 7,
    askSizeBase: 8,
    quoteAgeSeconds: 1,
    liquidityBase: 0.82,
    volatilityPoints: 4,
    slippageMultiplier: 0.35,
  },
  trending: {
    wave: [0, 4.5, 8, 10.5, 13, 15],
    driftStep: 2.1,
    spreadMultiplier: 1.25,
    bidSizeBase: 5,
    askSizeBase: 6,
    quoteAgeSeconds: 1,
    liquidityBase: 0.68,
    volatilityPoints: 9,
    slippageMultiplier: 0.55,
  },
  volatile: {
    wave: [0, 11, -7, 14, -11, 6],
    driftStep: 1.4,
    spreadMultiplier: 2.6,
    bidSizeBase: 3,
    askSizeBase: 3,
    quoteAgeSeconds: 2,
    liquidityBase: 0.42,
    volatilityPoints: 18,
    slippageMultiplier: 0.8,
  },
  illiquid: {
    wave: [0, 1.2, -0.8, 2.2, -1.4, 0.5],
    driftStep: 0.5,
    spreadMultiplier: 4.2,
    bidSizeBase: 0,
    askSizeBase: 1,
    quoteAgeSeconds: 2,
    liquidityBase: 0.12,
    volatilityPoints: 3,
    slippageMultiplier: 1,
  },
  stale_quote: {
    wave: [0, -1, -1, -0.5, -0.5, -1.5],
    driftStep: 0.2,
    spreadMultiplier: 3.2,
    bidSizeBase: 2,
    askSizeBase: 2,
    quoteAgeSeconds: 8,
    liquidityBase: 0.22,
    volatilityPoints: 2,
    slippageMultiplier: 0.9,
  },
};

function marketRegimeForTick(tick: number): BrowserMockMarketRegime {
  return marketRegimeOrder[Math.max(0, tick) % marketRegimeOrder.length] ?? "normal";
}

function lastPriceForTick(symbol: BrowserMockSymbol, tick: number): number {
  const safeTick = Math.max(0, tick);
  const base = 20_000;
  const regime = marketRegimeForTick(safeTick);
  const config = marketRegimeConfig[regime];
  const drift = Math.floor(safeTick / 6) * config.driftStep;
  const wave = config.wave[safeTick % config.wave.length] ?? 0;
  const volatilityPulse = ((safeTick % 4) - 1.5) * (config.volatilityPoints / 12);
  const symbolOffset = { TX: 0, MTX: -1, TMF: -1.5 }[symbol];
  return round2(base + drift + wave + volatilityPulse + symbolOffset);
}

function snapshotForSymbol(
  snapshots: BrowserMockMarketDataPoint[],
  symbol: BrowserMockSymbol,
): BrowserMockMarketDataPoint {
  return snapshots.find((snapshot) => snapshot.symbol === symbol) ?? marketSnapshot(symbol, 0);
}

function directionFromSnapshot(snapshot: BrowserMockMarketDataPoint): BrowserMockDirection {
  if (snapshot.change_points > 2) {
    return "LONG";
  }
  if (snapshot.change_points < -2) {
    return "SHORT";
  }
  return "FLAT";
}

function evaluateRisk(
  snapshot: BrowserMockMarketDataPoint,
  symbol: BrowserMockSymbol,
  quantity: number,
  direction: BrowserMockDirection,
): BrowserMockRiskEvaluation {
  const txEquivalentExposure = txEquivalentRatio[symbol] * quantity;
  const checks = {
    paper_only: true,
    live_trading_disabled: true,
    broker_provider_paper: true,
    signal_not_flat: direction !== "FLAT",
    max_order_size_by_contract: quantity <= { TX: 1, MTX: 4, TMF: 20 }[symbol],
    max_tx_equivalent_exposure: txEquivalentExposure <= maxTxEquivalentExposure,
    quote_not_stale: snapshot.quote_age_seconds <= 3,
    price_reasonability: Math.abs(snapshot.ask - snapshot.bid) <= { TX: 5, MTX: 3, TMF: 2 }[symbol],
    duplicate_order_prevention: true,
    kill_switch_inactive: true,
    broker_heartbeat_simulated_healthy: true,
  };
  const failed = Object.entries(checks).find(([, passed]) => !passed)?.[0];
  return {
    approved: failed === undefined,
    reason: failed
      ? riskReasonForFailedCheck(failed)
      : "Approved by browser-only paper risk guardrails.",
    checks,
  };
}

function riskReasonForFailedCheck(check: string): string {
  if (check === "quote_not_stale") {
    return "Rejected due to stale quote in deterministic browser-only market realism layer.";
  }
  if (check === "price_reasonability") {
    return "Rejected due to wide spread in deterministic browser-only market realism layer.";
  }
  return `Rejected by browser-only paper risk check: ${check}`;
}

function simulateFill(
  snapshot: BrowserMockMarketDataPoint,
  side: BrowserMockSide,
  quantity: number,
): BrowserMockFillResult {
  const availableQuantity = side === "BUY" ? snapshot.ask_size : snapshot.bid_size;
  if (snapshot.market_regime === "stale_quote" || snapshot.quote_age_seconds > 3) {
    const reason = "Rejected due to stale quote in deterministic browser-only market realism layer.";
    return {
      outcome: "REJECTED",
      fillQuantity: 0,
      fillPrice: null,
      slippagePoints: 0,
      remainingQuantity: quantity,
      marketRealism: buildMarketRealism(snapshot, side, quantity, reason),
      reason,
    };
  }
  if (snapshot.market_regime === "illiquid" || snapshot.liquidity_score < 0.2) {
    const reason = "Rejected due to illiquid deterministic quote snapshot.";
    return {
      outcome: "REJECTED",
      fillQuantity: 0,
      fillPrice: null,
      slippagePoints: 0,
      remainingQuantity: quantity,
      marketRealism: buildMarketRealism(snapshot, side, quantity, reason),
      reason,
    };
  }
  const fillQuantity = Math.min(quantity, availableQuantity);
  if (fillQuantity <= 0) {
    const reason = "Rejected due to no available browser-only quote size.";
    return {
      outcome: "REJECTED",
      fillQuantity: 0,
      fillPrice: null,
      slippagePoints: 0,
      remainingQuantity: quantity,
      marketRealism: buildMarketRealism(snapshot, side, quantity, reason),
      reason,
    };
  }
  const slippagePoints = snapshot.slippage_points_estimate;
  const fillPrice = round2(
    side === "BUY" ? snapshot.ask + slippagePoints : snapshot.bid - slippagePoints,
  );
  const reason =
    fillQuantity === quantity
      ? "Filled because sufficient deterministic liquidity was available."
      : "Partially filled due to limited bid/ask size in deterministic liquidity model.";
  return {
    outcome: fillQuantity === quantity ? "FILLED" : "PARTIALLY_FILLED",
    fillQuantity,
    fillPrice,
    slippagePoints,
    remainingQuantity: quantity - fillQuantity,
    marketRealism: buildMarketRealism(snapshot, side, quantity, reason),
    reason,
  };
}

function buildMarketRealism(
  snapshot: BrowserMockMarketDataPoint,
  side: BrowserMockSide,
  quantity: number,
  reason: string,
): BrowserMockMarketRealism {
  return {
    market_regime: snapshot.market_regime ?? "normal",
    spread_points: snapshot.spread_points ?? round2(snapshot.ask - snapshot.bid),
    liquidity_score: snapshot.liquidity_score,
    quote_age_seconds: snapshot.quote_age_seconds,
    available_size: side === "BUY" ? snapshot.ask_size : snapshot.bid_size,
    slippage_points_estimate: snapshot.slippage_points_estimate ?? 0,
    fill_model: "deterministic_spread_liquidity_v1",
    fill_reason: reason || `Evaluated ${quantity} contracts with browser-only quote size.`,
  };
}

function buildOmsTimeline(
  orderId: string,
  riskEvaluation: BrowserMockRiskEvaluation,
  fill: BrowserMockFillResult,
): BrowserMockOmsEvent[] {
  const base = [
    omsEvent(orderId, "CREATE", "PENDING", "PaperOrderIntent created by platform, not by strategy."),
    omsEvent(orderId, "RISK_CHECK", "RISK_CHECKED", riskEvaluation.reason),
  ];
  if (!riskEvaluation.approved) {
    return [...base, omsEvent(orderId, "RISK_REJECT", "REJECTED", riskEvaluation.reason)];
  }
  const accepted = [
    ...base,
    omsEvent(orderId, "SUBMIT", "SUBMITTED", "Submitted to browser-only simulated paper gateway."),
    omsEvent(orderId, "ACCEPT", "ACCEPTED", "Browser-only simulated gateway accepted the paper order."),
  ];
  if (fill.outcome === "PARTIALLY_FILLED") {
    return [
      ...accepted,
      omsEvent(orderId, "PARTIAL_FILL", "PARTIALLY_FILLED", fill.reason),
    ];
  }
  if (fill.outcome === "FILLED") {
    return [...accepted, omsEvent(orderId, "FILL", "FILLED", fill.reason)];
  }
  return [...accepted, omsEvent(orderId, "REJECT", "REJECTED", fill.reason)];
}

function omsEvent(
  orderId: string,
  eventType: string,
  status: string,
  reason: string,
): BrowserMockOmsEvent {
  return {
    event_id: `${orderId}-${eventType.toLowerCase()}`,
    event_type: eventType,
    status,
    reason,
  };
}

function applyOrderToPortfolio(
  portfolio: BrowserMockPortfolio,
  order: BrowserMockOrderSimulation,
): BrowserMockPortfolio {
  if (order.simulated_fill_quantity <= 0 || order.simulated_fill_price === null) {
    return markPortfolio(portfolio, [order.market_snapshot]);
  }
  const signedQuantity =
    order.side === "BUY" ? order.simulated_fill_quantity : -order.simulated_fill_quantity;
  const nextPosition = portfolio.position_contracts + signedQuantity;
  const nextAveragePrice =
    nextPosition === 0
      ? null
      : portfolio.average_price && Math.sign(portfolio.position_contracts) === Math.sign(nextPosition)
        ? round2(
            (portfolio.average_price * Math.abs(portfolio.position_contracts) +
              order.simulated_fill_price * Math.abs(signedQuantity)) /
              Math.abs(nextPosition),
          )
        : order.simulated_fill_price;
  return markPortfolio(
    {
      ...portfolio,
      symbol: order.symbol,
      position_contracts: nextPosition,
      tx_equivalent_position: round2(nextPosition * txEquivalentRatio[order.symbol]),
      average_price: nextAveragePrice,
      mark_price: order.market_snapshot.last,
    },
    [order.market_snapshot],
  );
}

function markPortfolio(
  portfolio: BrowserMockPortfolio,
  marketData: BrowserMockMarketDataPoint[],
): BrowserMockPortfolio {
  if (!portfolio.symbol || portfolio.average_price === null) {
    return {
      ...portfolio,
      unrealized_pnl_twd: 0,
      equity_twd: round2(portfolio.cash_twd + portfolio.realized_pnl_twd),
    };
  }
  const snapshot = snapshotForSymbol(marketData, portfolio.symbol);
  const unrealized = round2(
    (snapshot.last - portfolio.average_price) *
      portfolio.position_contracts *
      pointValueTwd[portfolio.symbol],
  );
  return {
    ...portfolio,
    mark_price: snapshot.last,
    unrealized_pnl_twd: unrealized,
    equity_twd: round2(portfolio.cash_twd + portfolio.realized_pnl_twd + unrealized),
  };
}

function performanceFromSession(
  session: BrowserOnlyMockSession,
  portfolio: BrowserMockPortfolio,
): BrowserMockPerformanceSummary {
  return {
    ...session.performance,
    unrealized_pnl_twd: portfolio.unrealized_pnl_twd,
    realized_pnl_twd: portfolio.realized_pnl_twd,
    equity_twd: portfolio.equity_twd,
  };
}

function performanceFromOrder(
  previous: BrowserMockPerformanceSummary,
  order: BrowserMockOrderSimulation,
  portfolio: BrowserMockPortfolio,
): BrowserMockPerformanceSummary {
  return {
    simulated_orders: previous.simulated_orders + 1,
    simulated_fills: previous.simulated_fills + (order.simulation_outcome === "FILLED" ? 1 : 0),
    simulated_rejects:
      previous.simulated_rejects + (order.simulation_outcome === "REJECTED" ? 1 : 0),
    simulated_partial_fills:
      previous.simulated_partial_fills +
      (order.simulation_outcome === "PARTIALLY_FILLED" ? 1 : 0),
    unrealized_pnl_twd: portfolio.unrealized_pnl_twd,
    realized_pnl_twd: portfolio.realized_pnl_twd,
    equity_twd: portfolio.equity_twd,
    simulated_metrics_only: true,
    performance_claim: false,
  };
}

function emptyPortfolio(): BrowserMockPortfolio {
  return {
    account_id: "browser-only-paper-account",
    symbol: null,
    position_contracts: 0,
    tx_equivalent_position: 0,
    average_price: null,
    mark_price: null,
    unrealized_pnl_twd: 0,
    realized_pnl_twd: 0,
    cash_twd: startingCashTwd,
    equity_twd: startingCashTwd,
    paper_only: true,
    real_money: false,
  };
}

function emptyPerformance(): BrowserMockPerformanceSummary {
  return {
    simulated_orders: 0,
    simulated_fills: 0,
    simulated_rejects: 0,
    simulated_partial_fills: 0,
    unrealized_pnl_twd: 0,
    realized_pnl_twd: 0,
    equity_twd: startingCashTwd,
    simulated_metrics_only: true,
    performance_claim: false,
  };
}

function deterministicTimestamp(tick: number): string {
  return new Date(Date.UTC(2026, 0, 1, 0, 0, Math.max(0, tick))).toISOString();
}

function stableHash(input: string): string {
  let hash = 5381;
  for (let index = 0; index < input.length; index += 1) {
    hash = (hash * 33) ^ input.charCodeAt(index);
  }
  return (hash >>> 0).toString(16).padStart(8, "0").repeat(4).slice(0, 32);
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}
