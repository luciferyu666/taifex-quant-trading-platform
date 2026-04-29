"use client";

import { useMemo, useState } from "react";

import type { DashboardCopy } from "../i18n";

type DemoGuidePanelProps = {
  copy: DashboardCopy["demoGuide"];
};

export function DemoGuidePanel({ copy }: DemoGuidePanelProps) {
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [copyStatus, setCopyStatus] = useState("");
  const activeStep = copy.steps[activeStepIndex];
  const checklist = useMemo(
    () =>
      copy.steps
        .map((step, index) => `${index + 1}. ${step.title} - ${step.expected}`)
        .join("\n"),
    [copy.steps],
  );

  function goToPreviousStep() {
    setActiveStepIndex((current) => Math.max(0, current - 1));
  }

  function goToNextStep() {
    setActiveStepIndex((current) => Math.min(copy.steps.length - 1, current + 1));
  }

  function resetGuide() {
    setActiveStepIndex(0);
    setCopyStatus("");
  }

  async function copyChecklist() {
    try {
      await navigator.clipboard.writeText(`${copy.checklistIntro}\n${checklist}`);
      setCopyStatus(copy.copied);
    } catch {
      setCopyStatus(copy.copyFailed);
    }
  }

  return (
    <section className="demo-guide" aria-label={copy.ariaLabel}>
      <div className="demo-guide-header">
        <div>
          <p className="eyebrow">{copy.eyebrow}</p>
          <h2>{copy.title}</h2>
          <p>{copy.description}</p>
        </div>
        <span className="metric ok">{copy.readOnlyBadge}</span>
      </div>

      <div className="demo-guide-layout">
        <nav className="demo-step-list" aria-label={copy.stepListLabel}>
          {copy.steps.map((step, index) => (
            <button
              aria-current={activeStepIndex === index ? "step" : undefined}
              className={activeStepIndex === index ? "demo-step-button active" : "demo-step-button"}
              key={step.title}
              type="button"
              onClick={() => setActiveStepIndex(index)}
            >
              <span>{index + 1}</span>
              <strong>{step.title}</strong>
            </button>
          ))}
        </nav>

        <article className="demo-step-card">
          <div className="demo-step-meta">
            <span className="metric ok">
              {copy.activeStepLabel} {activeStepIndex + 1}/{copy.steps.length}
            </span>
            <span className="metric warn">
              {copy.suggestedTabLabel}: {activeStep.tab}
            </span>
          </div>
          <h3>{activeStep.title}</h3>
          <p>{activeStep.body}</p>
          <dl className="demo-step-details">
            <div>
              <dt>{copy.expectedLabel}</dt>
              <dd>{activeStep.expected}</dd>
            </div>
            <div>
              <dt>{copy.safetyLabel}</dt>
              <dd>{activeStep.safety}</dd>
            </div>
          </dl>

          <div className="demo-guide-actions">
            <button
              className="action-button secondary"
              type="button"
              onClick={goToPreviousStep}
              disabled={activeStepIndex === 0}
            >
              {copy.previous}
            </button>
            <button
              className="action-button"
              type="button"
              onClick={goToNextStep}
              disabled={activeStepIndex === copy.steps.length - 1}
            >
              {copy.next}
            </button>
            <button className="action-button secondary" type="button" onClick={copyChecklist}>
              {copy.copyChecklist}
            </button>
            <button className="action-button secondary" type="button" onClick={resetGuide}>
              {copy.reset}
            </button>
          </div>
          {copyStatus ? <p className="loader-status ok">{copyStatus}</p> : null}
        </article>
      </div>

      <article className="demo-prohibited-panel">
        <p className="card-kicker">{copy.prohibitedKicker}</p>
        <h3>{copy.prohibitedTitle}</h3>
        <ul className="pill-list">
          {copy.prohibitedItems.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </article>
    </section>
  );
}
