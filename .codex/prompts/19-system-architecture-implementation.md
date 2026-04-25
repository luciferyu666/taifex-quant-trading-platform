# System Architecture Implementation

Read `AGENTS.md` first.

Then read:
- `docs/system-architecture-spec.md`
- `docs/control-plane.md`
- `docs/trading-data-plane.md`
- `docs/data-lakehouse-architecture.md`
- `docs/oms-state-machine.md`
- `docs/broker-gateway-adapter-pattern.md`
- `docs/risk-engine-spec.md`
- `docs/security-vault-asvs.md`
- `docs/observability-dr-event-sourcing.md`

Inspect the repository before editing. Implement only one architecture slice at a time.

Rules:
- Preserve `TRADING_MODE=paper`, `ENABLE_LIVE_TRADING=false`, and `BROKER_PROVIDER=paper`.
- Never enable live trading.
- Never add real broker SDK calls.
- Never add secrets, tokens, certificates, account IDs, or broker credentials.
- Keep strategies signal-only.
- Keep Risk Engine before OMS/Broker Gateway.
- Keep Broker Gateway paper-only unless an explicitly reviewed future task changes it.
- Add backend tests for API or domain changes.
- Treat K8s, Vault, and OpenTelemetry files as placeholders unless explicitly reviewed.

Validation:
- Run `make architecture-status`.
- Run `make architecture-docs-check`.
- Run `make architecture-safety-check`.
- Run `make check`.

Report changed files, checks passed, blockers, and the exact next command.
