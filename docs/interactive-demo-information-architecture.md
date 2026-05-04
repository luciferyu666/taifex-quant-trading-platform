# Interactive Demo Information Architecture

This document defines the Web App information architecture for the first-stage
product positioning:

```text
Taiwan index futures data analysis + Paper Trading research platform
```

The Web App must help users understand what they can operate, what each module
is for, and what value it provides before any live trading, broker connection, or
production SaaS workflow exists.

## Product Position

The first-stage product is a browser-accessible research and simulation
experience. It lets customers operate a complete Paper Only demo from market
data to simulated decision review:

```text
Market data preview
-> StrategySignal generation
-> Paper Only order simulation
-> OMS timeline review
-> Simulated position / PnL review
-> Evidence JSON handoff
```

This is not a production trading platform, not investment advice, and not a
performance claim.

## Web App Content Architecture

| Surface | Purpose | User Benefit |
| --- | --- | --- |
| Release / Safety status | Shows release level, `TRADING_MODE=paper`, `ENABLE_LIVE_TRADING=false`, and `BROKER_PROVIDER=paper`. | Users know immediately that the platform is for evaluation and Paper Only research. |
| Product value alignment panel | Maps each Web App module to its practical use and user benefit. | Users can understand why each feature exists before interacting with the demo. |
| Browser-only Mock Demo | Runs deterministic TX / MTX / TMF data, signal-only strategy output, paper order simulation, OMS timeline, and simulated PnL in the browser. | Customers can operate the full workflow from a public URL without local setup. |
| Market Data Lab | Displays deterministic quote snapshots and contract exposure context. | Users can understand data flow and contract sizing before strategy testing. |
| Strategy Research | Emits standardized `StrategySignal` output only. | Users can validate strategy logic without creating orders directly. |
| Paper Trading Simulator | Converts the platform-owned paper intent through risk checks, simulated OMS, and paper fill outcomes. | Users can practice order workflow safely and see why simulated orders pass or fail. |
| Portfolio Review | Shows browser-local position, average price, paper equity, and simulated PnL. | Users can connect simulated actions to position changes without treating results as performance claims. |
| Evidence Center | Copies summary, evidence JSON, session id, seed, and `localStorage` key. | Reviewers can reproduce or discuss the exact browser-local demo scenario. |

## Feature-to-Benefit Rules

Every customer-facing module should answer three questions:

1. What can the user operate?
2. What does the result mean?
3. What safety boundary applies?

Copy must avoid vague claims such as "advanced AI trading" or "best strategy".
Prefer concrete workflow language:

- "Generate deterministic market tick."
- "Run a signal-only mock strategy."
- "Simulate a Paper Only order."
- "Review simulated OMS timeline."
- "Copy browser-only evidence JSON."

## UI Entry Path

The production Web App opens the `Paper OMS` tab first. The Browser-only Mock
Demo is the first surface in that tab. This keeps the customer journey focused
on the core product value:

```text
Data -> Strategy -> Paper order -> OMS -> Position/PnL -> Evidence
```

Release, hosted readiness, local backend, research packet, and contract panels
remain available, but they support the main interactive demo instead of
replacing it.

## Safety Boundary

The aligned copy must continue to state:

- Paper Only.
- Browser-only where applicable.
- No broker connection.
- No real order submission.
- No credential collection.
- No investment advice.
- No performance claim.
- Production Trading Platform remains NOT READY.

## Validation

Run:

```bash
make browser-only-mock-demo-check
make frontend-i18n-check
cd frontend && npm run typecheck
cd frontend && npm run build
make check
```

Live trading remains disabled by default.
