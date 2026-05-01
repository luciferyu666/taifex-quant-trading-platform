# Local Backend Demo Browser Drill

## Purpose

This drill verifies the customer demo path where a reviewer follows the Web Command Center instructions, runs a local backend/frontend, seeds one local paper workflow record, and sees actual OMS / audit records in the browser.

It exists because the production Vercel frontend cannot directly read local SQLite. Production Vercel can show read-only UI, safe fallback data, and explicit local JSON evidence viewers. Actual paper records require local backend + local SQLite, or a future controlled hosted backend/API.

## What The Drill Starts

The automated drill starts:

- a local FastAPI backend on a random localhost port
- a local Next.js Web Command Center on a random localhost port
- a temporary local SQLite file through `PAPER_EXECUTION_AUDIT_DB_PATH`
- a headless Chrome / Chromium / Edge browser

It then runs `scripts/seed-paper-execution-demo.py` against the same temporary SQLite file before opening the UI.

## Verification Steps

The browser drill verifies:

1. The Release tab shows `Local Backend Demo Mode`.
2. The UI states that production Vercel cannot directly read local SQLite.
3. The Release tab shows the `Data Access Boundary` matrix for production Vercel, local backend, and future hosted API modes.
4. The UI exposes the local commands:
   - `make backend`
   - `make frontend`
   - `make seed-paper-execution-demo`
   - `make paper-execution-persistence-check`
5. The Paper OMS tab can display the seeded local paper workflow run.
6. The selected workflow shows:
   - `workflow_run_id`
   - `order_id`
   - `demo-paper-strategy`
   - final OMS status `PARTIALLY_FILLED`
7. The OMS timeline includes `PARTIAL_FILL`.
8. The audit timeline includes `paper_execution.paper_broker_simulated`.
9. The UI keeps safety flags visible:
   - `TRADING_MODE=paper`
   - `ENABLE_LIVE_TRADING=false`
   - `BROKER_PROVIDER=paper`
   - `PRODUCTION_SQLITE_ACCESS=false`
   - `LOCAL_BACKEND_REQUIRED_FOR_RECORDS=true`

## Command

```bash
cd "/mnt/f/From C download/taifex-quant-trading-platform"
make local-backend-demo-browser-drill
```

If the browser executable is not auto-detected:

```bash
PAPER_UI_SMOKE_CHROME_PATH="/path/to/chrome" make local-backend-demo-browser-drill
```

## Manual Reviewer Flow

For a human reviewer, run:

```bash
cd "/mnt/f/From C download/taifex-quant-trading-platform"
make backend
```

In a second terminal:

```bash
cd "/mnt/f/From C download/taifex-quant-trading-platform"
make frontend
```

In a third terminal:

```bash
cd "/mnt/f/From C download/taifex-quant-trading-platform"
make seed-paper-execution-demo
make paper-execution-persistence-check
```

Then open:

```text
http://localhost:3000/?lang=zh
```

Expected result:

- Release tab explains Local Backend Demo Mode.
- Paper OMS tab shows the seeded workflow run.
- OMS and audit timelines render actual local SQLite records.

## Safety Boundary

- Paper Only.
- Local SQLite only.
- No production Vercel direct SQLite access.
- No broker SDK call.
- No credential collection.
- No real order.
- No live approval.
- No production OMS or production audit claim.

Live trading remains disabled by default.
