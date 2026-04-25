# Pricing Strategy

## 1. Pricing Principles

- Price infrastructure value, not promised trading performance.
- Segment by workflow maturity, data precision, compute, governance, and support.
- Keep regulated offerings outside default packaging.
- Use annual billing to improve retention without creating lock-in confusion.
- Treat published prices as reference pricing until legal, tax, and market validation are complete.

## 2. Customer Segments

| Segment | Need | Pricing Sensitivity | Primary Offer |
| --- | --- | --- | --- |
| Individual investors | Education, backtesting, paper trading | High | Basic |
| Active traders | Better workflow, data quality, risk alerts | Medium | Pro |
| Professional traders / small desks | Tick data, runners, reconciliation | Medium | Elite |
| Institutions | Governance, SLA, private deployment | Lower | Enterprise |
| Broker / fintech partners | Infrastructure partnership | Negotiated | Enterprise / custom |
| Strategy developers | Distribution and validation | Medium | Marketplace terms |

## 3. Plan Matrix

| Plan | Reference Price | Target Customer | Data Precision | Primary Value |
| --- | --- | --- | --- | --- |
| Basic | ~1,980 TWD/month | Quant beginners / individual researchers | 1-minute | Learn, research, paper trade |
| Pro | ~8,800 TWD/month | Active traders | Second-level | Workflow readiness and risk alerts |
| Elite | ~29,800 TWD/month | Professional traders / small desks | Tick-level | Advanced diagnostics and runner capacity |
| Enterprise | 250,000+ TWD/month | Institutions / brokers | Full depth or premium feed | Governance, private cloud, SLA |

## 4. Basic Plan

Target customer: quant beginners / individual researchers.

Primary value: safe education, basic backtesting, and paper trading.

Included capabilities:
- 1-minute data workflows.
- Basic backtesting.
- Paper trading sandbox.
- TX/MTX/TMF exposure calculator.

Limits:
- Lower compute.
- Limited data history.
- No enterprise audit features.

Add-ons:
- Training sessions.
- Additional backtest compute.

Compliance notes:
- Must remain research tooling and paper trading.
- No individualized advice.

## 5. Pro Plan

Target customer: active traders.

Primary value: production-like paper workflow with stronger data quality and risk alerts.

Included capabilities:
- Second-level data workflows.
- Webhook risk alerts.
- Broker API readiness documentation.
- Paper/shadow workflow support.

Limits:
- No live order routing by default.
- Limited strategy runner capacity.

Add-ons:
- Data API usage.
- AI diagnosis tokens.
- Extra runner capacity.

Compliance notes:
- Broker integration and signal services require separate review.

## 6. Elite Plan

Target customer: professional traders and small desks.

Primary value: deeper data precision, reconciliation direction, AI diagnostics, and cloud runner capacity.

Included capabilities:
- Tick-level data workflows.
- Multi-account reconciliation direction.
- AI strategy diagnostics.
- Cloud runner capacity.

Limits:
- No managed account service.
- No copy trading service.

Add-ons:
- Tick replay.
- Additional audit retention.
- Advanced AI diagnostics.

Compliance notes:
- Diagnostics are analytical tools, not investment recommendations.

## 7. Enterprise Plan

Target customer: institutions, proprietary desks, family offices, broker partners.

Primary value: governance, private cloud, auditability, SLA, and custom integration.

Included capabilities:
- Full market depth or premium feed direction.
- Private cloud or on-premise deployment.
- WORM audit log direction.
- RBAC/ABAC.
- SLA and support.
- Custom broker adapters.

Limits:
- Requires commercial and legal review.
- Custom scope and deployment plan.

Add-ons:
- Dedicated support.
- Security review package.
- Custom data retention.
- Custom broker integration.

Compliance notes:
- Contract must define responsibility for kill switch, reconciliation, audit logs, and platform availability.

## 8. Usage-Based Add-ons

| Add-on | Unit Driver |
| --- | --- |
| AI diagnosis tokens | Report count / token consumption |
| Tick replay | Replay volume and history range |
| High-frequency replay | Data volume and compute |
| Backtest compute | Job count, CPU time, or queue priority |
| Strategy runner capacity | Runner hours |
| Data API usage | Requests or data transfer |
| Audit retention | Storage period and data volume |

## 9. Annual Billing and Retention

Annual billing can offer a discount in exchange for predictable ARR. Retention should come from data history, strategy workflow continuity, audit records, and operational trust rather than aggressive lock-in.

## 10. Enterprise Procurement Notes

Enterprise procurement will need:
- security questionnaire support
- data licensing clarity
- SLA
- support response terms
- privacy and retention terms
- audit logging model
- deployment responsibility matrix

## 11. Upgrade Path

Basic -> Pro: higher data precision and workflow readiness.  
Pro -> Elite: tick workflows, runner capacity, and AI diagnostics.  
Elite -> Enterprise: private deployment, SLA, RBAC/ABAC, and custom integrations.

## 12. Pricing Experiments

- Free tool-led lead magnets.
- Annual billing discount.
- AI diagnostics starter bundle.
- Data API trial quota.
- Enterprise pilot fee with conversion credit.

## 13. Guardrails

- Do not sell guaranteed returns.
- Do not present signal subscriptions as available without legal review.
- Do not offer copy trading or managed accounts by default.
- Do not collect payment credentials in the current skeleton.
- Keep live trading disabled by default.
