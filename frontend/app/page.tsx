import {
  PaperExecutionRecordsPanel,
  type PaperExecutionRunRecord,
} from "./components/PaperExecutionRecordsPanel";
import { CommandCenterTabs } from "./components/CommandCenterTabs";
import type { PaperAuditEventRecord } from "./components/PaperAuditTimelinePanel";
import type { PaperOmsEventRecord } from "./components/PaperOmsTimelinePanel";
import { ResearchReviewPacketJsonLoader } from "./components/ResearchReviewPacketJsonLoader";
import type { ResearchReviewPacket } from "./components/ResearchReviewPacketPanel";
import { ReleaseBaselinePanel, type ReleaseBaseline } from "./components/ReleaseBaselinePanel";
import { dashboardCopy, resolveLanguage } from "./i18n";

export const dynamic = "force-dynamic";

type HealthResponse = {
  status: string;
  service: string;
  trading_mode: string;
  live_trading_enabled: boolean;
};

type PhaseStatus = {
  phase: number;
  name: string;
  status: string;
  safety_mode: string;
};

type ContractSpec = {
  symbol: "TX" | "MTX" | "TMF";
  point_value_twd: number;
  tx_equivalent_ratio: number;
  description: string;
};

type PaperStatus = {
  trading_mode: string;
  live_trading_enabled: boolean;
  broker_provider: string;
  max_tx_equivalent_exposure: number;
  max_daily_loss_twd: number;
  stale_quote_seconds: number;
  message: string;
};

type PaperExecutionStatus = {
  trading_mode: string;
  live_trading_enabled: boolean;
  broker_provider: string;
  workflow_statuses: string[];
  order_path: string[];
  ui_mode: string;
  broker_api_called: boolean;
  message: string;
};

type PaperExecutionPersistenceStatus = {
  enabled: boolean;
  backend: string;
  db_path: string;
  local_only: boolean;
  live_trading_enabled: boolean;
  broker_api_called: boolean;
  runs_count: number;
  oms_events_count: number;
  audit_events_count: number;
  message: string;
};

type LoadState<T> = { available: true; data: T } | { available: false; error: string; data: T };

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000";

const fallbackHealth: HealthResponse = {
  status: "offline-safe",
  service: "backend unavailable",
  trading_mode: "paper",
  live_trading_enabled: false,
};

const fallbackRoadmap: PhaseStatus[] = [
  { phase: 0, name: "Compliance Boundary", status: "planned", safety_mode: "paper" },
  { phase: 1, name: "Infrastructure Foundation", status: "planned", safety_mode: "paper" },
  { phase: 2, name: "Data Platform", status: "planned", safety_mode: "paper" },
  { phase: 3, name: "Strategy SDK and Backtest", status: "planned", safety_mode: "paper" },
  { phase: 4, name: "Risk / OMS / Broker Gateway", status: "planned", safety_mode: "paper" },
  {
    phase: 5,
    name: "Command Center and Shadow Trading",
    status: "planned",
    safety_mode: "paper/shadow",
  },
  {
    phase: 6,
    name: "Reliability and Go-Live Readiness",
    status: "planned",
    safety_mode: "readiness-only",
  },
];

const fallbackContracts: ContractSpec[] = [
  {
    symbol: "TX",
    point_value_twd: 200,
    tx_equivalent_ratio: 1,
    description: "Taiwan Index Futures",
  },
  {
    symbol: "MTX",
    point_value_twd: 50,
    tx_equivalent_ratio: 0.25,
    description: "Mini Taiwan Index Futures",
  },
  {
    symbol: "TMF",
    point_value_twd: 10,
    tx_equivalent_ratio: 0.05,
    description: "Micro Taiwan Index Futures",
  },
];

const fallbackPaperStatus: PaperStatus = {
  trading_mode: "paper",
  live_trading_enabled: false,
  broker_provider: "paper",
  max_tx_equivalent_exposure: 0.25,
  max_daily_loss_twd: 5000,
  stale_quote_seconds: 3,
  message: "Fallback paper-safe status. Backend is unavailable.",
};

const fallbackPaperExecutionStatus: PaperExecutionStatus = {
  trading_mode: "paper",
  live_trading_enabled: false,
  broker_provider: "paper",
  workflow_statuses: [
    "research_approved",
    "approved_for_paper_simulation",
    "rejected",
    "needs_data_review",
  ],
  order_path: [
    "StrategySignal",
    "Platform PaperOrderIntent",
    "Risk Engine",
    "OMS",
    "Paper Broker Gateway",
    "Audit Event",
  ],
  ui_mode: "Paper Only read-only workflow status. No live controls are exposed.",
  broker_api_called: false,
  message: "Fallback paper execution workflow status. Backend is unavailable.",
};

const fallbackPaperExecutionPersistenceStatus: PaperExecutionPersistenceStatus = {
  enabled: false,
  backend: "sqlite",
  db_path: "data/paper_execution_audit.sqlite",
  local_only: true,
  live_trading_enabled: false,
  broker_api_called: false,
  runs_count: 0,
  oms_events_count: 0,
  audit_events_count: 0,
  message: "Fallback local persistence status. Backend is unavailable.",
};

const fallbackPaperExecutionRuns: PaperExecutionRunRecord[] = [];
const fallbackPaperOmsEvents: PaperOmsEventRecord[] = [];
const fallbackPaperAuditEvents: PaperAuditEventRecord[] = [];

const fallbackReleaseBaseline: ReleaseBaseline = {
  version: "v0.1.0-paper-research-preview",
  release_level: {
    marketing_website: "external presentation candidate",
    web_command_center: "internal demo candidate",
    paper_research_preview: "internal technical preview",
    production_trading_platform: "NOT READY",
  },
  safety_defaults: {
    trading_mode: "paper",
    enable_live_trading: false,
    broker_provider: "paper",
  },
  validation: {
    release_readiness_check: "passed",
    make_check: "passed",
    github_actions_release_gate: "passed",
  },
  live_trading_enabled: false,
  known_non_production_gaps: [
    "No production trading path exists.",
    "No real broker adapter exists.",
    "No live execution path exists.",
    "Data platform is based on local fixtures, dry-run validation, and schema scaffolding.",
    "Backtest outputs are simulated research artifacts, not performance reports.",
    "Web Command Center is read-only for research review packet inspection.",
  ],
  docs: {
    release_baseline: "docs/release-baseline-v0.1.0.md",
    release_readiness_audit: "docs/release-readiness-audit.md",
    trading_safety: "docs/trading-safety.md",
    paper_shadow_live_boundary: "docs/paper-shadow-live-boundary.md",
  },
};

const fallbackResearchReviewPacket: ResearchReviewPacket = {
  packet_id: "fallback-research-review-packet",
  packet_label: "fallback-research-review-packet",
  review_queue_id: "fallback-research-review-queue",
  decision_index_id: "fallback-research-review-decision-index",
  bundle_count: 1,
  decision_count: 3,
  decision_summary: {
    rejected_count: 1,
    needs_data_review_count: 1,
    approved_for_paper_research_count: 1,
  },
  included_sections: ["review_queue", "decisions", "decision_index"],
  checksums: {
    queue_checksum: "1111111111111111111111111111111111111111111111111111111111111111",
    decision_checksums: [
      "2222222222222222222222222222222222222222222222222222222222222222",
      "3333333333333333333333333333333333333333333333333333333333333333",
      "4444444444444444444444444444444444444444444444444444444444444444",
    ],
    index_checksum: "5555555555555555555555555555555555555555555555555555555555555555",
    packet_checksum: "6666666666666666666666666666666666666666666666666666666666666666",
  },
  reproducibility_hash: "7777777777777777777777777777777777777777777777777777777777777777",
  warnings: [
    "Fallback packet is read-only UI metadata. It does not approve paper execution or live trading, rank strategies, call brokers, or claim performance.",
  ],
  research_only: true,
  execution_eligible: false,
  order_created: false,
  broker_api_called: false,
  risk_engine_called: false,
  oms_called: false,
  performance_claim: false,
  simulated_metrics_only: true,
  external_data_downloaded: false,
  ranking_generated: false,
  best_strategy_selected: false,
  approval_for_live: false,
  approval_for_paper_execution: false,
  persisted: false,
};

async function fetchJson<T>(path: string, fallback: T): Promise<LoadState<T>> {
  try {
    const response = await fetch(`${backendUrl}${path}`, {
      cache: "no-store",
      signal: AbortSignal.timeout(2000),
    });
    if (!response.ok) {
      return { available: false, error: `Backend returned HTTP ${response.status}`, data: fallback };
    }
    return { available: true, data: (await response.json()) as T };
  } catch (error) {
    return {
      available: false,
      error: error instanceof Error ? error.message : "Backend is unavailable",
      data: fallback,
    };
  }
}

type HomeProps = {
  searchParams?: Promise<{
    lang?: string | string[];
  }>;
};

export default async function Home({ searchParams }: HomeProps) {
  const params = searchParams ? await searchParams : {};
  const language = resolveLanguage(params.lang);
  const copy = dashboardCopy[language];

  const [
    health,
    roadmap,
    contractsResponse,
    paperStatus,
    paperExecutionStatus,
    paperExecutionPersistence,
    paperExecutionRuns,
    releaseBaseline,
    reviewPacket,
  ] =
    await Promise.all([
      fetchJson<HealthResponse>("/health", fallbackHealth),
      fetchJson<PhaseStatus[]>("/api/roadmap", fallbackRoadmap),
      fetchJson<{ contracts: ContractSpec[] }>("/api/contracts", { contracts: fallbackContracts }),
      fetchJson<PaperStatus>("/api/risk/paper-status", fallbackPaperStatus),
      fetchJson<PaperExecutionStatus>(
        "/api/paper-execution/status",
        fallbackPaperExecutionStatus,
      ),
      fetchJson<PaperExecutionPersistenceStatus>(
        "/api/paper-execution/persistence/status",
        fallbackPaperExecutionPersistenceStatus,
      ),
      fetchJson<PaperExecutionRunRecord[]>(
        "/api/paper-execution/runs?limit=5",
        fallbackPaperExecutionRuns,
      ),
      fetchJson<ReleaseBaseline>("/api/release/baseline", fallbackReleaseBaseline),
      fetchJson<ResearchReviewPacket>(
        "/api/strategy/research-review/packet/sample",
        fallbackResearchReviewPacket,
      ),
    ]);

  const contracts = contractsResponse.data.contracts;
  const selectedPaperRunId = paperExecutionRuns.data[0]?.workflow_run_id;
  const [paperOmsEvents, paperAuditEvents] = selectedPaperRunId
    ? await Promise.all([
        fetchJson<PaperOmsEventRecord[]>(
          `/api/paper-execution/runs/${selectedPaperRunId}/oms-events`,
          fallbackPaperOmsEvents,
        ),
        fetchJson<PaperAuditEventRecord[]>(
          `/api/paper-execution/runs/${selectedPaperRunId}/audit-events`,
          fallbackPaperAuditEvents,
        ),
      ])
    : [
        { available: true as const, data: fallbackPaperOmsEvents },
        { available: true as const, data: fallbackPaperAuditEvents },
      ];
  const paperRecordsAvailable =
    paperExecutionRuns.available && paperOmsEvents.available && paperAuditEvents.available;
  const paperRecordsError = [
    paperExecutionRuns.available ? undefined : paperExecutionRuns.error,
    paperOmsEvents.available ? undefined : paperOmsEvents.error,
    paperAuditEvents.available ? undefined : paperAuditEvents.error,
  ]
    .filter(Boolean)
    .join("; ");
  const backendIssues = [
    health.available ? undefined : `health: ${health.error}`,
    roadmap.available ? undefined : `roadmap: ${roadmap.error}`,
    contractsResponse.available ? undefined : `contracts: ${contractsResponse.error}`,
    paperStatus.available ? undefined : `paper status: ${paperStatus.error}`,
    paperExecutionStatus.available
      ? undefined
      : `paper execution: ${paperExecutionStatus.error}`,
    paperExecutionPersistence.available
      ? undefined
      : `paper persistence: ${paperExecutionPersistence.error}`,
    paperExecutionRuns.available ? undefined : `paper records: ${paperExecutionRuns.error}`,
    releaseBaseline.available ? undefined : `release baseline: ${releaseBaseline.error}`,
    reviewPacket.available ? undefined : `research packet: ${reviewPacket.error}`,
  ].filter((issue): issue is string => Boolean(issue));
  const backendAvailable = backendIssues.length === 0;

  return (
    <main className="shell" lang={copy.htmlLang}>
      <section className="hero" aria-labelledby="page-title">
        <div>
          <div className="hero-meta">
            <p className="eyebrow">{copy.hero.eyebrow}</p>
            <nav className="language-toggle" aria-label={copy.languageToggleLabel}>
              <a className={language === "en" ? "active" : undefined} href="/?lang=en">
                {copy.languageOptions.en}
              </a>
              <a className={language === "zh" ? "active" : undefined} href="/?lang=zh">
                {copy.languageOptions.zh}
              </a>
            </nav>
          </div>
          <h1 id="page-title">{copy.hero.title}</h1>
          <p className="lead">{copy.hero.lead}</p>
        </div>
        <div className="status-strip" aria-label={copy.hero.safetyAria}>
          <span className="status-pill safe">
            {copy.hero.tradingModePrefix}={paperStatus.data.trading_mode}
          </span>
          <span className="status-pill">{copy.hero.liveDisabled}</span>
          <span className="status-pill">
            {copy.hero.brokerPrefix}: {paperStatus.data.broker_provider}
          </span>
        </div>
      </section>

      <section className="summary-grid" aria-label={copy.summary.ariaLabel}>
        <article className="card">
          <p className="card-kicker">{copy.summary.backendHealth.kicker}</p>
          <h2>
            {health.available
              ? copy.summary.backendHealth.connected
              : copy.summary.backendHealth.fallback}
          </h2>
          <p>{health.available ? health.data.service : health.error}</p>
          <span className={health.available ? "metric ok" : "metric warn"}>{health.data.status}</span>
        </article>

        <article className="card">
          <p className="card-kicker">{copy.summary.safetyMode.kicker}</p>
          <h2>
            {paperStatus.data.live_trading_enabled
              ? copy.summary.safetyMode.reviewRequired
              : copy.summary.safetyMode.paperOnly}
          </h2>
          <p>{paperStatus.data.message}</p>
          <span className={paperStatus.data.live_trading_enabled ? "metric danger" : "metric ok"}>
            ENABLE_LIVE_TRADING={String(paperStatus.data.live_trading_enabled)}
          </span>
        </article>

        <article className="card">
          <p className="card-kicker">{copy.summary.riskDefaults.kicker}</p>
          <h2>{copy.summary.riskDefaults.title}</h2>
          <p>{copy.summary.riskDefaults.text}</p>
          <span className="metric ok">
            MAX_TX_EQUIVALENT_EXPOSURE={paperStatus.data.max_tx_equivalent_exposure}
          </span>
        </article>
      </section>

      <CommandCenterTabs
        backendAvailable={backendAvailable}
        backendIssues={backendIssues}
        copy={copy.interactions}
        release={
          <ReleaseBaselinePanel
            available={releaseBaseline.available}
            baseline={releaseBaseline.data}
            copy={copy.release}
            error={releaseBaseline.available ? undefined : releaseBaseline.error}
          />
        }
        paper={
          <>
            <section className="paper-workflow" aria-labelledby="paper-workflow-title">
              <div className="section-heading">
                <p className="eyebrow">{copy.paperExecution.eyebrow}</p>
                <h2 id="paper-workflow-title">{copy.paperExecution.title}</h2>
                <p>{copy.paperExecution.description}</p>
                {!paperExecutionStatus.available ? (
                  <p className="notice">
                    {copy.paperExecution.fallbackPrefix} {paperExecutionStatus.error}
                  </p>
                ) : null}
              </div>
              <div className="paper-workflow-grid">
                <article className="paper-workflow-card">
                  <p className="card-kicker">{copy.paperExecution.approvalKicker}</p>
                  <h3>{copy.paperExecution.approvalTitle}</h3>
                  <ul className="workflow-list">
                    {paperExecutionStatus.data.workflow_statuses.map((status) => (
                      <li key={status}>
                        {copy.paperExecution.statusLabels[
                          status as keyof typeof copy.paperExecution.statusLabels
                        ] ?? status}
                      </li>
                    ))}
                  </ul>
                </article>

                <article className="paper-workflow-card">
                  <p className="card-kicker">{copy.paperExecution.pathKicker}</p>
                  <h3>{copy.paperExecution.pathTitle}</h3>
                  <ol className="workflow-list ordered">
                    {paperExecutionStatus.data.order_path.map((step) => (
                      <li key={step}>
                        {copy.paperExecution.pathLabels[
                          step as keyof typeof copy.paperExecution.pathLabels
                        ] ?? step}
                      </li>
                    ))}
                  </ol>
                </article>

                <article className="paper-workflow-card safety">
                  <p className="card-kicker">{copy.paperExecution.safetyKicker}</p>
                  <h3>{copy.paperExecution.safetyTitle}</h3>
                  <p>{copy.paperExecution.safetyText}</p>
                  <div className="workflow-metrics">
                    <span className="metric ok">
                      TRADING_MODE={paperExecutionStatus.data.trading_mode}
                    </span>
                    <span className="metric ok">
                      ENABLE_LIVE_TRADING=
                      {String(paperExecutionStatus.data.live_trading_enabled)}
                    </span>
                    <span className="metric ok">
                      BROKER_PROVIDER={paperExecutionStatus.data.broker_provider}
                    </span>
                    <span className="metric ok">
                      {copy.paperExecution.brokerApiCalled}=
                      {String(paperExecutionStatus.data.broker_api_called)}
                    </span>
                    <span
                      className={paperExecutionPersistence.data.enabled ? "metric ok" : "metric warn"}
                    >
                      {copy.paperExecution.persistenceBackend}:{" "}
                      {paperExecutionPersistence.data.backend}
                    </span>
                    <span className="metric ok">
                      {copy.paperExecution.localOnly}=
                      {String(paperExecutionPersistence.data.local_only)}
                    </span>
                  </div>
                </article>
              </div>
              <div className="persistence-strip" aria-label={copy.paperExecution.persistenceAria}>
                <span>
                  {copy.paperExecution.runs}: {paperExecutionPersistence.data.runs_count}
                </span>
                <span>
                  {copy.paperExecution.omsEvents}:{" "}
                  {paperExecutionPersistence.data.oms_events_count}
                </span>
                <span>
                  {copy.paperExecution.auditEvents}:{" "}
                  {paperExecutionPersistence.data.audit_events_count}
                </span>
                <span>
                  {copy.paperExecution.dbPath}: {paperExecutionPersistence.data.db_path}
                </span>
              </div>
            </section>

            <PaperExecutionRecordsPanel
              available={paperRecordsAvailable}
              copy={copy}
              error={paperRecordsError || undefined}
              auditEvents={paperAuditEvents.data}
              omsEvents={paperOmsEvents.data}
              runs={paperExecutionRuns.data}
            />
          </>
        }
        packet={
          <ResearchReviewPacketJsonLoader
            copy={copy}
            key={language}
            initialAvailable={reviewPacket.available}
            initialError={reviewPacket.available ? undefined : reviewPacket.error}
            initialPacket={reviewPacket.data}
            safeSamplePacket={fallbackResearchReviewPacket}
          />
        }
        contracts={
          <>
            <section className="module-section" aria-labelledby="roadmap-title">
              <div className="section-heading">
                <p className="eyebrow">{copy.roadmap.eyebrow}</p>
                <h2 id="roadmap-title">{copy.roadmap.title}</h2>
              </div>
              <div className="phase-grid">
                {roadmap.data.map((phase) => (
                  <article className="module-card" key={phase.phase}>
                    <span className="phase-number">
                      {copy.roadmap.phasePrefix} {phase.phase}
                    </span>
                    <h3>
                      {copy.roadmap.names[
                        phase.phase as keyof typeof copy.roadmap.names
                      ] ?? phase.name}
                    </h3>
                    <p>
                      {copy.roadmap.statusPrefix}:{" "}
                      {copy.roadmap.statuses[
                        phase.status as keyof typeof copy.roadmap.statuses
                      ] ?? phase.status}
                    </p>
                    <span className="metric ok">{phase.safety_mode}</span>
                  </article>
                ))}
              </div>
            </section>

            <section className="dashboard-grid" aria-label={copy.contracts.ariaLabel}>
              <article className="panel">
                <div className="section-heading compact">
                  <p className="eyebrow">{copy.contracts.eyebrow}</p>
                  <h2>{copy.contracts.title}</h2>
                </div>
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>{copy.contracts.headers.symbol}</th>
                        <th>{copy.contracts.headers.pointValue}</th>
                        <th>{copy.contracts.headers.txEquivalent}</th>
                        <th>{copy.contracts.headers.description}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {contracts.map((contract) => (
                        <tr key={contract.symbol}>
                          <td>{contract.symbol}</td>
                          <td>{contract.point_value_twd} TWD</td>
                          <td>{contract.tx_equivalent_ratio}</td>
                          <td>
                            {copy.contracts.descriptions[contract.symbol] ??
                              contract.description}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </article>

              <article className="panel paper-panel">
                <div className="section-heading compact">
                  <p className="eyebrow">{copy.paperPanel.eyebrow}</p>
                  <h2>{copy.paperPanel.title}</h2>
                </div>
                <p>{copy.paperPanel.text}</p>
                <pre>{`POST /api/paper/orders
{
  "symbol": "TMF",
  "side": "BUY",
  "quantity": 1,
  "tx_equivalent_exposure": 0.05,
  "paper_only": true
}`}</pre>
              </article>
            </section>

            <section className="module-section" aria-labelledby="module-roadmap">
              <div className="section-heading">
                <p className="eyebrow">{copy.modules.eyebrow}</p>
                <h2 id="module-roadmap">{copy.modules.title}</h2>
              </div>
              <div className="module-grid">
                {copy.modules.cards.map(([title, text]) => (
                  <article className="module-card" key={title}>
                    <h3>{title}</h3>
                    <p>{text}</p>
                  </article>
                ))}
              </div>
            </section>
          </>
        }
      />
    </main>
  );
}
