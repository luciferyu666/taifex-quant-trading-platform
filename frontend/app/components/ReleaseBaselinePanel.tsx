export type ReleaseBaseline = {
  version: string;
  release_level: {
    marketing_website: string;
    web_command_center: string;
    paper_research_preview: string;
    production_trading_platform: string;
  };
  safety_defaults: {
    trading_mode: string;
    enable_live_trading: boolean;
    broker_provider: string;
  };
  validation: {
    release_readiness_check: string;
    make_check: string;
    github_actions_release_gate: string;
  };
  live_trading_enabled: boolean;
  known_non_production_gaps: string[];
  docs: Record<string, string>;
};

type ReleaseBaselinePanelProps = {
  baseline: ReleaseBaseline;
  available: boolean;
  error?: string;
};

const releaseLevelLabels: Record<keyof ReleaseBaseline["release_level"], string> = {
  marketing_website: "Marketing Website",
  web_command_center: "Web Command Center",
  paper_research_preview: "Paper Research Preview",
  production_trading_platform: "Production Trading Platform",
};

const validationLabels: Record<keyof ReleaseBaseline["validation"], string> = {
  release_readiness_check: "release-readiness-check",
  make_check: "make check",
  github_actions_release_gate: "GitHub Actions release gate",
};

export function ReleaseBaselinePanel({
  baseline,
  available,
  error,
}: ReleaseBaselinePanelProps) {
  return (
    <section className="release-section" aria-labelledby="release-baseline-title">
      <div className="section-heading">
        <p className="eyebrow">Release Baseline</p>
        <h2 id="release-baseline-title">v0.1.0 paper research preview</h2>
      </div>
      {!available ? (
        <p className="notice warn">
          Backend release baseline unavailable. Rendering checked-in safe fallback: {error}
        </p>
      ) : null}

      <div className="release-hero panel">
        <div>
          <p className="card-kicker">Current tag</p>
          <h3>{baseline.version}</h3>
          <p>
            This baseline is an external presentation, internal demo, and paper research
            preview. It is not a production trading release.
          </p>
        </div>
        <span className={baseline.live_trading_enabled ? "metric danger" : "metric ok"}>
          live_trading_enabled={String(baseline.live_trading_enabled)}
        </span>
      </div>

      <div className="release-grid">
        <article className="release-card">
          <p className="card-kicker">Release Level</p>
          <dl className="detail-list">
            {Object.entries(releaseLevelLabels).map(([key, label]) => {
              const typedKey = key as keyof ReleaseBaseline["release_level"];
              const status = baseline.release_level[typedKey];
              return (
                <div key={key}>
                  <dt>{label}</dt>
                  <dd className={status === "NOT READY" ? "text-danger" : undefined}>
                    {status}
                  </dd>
                </div>
              );
            })}
          </dl>
        </article>

        <article className="release-card">
          <p className="card-kicker">Safety Defaults</p>
          <div className="flag-grid">
            <span className="flag ok">
              <span>TRADING_MODE</span>
              <strong>{baseline.safety_defaults.trading_mode}</strong>
            </span>
            <span
              className={
                baseline.safety_defaults.enable_live_trading ? "flag danger" : "flag ok"
              }
            >
              <span>ENABLE_LIVE_TRADING</span>
              <strong>{String(baseline.safety_defaults.enable_live_trading)}</strong>
            </span>
            <span className="flag ok">
              <span>BROKER_PROVIDER</span>
              <strong>{baseline.safety_defaults.broker_provider}</strong>
            </span>
          </div>
        </article>

        <article className="release-card">
          <p className="card-kicker">Validation</p>
          <div className="validation-list">
            {Object.entries(validationLabels).map(([key, label]) => {
              const typedKey = key as keyof ReleaseBaseline["validation"];
              return (
                <span className="validation-row" key={key}>
                  <span>{label}</span>
                  <strong>{baseline.validation[typedKey]}</strong>
                </span>
              );
            })}
          </div>
        </article>
      </div>

      <article className="release-card release-gaps">
        <p className="card-kicker">Known Non-Production Gaps</p>
        <ul className="warning-list">
          {baseline.known_non_production_gaps.map((gap) => (
            <li key={gap}>{gap}</li>
          ))}
        </ul>
      </article>
    </section>
  );
}
