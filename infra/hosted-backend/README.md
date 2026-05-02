# Hosted Backend Placeholder

This directory documents the future hosted backend/API deployment boundary for Hosted Paper mode.

Current status:

- Placeholder only.
- No customer-facing hosted backend is enabled by this directory.
- No managed datastore is connected.
- No customer account is created.
- No reviewer login is created.
- No broker credentials are collected.
- No broker SDK is configured.
- No live trading route is enabled.

The current customer-operable paper workflow remains:

```text
local backend + local SQLite + Web Command Center local demo
```

Production Vercel can display read-only UI and fallback/evidence views, but it cannot directly read local SQLite paper records.

Local SQLite is not a hosted datastore.

## Future Hosted Paper Boundary

Future hosted paper deployment must separate:

- dev
- staging
- production

It must enforce:

- tenant isolation
- authenticated sessions
- RBAC / ABAC
- managed datastore usage
- append-only hosted audit events
- paper-only risk and OMS routing
- broker SDK prohibition
- live trading disabled by default

## Safety Rules

- Do not place secrets in this directory.
- Do not add broker API keys, certificates, account IDs, Vercel tokens, database passwords, or private customer data.
- Do not use local SQLite as a hosted datastore.
- Do not deploy production customer traffic from these placeholders without security and operations review.
- Do not enable live trading.

Live trading remains disabled by default.
