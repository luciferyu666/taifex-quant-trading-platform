# Architecture

Taifex Quant Trading Platform is a paper-first monorepo skeleton for an enterprise-grade web platform for Taiwan Index Futures (TX/MTX/TMF). The architecture is organized around strict separation between strategy signals and order execution.

## Control Plane

The control plane owns non-latency-critical workflows:

- Web dashboard and operator workflows.
- Strategy registration and parameter governance.
- Audit views and future RBAC/MFA integration.
- Configuration for risk limits and environment gates.
- Future approval workflows for paper, shadow, and live promotion.

## Trading/Data Plane

The trading/data plane owns latency-sensitive and safety-critical workflows:

- Market data ingestion.
- Strategy signal intake.
- Risk Engine validation.
- OMS order lifecycle and idempotency.
- Broker Gateway adapter boundaries.
- Portfolio state and reconciliation hooks.

## Backend

The backend is a FastAPI service. It currently exposes:

- `GET /health`
- `GET /api/system/manifest`
- `GET /api/risk/config`

It reads environment configuration through `pydantic-settings` and defaults to paper trading.

## Frontend

The frontend is a Next.js App Router application written in TypeScript with plain CSS. It renders the operator dashboard safely even when the backend is unavailable.

## Data Pipeline

The future data pipeline owns market data ingestion, session alignment, rollover metadata, quality gates, and research/execution dataset separation.

## Strategy Engine

The future strategy engine emits target exposure signals only. It must never import or call broker SDKs directly.

## Risk Engine

The future Risk Engine validates stale quote limits, TX-equivalent exposure, daily loss, order rate, and kill-switch conditions before any OMS handoff.

## OMS

The future OMS owns idempotency, order state transitions, execution reports, and reconciliation hooks. It is the only path from risk-approved intent to broker-bound order request.

## Broker Gateway

The future Broker Gateway isolates paper and broker adapters. Broker SDK integration belongs here only, behind paper-first defaults and explicit future approval.

## Event Flow

```text
Strategy Engine
  -> target exposure signal
  -> Risk Engine
  -> OMS
  -> Broker Gateway
  -> execution report
  -> Portfolio / Reconciliation
```

Strategies must never call broker SDKs directly. Future broker access belongs only in `broker-gateway`, and every future order must pass through Risk Engine and OMS first.

## Event-Driven Direction

Future production services should use event-driven boundaries for signals, risk decisions, OMS events, execution reports, and portfolio reconciliation. Kafka or a similar log-backed event bus can be introduced after the skeleton has stable contracts and tests.

## Local Services

- PostgreSQL/Timescale-compatible database for operational state.
- Redis for future low-latency coordination.
- ClickHouse for future analytics and backtest result exploration.
- FastAPI backend for API boundaries.
- Next.js frontend for the operator dashboard.
