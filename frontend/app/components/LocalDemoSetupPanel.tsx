"use client";

import { useState } from "react";

import type { DashboardCopy } from "../i18n";

type LocalDemoSetupPanelProps = {
  copy: DashboardCopy["localDemoSetup"];
};

const quickStartCommands = [
  "make customer-demo-env-check",
  "make start-customer-demo",
].join("\n");

const windowsCommands = [
  "powershell -ExecutionPolicy Bypass -File scripts/start-customer-demo.ps1 -CheckOnly",
  "powershell -ExecutionPolicy Bypass -File scripts/start-customer-demo.ps1",
].join("\n");

export function LocalDemoSetupPanel({ copy }: LocalDemoSetupPanelProps) {
  const [copyStatus, setCopyStatus] = useState("");

  async function copyQuickStartCommands() {
    try {
      await navigator.clipboard.writeText(quickStartCommands);
      setCopyStatus(copy.copied);
    } catch {
      setCopyStatus(copy.copyFailed);
    }
  }

  return (
    <section className="local-demo-setup-panel" aria-labelledby="local-demo-setup-title">
      <div className="section-heading">
        <p className="eyebrow">{copy.eyebrow}</p>
        <h2 id="local-demo-setup-title">{copy.title}</h2>
        <p>{copy.description}</p>
      </div>

      <div className="paper-workflow-grid">
        {copy.steps.map((step) => (
          <article className="paper-workflow-card" key={step.title}>
            <p className="card-kicker">{step.kicker}</p>
            <h3>{step.title}</h3>
            <p>{step.text}</p>
          </article>
        ))}
      </div>

      <article className="troubleshooting-panel local-demo-commands">
        <div>
          <p className="card-kicker">{copy.commandKicker}</p>
          <h3>{copy.commandTitle}</h3>
          <p>{copy.commandText}</p>
        </div>
        <pre>{quickStartCommands}</pre>
        <button className="action-button secondary" type="button" onClick={copyQuickStartCommands}>
          {copy.copyCommands}
        </button>
        {copyStatus ? <p className="loader-status ok">{copyStatus}</p> : null}
      </article>

      <article className="paper-record-panel">
        <p className="card-kicker">{copy.windowsKicker}</p>
        <h3>{copy.windowsTitle}</h3>
        <p>{copy.windowsText}</p>
        <pre>{windowsCommands}</pre>
      </article>

      <div className="workflow-metrics" aria-label={copy.safetyLabel}>
        <span className="metric ok">TRADING_MODE=paper</span>
        <span className="metric ok">ENABLE_LIVE_TRADING=false</span>
        <span className="metric ok">BROKER_PROVIDER=paper</span>
        <span className="metric warn">LOCAL_MACHINE_ONLY=true</span>
        <span className="metric warn">HOSTED_CUSTOMER_ACCOUNTS=false</span>
        <span className="metric warn">BROKER_CREDENTIALS_COLLECTED=false</span>
        <span className="metric warn">PRODUCTION_TRADING_PLATFORM=NOT READY</span>
      </div>
    </section>
  );
}
