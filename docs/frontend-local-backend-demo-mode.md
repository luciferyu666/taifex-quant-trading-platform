# Frontend Local Backend Demo Mode

## Purpose

This runbook explains the boundary between the production Vercel Web Command Center and local paper execution records.

The production Vercel frontend cannot directly read a user's local SQLite paper audit database. It can display read-only UI, checked fallback data, release status, safety copy, and explicitly selected local JSON evidence files. Actual persisted paper workflow records require a local backend connected to the same local SQLite database, or a future controlled hosted backend/API with a governed data layer.

## Supported Modes

| Mode | What It Can Show | What It Cannot Do |
| --- | --- | --- |
| Production Vercel frontend | Release status, fallback paper-safe data, local JSON evidence viewers, bilingual safety copy | Read local SQLite, create orders, write DB, call brokers |
| Local backend demo | Actual local paper approval, OMS, audit, risk, broker simulation, and audit-integrity records through FastAPI query endpoints | Live trading, broker login, real orders, external DB writes |
| Future hosted backend/API | Controlled paper records through a deployed backend and governed data layer after separate architecture review | Direct local SQLite access from Vercel, unreviewed live trading |

## Local Demo Steps

Use these commands when a reviewer must inspect actual persisted paper records in the Web Command Center:

```bash
cd "/mnt/f/From C download/taifex-quant-trading-platform"
make backend
```

In a second terminal:

```bash
cd "/mnt/f/From C download/taifex-quant-trading-platform"
make frontend
```

In a third terminal, create a safe local paper record:

```bash
cd "/mnt/f/From C download/taifex-quant-trading-platform"
make seed-paper-execution-demo
make paper-execution-persistence-check
```

Then open:

```text
http://localhost:3000/?lang=zh
http://localhost:3000/?lang=en
```

For an automated browser drill that starts local backend/frontend, seeds one
temporary local SQLite paper workflow record, and verifies the UI can see OMS /
audit timelines, run:

```bash
make local-backend-demo-browser-drill
```

## Production Vercel Expectations

Production URL:

```text
https://taifex-quant-trading-platform-front.vercel.app/
```

Expected behavior:

- Safe fallback content is allowed when backend APIs are unavailable.
- Local JSON evidence viewers work only after explicit user file selection.
- Paper records from local SQLite are not expected to appear on production Vercel.
- If actual paper records must be shown, use local backend demo mode or future hosted backend/API mode.

The Web Command Center now includes a `Data Access Boundary` panel in the Release tab. It distinguishes production Vercel fallback UI, local backend + SQLite records, and the future hosted API direction. See [production-local-data-boundary.md](production-local-data-boundary.md) for the reviewer-facing matrix and verification commands.

## Safety Rules

- `TRADING_MODE=paper`
- `ENABLE_LIVE_TRADING=false`
- `BROKER_PROVIDER=paper`
- Production Vercel must not read local SQLite directly.
- Production Vercel must not collect broker credentials.
- Production Vercel must not call broker SDKs.
- Production Vercel must not create real orders.
- Production Vercel must not claim production trading readiness.

## Future Hosted API Direction

A future cloud deployment may expose paper records through a controlled backend/API and managed data layer. That future work requires separate review for authentication, RBAC/ABAC, retention, audit integrity, deployment topology, data governance, and operational monitoring.

Until that work is complete, local SQLite remains a local demo store only.

Live trading remains disabled by default.
