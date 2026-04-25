# Observability, DR, and Event Sourcing

## OpenTelemetry Traces

Future tracing should follow:

```text
strategy signal -> risk evaluation -> OMS transition -> broker gateway -> paper execution -> reconciliation
```

Trace IDs should connect strategy decisions, risk checks, OMS events, broker acknowledgements, and audit records.

## Metrics and Logs Future Stack

Future local and production stacks can use OpenTelemetry Collector, Prometheus, Grafana, and centralized logs. Current files are placeholders only.

Suggested metrics:
- signal count
- risk approvals/rejections
- OMS transition count
- broker gateway acknowledgements/rejections
- reconciliation mismatch count
- quote staleness
- daily loss placeholder

## Event Sourcing Recovery

OMS state should be recoverable from immutable order events. Unknown or inconsistent states must be represented as `UNKNOWN_NEEDS_RECONCILIATION`.

## Broker Reconciliation

Future reconciliation should compare platform positions against broker positions. If mismatch is detected, the system should enter a locked state until operator review.

Current implementation performs simulated paper-only reconciliation and does not query a broker.

## Critical Alert Conditions

- Risk Engine disabled or bypassed.
- OMS invalid transition.
- Broker heartbeat missing.
- Reconciliation mismatch.
- Kill switch activated.
- Unexpected live trading flag.
- Stale market data above threshold.

## DR Runbook Direction

Future DR runbooks should cover backup, restore, replay, failover, incident response, broker disconnect, and post-incident audit review.

## Paper-Only Limitations

The current scaffolding validates architecture contracts only. It is not a production recovery system and does not enable live trading.

## Acceptance Criteria

- OTel placeholder exists without production endpoint or secrets.
- Reconciliation mismatch locks simulated result.
- Event sourcing direction is documented.
- DR remains readiness planning only.
