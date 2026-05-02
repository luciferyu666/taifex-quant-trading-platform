# Customer Self-Service Local Demo Launcher

## Purpose

The local demo launcher packages the current local backend + local SQLite +
seeded paper record + local frontend workflow into one customer-facing command.
It exists because Production Vercel cannot directly read local SQLite paper
records.

This launcher is for Paper Only evaluation. It is not a production OMS, not a
production audit service, not broker connectivity, and not live trading.

## Command

```bash
cd "/mnt/f/From C download/taifex-quant-trading-platform"
make customer-demo-env-check
make start-customer-demo
```

`make start-customer-demo` is the customer-facing wrapper. It runs the
environment check first, then delegates to the underlying launcher.

The lower-level command remains available for operators who need custom flags:

```bash
make launch-self-service-paper-demo
```

The launcher:

- validates paper-only safety defaults
- refuses unsafe `.env` values where `ENABLE_LIVE_TRADING` is true
- creates a local runtime directory under `.tmp/self-service-paper-demo`
- writes paper demo records only to local SQLite
- seeds one safe paper workflow record
- starts local FastAPI on `127.0.0.1:8000`
- starts local Next.js on `127.0.0.1:3000`
- prints browser URLs for Traditional Chinese and English demo flows

## Check-Only Mode

For CI or pre-demo verification:

```bash
make customer-demo-env-check
make self-service-paper-demo-launcher-check
```

This validates prerequisites and safety defaults without starting servers,
creating records, or writing SQLite data.

## Optional Modes

Seed only:

```bash
bash scripts/launch-self-service-paper-demo.sh --seed-only
```

Use custom ports:

```bash
bash scripts/launch-self-service-paper-demo.sh \
  --backend-port 8010 \
  --frontend-port 3010
```

Use a custom runtime directory:

```bash
bash scripts/launch-self-service-paper-demo.sh \
  --runtime-dir .tmp/customer-a-paper-demo
```

## Expected Browser Flow

Open:

```text
http://127.0.0.1:3000/?lang=zh
```

Expected result:

- Release tab explains the Production Vercel / local SQLite boundary.
- Paper OMS tab can show the seeded paper workflow record.
- OMS and audit timelines render actual local SQLite records through the local
  backend.
- Paper approval request, reviewer decision, controlled Paper Only submit, risk
  guardrails, broker simulation preview, and evidence viewers remain visible.

## Safety Boundary

The launcher must preserve:

```text
TRADING_MODE=paper
ENABLE_LIVE_TRADING=false
BROKER_PROVIDER=paper
```

It must not:

- use Production Vercel as a local SQLite data access layer
- call broker SDKs
- download external market data
- collect API keys, account IDs, certificates, or broker credentials
- write external databases
- create real orders
- approve live trading
- claim production trading readiness

## Troubleshooting

If a port is already in use, run with custom ports:

```bash
bash scripts/launch-self-service-paper-demo.sh --backend-port 8010 --frontend-port 3010
```

If dependencies are missing, run the existing project setup first:

```bash
make init
```

If the UI does not show records, confirm the local backend and frontend are using
the same `PAPER_EXECUTION_AUDIT_DB_PATH` printed by the launcher.

## Verification

Run:

```bash
make self-service-paper-demo-launcher-check
make self-service-paper-demo-check
make local-backend-demo-browser-drill
```

Live trading remains disabled by default.
