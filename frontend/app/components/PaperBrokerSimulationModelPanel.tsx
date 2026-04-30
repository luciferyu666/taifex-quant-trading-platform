"use client";

import { useMemo, useState, type FormEvent } from "react";

import type { DashboardCopy } from "../i18n";

type SymbolCode = "TX" | "MTX" | "TMF";
type Side = "BUY" | "SELL";
type OrderType = "MARKET" | "LIMIT";
type SimulationOutcome = "acknowledge" | "partial_fill" | "fill" | "reject" | "cancel";

type PaperBrokerSimulationResult = {
  model_version: string;
  simulation_outcome: SimulationOutcome;
  reason: string;
  symbol: SymbolCode;
  side: Side;
  order_type: OrderType;
  limit_price: number | null;
  reference_price: number | null;
  simulated_fill_price: number | null;
  requested_quantity: number;
  simulated_fill_quantity: number;
  remaining_quantity: number;
  bid_price: number;
  ask_price: number;
  spread_points: number;
  available_size: number;
  liquidity_score: number;
  checks: Record<string, boolean>;
  warnings: string[];
  paper_only: boolean;
  live_trading_enabled: boolean;
  broker_api_called: boolean;
  external_market_data_downloaded: boolean;
  production_execution_model: boolean;
};

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000";

export function PaperBrokerSimulationModelPanel({ copy }: { copy: DashboardCopy }) {
  const labels = copy.paperBrokerSimulation;
  const [symbol, setSymbol] = useState<SymbolCode>("TMF");
  const [side, setSide] = useState<Side>("BUY");
  const [orderType, setOrderType] = useState<OrderType>("MARKET");
  const [quantity, setQuantity] = useState(2);
  const [bidPrice, setBidPrice] = useState(19999);
  const [askPrice, setAskPrice] = useState(20000);
  const [lastPrice, setLastPrice] = useState(19999.5);
  const [bidSize, setBidSize] = useState(5);
  const [askSize, setAskSize] = useState(5);
  const [quoteAgeSeconds, setQuoteAgeSeconds] = useState(0);
  const [liquidityScore, setLiquidityScore] = useState(1);
  const [limitPrice, setLimitPrice] = useState(20000);
  const [maxSpreadPoints, setMaxSpreadPoints] = useState(5);
  const [staleQuoteSeconds, setStaleQuoteSeconds] = useState(3);
  const [statusMessage, setStatusMessage] = useState<string>(labels.initialMessage);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [result, setResult] = useState<PaperBrokerSimulationResult | null>(null);

  const txEquivalentExposure = useMemo(() => {
    const ratios: Record<SymbolCode, number> = { TX: 1, MTX: 0.25, TMF: 0.05 };
    return Number((quantity * ratios[symbol]).toFixed(4));
  }, [quantity, symbol]);

  async function previewSimulation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsPreviewing(true);
    setErrorMessage("");
    setStatusMessage(labels.previewing);
    setResult(null);

    try {
      const payload = {
        paper_only: true,
        intent: {
          order_id: "paper-preview-order",
          idempotency_key: "paper-preview-idempotency-key",
          symbol,
          side,
          quantity,
          tx_equivalent_exposure: txEquivalentExposure,
          quote_age_seconds: quoteAgeSeconds,
          paper_only: true,
          source_signal_id: "paper-preview-signal",
          strategy_id: "paper-preview-strategy",
          strategy_version: "0.1.0",
          approval_id: "paper-preview-approval",
        },
        simulation: {
          market_snapshot: {
            symbol,
            bid_price: bidPrice,
            ask_price: askPrice,
            last_price: lastPrice,
            bid_size: bidSize,
            ask_size: askSize,
            quote_age_seconds: quoteAgeSeconds,
            liquidity_score: liquidityScore,
            paper_only: true,
          },
          order_type: orderType,
          limit_price: orderType === "LIMIT" ? limitPrice : null,
          stale_quote_seconds: staleQuoteSeconds,
          max_spread_points: maxSpreadPoints,
          model_version: "paper-broker-sim-v0.1",
          paper_only: true,
        },
      };

      const response = await fetch(`${backendUrl}/api/paper-execution/broker-simulation/preview`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const responsePayload = (await response.json()) as
        | PaperBrokerSimulationResult
        | { detail?: string };
      if (!response.ok) {
        throw new Error(
          "detail" in responsePayload && responsePayload.detail
            ? responsePayload.detail
            : `HTTP ${response.status}`,
        );
      }

      assertSafePaperSimulationResult(responsePayload as PaperBrokerSimulationResult);
      setResult(responsePayload as PaperBrokerSimulationResult);
      setStatusMessage(labels.previewReady);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : labels.unknownError);
      setStatusMessage("");
    } finally {
      setIsPreviewing(false);
    }
  }

  return (
    <section className="paper-submit-section" aria-labelledby="paper-broker-sim-title">
      <div className="section-heading">
        <p className="eyebrow">{labels.eyebrow}</p>
        <h2 id="paper-broker-sim-title">{labels.title}</h2>
        <p>{labels.description}</p>
      </div>

      <form className="paper-submit-card" onSubmit={previewSimulation}>
        <div className="paper-submit-banner">
          <span className="metric ok">{labels.paperOnlyBadge}</span>
          <span className="metric ok">ENABLE_LIVE_TRADING=false</span>
          <span className="metric ok">BROKER_PROVIDER=paper</span>
          <span className="metric ok">{labels.previewOnlyBadge}</span>
        </div>

        <div className="paper-submit-grid">
          <label>
            <span>{labels.fields.symbol}</span>
            <select value={symbol} onChange={(event) => setSymbol(event.target.value as SymbolCode)}>
              <option value="TX">TX</option>
              <option value="MTX">MTX</option>
              <option value="TMF">TMF</option>
            </select>
          </label>

          <label>
            <span>{labels.fields.side}</span>
            <select value={side} onChange={(event) => setSide(event.target.value as Side)}>
              <option value="BUY">{labels.sideOptions.BUY}</option>
              <option value="SELL">{labels.sideOptions.SELL}</option>
            </select>
          </label>

          <label>
            <span>{labels.fields.orderType}</span>
            <select
              value={orderType}
              onChange={(event) => setOrderType(event.target.value as OrderType)}
            >
              <option value="MARKET">{labels.orderTypeOptions.MARKET}</option>
              <option value="LIMIT">{labels.orderTypeOptions.LIMIT}</option>
            </select>
          </label>

          <label>
            <span>{labels.fields.quantity}</span>
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
            <span>{labels.fields.txEquivalentExposure}</span>
            <input readOnly value={txEquivalentExposure} />
          </label>

          <label>
            <span>{labels.fields.limitPrice}</span>
            <input
              disabled={orderType !== "LIMIT"}
              min={1}
              step={0.5}
              type="number"
              value={limitPrice}
              onChange={(event) => setLimitPrice(Number(event.target.value))}
            />
          </label>

          <label>
            <span>{labels.fields.bidPrice}</span>
            <input
              min={1}
              step={0.5}
              type="number"
              value={bidPrice}
              onChange={(event) => setBidPrice(Number(event.target.value))}
            />
          </label>

          <label>
            <span>{labels.fields.askPrice}</span>
            <input
              min={1}
              step={0.5}
              type="number"
              value={askPrice}
              onChange={(event) => setAskPrice(Number(event.target.value))}
            />
          </label>

          <label>
            <span>{labels.fields.lastPrice}</span>
            <input
              min={1}
              step={0.5}
              type="number"
              value={lastPrice}
              onChange={(event) => setLastPrice(Number(event.target.value))}
            />
          </label>

          <label>
            <span>{labels.fields.bidSize}</span>
            <input
              min={0}
              step={1}
              type="number"
              value={bidSize}
              onChange={(event) => setBidSize(Number(event.target.value))}
            />
          </label>

          <label>
            <span>{labels.fields.askSize}</span>
            <input
              min={0}
              step={1}
              type="number"
              value={askSize}
              onChange={(event) => setAskSize(Number(event.target.value))}
            />
          </label>

          <label>
            <span>{labels.fields.quoteAgeSeconds}</span>
            <input
              min={0}
              step={0.5}
              type="number"
              value={quoteAgeSeconds}
              onChange={(event) => setQuoteAgeSeconds(Number(event.target.value))}
            />
          </label>

          <label>
            <span>{labels.fields.liquidityScore}</span>
            <input
              max={1}
              min={0}
              step={0.05}
              type="number"
              value={liquidityScore}
              onChange={(event) => setLiquidityScore(Number(event.target.value))}
            />
          </label>

          <label>
            <span>{labels.fields.maxSpreadPoints}</span>
            <input
              min={0.5}
              step={0.5}
              type="number"
              value={maxSpreadPoints}
              onChange={(event) => setMaxSpreadPoints(Number(event.target.value))}
            />
          </label>

          <label>
            <span>{labels.fields.staleQuoteSeconds}</span>
            <input
              min={1}
              step={1}
              type="number"
              value={staleQuoteSeconds}
              onChange={(event) => setStaleQuoteSeconds(Number(event.target.value))}
            />
          </label>
        </div>

        <ul className="warning-list paper-submit-guardrails">
          {labels.guardrails.map((guardrail) => (
            <li key={guardrail}>{guardrail}</li>
          ))}
        </ul>

        <div className="paper-submit-actions">
          <button className="action-button" disabled={isPreviewing} type="submit">
            {isPreviewing ? labels.previewing : labels.preview}
          </button>
        </div>

        {statusMessage ? <p className="loader-status ok">{statusMessage}</p> : null}
        {errorMessage ? <p className="loader-status error">{errorMessage}</p> : null}

        {result ? (
          <article className="paper-submit-result">
            <p className="card-kicker">{labels.resultKicker}</p>
            <h3>{labels.resultTitle}</h3>
            <dl className="detail-list">
              <div>
                <dt>{labels.result.outcome}</dt>
                <dd>{labels.outcomeLabels[result.simulation_outcome]}</dd>
              </div>
              <div>
                <dt>{labels.result.fillQuantity}</dt>
                <dd>
                  {result.simulated_fill_quantity} / {result.requested_quantity}
                </dd>
              </div>
              <div>
                <dt>{labels.result.fillPrice}</dt>
                <dd>{result.simulated_fill_price ?? labels.none}</dd>
              </div>
              <div>
                <dt>{labels.result.remainingQuantity}</dt>
                <dd>{result.remaining_quantity}</dd>
              </div>
              <div>
                <dt>{labels.result.spread}</dt>
                <dd>{result.spread_points}</dd>
              </div>
              <div>
                <dt>{labels.result.availableSize}</dt>
                <dd>{result.available_size}</dd>
              </div>
              <div>
                <dt>{labels.result.reason}</dt>
                <dd>{result.reason}</dd>
              </div>
            </dl>

            <div className="flag-grid">
              <Flag label="paper_only" value={result.paper_only} safe={!result.paper_only} />
              <Flag
                label="live_trading_enabled"
                value={result.live_trading_enabled}
                safe={result.live_trading_enabled}
              />
              <Flag
                label="broker_api_called"
                value={result.broker_api_called}
                safe={result.broker_api_called}
              />
              <Flag
                label="external_market_data_downloaded"
                value={result.external_market_data_downloaded}
                safe={result.external_market_data_downloaded}
              />
              <Flag
                label="production_execution_model"
                value={result.production_execution_model}
                safe={result.production_execution_model}
              />
            </div>

            <ul className="warning-list">
              {result.warnings.map((warning) => (
                <li key={warning}>{warning}</li>
              ))}
            </ul>
          </article>
        ) : null}
      </form>
    </section>
  );
}

function assertSafePaperSimulationResult(result: PaperBrokerSimulationResult) {
  if (
    result.paper_only !== true ||
    result.live_trading_enabled !== false ||
    result.broker_api_called !== false ||
    result.external_market_data_downloaded !== false ||
    result.production_execution_model !== false
  ) {
    throw new Error("Unsafe paper broker simulation response.");
  }
}

function Flag({
  label,
  value,
  safe,
}: {
  label: string;
  value: boolean;
  safe: boolean;
}) {
  return (
    <div className={safe ? "flag danger" : "flag ok"}>
      <span>{label}</span>
      <strong>{String(value)}</strong>
    </div>
  );
}
