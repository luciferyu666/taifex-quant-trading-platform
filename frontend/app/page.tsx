import { ResearchReviewPacketJsonLoader } from "./components/ResearchReviewPacketJsonLoader";
import type { ResearchReviewPacket } from "./components/ResearchReviewPacketPanel";

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
  { phase: 5, name: "Command Center and Shadow Trading", status: "planned", safety_mode: "paper/shadow" },
  { phase: 6, name: "Reliability and Go-Live Readiness", status: "planned", safety_mode: "readiness-only" },
];

const fallbackContracts: ContractSpec[] = [
  { symbol: "TX", point_value_twd: 200, tx_equivalent_ratio: 1, description: "Taiwan Index Futures" },
  { symbol: "MTX", point_value_twd: 50, tx_equivalent_ratio: 0.25, description: "Mini Taiwan Index Futures" },
  { symbol: "TMF", point_value_twd: 10, tx_equivalent_ratio: 0.05, description: "Micro Taiwan Index Futures" },
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
    "Fallback packet is read-only UI metadata. It does not approve paper execution, approve live trading, rank strategies, call brokers, or claim performance.",
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

const architectureModules = [
  ["Data Platform", "Bronze/Silver/Gold layers, contract master, market bars, rollover events."],
  ["Strategy SDK", "Signal-only strategy interface. No broker SDK access and no order submission."],
  ["Risk Engine", "Paper risk checks for live-disabled state and TX-equivalent exposure limits."],
  ["OMS", "Event-style order state machine that owns lifecycle transitions."],
  ["Broker Gateway", "Paper broker acknowledgement boundary. No real orders are placed."],
  ["Web Command Center", "Operator view for roadmap, safety mode, contracts, and paper-only status."],
] as const;

async function fetchJson<T>(path: string, fallback: T): Promise<LoadState<T>> {
  try {
    const response = await fetch(`${backendUrl}${path}`, { cache: "no-store" });
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

export default async function Home() {
  const [health, roadmap, contractsResponse, paperStatus, reviewPacket] = await Promise.all([
    fetchJson<HealthResponse>("/health", fallbackHealth),
    fetchJson<PhaseStatus[]>("/api/roadmap", fallbackRoadmap),
    fetchJson<{ contracts: ContractSpec[] }>("/api/contracts", { contracts: fallbackContracts }),
    fetchJson<PaperStatus>("/api/risk/paper-status", fallbackPaperStatus),
    fetchJson<ResearchReviewPacket>(
      "/api/strategy/research-review/packet/sample",
      fallbackResearchReviewPacket,
    ),
  ]);

  const contracts = contractsResponse.data.contracts;

  return (
    <main className="shell">
      <section className="hero" aria-labelledby="page-title">
        <div>
          <p className="eyebrow">Web Command Center</p>
          <h1 id="page-title">Taifex Quant Trading Platform</h1>
          <p className="lead">
            Paper-first control surface for the Phase 0-6 cloud-native roadmap. Strategy signals,
            risk checks, OMS state, and broker gateway boundaries stay decoupled.
          </p>
        </div>
        <div className="status-strip" aria-label="Runtime safety status">
          <span className="status-pill safe">TRADING_MODE={paperStatus.data.trading_mode}</span>
          <span className="status-pill">Live disabled</span>
          <span className="status-pill">Broker: {paperStatus.data.broker_provider}</span>
        </div>
      </section>

      <section className="summary-grid" aria-label="System summary">
        <article className="card">
          <p className="card-kicker">Backend Health</p>
          <h2>{health.available ? "Connected" : "Fallback Mode"}</h2>
          <p>{health.available ? health.data.service : health.error}</p>
          <span className={health.available ? "metric ok" : "metric warn"}>{health.data.status}</span>
        </article>

        <article className="card">
          <p className="card-kicker">Safety Mode</p>
          <h2>{paperStatus.data.live_trading_enabled ? "Review Required" : "Paper Only"}</h2>
          <p>{paperStatus.data.message}</p>
          <span className={paperStatus.data.live_trading_enabled ? "metric danger" : "metric ok"}>
            ENABLE_LIVE_TRADING={String(paperStatus.data.live_trading_enabled)}
          </span>
        </article>

        <article className="card">
          <p className="card-kicker">Risk Defaults</p>
          <h2>TX-equivalent limit</h2>
          <p>Max daily loss and stale quote limits are visible before any future OMS workflow.</p>
          <span className="metric ok">MAX_TX_EQUIVALENT_EXPOSURE={paperStatus.data.max_tx_equivalent_exposure}</span>
        </article>
      </section>

      <ResearchReviewPacketJsonLoader
        initialAvailable={reviewPacket.available}
        initialError={reviewPacket.available ? undefined : reviewPacket.error}
        initialPacket={reviewPacket.data}
      />

      <section className="module-section" aria-labelledby="roadmap-title">
        <div className="section-heading">
          <p className="eyebrow">Phase Roadmap</p>
          <h2 id="roadmap-title">Phase 0-6 implementation status</h2>
        </div>
        <div className="phase-grid">
          {roadmap.data.map((phase) => (
            <article className="module-card" key={phase.phase}>
              <span className="phase-number">Phase {phase.phase}</span>
              <h3>{phase.name}</h3>
              <p>Status: {phase.status}</p>
              <span className="metric ok">{phase.safety_mode}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="dashboard-grid" aria-label="Contracts and paper simulation">
        <article className="panel">
          <div className="section-heading compact">
            <p className="eyebrow">Contracts</p>
            <h2>TX / MTX / TMF point values</h2>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Symbol</th>
                  <th>Point Value</th>
                  <th>TX Equivalent</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {contracts.map((contract) => (
                  <tr key={contract.symbol}>
                    <td>{contract.symbol}</td>
                    <td>{contract.point_value_twd} TWD</td>
                    <td>{contract.tx_equivalent_ratio}</td>
                    <td>{contract.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="panel paper-panel">
          <div className="section-heading compact">
            <p className="eyebrow">Paper Only</p>
            <h2>Order simulation placeholder</h2>
          </div>
          <p>
            Paper order APIs route through Risk Engine, OMS, and Paper Broker Gateway. This UI does
            not place orders or expose live trading controls.
          </p>
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
          <p className="eyebrow">Architecture Modules</p>
          <h2 id="module-roadmap">Signal-to-execution boundaries</h2>
        </div>
        <div className="module-grid">
          {architectureModules.map(([title, text]) => (
            <article className="module-card" key={title}>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
