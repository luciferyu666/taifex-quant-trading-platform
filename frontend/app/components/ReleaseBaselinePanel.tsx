import type { DashboardCopy } from "../i18n";

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
  copy: DashboardCopy["release"];
  error?: string;
};

export function ReleaseBaselinePanel({
  baseline,
  available,
  copy,
  error,
}: ReleaseBaselinePanelProps) {
  return (
    <section className="release-section" aria-labelledby="release-baseline-title">
      <div className="section-heading">
        <p className="eyebrow">{copy.eyebrow}</p>
        <h2 id="release-baseline-title">{copy.title}</h2>
      </div>
      {!available ? (
        <p className="notice warn">
          {copy.fallbackPrefix} {error}
        </p>
      ) : null}

      <div className="release-hero panel">
        <div>
          <p className="card-kicker">{copy.currentTag}</p>
          <h3>{baseline.version}</h3>
          <p>{copy.description}</p>
        </div>
        <span className={baseline.live_trading_enabled ? "metric danger" : "metric ok"}>
          live_trading_enabled={String(baseline.live_trading_enabled)}
        </span>
      </div>

      <div className="release-grid">
        <article className="release-card">
          <p className="card-kicker">{copy.releaseLevel}</p>
          <dl className="detail-list">
            {Object.entries(copy.levelLabels).map(([key, label]) => {
              const typedKey = key as keyof ReleaseBaseline["release_level"];
              const status = baseline.release_level[typedKey];
              return (
                <div key={key}>
                  <dt>{label}</dt>
                  <dd className={status === "NOT READY" ? "text-danger" : undefined}>
                    {copy.statusLabels[status as keyof typeof copy.statusLabels] ?? status}
                  </dd>
                </div>
              );
            })}
          </dl>
        </article>

        <article className="release-card">
          <p className="card-kicker">{copy.safetyDefaults}</p>
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
          <p className="card-kicker">{copy.validation}</p>
          <div className="validation-list">
            {Object.entries(copy.validationLabels).map(([key, label]) => {
              const typedKey = key as keyof ReleaseBaseline["validation"];
              const status = baseline.validation[typedKey];
              return (
                <span className="validation-row" key={key}>
                  <span>{label}</span>
                  <strong>
                    {copy.validationStatusLabels[
                      status as keyof typeof copy.validationStatusLabels
                    ] ?? status}
                  </strong>
                </span>
              );
            })}
          </div>
        </article>
      </div>

      <article className="release-card release-gaps">
        <p className="card-kicker">{copy.knownGaps}</p>
        <ul className="warning-list">
          {baseline.known_non_production_gaps.map((gap) => (
            <li key={gap}>{copy.gapLabels[gap as keyof typeof copy.gapLabels] ?? gap}</li>
          ))}
        </ul>
      </article>
    </section>
  );
}
