"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import type { DashboardCopy } from "../i18n";
import type { PaperApprovalHistory } from "./PaperApprovalQueuePanel";

type SignalDirection = "LONG" | "SHORT" | "FLAT";

type PaperApprovalRequestPanelProps = {
  available: boolean;
  copy: DashboardCopy;
};

type RequestResponse = PaperApprovalHistory;

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000";

export function PaperApprovalRequestPanel({
  available,
  copy,
}: PaperApprovalRequestPanelProps) {
  const router = useRouter();
  const [strategyId, setStrategyId] = useState("customer-demo-strategy");
  const [strategyVersion, setStrategyVersion] = useState("0.1.0");
  const [signalId, setSignalId] = useState(() => createLocalSignalId());
  const [direction, setDirection] = useState<SignalDirection>("LONG");
  const [targetTxEquivalent, setTargetTxEquivalent] = useState(0.05);
  const [confidence, setConfidence] = useState(0.72);
  const [stopDistancePoints, setStopDistancePoints] = useState(20);
  const [requesterId, setRequesterId] = useState("local-ui-requester");
  const [requestReason, setRequestReason] = useState<string>(
    copy.paperApprovalRequest.defaultReason,
  );
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<RequestResponse | null>(null);
  const submitDisabled =
    !available ||
    isSubmitting ||
    strategyId.trim().length === 0 ||
    strategyVersion.trim().length === 0 ||
    signalId.trim().length === 0 ||
    requesterId.trim().length === 0 ||
    requestReason.trim().length === 0 ||
    targetTxEquivalent < 0 ||
    confidence < 0 ||
    confidence > 1 ||
    stopDistancePoints < 0;

  async function submitApprovalRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");
    setStatusMessage(copy.paperApprovalRequest.submitting);
    setResult(null);

    try {
      const response = await fetch(
        `${backendUrl}/api/paper-execution/approvals/requests`,
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify({
            signal: {
              signal_id: signalId.trim(),
              strategy_id: strategyId.trim(),
              strategy_version: strategyVersion.trim(),
              timestamp: new Date().toISOString(),
              symbol_group: "TAIEX_FUTURES",
              direction,
              target_tx_equivalent: targetTxEquivalent,
              confidence,
              stop_distance_points: stopDistancePoints,
              reason: {
                signals_only: true,
                order_created: false,
                broker_api_called: false,
                risk_engine_called: false,
                oms_called: false,
                source: "paper_approval_request_ui",
              },
            },
            requested_action: "paper_simulation",
            requester_id: requesterId.trim(),
            request_reason: requestReason.trim(),
            paper_only: true,
          }),
        },
      );
      const payload = (await response.json()) as RequestResponse | { detail?: string };

      if (!response.ok) {
        const detail =
          "detail" in payload && payload.detail
            ? payload.detail
            : `Backend returned HTTP ${response.status}`;
        throw new Error(detail);
      }

      assertPaperOnlyRequestResponse(payload as RequestResponse);
      setResult(payload as RequestResponse);
      setStatusMessage(copy.paperApprovalRequest.success);
      setSignalId(createLocalSignalId());
      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : copy.paperApprovalRequest.unknownError,
      );
      setStatusMessage("");
    } finally {
      setIsSubmitting(false);
    }
  }

  function refreshQueue() {
    router.refresh();
  }

  return (
    <section className="paper-approval-request-section" aria-labelledby="paper-approval-request-title">
      <div className="section-heading">
        <p className="eyebrow">{copy.paperApprovalRequest.eyebrow}</p>
        <h2 id="paper-approval-request-title">{copy.paperApprovalRequest.title}</h2>
        <p>{copy.paperApprovalRequest.description}</p>
      </div>

      <form className="paper-approval-request-card" onSubmit={submitApprovalRequest}>
        <div className="paper-submit-banner">
          <span className="metric ok">{copy.paperApprovalRequest.paperOnlyBadge}</span>
          <span className="metric ok">ENABLE_LIVE_TRADING=false</span>
          <span className="metric ok">BROKER_PROVIDER=paper</span>
          <span className="metric ok">{copy.paperApprovalRequest.noOrderBadge}</span>
        </div>

        <div className="paper-approval-request-grid">
          <label>
            <span>{copy.paperApprovalRequest.fields.strategyId}</span>
            <input
              autoComplete="off"
              value={strategyId}
              onChange={(event) => setStrategyId(event.target.value)}
            />
          </label>

          <label>
            <span>{copy.paperApprovalRequest.fields.strategyVersion}</span>
            <input
              autoComplete="off"
              value={strategyVersion}
              onChange={(event) => setStrategyVersion(event.target.value)}
            />
          </label>

          <label>
            <span>{copy.paperApprovalRequest.fields.signalId}</span>
            <input
              autoComplete="off"
              value={signalId}
              onChange={(event) => setSignalId(event.target.value)}
            />
          </label>

          <label>
            <span>{copy.paperApprovalRequest.fields.direction}</span>
            <select
              value={direction}
              onChange={(event) => setDirection(event.target.value as SignalDirection)}
            >
              <option value="LONG">LONG</option>
              <option value="SHORT">SHORT</option>
              <option value="FLAT">FLAT</option>
            </select>
          </label>

          <label>
            <span>{copy.paperApprovalRequest.fields.targetExposure}</span>
            <input
              min={0}
              max={0.25}
              step={0.05}
              type="number"
              value={targetTxEquivalent}
              onChange={(event) => setTargetTxEquivalent(Number(event.target.value))}
            />
          </label>

          <label>
            <span>{copy.paperApprovalRequest.fields.confidence}</span>
            <input
              min={0}
              max={1}
              step={0.01}
              type="number"
              value={confidence}
              onChange={(event) => setConfidence(Number(event.target.value))}
            />
          </label>

          <label>
            <span>{copy.paperApprovalRequest.fields.stopDistance}</span>
            <input
              min={0}
              step={1}
              type="number"
              value={stopDistancePoints}
              onChange={(event) => setStopDistancePoints(Number(event.target.value))}
            />
          </label>

          <label>
            <span>{copy.paperApprovalRequest.fields.requesterId}</span>
            <input
              autoComplete="off"
              value={requesterId}
              onChange={(event) => setRequesterId(event.target.value)}
            />
          </label>

          <label className="paper-approval-request-wide">
            <span>{copy.paperApprovalRequest.fields.requestReason}</span>
            <textarea
              rows={3}
              value={requestReason}
              onChange={(event) => setRequestReason(event.target.value)}
            />
          </label>
        </div>

        <ul className="warning-list paper-submit-guardrails">
          {copy.paperApprovalRequest.guardrails.map((guardrail) => (
            <li key={guardrail}>{guardrail}</li>
          ))}
        </ul>

        <div className="paper-submit-actions">
          <button className="action-button" disabled={submitDisabled} type="submit">
            {isSubmitting ? copy.paperApprovalRequest.submitting : copy.paperApprovalRequest.submit}
          </button>
          <button className="action-button secondary" type="button" onClick={refreshQueue}>
            {copy.paperApprovalRequest.refreshQueue}
          </button>
        </div>

        {statusMessage ? <p className="loader-status ok">{statusMessage}</p> : null}
        {errorMessage ? <p className="loader-status error">{errorMessage}</p> : null}

        {result ? (
          <article className="paper-submit-result">
            <p className="card-kicker">{copy.paperApprovalRequest.resultKicker}</p>
            <h3>{copy.paperApprovalRequest.resultTitle}</h3>
            <dl className="detail-list">
              <div>
                <dt>{copy.paperApprovalRequest.result.approvalRequestId}</dt>
                <dd>{result.request.approval_request_id}</dd>
              </div>
              <div>
                <dt>{copy.paperApprovalRequest.result.currentStatus}</dt>
                <dd>{result.current_status}</dd>
              </div>
              <div>
                <dt>{copy.paperApprovalRequest.result.strategy}</dt>
                <dd>
                  {result.request.strategy_id}@{result.request.strategy_version}
                </dd>
              </div>
              <div>
                <dt>{copy.paperApprovalRequest.result.signal}</dt>
                <dd>{result.request.signal_id}</dd>
              </div>
              <div>
                <dt>{copy.paperApprovalRequest.result.paperOnly}</dt>
                <dd>{String(result.request.paper_only)}</dd>
              </div>
              <div>
                <dt>{copy.paperApprovalRequest.result.latestHash}</dt>
                <dd>{result.request.latest_chain_hash}</dd>
              </div>
            </dl>
          </article>
        ) : null}
      </form>
    </section>
  );
}

function createLocalSignalId() {
  return `ui-paper-signal-${Date.now()}`;
}

function assertPaperOnlyRequestResponse(response: RequestResponse) {
  if (!response.request.paper_only) {
    throw new Error("Unsafe response: approval request must remain paper_only=true.");
  }
  if (response.request.approval_for_live || response.approval_for_live) {
    throw new Error("Unsafe response: live approval is not allowed.");
  }
  if (response.request.live_execution_eligible || response.live_execution_eligible) {
    throw new Error("Unsafe response: live execution eligibility is not allowed.");
  }
  if (response.request.broker_api_called || response.broker_api_called) {
    throw new Error("Unsafe response: broker API must not be called.");
  }
  if (response.current_status !== "pending_review") {
    throw new Error("Unsafe response: new approval request must start as pending_review.");
  }
  if (response.decisions.length > 0) {
    throw new Error("Unsafe response: request creation must not create decisions.");
  }
}
