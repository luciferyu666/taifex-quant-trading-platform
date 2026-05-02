# Customer Self-Service Demo

## Purpose

This runbook gives a customer or reviewer a lower-friction way to start the
local Paper Only demo without reading the full engineering setup path first.
It packages the local backend, local frontend, local SQLite paper demo records,
and safety checks behind two commands.

Production Vercel remains a read-only presentation surface. It cannot directly
read the evaluator's local SQLite paper records. Actual paper approval, OMS,
audit, risk, and evidence records require this local demo path or a future
controlled hosted backend/API.

## Quick Start

From the repository root:

```bash
make customer-demo-env-check
make start-customer-demo
```

The first command validates prerequisites and safety defaults. The second
command starts the local Paper Only demo and prints:

- Traditional Chinese Web Command Center URL
- English Web Command Center URL
- local backend health URL
- local SQLite path
- backend and frontend log paths

## Windows Helper

From the repository root:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/start-customer-demo.ps1 -CheckOnly
powershell -ExecutionPolicy Bypass -File scripts/start-customer-demo.ps1
```

The PowerShell wrapper delegates to the same local Bash launcher. It does not
ask for credentials and does not connect to any broker.

## What The Launcher Does

- validates `.env.example` contains `TRADING_MODE=paper`
- validates `.env.example` contains `ENABLE_LIVE_TRADING=false`
- validates `.env.example` contains `BROKER_PROVIDER=paper`
- refuses unsafe local `.env` values where live trading is enabled
- uses a local runtime directory under `.tmp/self-service-paper-demo`
- optionally seeds one safe Paper Only workflow record
- starts local FastAPI on `127.0.0.1:8000`
- starts local Next.js on `127.0.0.1:3000`
- points the frontend at the local backend through `NEXT_PUBLIC_BACKEND_URL`

## What The Launcher Must Not Do

- no broker SDK calls
- no external market data download
- no external database writes
- no hosted customer account creation
- no credential collection
- no real order creation
- no production OMS claim
- no production audit claim
- no production trading readiness claim

## Customer Demo Flow

1. Run `make customer-demo-env-check`.
2. Run `make start-customer-demo`.
3. Open `http://127.0.0.1:3000/?lang=zh`.
4. Review the Release tab and confirm Production Trading Platform is `NOT READY`.
5. Confirm safety defaults:
   - `TRADING_MODE=paper`
   - `ENABLE_LIVE_TRADING=false`
   - `BROKER_PROVIDER=paper`
6. Open the Paper OMS tab and inspect the seeded paper workflow record.
7. Select the workflow row and inspect OMS / audit timelines.
8. Review risk, broker simulation, audit integrity, and readiness panels.
9. Stop the launcher with `Ctrl-C` when finished.

## Troubleshooting

If a port is already in use:

```bash
bash scripts/start-customer-demo.sh --backend-port 8010 --frontend-port 3010
```

If dependencies are missing:

```bash
bash scripts/bootstrap.sh
```

If the UI does not show actual paper records, verify that the local backend and
local frontend are using the same `PAPER_EXECUTION_AUDIT_DB_PATH` printed by the
launcher.

## Verification

```bash
make customer-demo-env-check
make self-service-paper-demo-launcher-check
make self-service-paper-demo-check
make frontend-i18n-check
```

Live trading remains disabled by default.
