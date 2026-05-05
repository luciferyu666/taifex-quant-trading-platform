"use client";

import type { DashboardCopy } from "../i18n";
import type { BrowserOnlyMockSession } from "./browserOnlyMockRuntime";

export type BrowserOnlyGuideAction =
  | "next_tick"
  | "run_strategy"
  | "simulate_order"
  | "review_oms"
  | "review_portfolio"
  | "reset_session";

type BrowserOnlyMockDemoGuideProps = {
  activeStep: number;
  copy: DashboardCopy["browserOnlyMockDemo"]["guide"];
  session: BrowserOnlyMockSession;
  onAction: (action: BrowserOnlyGuideAction) => void;
  onStepChange: (step: number) => void;
};

const actionByStep: BrowserOnlyGuideAction[] = [
  "next_tick",
  "run_strategy",
  "simulate_order",
  "review_oms",
  "review_portfolio",
  "reset_session",
];

export function BrowserOnlyMockDemoGuide({
  activeStep,
  copy,
  session,
  onAction,
  onStepChange,
}: BrowserOnlyMockDemoGuideProps) {
  const boundedStep = Math.min(Math.max(activeStep, 0), copy.steps.length - 1);
  const step = copy.steps[boundedStep];
  const action = actionByStep[boundedStep] ?? "next_tick";

  return (
    <article className="browser-demo-guide" aria-labelledby="browser-demo-guide-title">
      <div className="browser-demo-guide-header">
        <div>
          <p className="eyebrow">{copy.eyebrow}</p>
          <h3 id="browser-demo-guide-title">{copy.title}</h3>
          <p>{copy.description}</p>
        </div>
        <div className="browser-demo-session-meta" aria-label={copy.sessionMetaLabel}>
          <span className="metric ok">{copy.sessionIdLabel}: {session.session_id}</span>
          <span className="metric ok">{copy.seedLabel}: {session.mock_seed}</span>
        </div>
      </div>

      <div className="browser-demo-guide-layout">
        <nav className="browser-demo-step-list" aria-label={copy.stepListLabel}>
          {copy.steps.map((candidate, index) => (
            <button
              aria-current={index === boundedStep ? "step" : undefined}
              className={index === boundedStep ? "demo-step-button active" : "demo-step-button"}
              key={candidate.title}
              onClick={() => onStepChange(index)}
              type="button"
            >
              <span>{index + 1}</span>
              <strong>{candidate.title}</strong>
            </button>
          ))}
        </nav>

        <div className="browser-demo-step-card">
          <div className="demo-step-meta">
            <span className="metric ok">
              {copy.activeStepLabel} {boundedStep + 1}/{copy.steps.length}
            </span>
            <span className="metric ok">{copy.paperOnlyLabel}</span>
            <span className="metric ok">{copy.browserOnlyLabel}</span>
          </div>
          <h4>{step.title}</h4>
          <p>{step.body}</p>

          <div className="demo-step-details">
            <div>
              <strong>{copy.expectedLabel}</strong>
              <p>{step.expected}</p>
            </div>
            <div>
              <strong>{copy.resultLabel}</strong>
              <p>{step.result}</p>
            </div>
            <div>
              <strong>{copy.safetyLabel}</strong>
              <p>{step.safety}</p>
            </div>
            <div>
              <strong>{copy.nextLabel}</strong>
              <p>{step.next}</p>
            </div>
          </div>

          <div className="demo-guide-actions">
            <button className="action-button" type="button" onClick={() => onAction(action)}>
              {step.actionLabel}
            </button>
            <button
              className="action-button secondary"
              disabled={boundedStep === 0}
              type="button"
              onClick={() => onStepChange(Math.max(0, boundedStep - 1))}
            >
              {copy.previous}
            </button>
            <button
              className="action-button secondary"
              disabled={boundedStep === copy.steps.length - 1}
              type="button"
              onClick={() => onStepChange(Math.min(copy.steps.length - 1, boundedStep + 1))}
            >
              {copy.next}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
