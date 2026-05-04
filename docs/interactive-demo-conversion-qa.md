# Interactive Demo Conversion QA

## Purpose

This QA gate verifies that the production Web Command Center is not only a
static presentation page. It checks that a customer can open the public URL,
understand the product positioning, find the browser-only interactive demo
entry points, and see the safety boundary before testing any workflow.

The check is HTML-level and zero dependency. It does not click buttons, write
data, call a broker, collect credentials, or create orders.

## Production Target

Default URL:

```bash
https://taifex-quant-trading-platform-front.vercel.app
```

Override when validating another deployment:

```bash
FRONTEND_PRODUCTION_URL=https://example.vercel.app make interactive-demo-conversion-check
```

Optional network settings:

```bash
FRONTEND_PRODUCTION_TIMEOUT_MS=15000
FRONTEND_PRODUCTION_FETCH_ATTEMPTS=3
```

## Required UX Gates

The production HTML must expose the first-stage product position:

- Taiwan index futures data analysis and Paper Trading research platform.
- 台指期資料分析與 Paper Trading 研究平台.
- Feature to user benefit mapping.
- Market Data Lab.
- Strategy Research.
- Paper Trading Simulator.
- Portfolio Review.
- Evidence Center.

The production HTML must expose the interactive demo flow:

- Browser-only Mock Runtime.
- Generate next tick.
- Run mock strategy.
- Simulate paper order.
- Copy demo summary.
- Copy evidence JSON.
- Deterministic mock seed.
- localStorage key.
- Paper OMS tab active by default.

## Safety Gates

The production HTML must keep these safety markers:

- `TRADING_MODE`
- `ENABLE_LIVE_TRADING`
- `BROKER_PROVIDER`
- `NOT READY`
- `Paper Only`
- No backend required.
- No broker.
- No real money.
- No live trading.
- Not investment advice.

The gate rejects high-risk claims:

- guaranteed profit
- risk-free
- 保證獲利
- 零風險

Contextual live-approval phrases are allowed only when clearly negated.

## Commands

Run the standalone production conversion gate:

```bash
make interactive-demo-conversion-check
```

Recommended release validation:

```bash
make interactive-demo-conversion-check
make frontend-production-smoke-check
make frontend-i18n-check
cd frontend && npm run typecheck
cd frontend && npm run build
make check
```

## Boundary

This QA gate validates production-facing copy and discoverability only. It is
not a trading test, broker test, hosted backend readiness approval, investment
advice review, or production trading approval.

Live trading remains disabled by default.
