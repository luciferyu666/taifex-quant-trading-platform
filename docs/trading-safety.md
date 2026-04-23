# Trading Safety

This repository is paper-first by design.

## Defaults

```text
TRADING_MODE=paper
ENABLE_LIVE_TRADING=false
BROKER_PROVIDER=paper
MAX_TX_EQUIVALENT_EXPOSURE=0.25
MAX_DAILY_LOSS_TWD=5000
STALE_QUOTE_SECONDS=3
```

## Live Trading

Live trading is not enabled by default and real broker connectivity is not implemented in this skeleton. This protects local development from accidental real-market activity and keeps future execution work behind explicit review gates.

## Strategy and Execution Separation

Strategies emit target exposure signals only. They must not:

- Call broker SDKs.
- Create orders directly.
- Bypass risk checks.
- Bypass OMS state transitions.

Future order flow must be:

```text
Strategy signal -> Risk Engine -> OMS -> Broker Gateway
```

## Risk and OMS Rule

Every future order must pass pre-trade checks and be represented in the OMS state machine with idempotency. Broker Gateway is an adapter boundary, not a strategy execution surface.

## Secrets Policy

- Do not commit `.env`.
- Do not commit broker credentials, account IDs, certificates, private keys, or API keys.
- Keep `.env.example` limited to safe fake local defaults.
- Use a future secrets manager for real integrations.

## Future Live-Trading Approval Checklist

Before any future live mode exists, require:

- Explicit human approval.
- Dedicated non-paper broker adapter.
- Risk Engine checks for stale quotes, exposure, daily loss, and kill switch.
- OMS idempotency and reconciliation tests.
- Separate credentials and environment from paper/shadow trading.
- Audit logging for configuration changes and order lifecycle events.
