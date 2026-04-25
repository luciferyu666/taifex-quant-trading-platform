# Cloud-Native Transformation Blueprint

This blueprint defines the transformation path from a Python MVP into a cloud-native quantitative trading operating system for Taiwan Index Futures (TX/MTX/TMF). It is a planning and architecture document only. It does not enable live trading.

## Operating Model

The platform is split into two planes.

Control Plane:
- Identity service, future RBAC/ABAC, strategy configuration, approval workflow, reporting, and Web Command Center.
- Human-facing governance for research, paper trading, shadow trading, and future go-live review.

Trading/Data Plane:
- Market data ingestion, strategy signals, risk checks, OMS state, broker gateway, reconciliation, and audit events.
- Paper-only execution scaffolding until future controls, legal review, and operational approval exist.

## Core Services

- Identity Service
- Strategy Registry
- Market Data Service
- Data Pipeline
- Strategy SDK
- Backtest Service
- Risk Engine
- OMS
- EMS / Broker Gateway
- Position Service
- Audit Service
- Web Command Center

## Data Architecture

- Bronze Raw: S3/MinIO-style immutable raw source layer.
- Silver Clean: TimescaleDB/PostgreSQL time-series tables for cleaned bars and ticks.
- Gold Feature: ClickHouse-style analytics layer for features, factors, and backtest results.
- Rollover Event Table: tracks continuous futures rollover, spread, adjustment method, and data version.

Real contract prices must be used for live or paper order simulation. Back-adjusted and ratio-adjusted continuous contracts are reserved for research and backtesting.

## Trading Architecture

- Strategies emit target exposure signals only.
- Risk Engine validates signals and order intents.
- OMS owns event-style order state transitions.
- Broker Gateway adapts normalized order intents to broker-specific APIs.
- Current implementation uses a paper broker adapter only.
- Future reconciliation compares platform positions against broker-side positions.

## TX / MTX / TMF Exposure Model

- TX = 200 TWD per index point.
- MTX = 50 TWD per index point.
- TMF = 10 TWD per index point.
- 1 TX = 4 MTX = 20 TMF.
- 1 MTX = 5 TMF.

Position sizing should use TX-equivalent exposure. Future sizing can use integer optimization to minimize residual exposure subject to risk limits.

## Risk Model

Pre-trade:
- Price reasonability.
- Max order size.
- Max position.
- Margin proxy.
- Stale quote check.

In-trade:
- Equity.
- Max daily loss.
- Broker heartbeat.
- Duplicate order prevention.

Post-trade:
- Reconciliation.
- Realized and unrealized PnL.
- Audit.
- Attribution.

Kill Switch:
- Future feature.
- Current implementation exposes disabled paper-only placeholder state.

## Security and Governance

- No secrets in source code.
- Future Vault integration placeholder.
- Future RBAC/ABAC placeholder.
- Immutable audit log placeholder.
- OWASP ASVS-aligned web security checklist placeholder.
- Every high-risk feature must have explicit safety documentation.

## Implementation Phases

- Phase 0: Legal, compliance, authorization boundary, roles, safety policy, no-live-trading baseline.
- Phase 1: Infrastructure foundation, Docker Compose, Kubernetes placeholder manifests, observability placeholders, Vault placeholders.
- Phase 2: Data platform and pipeline, contract master, market bars schema, rollover events, data quality checks.
- Phase 3: Strategy SDK and backtest foundation, signal contract, strategy lifecycle, paper-safe research APIs.
- Phase 4: Trading execution and risk core, TX/MTX/TMF allocator, Risk Engine, OMS state machine, Paper Broker Gateway.
- Phase 5: Web Command Center and Shadow Trading, dashboard pages, API endpoints, paper/shadow status, event timeline.
- Phase 6: Reliability validation and Go-Live readiness, DR checklist, security checklist, runbooks, small-live preconditions.

Phase 0-5 are paper/shadow-only. Phase 6 is readiness planning only and does not enable live trading.
