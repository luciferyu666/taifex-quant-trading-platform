# Customer Trial Feedback Workflow

## Purpose

This workflow defines how customers should report browser-only Interactive Demo
feedback and how reviewers should classify it. It closes the trial loop without
collecting secrets, broker credentials, broker account details, real trading
records, or personal financial information.

The workflow covers the public Web Command Center trial at:

```text
https://taifex-quant-trading-platform-front.vercel.app
```

Release posture:

- Production Trading Platform: NOT READY.
- `TRADING_MODE=paper`.
- `ENABLE_LIVE_TRADING=false`.
- `BROKER_PROVIDER=paper`.
- Live trading remains disabled by default.

## Customer Submission Checklist

Ask the customer to provide only non-sensitive trial information:

- Demo summary copied from the browser-only demo.
- Evidence JSON copied from the browser-only demo.
- Language version tested: `zh` / `en`.
- Browser and operating system.
- Production URL tested.
- Demo session timestamp.
- Furthest completed step:
  - `generate_market_tick`
  - `run_mock_strategy`
  - `simulate_paper_order`
  - `review_oms_timeline`
  - `review_position_pnl`
  - `copy_demo_summary`
  - `copy_evidence_json`
  - `reset_demo_session`
- Step where the customer got stuck, if any.
- Expected behavior.
- Actual behavior.
- Screenshot, if it does not reveal private information.
- Requested capability or business question.

Do not ask for or accept:

- Broker credentials.
- Broker account IDs.
- API keys.
- Certificates.
- Private keys.
- Real order IDs.
- Real account balances.
- Real positions.
- Real trading records.
- Personal financial information.
- Secrets from `.env` or any credential file.

## Feedback Categories

Use exactly one primary category for each feedback item:

| Category | Meaning |
| --- | --- |
| `ux_confusion` | Customer could operate the demo but did not understand labels, layout, or sequence. |
| `missing_guidance` | Customer needed more instruction, expected-result copy, or safety explanation. |
| `demo_runtime_issue` | Browser-only runtime failed, copied evidence was malformed, state reset failed, or controls did not behave as expected. |
| `product_request` | Customer requested a future product capability that stays within paper-only or hosted paper SaaS scope. |
| `safety_boundary_question` | Customer asked whether the demo involves live trading, broker connectivity, real market data, credentials, or investment advice. |
| `out_of_scope_live_trading` | Customer requested live trading, broker login, real order routing, account onboarding, managed accounts, copy trading, or signal service activation. |

Secondary tags may be added when useful:

- `copy_clarity`
- `bilingual_copy`
- `market_data_demo`
- `strategy_demo`
- `paper_order_demo`
- `oms_timeline`
- `portfolio_pnl`
- `evidence_json`
- `browser_compatibility`
- `hosted_saas_request`

## Internal Review Checklist

For each feedback item, reviewers should answer:

| Review question | Yes / No / Notes |
| --- | --- |
| Is this a UX issue? |  |
| Is this a documentation or guidance issue? |  |
| Is this a bilingual copy issue? |  |
| Is this a safety boundary misunderstanding? |  |
| Is this a product requirement? |  |
| Is this a browser-only runtime issue? |  |
| Does this require backend, hosted datastore, auth, tenant, or RBAC work? |  |
| Does this mention broker, live trading, credentials, real account data, or real orders? |  |
| Should this be marked `out_of_scope_live_trading`? |  |
| Does the submitted evidence JSON contain secrets or real trading data? |  |
| Is follow-up with the customer needed? |  |

## Triage Rules

1. If feedback asks for live trading, broker login, real order placement,
   credential upload, account opening, managed account services, copy trading, or
   signal subscriptions, mark it `out_of_scope_live_trading`.
2. If feedback asks whether the demo is live or investment advice, mark it
   `safety_boundary_question` and respond with the safety statement below.
3. If evidence JSON is missing safety flags, ask the customer to recopy evidence
   from the production Web App and do not infer missing fields.
4. If evidence JSON includes credentials, broker account data, real orders, or
   private trading records, stop processing it, delete the unsafe copy according
   to internal policy, and ask for a sanitized resubmission.
5. If a product request is valid but requires hosted backend, managed datastore,
   auth, tenant isolation, or RBAC, link it to the hosted paper SaaS roadmap.
6. Do not convert simulated PnL feedback into a performance claim, investment
   recommendation, strategy ranking, or alpha statement.

## Standard Safety Response

Use this response when customers ask about live trading or real accounts:

```text
This trial is Paper Only and browser-only. It uses deterministic mock data and
does not connect to brokers, download real market data, collect credentials,
create real orders, or provide investment advice. Production Trading Platform
status remains NOT READY. Live trading remains disabled by default.
```

## Reviewer Output

Each reviewed item should produce:

- Feedback ID.
- Customer / organization.
- Date received.
- Primary category.
- Secondary tags.
- Demo step affected.
- Evidence JSON present: yes / no.
- Evidence JSON sanitized: yes / no.
- Safety boundary issue: yes / no.
- Recommended next action:
  - `no_action`
  - `copy_update`
  - `docs_update`
  - `ui_follow_up`
  - `runtime_bug`
  - `product_backlog`
  - `hosted_saas_backlog`
  - `out_of_scope_close`
- Owner.
- Follow-up due date.

## Validation

Before using this workflow in a customer trial, run:

```bash
make customer-evaluation-check
make interactive-demo-conversion-check
make frontend-production-smoke-check
```

For release validation, run:

```bash
make check
```

Live trading remains disabled by default.
