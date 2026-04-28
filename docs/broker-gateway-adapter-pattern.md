# Broker Gateway Adapter Pattern

## Purpose

Broker Gateway is the only boundary where broker-specific adapters may exist in future phases. Current implementation allows only paper adapters and simulated acknowledgements.

## Adapter Pattern

Normalized order intents enter Broker Gateway only after Risk Engine approval and OMS state preparation. Gateway adapters translate normalized intents to broker-specific APIs in future implementations.

## Paper Adapter

`backend/app/services/paper_broker_gateway.py` returns deterministic paper
simulation outcomes. It can simulate acknowledgement, rejection, partial fill, fill,
and cancellation for workflow testing. It never places real orders and never imports
broker SDKs.

## Future Shioaji/Fubon Adapters

Shioaji, Fubon, or other broker adapters are placeholders only. They must not be added until live readiness, credential storage, legal review, rate limit handling, reconciliation, and kill switch controls exist.

## Reconnect and Rate Limit Responsibilities

Future adapters must own reconnect logic, retry budgets, broker heartbeat, rate limit handling, and normalized exceptions.

## Exception Normalization

Future broker exceptions must be converted into platform-level execution events without leaking broker SDK internals into Strategy Engine or UI code.

## Strategy Engine Boundary

Broker SDK imports are forbidden in `strategy-engine`. Strategies emit signals only.

## Credential Isolation

Strategy Runner must never see plaintext broker keys. Future credentials should be retrieved through Vault or equivalent secrets infrastructure inside a tightly controlled Broker Gateway boundary.

## Acceptance Criteria

- Current gateway remains paper-only.
- No Shioaji/Fubon SDK imports exist in this task.
- Broker credentials are not stored in source code.
- Risk Engine and OMS remain before Broker Gateway.
- Paper Broker Gateway refuses unapproved Risk Engine decisions.
- Paper Broker Gateway output is recorded as simulated audit metadata only.
