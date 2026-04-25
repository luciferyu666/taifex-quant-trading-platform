# Business Model

## 1. Executive Summary

Taifex Quant Trading Platform is commercially positioned as Taiwan futures quant infrastructure, not as a guaranteed-profit strategy or discretionary trading service. The preferred revenue base is recurring SaaS tooling, data services, AI diagnostics, enterprise licensing, training, and implementation services.

## 2. Platform Commercial Positioning

The platform should be described as a Trading OS for Taiwan Index Futures workflows. It supports data governance, strategy research, backtesting, paper/shadow trading, risk controls, OMS discipline, broker gateway abstraction, auditability, and future enterprise deployment.

It should not be marketed as:
- a simple trading bot
- an investment advisory product
- a managed account service
- a copy trading product
- a guaranteed-profit strategy

## 3. Revenue Architecture

| Revenue Stream | Risk Level | Recurring Potential | Implementation Priority |
| --- | --- | --- | --- |
| SaaS subscriptions | Lower | High | Primary |
| Usage-based billing | Lower to medium | High | Primary |
| Enterprise licensing | Lower to medium | High | Primary |
| Data services | Medium | High | Primary after data governance |
| AI diagnostics | Medium | High | Secondary |
| Strategy marketplace | Medium to high | High | Later, with review workflow |
| Training and implementation | Lower | Medium | Early |
| Broker partnerships | Medium to high | Medium | Later, compliance-reviewed |
| Performance-based models | High | Uncertain | Future only |

## 4. Core SaaS Subscription Model

SaaS revenue should package infrastructure capabilities rather than trading outcomes. Plans can be separated by data precision, compute capacity, workflow maturity, audit needs, and support level.

| Plan | Customer | Primary Value | Reference Price |
| --- | --- | --- | --- |
| Basic | Beginners / researchers | Education, backtesting, paper trading | ~1,980 TWD / month |
| Pro | Active traders | Higher data precision, risk alerts, workflow readiness | ~8,800 TWD / month |
| Elite | Professional traders / small desks | Tick data, reconciliation, AI diagnostics, cloud runner | ~29,800 TWD / month |
| Enterprise | Institutions / brokers | Private cloud, RBAC/ABAC, audit logs, SLA | 250,000+ TWD / month |

## 5. Usage-Based Billing

Usage-based billing should map to infrastructure cost drivers:
- AI diagnosis tokens.
- Tick replay.
- High-frequency data replay.
- Backtest compute.
- Strategy runner capacity.
- Data API usage.
- Storage and audit retention.

## 6. Enterprise Licensing

Enterprise licensing should focus on procurement-ready infrastructure:
- private cloud or on-premise deployment
- WORM audit log direction
- RBAC/ABAC
- SLA and support model
- custom broker adapter work
- security review documentation
- data retention and audit requirements

## 7. Data Services

Data services should monetize cleaned Taiwan futures datasets and governance:
- rollover-aware continuous futures datasets
- versioned historical bars and ticks
- data quality reports
- research-only adjusted continuous contracts
- enterprise data API access

Execution and paper simulation must use real contract prices. Research adjusted data must not be described as tradable prices.

## 8. AI Strategy Diagnostics

AI diagnostics can be sold as analysis tooling:
- overfitting detection assistance
- parameter sensitivity summaries
- strategy health reports
- backtest review summaries
- anomaly and risk review support

AI diagnostics must not be described as investment advice, guaranteed alpha, or autonomous trading authority.

## 9. Strategy Marketplace

The strategy marketplace can become a distribution channel for developers and a discovery layer for users. It requires review workflow, risk labels, clear author responsibility, and compliance controls.

Marketplace copy must avoid implying that users can copy signals for profit without risk or legal review.

## 10. Training and Implementation Services

Training and implementation revenue can include:
- onboarding workshops
- quant workflow setup
- data governance implementation
- paper trading runbook design
- enterprise deployment assistance
- custom reporting and dashboard configuration

## 11. Broker and Institutional Partnerships

Broker and fintech partnerships may include white-label infrastructure, co-marketing, or integration work. Any broker fee-sharing, referral arrangement, signal service, or order-routing monetization requires separate legal and regulatory review.

## 12. Compliance-Dependent Future Revenue

The following are future options only:
- performance fees
- managed accounts
- copy trading
- signal subscriptions
- broker fee-sharing
- discretionary trading
- futures advisory services

These require licensed legal counsel, regulatory review, and possibly licensed partner structure.

## 13. Recommended Revenue Mix

Initial mix:
- 50% SaaS subscriptions.
- 20% enterprise implementation and training.
- 15% data services.
- 10% AI diagnostics.
- 5% partnerships and pilots.

Later mix can shift toward enterprise ARR, data APIs, and marketplace GMV after governance and compliance controls mature.

## 14. Risks and Non-Goals

Risks:
- regulatory ambiguity around signals, copy trading, and performance-based fees
- data licensing restrictions
- enterprise procurement timelines
- broker dependency risk
- overpromising product maturity

Non-goals:
- no guaranteed returns
- no live trading enablement
- no payment checkout in this task
- no real broker integration
- no user financial data collection

## 15. Implementation Checklist

- [ ] Keep commercial copy infrastructure-focused.
- [ ] Keep compliance-dependent revenue clearly labeled.
- [ ] Separate SaaS revenue from trading performance revenue.
- [ ] Maintain pricing docs and website pricing pages together.
- [ ] Review marketing copy against `docs/compliance-boundary.md`.
- [ ] Keep live trading disabled by default.
