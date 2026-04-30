import type { DashboardCopy } from "../i18n";

export type PaperRiskPolicy = {
  trading_mode: string;
  live_trading_enabled: boolean;
  broker_provider: string;
  max_tx_equivalent_exposure: number;
  max_daily_loss_twd: number;
  stale_quote_seconds: number;
  price_reasonability_band_pct: number;
  max_order_size_by_contract: Record<string, number>;
  margin_proxy_per_tx_equivalent_twd: number;
  max_margin_proxy_twd: number;
  max_position_tx_equivalent: number;
  kill_switch_active: boolean;
  broker_heartbeat_healthy: boolean;
};

export type PaperRiskState = {
  seen_idempotency_keys: string[];
  daily_realized_loss_twd: number;
  current_position_tx_equivalent: number;
  kill_switch_active: boolean;
  broker_heartbeat_healthy: boolean;
  paper_only: boolean;
  live_trading_enabled: boolean;
  broker_api_called: boolean;
  updated_at: string;
};

export type PaperRiskStatus = {
  trading_mode: string;
  live_trading_enabled: boolean;
  broker_provider: string;
  paper_only: boolean;
  broker_api_called: boolean;
  state: PaperRiskState;
  policy: PaperRiskPolicy;
  supported_checks: string[];
  message: string;
};

export function PaperRiskGuardrailsPanel({
  available,
  copy,
  error,
  status,
}: {
  available: boolean;
  copy: DashboardCopy;
  error?: string;
  status: PaperRiskStatus;
}) {
  const labels = copy.paperRisk;
  const policy = status.policy;
  const state = status.state;
  const contractLimits = Object.entries(policy.max_order_size_by_contract);

  return (
    <section className="paper-record-panel" aria-labelledby="paper-risk-title">
      <div className="section-heading">
        <p className="eyebrow">{labels.eyebrow}</p>
        <h2 id="paper-risk-title">{labels.title}</h2>
        <p>{labels.description}</p>
        {!available && error ? (
          <p className="notice">
            {labels.fallbackPrefix} {error}
          </p>
        ) : null}
      </div>

      <div className="flag-grid">
        <span className="metric ok">TRADING_MODE={status.trading_mode}</span>
        <span className="metric ok">
          ENABLE_LIVE_TRADING={String(status.live_trading_enabled)}
        </span>
        <span className="metric ok">BROKER_PROVIDER={status.broker_provider}</span>
        <span className="metric ok">PAPER_ONLY={String(status.paper_only)}</span>
        <span className="metric ok">
          BROKER_API_CALLED={String(status.broker_api_called)}
        </span>
        <span className={policy.kill_switch_active ? "metric danger" : "metric ok"}>
          KILL_SWITCH={String(policy.kill_switch_active || state.kill_switch_active)}
        </span>
        <span className={state.broker_heartbeat_healthy ? "metric ok" : "metric danger"}>
          BROKER_HEARTBEAT={String(state.broker_heartbeat_healthy)}
        </span>
      </div>

      <div className="paper-reliability-grid">
        <article className="paper-evidence-section">
          <p className="card-kicker">{labels.guardrailKicker}</p>
          <h3>{labels.guardrailTitle}</h3>
          <ul className="detail-list">
            {labels.guardrails.map((guardrail) => (
              <li key={guardrail}>{guardrail}</li>
            ))}
          </ul>
        </article>

        <article className="paper-evidence-section">
          <p className="card-kicker">{labels.policyKicker}</p>
          <h3>{labels.policyTitle}</h3>
          <dl className="detail-list">
            <div>
              <dt>{labels.fields.maxExposure}</dt>
              <dd>{policy.max_tx_equivalent_exposure}</dd>
            </div>
            <div>
              <dt>{labels.fields.staleQuoteSeconds}</dt>
              <dd>{policy.stale_quote_seconds}</dd>
            </div>
            <div>
              <dt>{labels.fields.priceBand}</dt>
              <dd>{(policy.price_reasonability_band_pct * 100).toFixed(2)}%</dd>
            </div>
            <div>
              <dt>{labels.fields.marginProxy}</dt>
              <dd>{policy.max_margin_proxy_twd} TWD</dd>
            </div>
            <div>
              <dt>{labels.fields.positionLimit}</dt>
              <dd>{policy.max_position_tx_equivalent}</dd>
            </div>
            <div>
              <dt>{labels.fields.dailyLoss}</dt>
              <dd>{policy.max_daily_loss_twd} TWD</dd>
            </div>
          </dl>
        </article>

        <article className="paper-evidence-section">
          <p className="card-kicker">{labels.stateKicker}</p>
          <h3>{labels.stateTitle}</h3>
          <dl className="detail-list">
            <div>
              <dt>{labels.fields.dailyLossState}</dt>
              <dd>{state.daily_realized_loss_twd} TWD</dd>
            </div>
            <div>
              <dt>{labels.fields.positionState}</dt>
              <dd>{state.current_position_tx_equivalent}</dd>
            </div>
            <div>
              <dt>{labels.fields.seenIdempotencyKeys}</dt>
              <dd>{state.seen_idempotency_keys.length}</dd>
            </div>
            <div>
              <dt>{labels.fields.updatedAt}</dt>
              <dd>{state.updated_at}</dd>
            </div>
          </dl>
        </article>

        <article className="paper-evidence-section">
          <p className="card-kicker">{labels.contractKicker}</p>
          <h3>{labels.contractTitle}</h3>
          <dl className="detail-list">
            {contractLimits.map(([contract, limit]) => (
              <div key={contract}>
                <dt>{contract}</dt>
                <dd>{limit}</dd>
              </div>
            ))}
          </dl>
        </article>
      </div>

      <article className="paper-evidence-section">
        <p className="card-kicker">{labels.checksKicker}</p>
        <h3>{labels.checksTitle}</h3>
        <div className="tag-cloud">
          {status.supported_checks.map((check) => (
            <span className="metric ok" key={check}>
              {check}
            </span>
          ))}
        </div>
      </article>

      <p className="read-only-note">{labels.readOnlyNote}</p>
    </section>
  );
}
