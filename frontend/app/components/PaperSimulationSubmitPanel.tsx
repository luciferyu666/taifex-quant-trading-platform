"use client";

import { useState, type FormEvent } from "react";

import { commandCenterApiBaseUrl } from "../apiBase";
import type { DashboardCopy } from "../i18n";
import type {
  PaperApprovalHistory,
  PaperApprovalSignalPayload,
} from "./PaperApprovalQueuePanel";

type SymbolCode = "TX" | "MTX" | "TMF";
type BrokerSimulation = "acknowledge" | "partial_fill" | "fill" | "reject" | "cancel";

type PaperSimulationSubmitPanelProps = {
  approvalHistories: PaperApprovalHistory[];
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

const backendUrl = commandCenterApiBaseUrl;

export function PaperSimulationSubmitPanel({
  approvalHistories,
  copy,
}: PaperSimulationSubmitPanelProps) {
  const approvedApprovalHistories = approvalHistories.filter(
    (history) =>
      history.current_status === "approved_for_paper_simulation" &&
      history.paper_simulation_approved &&
      !history.approval_for_live &&
      !history.live_execution_eligible &&
      !history.broker_api_called,
  );
  const [approvalRequestId, setApprovalRequestId] = useState<string>(
    approvedApprovalHistories[0]?.request.approval_request_id ?? "",
  );
  const [symbol, setSymbol] = useState<SymbolCode>("TMF");
  const [quantity, setQuantity] = useState(1);
  const [brokerSimulation, setBrokerSimulation] =
    useState<BrokerSimulation>("fill");
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<PaperWorkflowResponse | null>(null);
  const effectiveApprovalRequestId =
    approvalRequestId || approvedApprovalHistories[0]?.request.approval_request_id || "";
  const selectedApproval =
    approvedApprovalHistories.find(
      (history) => history.request.approval_request_id === effectiveApprovalRequestId,
    ) ?? approvedApprovalHistories[0];
  const selectedSignal = selectedApproval?.request.payload?.signal;
  const submitDisabled = isSubmitting || !selectedApproval || !selectedSignal;

  async function submitPaperSimulation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedApproval || !selectedSignal) {
      setErrorMessage(copy.paperSubmit.missingApproval);
      setStatusMessage("");
      return;
    }
    setIsSubmitting(true);
    setErrorMessage("");
    setStatusMessage(copy.paperSubmit.submitting);
    setResult(null);

    try {
      const payload = buildPaperWorkflowPayload({
        approvalRequestId: selectedApproval.request.approval_request_id,
        signal: selectedSignal,
        symbol,
        quantity,
        brokerSimulation,
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
      if (
        (responsePayload as PaperWorkflowResponse).approval.approval_id !==
        selectedApproval.request.approval_request_id
      ) {
        throw new Error("Unsafe response: approval_id must match approval_request_id.");
      }
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
          <span className={selectedApproval ? "metric ok" : "metric warn"}>
            {copy.paperSubmit.approvalRequiredBadge}
          </span>
        </div>

        <div className="paper-submit-grid">
          <label className="paper-submit-wide">
            <span>{copy.paperSubmit.fields.approvalRequestId}</span>
            <select
              value={selectedApproval?.request.approval_request_id ?? ""}
              onChange={(event) => setApprovalRequestId(event.target.value)}
              disabled={approvedApprovalHistories.length === 0}
            >
              {approvedApprovalHistories.length === 0 ? (
                <option value="">{copy.paperSubmit.noApprovedRequests}</option>
              ) : (
                approvedApprovalHistories.map((history) => (
                  <option
                    key={history.request.approval_request_id}
                    value={history.request.approval_request_id}
                  >
                    {history.request.approval_request_id}
                  </option>
                ))
              )}
            </select>
          </label>

          <label>
            <span>{copy.paperSubmit.fields.direction}</span>
            <input readOnly value={selectedSignal?.direction ?? copy.paperRecords.none} />
          </label>

          <label>
            <span>{copy.paperSubmit.fields.targetExposure}</span>
            <input
              readOnly
              value={selectedSignal?.target_tx_equivalent ?? copy.paperRecords.none}
            />
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
            <input readOnly value={selectedApproval?.current_status ?? copy.paperRecords.none} />
          </label>
        </div>

        {selectedApproval ? (
          <dl className="detail-list paper-submit-approval-context">
            <div>
              <dt>{copy.paperSubmit.approvalContext.strategy}</dt>
              <dd>
                {selectedApproval.request.strategy_id}@
                {selectedApproval.request.strategy_version}
              </dd>
            </div>
            <div>
              <dt>{copy.paperSubmit.approvalContext.requiredSequence}</dt>
              <dd>{selectedApproval.request.required_decision_sequence.join(" -> ")}</dd>
            </div>
            <div>
              <dt>{copy.paperSubmit.approvalContext.latestHash}</dt>
              <dd>{selectedApproval.request.latest_chain_hash}</dd>
            </div>
          </dl>
        ) : (
          <p className="empty-state">{copy.paperSubmit.missingApproval}</p>
        )}

        <ul className="warning-list paper-submit-guardrails">
          {copy.paperSubmit.guardrails.map((guardrail) => (
            <li key={guardrail}>{guardrail}</li>
          ))}
        </ul>

        <div className="paper-submit-actions">
          <button className="action-button" disabled={submitDisabled} type="submit">
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
                <dt>{copy.paperSubmit.result.approvalRequestId}</dt>
                <dd>{result.approval.approval_id}</dd>
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
  approvalRequestId: string;
  signal: PaperApprovalSignalPayload;
  symbol: SymbolCode;
  quantity: number;
  brokerSimulation: BrokerSimulation;
}) {
  const safeQuantity = Math.max(1, Math.min(5, Math.trunc(input.quantity || 1)));

  return {
    signal: input.signal,
    approval_request_id: input.approvalRequestId,
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
