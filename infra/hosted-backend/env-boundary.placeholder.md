# Hosted Backend Environment Boundary Placeholder

This file is a placeholder for future hosted backend environment separation. It is not a deployment manifest and must not contain secrets.

## dev

- Local developer testing only.
- Local SQLite is allowed only for local demo records.
- Local SQLite is not a hosted datastore.
- No customer accounts.
- No reviewer login.
- No broker calls.
- No live trading.

## staging

- Future hosted paper API rehearsal environment.
- Managed datastore can be tested only after dry-run gates pass.
- Test tenants only after auth/session and RBAC/ABAC review.
- No real broker SDK.
- No credential collection.
- No real orders.
- No live trading.

## production

- Production Trading Platform remains NOT READY.
- Hosted paper SaaS requires auth, tenant isolation, managed datastore, audit retention, audit integrity, monitoring, and security review.
- Local SQLite is forbidden for hosted paper records.
- Broker SDK calls remain forbidden.
- Credential collection remains disabled.
- Live trading remains disabled by default.

## Required Safe Defaults

```text
TRADING_MODE=paper
ENABLE_LIVE_TRADING=false
BROKER_PROVIDER=paper
```

Live trading remains disabled by default.
