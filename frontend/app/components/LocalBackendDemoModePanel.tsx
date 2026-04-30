"use client";

import { useState } from "react";

import type { DashboardCopy } from "../i18n";

type LocalBackendDemoModePanelProps = {
  copy: DashboardCopy["localBackendMode"];
};

const commandLines = [
  "make backend",
  "make frontend",
  "make seed-paper-execution-demo",
  "make paper-execution-persistence-check",
];

export function LocalBackendDemoModePanel({ copy }: LocalBackendDemoModePanelProps) {
  const [copyStatus, setCopyStatus] = useState("");
  const commandBlock = commandLines.join("\n");

  async function copyCommands() {
    try {
      await navigator.clipboard.writeText(commandBlock);
      setCopyStatus(copy.copied);
    } catch {
      setCopyStatus(copy.copyFailed);
    }
  }

  return (
    <section className="local-backend-panel" aria-labelledby="local-backend-demo-title">
      <div className="section-heading">
        <p className="eyebrow">{copy.eyebrow}</p>
        <h2 id="local-backend-demo-title">{copy.title}</h2>
        <p>{copy.description}</p>
      </div>

      <div className="paper-workflow-grid">
        {copy.modes.map((mode) => (
          <article className="paper-workflow-card" key={mode.title}>
            <p className="card-kicker">{mode.kicker}</p>
            <h3>{mode.title}</h3>
            <p>{mode.text}</p>
          </article>
        ))}
      </div>

      <article className="troubleshooting-panel local-demo-commands">
        <div>
          <p className="card-kicker">{copy.commandsKicker}</p>
          <h3>{copy.commandsTitle}</h3>
          <p>{copy.commandsText}</p>
        </div>
        <pre>{commandBlock}</pre>
        <button className="action-button secondary" type="button" onClick={copyCommands}>
          {copy.copyCommands}
        </button>
        {copyStatus ? <p className="loader-status ok">{copyStatus}</p> : null}
      </article>

      <div className="workflow-metrics" aria-label={copy.safetyLabel}>
        <span className="metric ok">TRADING_MODE=paper</span>
        <span className="metric ok">ENABLE_LIVE_TRADING=false</span>
        <span className="metric ok">BROKER_PROVIDER=paper</span>
        <span className="metric warn">PRODUCTION_SQLITE_ACCESS=false</span>
        <span className="metric warn">PRODUCTION_TRADING_PLATFORM=NOT READY</span>
      </div>
    </section>
  );
}
