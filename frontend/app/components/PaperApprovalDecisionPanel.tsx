"use client";

import { useState, type FormEvent } from "react";

import { commandCenterApiBaseUrl } from "../apiBase";
import type { DashboardCopy } from "../i18n";
import type { PaperApprovalHistory } from "./PaperApprovalQueuePanel";

type PaperApprovalDecision = "research_approved" | "approved_for_paper_simulation" | "rejected" | "needs_data_review";
type PaperApprovalReviewerRole = "research_reviewer" | "risk_reviewer" | "compliance_reviewer";

type PaperApprovalDecisionPanelProps = {
  available: boolean;
  copy: DashboardCopy;
  queue: PaperApprovalHistory[];
};

type DecisionResponse = PaperApprovalHistory;

const backendUrl = commandCenterApiBaseUrl;

export function PaperApprovalDecisionPanel({
  available,
  copy,
  queue,
}: PaperApprovalDecisionPanelProps) {
  const actionableQueue = queue.filter((item) =>
    ["pending_review", "research_approved"].includes(item.current_status),
  );
  const [approvalRequestId, setApprovalRequestId] = useState(
    actionableQueue[0]?.request.approval_request_id ?? "",
  );
  const selectedApproval =
    actionableQueue.find(
      (item) => item.request.approval_request_id === approvalRequestId,
    ) ?? actionableQueue[0];
  const decisionOptions = getDecisionOptions(selectedApproval?.current_status);
  const initialDecision = decisionOptions[0] ?? "research_approved";
  const [decision, setDecision] = useState<PaperApprovalDecision>(initialDecision);
  const safeDecision = decisionOptions.includes(decision)
    ? decision
    : decisionOptions[0] ?? "research_approved";
  const [reviewerId, setReviewerId] = useState("local-ui-reviewer");
  const [reviewerRole, setReviewerRole] =
    useState<PaperApprovalReviewerRole>(getDefaultReviewerRole(initialDecision));
  const [decisionReason, setDecisionReason] = useState<string>(
    copy.paperApprovalDecision.defaultReason,
  );
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<DecisionResponse | null>(null);
  const submitDisabled =
    !available ||
    !selectedApproval ||
    decisionOptions.length === 0 ||
    isSubmitting ||
    reviewerId.trim().length === 0 ||
    decisionReason.trim().length === 0;

  async function submitDecision(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedApproval) {
      setErrorMessage(copy.paperApprovalDecision.noActionableRequests);
      setStatusMessage("");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");
    setStatusMessage(copy.paperApprovalDecision.submitting);
    setResult(null);

    try {
      const response = await fetch(
        `${backendUrl}/api/paper-execution/approvals/requests/${selectedApproval.request.approval_request_id}/decisions`,
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify({
            decision: safeDecision,
            reviewer_id: reviewerId.trim(),
            reviewer_role: reviewerRole,
            decision_reason: decisionReason.trim(),
            paper_only: true,
          }),
        },
      );
      const payload = (await response.json()) as DecisionResponse | { detail?: string };

      if (!response.ok) {
        const detail =
          "detail" in payload && payload.detail
            ? payload.detail
            : `Backend returned HTTP ${response.status}`;
        throw new Error(detail);
      }

      assertPaperOnlyDecisionResponse(payload as DecisionResponse);
      setResult(payload as DecisionResponse);
      setStatusMessage(copy.paperApprovalDecision.success);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : copy.paperApprovalDecision.unknownError,
      );
      setStatusMessage("");
    } finally {
      setIsSubmitting(false);
    }
  }

  function refreshQueue() {
    window.location.reload();
  }

  return (
    <section className="paper-approval-decision-section" aria-labelledby="paper-approval-decision-title">
      <div className="section-heading">
        <p className="eyebrow">{copy.paperApprovalDecision.eyebrow}</p>
        <h2 id="paper-approval-decision-title">{copy.paperApprovalDecision.title}</h2>
        <p>{copy.paperApprovalDecision.description}</p>
      </div>

      <form className="paper-approval-decision-card" onSubmit={submitDecision}>
        <div className="paper-submit-banner">
          <span className="metric ok">{copy.paperApprovalDecision.paperOnlyBadge}</span>
          <span className="metric ok">ENABLE_LIVE_TRADING=false</span>
          <span className="metric ok">BROKER_PROVIDER=paper</span>
          <span className="metric ok">{copy.paperApprovalDecision.noCredentialsBadge}</span>
        </div>

        {actionableQueue.length === 0 ? (
          <p className="empty-state">{copy.paperApprovalDecision.noActionableRequests}</p>
        ) : null}

        <div className="paper-approval-decision-grid">
          <label className="paper-approval-decision-wide">
            <span>{copy.paperApprovalDecision.fields.approvalRequestId}</span>
            <select
              disabled={actionableQueue.length === 0}
              value={selectedApproval?.request.approval_request_id ?? ""}
              onChange={(event) => {
                const nextApproval = actionableQueue.find(
                  (item) => item.request.approval_request_id === event.target.value,
                );
                const nextOptions = getDecisionOptions(nextApproval?.current_status);
                setApprovalRequestId(event.target.value);
                setDecision(nextOptions[0] ?? "research_approved");
                setReviewerRole(getDefaultReviewerRole(nextOptions[0]));
              }}
            >
              {actionableQueue.map((item) => (
                <option
                  key={item.request.approval_request_id}
                  value={item.request.approval_request_id}
                >
                  {item.request.approval_request_id}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>{copy.paperApprovalDecision.fields.currentStatus}</span>
            <input readOnly value={selectedApproval?.current_status ?? copy.paperRecords.none} />
          </label>

          <label>
            <span>{copy.paperApprovalDecision.fields.decision}</span>
            <select
              disabled={decisionOptions.length === 0}
              value={safeDecision}
              onChange={(event) => {
                const nextDecision = event.target.value as PaperApprovalDecision;
                setDecision(nextDecision);
                setReviewerRole(getDefaultReviewerRole(nextDecision));
              }}
            >
              {decisionOptions.map((option) => (
                <option key={option} value={option}>
                  {copy.paperApprovalDecision.decisionLabels[option]}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>{copy.paperApprovalDecision.fields.reviewerRole}</span>
            <select
              value={reviewerRole}
              onChange={(event) =>
                setReviewerRole(event.target.value as PaperApprovalReviewerRole)
              }
            >
              <option value="research_reviewer">
                {copy.paperApprovalDecision.roleLabels.research_reviewer}
              </option>
              <option value="risk_reviewer">
                {copy.paperApprovalDecision.roleLabels.risk_reviewer}
              </option>
              <option value="compliance_reviewer">
                {copy.paperApprovalDecision.roleLabels.compliance_reviewer}
              </option>
            </select>
          </label>

          <label>
            <span>{copy.paperApprovalDecision.fields.reviewerId}</span>
            <input
              autoComplete="off"
              value={reviewerId}
              onChange={(event) => setReviewerId(event.target.value)}
            />
          </label>

          <label className="paper-approval-decision-wide">
            <span>{copy.paperApprovalDecision.fields.decisionReason}</span>
            <textarea
              rows={3}
              value={decisionReason}
              onChange={(event) => setDecisionReason(event.target.value)}
            />
          </label>
        </div>

        {selectedApproval ? (
          <dl className="detail-list paper-submit-approval-context">
            <div>
              <dt>{copy.paperApprovalDecision.context.strategy}</dt>
              <dd>
                {selectedApproval.request.strategy_id}@
                {selectedApproval.request.strategy_version}
              </dd>
            </div>
            <div>
              <dt>{copy.paperApprovalDecision.context.signal}</dt>
              <dd>{selectedApproval.request.signal_id}</dd>
            </div>
            <div>
              <dt>{copy.paperApprovalDecision.context.requiredSequence}</dt>
              <dd>{selectedApproval.request.required_decision_sequence.join(" -> ")}</dd>
            </div>
            <div>
              <dt>{copy.paperApprovalDecision.context.latestHash}</dt>
              <dd>{selectedApproval.request.latest_chain_hash}</dd>
            </div>
          </dl>
        ) : null}

        <ul className="warning-list paper-submit-guardrails">
          {copy.paperApprovalDecision.guardrails.map((guardrail) => (
            <li key={guardrail}>{guardrail}</li>
          ))}
        </ul>

        <div className="paper-submit-actions">
          <button className="action-button" disabled={submitDisabled} type="submit">
            {isSubmitting ? copy.paperApprovalDecision.submitting : copy.paperApprovalDecision.submit}
          </button>
          <button className="action-button secondary" type="button" onClick={refreshQueue}>
            {copy.paperApprovalDecision.refreshQueue}
          </button>
        </div>

        {statusMessage ? <p className="loader-status ok">{statusMessage}</p> : null}
        {errorMessage ? <p className="loader-status error">{errorMessage}</p> : null}

        {result ? (
          <article className="paper-submit-result">
            <p className="card-kicker">{copy.paperApprovalDecision.resultKicker}</p>
            <h3>{copy.paperApprovalDecision.resultTitle}</h3>
            <dl className="detail-list">
              <div>
                <dt>{copy.paperApprovalDecision.result.approvalRequestId}</dt>
                <dd>{result.request.approval_request_id}</dd>
              </div>
              <div>
                <dt>{copy.paperApprovalDecision.result.currentStatus}</dt>
                <dd>{result.current_status}</dd>
              </div>
              <div>
                <dt>{copy.paperApprovalDecision.result.decisionCount}</dt>
                <dd>{result.decisions.length}</dd>
              </div>
              <div>
                <dt>{copy.paperApprovalDecision.result.paperSimulationApproved}</dt>
                <dd>{String(result.paper_simulation_approved)}</dd>
              </div>
              <div>
                <dt>{copy.paperApprovalDecision.result.latestHash}</dt>
                <dd>{result.request.latest_chain_hash}</dd>
              </div>
            </dl>
          </article>
        ) : null}
      </form>
    </section>
  );
}

function getDecisionOptions(status?: string): PaperApprovalDecision[] {
  if (status === "pending_review") {
    return ["research_approved", "rejected", "needs_data_review"];
  }
  if (status === "research_approved") {
    return ["approved_for_paper_simulation", "rejected", "needs_data_review"];
  }
  return [];
}

function getDefaultReviewerRole(
  decision?: PaperApprovalDecision,
): PaperApprovalReviewerRole {
  if (decision === "approved_for_paper_simulation") {
    return "risk_reviewer";
  }
  if (decision === "research_approved") {
    return "research_reviewer";
  }
  return "compliance_reviewer";
}

function assertPaperOnlyDecisionResponse(response: DecisionResponse) {
  if (!response.request.paper_only) {
    throw new Error("Unsafe response: approval request must remain paper_only=true.");
  }
  if (response.approval_for_live || response.live_execution_eligible) {
    throw new Error("Unsafe response: live approval is not allowed.");
  }
  if (response.broker_api_called) {
    throw new Error("Unsafe response: broker API must not be called.");
  }
  if (response.decisions.some((decision) => !decision.paper_only)) {
    throw new Error("Unsafe response: every decision must remain paper_only=true.");
  }
  if (response.decisions.some((decision) => decision.approval_for_live)) {
    throw new Error("Unsafe response: reviewer decisions must not approve live trading.");
  }
}
