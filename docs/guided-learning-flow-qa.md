# Guided Learning Flow QA

This QA gate verifies that the production Web Command Center still presents a
complete guided learning path for the browser-only Interactive Demo.

## Purpose

The Web App now combines product value copy, browser-only mock runtime controls,
and the Workflow Standardization learning panel. This check makes sure a
customer can still understand and follow the expected path:

```text
Data -> StrategySignal -> PaperOrderIntent -> Risk Engine -> OMS -> Evidence
```

The gate is intentionally HTML-level and dependency-light. It checks production
copy and safety boundaries without launching a browser automation framework.

## Command

```bash
make guided-learning-flow-check
```

The command runs:

```bash
node frontend/scripts/check-guided-learning-flow.mjs
```

It defaults to:

```text
https://taifex-quant-trading-platform-front.vercel.app
```

Override the production URL for staging-like checks:

```bash
FRONTEND_PRODUCTION_URL=https://example.vercel.app make guided-learning-flow-check
```

## Checked Content

The script verifies that the root, Traditional Chinese page, and English page
return HTTP 200 and expose the same Vercel deployment id.

It then checks that both language views include:

- Workflow Standardization / 流程標準化 section.
- Data standardization.
- StrategySignal standardization.
- Backtest reproducibility.
- Rollover data separation.
- PaperOrderIntent flow.
- Risk Engine checks.
- OMS lifecycle.
- Audit evidence.
- Demo operation entries:
  - Generate market tick.
  - Run mock strategy.
  - Simulate Paper Only order.
  - Review OMS timeline.
  - Copy demo summary.
  - Copy evidence JSON.
- Local source markers for the deterministic market realism layer:
  - market regime: `normal`, `trending`, `volatile`, `illiquid`,
    `stale_quote`.
  - spread, liquidity score, quote age, volatility path, and slippage estimate.
  - fill reason for filled, partial, stale quote reject, and illiquid reject.
  - bilingual result explanation copy in the guided stepper.

## Safety Boundary

The gate also verifies that production HTML keeps these boundaries visible:

- Paper Only.
- Browser-only / mock demo.
- No broker / 不連券商.
- No real order / 不建立真實委託.
- No credentials / 不收集憑證.
- Not investment advice / 不構成投資建議.
- Production Trading Platform: NOT READY.
- `TRADING_MODE`.
- `ENABLE_LIVE_TRADING`.
- `BROKER_PROVIDER`.

It blocks unsafe promotional or execution language such as:

- `guaranteed profit`
- `risk-free`
- `保證獲利`
- `零風險`
- unsafe `approve live`
- unsafe `核准實盤`

## Non-Goals

This check does not:

- Click buttons in a browser.
- Call backend mutation APIs.
- Write a database.
- Upload evidence JSON.
- Connect to a broker.
- Collect credentials.
- Validate investment performance.
- Claim production trading readiness.

Live trading remains disabled by default.
