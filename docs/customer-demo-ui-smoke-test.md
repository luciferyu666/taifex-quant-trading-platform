# Customer Demo UI Smoke Test

## Purpose

This runbook verifies that the deployed Web Command Center exposes a usable customer demo guide and keeps the production-facing safety copy intact.

The check is intentionally HTML-level and zero-dependency. It does not launch a browser, click controls, upload files, write a database, call a broker, or create orders.

## Command

Run from the repository root:

```bash
make customer-demo-ui-smoke-check
```

By default the script checks:

```text
https://taifex-quant-trading-platform-front.vercel.app
```

To check another deployment:

```bash
FRONTEND_PRODUCTION_URL=https://example.vercel.app make customer-demo-ui-smoke-check
```

## What It Checks

The smoke check verifies:

- Production root, Traditional Chinese page, and English page return HTTP 200.
- Checked pages expose a Vercel deployment id marker.
- Customer Demo Guided Flow / 客戶測試導覽流程 is present.
- English and Traditional Chinese pages each expose seven demo steps.
- Previous / Next / Reset / Copy checklist controls are present.
- Release / Paper OMS / Research Packet / Contracts tabs are present.
- Prohibited-action lists are visible.
- Safety copy remains present:
  - `TRADING_MODE`
  - `ENABLE_LIVE_TRADING`
  - `BROKER_PROVIDER`
  - `NOT READY`
  - `Paper Only`
  - `實盤關閉`
  - `僅限紙上交易`
- Prohibited marketing or unsafe execution copy is absent:
  - `guaranteed profit`
  - `risk-free`
  - `保證獲利`
  - `零風險`
  - unsafe `approve live`
  - unsafe `核准實盤`

## What It Does Not Do

This smoke check does not:

- Deploy the frontend.
- Perform browser-level interaction testing.
- Submit paper simulations.
- Approve paper execution.
- Approve live trading.
- Upload customer files.
- Write any database.
- Call Risk Engine, OMS, Broker Gateway, or broker APIs.
- Collect credentials.

## CI Usage

`scripts/check.sh` runs this smoke check when Node.js is available, so `make check` covers the deployed customer demo guide alongside the existing production safety gate.

Future browser-level verification can add Playwright or another browser harness, but this check remains a stable production-facing content gate.

## Safety Confirmation

The customer demo guide is read-only. It supports customer evaluation and reviewer walkthroughs only.

Live trading remains disabled by default.
