"use client";

import { useState, type ReactNode } from "react";

import type { DashboardCopy } from "../i18n";

type TabKey = "release" | "paper" | "packet" | "contracts";

type CommandCenterTabsProps = {
  copy: DashboardCopy["interactions"];
  backendAvailable: boolean;
  backendIssues: string[];
  release: ReactNode;
  paper: ReactNode;
  packet: ReactNode;
  contracts: ReactNode;
};

const tabOrder: TabKey[] = ["release", "paper", "packet", "contracts"];
const demoSeedCommand = "make seed-paper-execution-demo";

export function CommandCenterTabs({
  copy,
  backendAvailable,
  backendIssues,
  release,
  paper,
  packet,
  contracts,
}: CommandCenterTabsProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("paper");
  const [copyStatus, setCopyStatus] = useState<string>("");

  async function copyDemoSeedCommand() {
    try {
      await navigator.clipboard.writeText(demoSeedCommand);
      setCopyStatus(copy.copied);
    } catch {
      setCopyStatus(copy.copyFailed);
    }
  }

  function refreshStatus() {
    window.location.reload();
  }

  const panels: Record<TabKey, ReactNode> = {
    release,
    paper,
    packet,
    contracts,
  };

  return (
    <section className="command-center-interactions" aria-label={copy.ariaLabel}>
      <div className="interaction-toolbar">
        <div>
          <p className="eyebrow">{copy.eyebrow}</p>
          <h2>{copy.title}</h2>
          <p>{copy.description}</p>
        </div>
        <div className="toolbar-actions">
          <span className="metric ok">{copy.readOnlyBadge}</span>
          <button className="action-button" type="button" onClick={refreshStatus}>
            {copy.refresh}
          </button>
        </div>
      </div>

      {!backendAvailable ? (
        <article className="troubleshooting-panel" aria-labelledby="backend-troubleshooting">
          <div>
            <p className="card-kicker">{copy.troubleshootingKicker}</p>
            <h3 id="backend-troubleshooting">{copy.troubleshootingTitle}</h3>
            <p>{copy.troubleshootingText}</p>
          </div>
          <ul className="warning-list">
            {backendIssues.slice(0, 4).map((issue) => (
              <li key={issue}>{issue}</li>
            ))}
          </ul>
          <div className="demo-command">
            <div>
              <p className="card-kicker">{copy.demoSeedKicker}</p>
              <code>{demoSeedCommand}</code>
            </div>
            <button className="action-button secondary" type="button" onClick={copyDemoSeedCommand}>
              {copy.copyCommand}
            </button>
          </div>
          {copyStatus ? <p className="loader-status ok">{copyStatus}</p> : null}
        </article>
      ) : null}

      <div className="tabs-shell">
        <div className="tab-list" role="tablist" aria-label={copy.tabsLabel}>
          {tabOrder.map((tab) => (
            <button
              aria-controls={`panel-${tab}`}
              aria-selected={activeTab === tab}
              className={activeTab === tab ? "tab-button active" : "tab-button"}
              id={`tab-${tab}`}
              key={tab}
              role="tab"
              type="button"
              onClick={() => setActiveTab(tab)}
            >
              {copy.tabs[tab]}
            </button>
          ))}
        </div>

        {tabOrder.map((tab) => (
          <div
            aria-labelledby={`tab-${tab}`}
            className={activeTab === tab ? "tab-panel active" : "tab-panel"}
            hidden={activeTab !== tab}
            id={`panel-${tab}`}
            key={tab}
            role="tabpanel"
          >
            {panels[tab]}
          </div>
        ))}
      </div>
    </section>
  );
}
