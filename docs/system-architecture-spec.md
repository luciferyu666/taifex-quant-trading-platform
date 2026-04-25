# System Architecture Specification

## Purpose

This specification defines the enterprise architecture for the Taifex Quant Trading Platform. The platform is a Web-based quantitative trading infrastructure system for Taiwan Index Futures, focused on TX, MTX, and TMF workflows. It is a Trading OS direction, not a simple trading bot and not a production trading system.

Current implementation status: paper-only scaffolding. Live trading remains disabled by default.

## Core Principles

- Control Plane and Trading/Data Plane must be separated.
- Control Plane load must not interfere with trading execution.
- Strategies emit standardized signals only.
- Strategies must never call broker APIs directly.
- All future orders must pass through Risk Engine and OMS.
- Broker Gateway is the only boundary for broker adapter integration.
- Current broker gateway implementation is paper-only.
- Research, Backtest, Paper, Shadow, and Live must be separated by environment boundary, not only by a single config flag.
- No real broker credentials, account IDs, certificates, Vault tokens, or secrets belong in source code.

## Plane Separation

Control Plane responsibilities:
- identity and future RBAC/ABAC
- strategy configuration
- approval workflow
- reporting
- audit viewing
- administration

Trading/Data Plane responsibilities:
- market data
- strategy runners
- risk engine
- OMS
- broker gateway
- execution events
- reconciliation
- trading state

## Data Architecture

- Bronze Raw: immutable S3/MinIO-style raw storage for source payloads.
- Silver Clean: TimescaleDB/PostgreSQL cleaned time-series bars and ticks.
- Gold Feature: ClickHouse analytics for technical indicators, factors, backtest results, and OLAP.
- Contract Master Service: TX/MTX/TMF lifecycle, expiries, sessions, and tradable symbols.
- Rollover Event Table: rollover date, basis/spread, adjustment method, adjustment factor, and data version.

Research may use back-adjusted or ratio-adjusted continuous futures. Paper/live execution must use real contract symbols and real-contract prices.

## Trading Architecture

Strategy Runner emits target exposure signals only. Risk Engine validates order intents. OMS owns order state, idempotency, and deterministic transitions. Broker Gateway adapts normalized paper order intents to adapters. Reconciliation compares platform state with broker-side state in future phases.

Current implementation uses paper-only order simulation and simulated reconciliation.

## OMS State Model

Suggested states:
- PENDING
- NEW
- RISK_CHECKED
- SUBMITTED
- ACCEPTED
- PARTIALLY_FILLED
- FILLED
- CANCEL_REQUESTED
- CANCELLED
- REJECTED
- EXPIRED
- UNKNOWN_NEEDS_RECONCILIATION

Orders require idempotency keys. Long-term state should be event-sourced. The initial implementation is in-memory and paper-only.

## TX/MTX/TMF Exposure Model

| Contract | Point Value | TMF Units | TX Equivalent |
| --- | ---: | ---: | ---: |
| TX | TWD 200 per point | 20 | 1.00 |
| MTX | TWD 50 per point | 5 | 0.25 |
| TMF | TWD 10 per point | 1 | 0.05 |

Equivalence:
- 1 TX = 4 MTX = 20 TMF
- 1 MTX = 5 TMF

Initial allocator uses deterministic integer TMF units. Future allocators should optimize by margin usage, liquidity, ATR, current position, and residual exposure.

## Risk Architecture

Pre-trade:
- price reasonability
- max order size
- max position
- stale quote
- margin proxy
- duplicate order prevention

In-trade:
- equity
- max daily loss
- broker heartbeat
- order rejection rate
- duplicate orders

Post-trade:
- reconciliation
- realized/unrealized PnL
- audit trail
- performance attribution

Kill switch paths through Web UI, API, and CLI are future work. Current implementation exposes paper-only placeholders and does not enable live trading.

## Security

- Align web and API controls with OWASP ASVS.
- Future broker credentials should live in HashiCorp Vault or equivalent.
- Vault Transit is the future direction for dynamic encryption/signing.
- Strategy Runner must never see plaintext broker keys.
- Current Vault policy files are placeholders only.

## Observability and DR

OpenTelemetry should trace signal to risk to OMS to broker gateway to paper execution. Metrics and logs should support future Prometheus/Grafana. Event sourcing should support OMS state rebuild. Reconciliation mismatches should lock the system in future phases.

## Implementation Mapping

- Control Plane: `docs/control-plane.md`
- Trading/Data Plane: `docs/trading-data-plane.md`
- Data Lakehouse: `docs/data-lakehouse-architecture.md`
- OMS: `docs/oms-state-machine.md`, `backend/app/domain/order_state_machine.py`
- Allocator: `backend/app/domain/allocator.py`
- Risk Rules: `docs/risk-engine-spec.md`, `backend/app/domain/risk_rules.py`
- Broker Gateway: `docs/broker-gateway-adapter-pattern.md`, `backend/app/services/paper_broker_gateway.py`
- Reconciliation: `backend/app/services/reconciliation.py`
- API: `backend/app/api/architecture_routes.py`
- Infrastructure placeholders: `infra/k8s/`, `infra/vault/`, `infra/observability/`

## Safety Statement

Strategies emit signals. Platform handles risk, OMS, broker gateway, reconciliation, and audit. Live trading remains disabled by default.
