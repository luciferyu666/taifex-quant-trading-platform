# Trading/Data Plane

## Purpose

The Trading/Data Plane owns high-priority runtime workflows: market data, strategy runners, risk checks, OMS state, broker gateway adapters, execution events, reconciliation, and trading state.

## Responsibilities

- Market data ingestion and normalization.
- Strategy signal path.
- Risk and OMS path.
- Broker gateway path.
- Execution event capture.
- Position and reconciliation workflow.
- Event-sourced future trading state.

## Services

- Market Data Service.
- Data Pipeline.
- Strategy Runner.
- Risk Engine.
- OMS.
- Broker Gateway.
- Position Service.
- Audit/Event Service.

## Market Data Path

Raw data lands in Bronze Raw. Cleaned bars and ticks flow into Silver Clean. Features and backtest results flow into Gold Feature. Paper/live simulation must use real contract symbols and real-contract prices.

## Strategy Signal Path

Strategies emit standardized target exposure signals only. They do not call broker SDKs and do not submit orders.

## Risk and OMS Path

Order intents must pass Risk Engine before OMS and Broker Gateway. OMS owns deterministic state transitions and idempotency keys.

## Broker Gateway Path

Broker Gateway adapts normalized paper order intents to adapters. Current implementation allows only PaperBrokerGateway. Real Shioaji/Fubon adapters are future placeholders only.

## Event Sourcing Direction

Long-term trading state should be rebuilt from immutable events. Current implementation uses in-memory paper-only models for tests and API scaffolding.

## Paper, Shadow, and Live Boundaries

Paper and shadow workflows are allowed as scaffolding. Live requires separate environment boundaries, reviewed credentials, network segmentation, operational controls, legal review, and explicit approval. It is not enabled by default.

## Acceptance Criteria

- Strategy code remains signal-only.
- Risk Engine is always before OMS/Broker Gateway.
- Broker gateway is paper-only in current implementation.
- Reconciliation is simulated or placeholder-only.

## Next Implementation Steps

1. Add event models for signal, risk, OMS, broker, and reconciliation.
2. Add durable paper order store.
3. Add shadow trading status APIs.
4. Add reconciliation runbook and alert placeholders.
