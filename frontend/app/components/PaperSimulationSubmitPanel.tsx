"use client";

import { useState, type FormEvent } from "react";

import type { DashboardCopy } from "../i18n";

type Direction = "LONG" | "SHORT";
type SymbolCode = "TX" | "MTX" | "TMF";
type BrokerSimulation = "acknowledge" | "partial_fill" | "fill" | "reject" | "cancel";

type PaperSimulationSubmitPanelProps = {
  copy: DashboardCopy;
};

type PaperWorkflowResponse = {
  workflow_run_id: string;
  paper_only: boolean;
  live_trading_enabled: boolean;
  broker_api_called: boolean;
  order_created: boolean;
  paper_broker_gateway_called: boolean;
  persisted: boolean;
  persistence_backend: string;
  approval: {
    approval_id: string;
    decision: string;
    approval_for_live: boolean;
    approval_for_paper_simulation: boolean;
  };
  paper_order_intent: {
    order_id: string;
    symbol: string;
    side: string;
    quantity: number;
    tx_equivalent_exposure: number;
    paper_only: boolean;
  } | null;
  oms_state: {
    status: string;
  } | null;
  paper_broker_ack: {
    broker_provider: string;
    accepted: boolean;
    message: string;
  } | null;
  message: string;
};

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000";

export function PaperSimulationSubmitPanel({ copy }: PaperSimulationSubmitPanelProps) {
  const [direction, setDirection] = useState<Direction>("LONG");
  const [symbol, setSymbol] = useState<SymbolCode>("TMF");
  const [quantity, setQuantity] = useState(1);
  const [targetTxEquivalent, setTargetTxEquivalent] = useState(0.05);
  const [brokerSimulation, setBrokerSimulation] =
    useState<BrokerSimulation>("fill");
  const [approvalReason, setApprovalReason] = useState<string>(
    copy.paperSubmit.defaultReason,
  );
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<PaperWorkflowResponse | null>(null);

  async function submitPaperSimulation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");
    setStatusMessage(copy.paperSubmit.submitting);
    setResult(null);

    try {
      const payload = buildPaperWorkflowPayload({
        direction,
        symbol,
        quantity,
        targetTxEquivalent,
        brokerSimulation,
        approvalReason,
      });
      const response = await fetch(`${backendUrl}/api/paper-execution/workflow/record`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const responsePayload = (await response.json()) as PaperWorkflowResponse | { detail?: string };

      if (!response.ok) {
        const detail =
          "detail" in responsePayload && responsePayload.detail
            ? responsePayload.detail
            : `Backend returned HTTP ${response.status}`;
        throw new Error(detail);
      }

      assertPaperOnlyResponse(responsePayload as PaperWorkflowResponse);
      setResult(responsePayload as PaperWorkflowResponse);
      setStatusMessage(copy.paperSubmit.success);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : copy.paperSubmit.unknownError);
      setStatusMessage("");
    } finally {
      setIsSubmitting(false);
    }
  }

  function refreshRecords() {
    window.location.reload();
  }

  return (
    <section className="paper-submit-section" aria-labelledby="paper-submit-title">
      <div className="section-heading">
        <p className="eyebrow">{copy.paperSubmit.eyebrow}</p>
        <h2 id="paper-submit-title">{copy.paperSubmit.title}</h2>
        <p>{copy.paperSubmit.description}</p>
      </div>

      <form className="paper-submit-card" onSubmit={submitPaperSimulation}>
        <div className="paper-submit-banner">
          <span className="metric ok">{copy.paperSubmit.paperOnlyBadge}</span>
          <span className="metric ok">ENABLE_LIVE_TRADING=false</span>
          <span className="metric ok">BROKER_PROVIDER=paper</span>
        </div>

        <div className="paper-submit-grid">
          <label>
            <span>{copy.paperSubmit.fields.direction}</span>
            <select
              value={direction}
              onChange={(event) => setDirection(event.target.value as Direction)}
            >
              <option value="LONG">{copy.paperSubmit.directionOptions.LONG}</option>
              <option value="SHORT">{copy.paperSubmit.directionOptions.SHORT}</option>
            </select>
          </label>

          <label>
            <span>{copy.paperSubmit.fields.symbol}</span>
            <select
              value={symbol}
              onChange={(event) => setSymbol(event.target.value as SymbolCode)}
            >
              <option value="TX">TX</option>
              <option value="MTX">MTX</option>
              <option value="TMF">TMF</option>
            </select>
          </label>

          <label>
            <span>{copy.paperSubmit.fields.quantity}</span>
            <input
              min={1}
              max={5}
              step={1}
              type="number"
              value={quantity}
              onChange={(event) => setQuantity(Number(event.target.value))}
            />
          </label>

          <label>
            <span>{copy.paperSubmit.fields.targetExposure}</span>
            <input
              min={0.05}
              max={0.25}
              step={0.05}
              type="number"
              value={targetTxEquivalent}
              onChange={(event) => setTargetTxEquivalent(Number(event.target.value))}
            />
          </label>

          <label>
            <span>{copy.paperSubmit.fields.brokerSimulation}</span>
            <select
              value={brokerSimulation}
              onChange={(event) =>
                setBrokerSimulation(event.target.value as BrokerSimulation)
              }
            >
              <option value="fill">{copy.paperSubmit.simulationOptions.fill}</option>
              <option value="partial_fill">
                {copy.paperSubmit.simulationOptions.partial_fill}
              </option>
              <option value="acknowledge">
                {copy.paperSubmit.simulationOptions.acknowledge}
              </option>
              <option value="reject">{copy.paperSubmit.simulationOptions.reject}</option>
              <option value="cancel">{copy.paperSubmit.simulationOptions.cancel}</option>
            </select>
          </label>

          <label>
            <span>{copy.paperSubmit.fields.approvalDecision}</span>
            <input readOnly value="approved_for_paper_simulation" />
          </label>

          <label className="paper-submit-reason">
            <span>{copy.paperSubmit.fields.approvalReason}</span>
            <textarea
              rows={3}
              value={approvalReason}
              onChange={(event) => setApprovalReason(event.target.value)}
            />
          </label>
        </div>

        <ul className="warning-list paper-submit-guardrails">
          {copy.paperSubmit.guardrails.map((guardrail) => (
            <li key={guardrail}>{guardrail}</li>
          ))}
        </ul>

        <div className="paper-submit-actions">
          <button className="action-button" disabled={isSubmitting} type="submit">
            {isSubmitting ? copy.paperSubmit.submitting : copy.paperSubmit.submit}
          </button>
          <button className="action-button secondary" type="button" onClick={refreshRecords}>
            {copy.paperSubmit.refreshRecords}
          </button>
        </div>

        {statusMessage ? <p className="loader-status ok">{statusMessage}</p> : null}
        {errorMessage ? <p className="loader-status error">{errorMessage}</p> : null}

        {result ? (
          <article className="paper-submit-result">
            <p className="card-kicker">{copy.paperSubmit.resultKicker}</p>
            <h3>{copy.paperSubmit.resultTitle}</h3>
            <dl className="detail-list">
              <div>
                <dt>{copy.paperSubmit.result.workflowRunId}</dt>
                <dd>{result.workflow_run_id}</dd>
              </div>
              <div>
                <dt>{copy.paperSubmit.result.orderId}</dt>
                <dd>{result.paper_order_intent?.order_id ?? copy.paperRecords.none}</dd>
              </div>
              <div>
                <dt>{copy.paperSubmit.result.finalStatus}</dt>
                <dd>{result.oms_state?.status ?? copy.paperRecords.none}</dd>
              </div>
              <div>
                <dt>{copy.paperSubmit.result.persistence}</dt>
                <dd>
                  {String(result.persisted)} / {result.persistence_backend}
                </dd>
              </div>
              <div>
                <dt>{copy.paperSubmit.result.brokerMessage}</dt>
                <dd>{result.paper_broker_ack?.message ?? result.message}</dd>
              </div>
            </dl>
          </article>
        ) : null}
      </form>
    </section>
  );
}

function buildPaperWorkflowPayload(input: {
  direction: Direction;
  symbol: SymbolCode;
  quantity: number;
  targetTxEquivalent: number;
  brokerSimulation: BrokerSimulation;
  approvalReason: string;
}) {
  const now = new Date();
  const safeQuantity = Math.max(1, Math.min(5, Math.trunc(input.quantity || 1)));
  const safeExposure = Math.max(0.05, Math.min(0.25, input.targetTxEquivalent || 0.05));

  return {
    signal: {
      signal_id: `ui-paper-signal-${now.getTime()}`,
      strategy_id: "controlled-paper-ui-demo",
      strategy_version: "0.1.0",
      timestamp: now.toISOString(),
      symbol_group: "TAIEX_FUTURES",
      direction: input.direction,
      target_tx_equivalent: safeExposure,
      confidence: 0.5,
      stop_distance_points: 20,
      reason: {
        signals_only: true,
        order_created: false,
        broker_api_called: false,
        risk_engine_called: false,
        oms_called: false,
        ui_source: "paper_simulation_controlled_submit",
      },
    },
    approval_decision: "approved_for_paper_simulation",
    reviewer_id: "local-paper-reviewer",
    approval_reason: input.approvalReason.trim() || "Controlled paper UI demo only.",
    symbol: input.symbol,
    quantity: safeQuantity,
    quote_age_seconds: 0,
    broker_simulation: input.brokerSimulation,
    paper_only: true,
  };
}

function assertPaperOnlyResponse(response: PaperWorkflowResponse) {
  if (!response.paper_only) {
    throw new Error("Unsafe response: paper_only must be true.");
  }
  if (response.live_trading_enabled) {
    throw new Error("Unsafe response: live trading must remain disabled.");
  }
  if (response.broker_api_called) {
    throw new Error("Unsafe response: broker API must not be called.");
  }
  if (response.approval.approval_for_live) {
    throw new Error("Unsafe response: live approval is not allowed.");
  }
  if (response.paper_order_intent && !response.paper_order_intent.paper_only) {
    throw new Error("Unsafe response: paper order intent must remain paper_only=true.");
  }
}
