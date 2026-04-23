export const dynamic = "force-dynamic";

type HealthResponse = {
  status: string;
  service: string;
  trading_mode: string;
  live_trading_enabled: boolean;
};

type HealthState =
  | { available: true; data: HealthResponse }
  | { available: false; error: string };

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000";

async function getBackendHealth(): Promise<HealthState> {
  try {
    const response = await fetch(`${backendUrl}/health`, {
      cache: "no-store",
    });

    if (!response.ok) {
      return {
        available: false,
        error: `Backend returned HTTP ${response.status}`,
      };
    }

    return {
      available: true,
      data: (await response.json()) as HealthResponse,
    };
  } catch (error) {
    return {
      available: false,
      error: error instanceof Error ? error.message : "Backend is unavailable",
    };
  }
}

const modules = [
  {
    title: "Data Pipeline",
    text: "Market data ingestion, quality gates, session alignment, and future Timescale/ClickHouse flows.",
  },
  {
    title: "Strategy Engine",
    text: "Signal-only strategy runtime. Strategies emit target exposure and never call broker SDKs.",
  },
  {
    title: "Risk Engine",
    text: "Pre-trade and in-trade checks for stale quotes, exposure limits, daily loss, and kill switch rules.",
  },
  {
    title: "OMS",
    text: "Order state machine, idempotency, lifecycle tracking, and reconciliation boundaries.",
  },
  {
    title: "Broker Gateway",
    text: "Paper-first broker adapter boundary for future Shioaji or other provider integrations.",
  },
  {
    title: "AI Module",
    text: "Future analytics, diagnostics, and strategy research assistance outside the execution path.",
  },
];

export default async function Home() {
  const health = await getBackendHealth();
  const tradingMode = health.available ? health.data.trading_mode : "paper";
  const liveTradingEnabled = health.available ? health.data.live_trading_enabled : false;

  return (
    <main className="shell">
      <section className="hero" aria-labelledby="page-title">
        <div>
          <p className="eyebrow">Taiwan Futures Quant Infrastructure</p>
          <h1 id="page-title">Taifex Quant Trading Platform</h1>
          <p className="lead">
            A paper-first local development surface for TX, MTX, and TMF automation. Strategy
            signals stay decoupled from risk checks, OMS state, and broker access.
          </p>
        </div>
        <div className="status-strip" aria-label="Runtime safety status">
          <span className="status-pill safe">Paper default</span>
          <span className="status-pill">Live disabled</span>
          <span className="status-pill">Broker provider: paper</span>
        </div>
      </section>

      <section className="summary-grid" aria-label="System summary">
        <article className="card">
          <p className="card-kicker">Backend Health</p>
          <h2>{health.available ? "Connected" : "Unavailable"}</h2>
          <p>{health.available ? health.data.service : health.error}</p>
          <span className={health.available ? "metric ok" : "metric warn"}>
            {health.available ? health.data.status : "offline-safe"}
          </span>
        </article>

        <article className="card">
          <p className="card-kicker">Trading Mode</p>
          <h2>{tradingMode}</h2>
          <p>Runtime defaults are intentionally conservative for local development.</p>
          <span className="metric ok">MAX_TX_EQUIVALENT_EXPOSURE=0.25</span>
        </article>

        <article className="card">
          <p className="card-kicker">Safety Defaults</p>
          <h2>{liveTradingEnabled ? "Review required" : "Live disabled"}</h2>
          <p>Orders are not implemented. Future orders must pass Risk Engine and OMS.</p>
          <span className={liveTradingEnabled ? "metric danger" : "metric ok"}>
            ENABLE_LIVE_TRADING={String(liveTradingEnabled)}
          </span>
        </article>
      </section>

      <section className="module-section" aria-labelledby="module-roadmap">
        <div className="section-heading">
          <p className="eyebrow">Module Roadmap</p>
          <h2 id="module-roadmap">Signal-to-execution boundaries</h2>
        </div>
        <div className="module-grid">
          {modules.map((module) => (
            <article className="module-card" key={module.title}>
              <h3>{module.title}</h3>
              <p>{module.text}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
