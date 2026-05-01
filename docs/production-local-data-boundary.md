# Production / Local Data Boundary

## Purpose

This runbook explains what the production Vercel Web Command Center can and cannot read compared with a local backend demo.

The production Vercel frontend can render read-only UI, fallback data, safety copy, and explicitly selected local JSON evidence. It cannot directly read a reviewer machine's local SQLite paper execution database. Actual persisted paper approval, OMS, audit, risk, and audit-integrity records require a local FastAPI backend connected to the same local SQLite file, or a future controlled hosted backend/API with a governed data layer.

## Boundary Matrix

| Mode | Can Show | Requires | Cannot Do |
| --- | --- | --- | --- |
| Production Vercel frontend | Release status, safety defaults, checked fallback data, local JSON evidence viewers | Public frontend URL and optional explicit local JSON selection | Read local SQLite, call local FastAPI, write DB, create orders, collect credentials, call brokers |
| Local backend demo | Actual local paper records from SQLite through FastAPI query endpoints | `make backend`, `make frontend`, shared `PAPER_EXECUTION_AUDIT_DB_PATH`, and a seeded or created paper record | Act as production OMS, production audit system, broker connectivity, or live readiness |
| Future hosted backend/API | Future controlled paper records through authenticated API and governed data layer | Separate architecture, security, RBAC/ABAC, retention, audit, and observability review | Bypass paper/live boundaries or claim production trading readiness |

## Reviewer Flow For Actual Paper Records

Run the backend locally:

```bash
cd "/mnt/f/From C download/taifex-quant-trading-platform"
make backend
```

Run the frontend locally in a second terminal:

```bash
cd "/mnt/f/From C download/taifex-quant-trading-platform"
make frontend
```

Seed a safe paper-only demo record in a third terminal:

```bash
cd "/mnt/f/From C download/taifex-quant-trading-platform"
make seed-paper-execution-demo
make paper-execution-persistence-check
```

Open:

```text
http://localhost:3000/?lang=zh
```

Expected result:

- Release tab shows the deployment and data access boundary.
- Paper OMS tab shows the local paper workflow run.
- OMS and audit timelines render records from the local SQLite file through the local backend.

## Automated Verification

Use the browser drill to verify the local flow end to end:

```bash
make local-backend-demo-browser-drill
```

Use the static UI / copy gate:

```bash
make frontend-local-backend-demo-check
make frontend-i18n-check
```

## Safety Rules

- `TRADING_MODE=paper`
- `ENABLE_LIVE_TRADING=false`
- `BROKER_PROVIDER=paper`
- Production Vercel direct SQLite access remains `false`.
- Production Vercel must not collect broker credentials.
- Production Vercel must not call broker SDKs.
- Production Vercel must not create paper or real orders.
- Local SQLite is for paper demo only and is not a production OMS or WORM audit ledger.

Live trading remains disabled by default.
