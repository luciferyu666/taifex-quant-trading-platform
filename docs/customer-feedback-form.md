# Customer Feedback Form

## Purpose

Use this form to collect structured feedback from controlled customer evaluations. Do not collect secrets, broker credentials, API keys, certificates, account IDs, personal financial information, or private trading records.

## Evaluation Metadata

| Field | Response |
| --- | --- |
| Date |  |
| Customer / organization |  |
| Reviewer role |  |
| Evaluator type | Individual trader / professional trader / institution / broker partner / technical advisor / other |
| Demo presenter |  |
| Marketing Website URL tested |  |
| Web Command Center URL tested |  |
| Release baseline shown | `v0.1.0-paper-research-preview` |
| Production Trading Platform status acknowledged | NOT READY |
| Live trading disabled acknowledged | Yes / No |

## Product Clarity

| Question | Rating / Notes |
| --- | --- |
| Was the product positioning clear? |  |
| Was it clear this is infrastructure, not a simple trading bot? |  |
| Was the TX / MTX / TMF exposure model understandable? |  |
| Was the paper-first safety posture clear? |  |
| Was the NOT READY production trading status clear? |  |
| Was the compliance boundary clear? |  |

## Web Command Center Feedback

| Question | Rating / Notes |
| --- | --- |
| Was the release baseline panel useful? |  |
| Was the bilingual switch useful? |  |
| Was the local JSON review packet flow understandable? |  |
| Was the UI clearly read-only? |  |
| Was any wording confusing or too technical? |  |
| What information should be more prominent? |  |

## Browser-only Interactive Demo Feedback

Use `docs/customer-trial-feedback-workflow.md` when reviewing this section.

| Field | Response |
| --- | --- |
| Language version tested | zh / en |
| Browser / operating system |  |
| Production Web App URL tested |  |
| Demo summary copied | Yes / No |
| Evidence JSON copied | Yes / No |
| Furthest completed step | generate_market_tick / run_mock_strategy / simulate_paper_order / review_oms_timeline / review_position_pnl / copy_demo_summary / copy_evidence_json / reset_demo_session |
| Step where evaluator got stuck |  |
| Expected behavior |  |
| Actual behavior |  |
| Requested capability |  |

## Feedback Classification

Pick one primary category:

| Category | Selected |
| --- | --- |
| `ux_confusion` |  |
| `missing_guidance` |  |
| `demo_runtime_issue` |  |
| `product_request` |  |
| `safety_boundary_question` |  |
| `out_of_scope_live_trading` |  |

Optional secondary tags:

| Tag | Selected |
| --- | --- |
| `copy_clarity` |  |
| `bilingual_copy` |  |
| `market_data_demo` |  |
| `strategy_demo` |  |
| `paper_order_demo` |  |
| `oms_timeline` |  |
| `portfolio_pnl` |  |
| `evidence_json` |  |
| `browser_compatibility` |  |
| `hosted_saas_request` |  |

## Internal Review Checklist

| Review question | Yes / No / Notes |
| --- | --- |
| Is this a UX issue? |  |
| Is this a documentation or guidance issue? |  |
| Is this a bilingual copy issue? |  |
| Is this a safety boundary misunderstanding? |  |
| Is this a product requirement? |  |
| Is this a browser-only runtime issue? |  |
| Does this require hosted backend, managed datastore, auth, tenant, or RBAC work? |  |
| Does this mention broker, live trading, credentials, broker account, real account data, or real orders? |  |
| Should this be marked `out_of_scope_live_trading`? |  |
| Is follow-up with the customer needed? |  |

## Enterprise / Partner Requirements

| Topic | Notes |
| --- | --- |
| Data governance requirements |  |
| Rollover / continuous futures requirements |  |
| Backtest reproducibility requirements |  |
| Broker integration requirements |  |
| Risk Engine / OMS requirements |  |
| Audit trail requirements |  |
| Security / RBAC / SSO requirements |  |
| Deployment / private cloud requirements |  |
| Compliance / legal review requirements |  |

## Requested Capabilities

List requested features. Mark whether each is:

- presentation / website
- read-only command center
- paper research
- paper execution future
- production trading future
- compliance-dependent future

| Request | Category | Priority | Compliance or safety notes |
| --- | --- | --- | --- |
|  |  |  |  |

## Explicit Non-Requests

Confirm the customer did not request any of the following during the evaluation:

| Item | Confirmed |
| --- | --- |
| Real broker credentials |  |
| Broker account IDs |  |
| API keys, certificates, private keys, or secrets |  |
| Live order placement |  |
| Real account balances, positions, or trading records |  |
| Account opening |  |
| Managed account service |  |
| Copy trading activation |  |
| Signal subscription activation |  |
| Guaranteed profit or risk-free claim |  |

## Follow-Up Actions

| Action | Owner | Due date | Notes |
| --- | --- | --- | --- |
|  |  |  |  |

## Safety Acknowledgement

The customer evaluation covered presentation, browser-only Interactive Demo,
internal demo, and paper research preview capabilities only. The platform is not
production trading ready, does not provide investment advice, does not promise
performance, does not collect credentials, and does not enable live trading by
default.

Live trading remains disabled by default.
