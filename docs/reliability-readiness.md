# Reliability Readiness

Phase 6 is readiness planning only. It does not enable live trading.

## Readiness Areas

- Service health checks.
- Runbooks for start, stop, rollback, and incident response.
- Disaster recovery checklist.
- Data backup and restore plan.
- Broker heartbeat design.
- Reconciliation design.
- Audit event retention.
- Observability dashboards.

## Small-Live Preconditions

Before any future small-live pilot:
- Legal and compliance review must be complete.
- Paper and shadow trading evidence must be reviewed.
- Kill switch must be implemented and tested.
- OMS persistence and reconciliation must be implemented.
- Broker credentials must come from a secrets manager.
- Live limits must be explicitly approved.
- Operators must have incident procedures.

## Current Status

The repository is not production-ready. It contains paper-only scaffolding and readiness documentation.
