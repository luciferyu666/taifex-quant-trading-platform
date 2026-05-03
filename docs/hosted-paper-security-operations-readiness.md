# Hosted Paper Security Operations Readiness

This document defines the security and operations boundary for a future hosted
paper SaaS product. It is a readiness contract only. It does not enable hosted
customer accounts, write hosted records, collect credentials, connect brokers,
or enable live trading.

Live trading remains disabled by default.

## Purpose

The current platform has local paper workflow scaffolding, read-only Web Command
Center panels, production smoke gates, and release readiness checks. A complete
hosted paper SaaS product still needs operational controls before customer
production use:

- secrets management
- rate limiting
- audit monitoring
- observability
- CI/CD deployment gates
- staging smoke tests
- basic load, abuse, and auth boundary tests
- incident response and rollback runbooks

## Read-Only API

```text
GET /api/hosted-paper/security-operations/readiness
```

The endpoint returns metadata only:

- current capability flags
- required security and operations controls
- required next implementation slices
- safety defaults
- safety flags
- warnings and documentation links

It does not execute tests, write a database, call a broker, collect secrets, or
modify hosted infrastructure.

## Current Capability Status

Enabled today:

- static source checks for unsafe secrets and live-trading defaults
- GitHub Actions Release Readiness gate
- production Command Center smoke gate
- production-facing forbidden claim checks

Not enabled yet:

- managed secret store or Vault integration
- runtime secret rotation
- application or edge rate limiting
- hosted audit monitoring rules
- hosted OpenTelemetry/log drain pipeline
- staging hosted backend smoke test
- authorized load / abuse test suite
- real auth boundary test suite
- incident response workflow

## Required Controls

### Secrets Management

Future hosted paper SaaS must use managed secrets or Vault-style storage for
runtime secrets. Public frontend environment variables such as
`NEXT_PUBLIC_HOSTED_BACKEND_API_BASE_URL` are routing configuration only and must
never contain secrets, tokens, broker credentials, account IDs, or certificates.

### Rate Limiting

Hosted endpoints must define rate limits for:

- login/session paths
- approval queue reads
- reviewer decision writes
- paper workflow submit
- evidence export and read endpoints
- health/readiness endpoints

This repository currently does not install runtime rate limiting middleware or
edge rules.

### Audit Monitoring

Hosted paper workflow requires alerting for:

- suspicious approval activity
- failed or repeated reviewer decisions
- OMS lifecycle anomalies
- audit integrity verification failures
- repeated denied auth or tenant-boundary attempts

Local SQLite audit records are demo/dev scaffolding only and are not centralized
monitoring.

### Observability

Future hosted paper SaaS should trace:

```text
request -> auth/session -> tenant boundary -> approval -> risk -> OMS -> paper gateway -> audit
```

OpenTelemetry placeholders exist, but no production endpoint, log drain, trace
backend, alerting channel, or secret-backed exporter is configured.

### CI/CD Deployment Gates

Current gates include:

- `make release-readiness-check`
- `make frontend-production-smoke-check`
- `make check`
- GitHub Actions Release Readiness workflow

Future hosted paper SaaS must add staging hosted backend checks before customer
use.

### Staging Smoke Test

Before hosted customer use, staging must verify:

- hosted backend URL reachability
- no live trading
- paper broker provider
- auth/session boundary presence
- tenant boundary presence
- no cross-tenant access
- managed datastore connectivity only in approved staging mode
- no broker SDK calls
- no credential collection

### Load, Abuse, and Auth Boundary Tests

Future tests must be authorized, scoped, non-destructive, and paper-only. They
should verify rate limits, denial paths, auth failures, tenant isolation
failures, and read-only endpoint resilience. This readiness contract does not
run load, crawler, abuse, or penetration tests.

## Safety Boundary

- Paper Only.
- Read-only contract only.
- No secrets are stored.
- No broker credentials are collected.
- No customer account is created.
- No hosted datastore is written.
- No external database is written.
- No broker API is called.
- No order is created.
- No production security approval is granted.
- Production Trading Platform remains NOT READY.

## Acceptance Criteria

- `GET /api/hosted-paper/security-operations/readiness` returns
  `readiness_contract_only_not_operational`.
- Safety defaults remain:
  - `TRADING_MODE=paper`
  - `ENABLE_LIVE_TRADING=false`
  - `BROKER_PROVIDER=paper`
- Web Command Center displays the readiness response as read-only metadata.
- The check target rejects unsafe wording or accidental secret/live defaults.

## Validation

```bash
make hosted-paper-security-operations-check
cd backend && .venv/bin/python -m pytest tests/test_hosted_paper_security_operations_routes.py
make frontend-i18n-check
cd frontend && npm run typecheck
cd frontend && npm run build
make check
```
