# Business Operations Plan

## Purpose

This document is the seed source for commercial implementation artifacts. It positions Taifex Quant Trading Platform as an enterprise-grade, Web-based quantitative trading infrastructure platform for Taiwan Index Futures (TX/MTX/TMF). It is not a trading logic implementation plan and does not enable live trading.

## Core Positioning

- Not a simple trading bot.
- Not a guaranteed-profit strategy.
- Not discretionary managed trading.
- A trading infrastructure platform for Taiwan futures quant workflows.
- Focused on data governance, strategy research, backtesting, paper/shadow trading, risk control, OMS workflows, broker gateway abstraction, auditability, and enterprise deployment.

## Commercial Thesis

Taiwan futures quant workflows are fragmented across local scripts, broker APIs, CSV data, manual rollover handling, and weak auditability. The platform turns these workflows into a scalable SaaS and enterprise infrastructure product.

Early revenue should prioritize lower-regulatory-risk SaaS, technical tooling, data services, AI diagnostics, training, implementation, and enterprise licensing.

Regulated services such as investment advice, copy trading, signal subscriptions, managed accounts, performance-based fees, or broker fee-sharing require separate legal, regulatory, or licensed partner review.

## Primary Monetization Streams

1. SaaS subscriptions.
2. Usage-based billing.
3. Enterprise licensing and private cloud deployment.
4. Data API and data governance services.
5. AI strategy diagnosis services.
6. Strategy marketplace.
7. Training, onboarding, and implementation services.
8. Broker or institutional partnerships.
9. Compliance-dependent future performance-based models.

## Pricing Tiers

| Plan | Target Customer | Data Precision | Core Features | Reference Price |
| --- | --- | --- | --- | --- |
| Basic | Quant beginners / individual researchers | 1-minute level | Basic backtesting, paper trading | Around 1,980 TWD / month |
| Pro | Active traders | Second-level data | Broker API readiness, webhook risk alerts, production-like workflow | Around 8,800 TWD / month |
| Elite | Professional traders / small desks | Tick-level | Multi-account reconciliation, AI strategy diagnostics, cloud runner | Around 29,800 TWD / month |
| Enterprise | Institutions, proprietary desks, family offices, broker partners | Full market depth or premium feed | Private cloud, WORM audit logs, RBAC/ABAC, SLA, custom broker adapters | 250,000+ TWD / month |

## Usage-Based Billing

- AI diagnosis tokens.
- Tick replay.
- High-frequency data replay.
- Backtest compute.
- Strategy runner capacity.
- Data API usage.
- Storage and audit retention.

## Customer Segments

1. Individual investors: need education, backtesting, paper trading, lower price, and safety defaults.
2. Active traders / professional traders: need real workflow, data quality, signal/execution separation, risk alerts, and broker API readiness.
3. Institutions: need RBAC, audit logs, SLA, security, private cloud, procurement readiness, compliance boundary, and enterprise support.
4. Broker and fintech partners: need white-label or infrastructure partnership potential.
5. Strategy developers: need marketplace, validation, distribution, and clear revenue split.

## Go-To-Market Strategy

Phase 1: Tool-led Growth
- Free rollover-aware backtesting tools.
- Free TX/MTX/TMF exposure calculator.
- Free paper-trading sandbox.
- Developer-first content.
- Business goal: build credibility and user pipeline.

Phase 2: Ecosystem Expansion
- Broker API integration.
- Strategy marketplace.
- AI strategy diagnostics.
- Professional trader plans.
- Business goal: increase ARPU and retention.

Phase 3: Infrastructure Moat
- Enterprise licensing.
- Private cloud deployment.
- RBAC/ABAC.
- WORM audit logs.
- SLA.
- Security and compliance procurement readiness.
- Business goal: long-term ARR and high switching costs.

## Long-Term Moat

- Local Taiwan futures specialization.
- TX/MTX/TMF risk-equivalent normalization.
- Rollover-aware data governance.
- Versioned historical datasets.
- Paper-to-live workflow data.
- Broker gateway abstraction.
- Enterprise auditability.
- Strategy marketplace network effects.
- Institutional workflow lock-in.
- Security and compliance readiness.

## Compliance Boundary

- Position as SaaS and technical infrastructure in early stages.
- Do not provide individualized futures trading recommendations.
- Do not market as an investment advisory service.
- Do not offer copy trading or managed accounts without legal review and required licensing or licensed partner structure.
- Performance-based fees, discretionary trading, signal subscriptions, broker fee-sharing, and managed accounts are future compliance-dependent options.
- Enterprise contracts should clearly define responsibilities for kill switch, reconciliation, audit logs, and platform availability.
- Security standards such as OWASP ASVS can support enterprise procurement and security review.

## Partner Profit-Sharing Principles

Separate platform operating revenue from trading capital performance and strategy marketplace revenue.

Suggested platform operating net profit allocation:
- 50% reinvestment.
- 20% shareholder dividend pool.
- 20% active partner contribution pool.
- 10% risk/legal reserve.

Suggested trading performance pool if self-funded and legally appropriate:
- 75% capital provider.
- 15% strategy/research.
- 7% platform technology/risk.
- 3% trading operations.

Suggested strategy marketplace split:
- 60% strategy author.
- 30% platform.
- 10% review/risk/compliance.

Early friends or partners should generally receive commissions, milestone bonuses, or phantom equity before permanent equity. Formal equity should require vesting, IP assignment, confidentiality, exit clauses, and measurable contribution.
