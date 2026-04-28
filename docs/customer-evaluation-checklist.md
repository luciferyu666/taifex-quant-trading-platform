# Customer Evaluation Checklist

## Purpose

Use this checklist before, during, and after a customer evaluation. It prevents the demo from drifting into production trading claims or unsafe testing.

## Pre-Demo Readiness

| Check | Status |
| --- | --- |
| `git status --short --branch` is clean or understood |  |
| `make customer-evaluation-check` passes |  |
| `make frontend-production-smoke-check` passes |  |
| Latest `Release Readiness` GitHub Actions run is successful |  |
| Web Command Center production alias is `Ready` |  |
| Marketing Website is reachable |  |
| `.env.example` contains `TRADING_MODE=paper` |  |
| `.env.example` contains `ENABLE_LIVE_TRADING=false` |  |
| `.env.example` contains `BROKER_PROVIDER=paper` |  |
| No private credentials, certificates, account IDs, or secrets are used |  |

## Demo Scope Checklist

Allowed:

- Marketing Website walkthrough.
- Web Command Center read-only walkthrough.
- English / Traditional Chinese language switch.
- Release baseline and NOT READY status review.
- Safety defaults review.
- Local JSON packet viewer demo using approved fixtures.
- Discussion of future architecture and roadmap.
- Discussion of customer requirements and workflow gaps.

Not allowed:

- Live order placement.
- Broker login.
- Broker SDK setup.
- Real customer account IDs.
- API key or certificate input.
- Payment checkout.
- Account opening.
- Strategy ranking as an investment recommendation.
- Managed account, copy trading, or signal subscription activation.
- Any statement that the platform is production trading ready.

## Customer Tasks

Ask the customer to evaluate:

| Task | Expected result |
| --- | --- |
| Open Marketing Website | Customer can understand product positioning and safety boundary. |
| Switch website language if available | Customer can review bilingual commercial and safety copy. |
| Open Web Command Center | Customer sees paper-first, read-only, NOT READY status. |
| Switch Command Center language | Customer sees English and Traditional Chinese safety copy. |
| Review release baseline panel | Customer understands current release level. |
| Review local JSON loader behavior | Customer understands review packets are local and read-only. |
| Review known limitations | Customer confirms this is not a production trading system. |
| Provide feedback | Feedback is captured without collecting secrets or account information. |

## Acceptance Criteria

Customer evaluation is acceptable when:

- Customer can access the URLs.
- Safety copy is visible and understood.
- No real trading credentials are requested or entered.
- Customer understands live trading is disabled.
- Customer understands the product is not production trading ready.
- Feedback is captured in a structured form.

Customer evaluation is not acceptable when:

- Customer expects live order submission.
- Customer wants to connect a real broker account during the demo.
- Customer asks for investment advice or performance claims.
- Customer requests copy trading, managed accounts, or signal service activation.
- The demo presenter cannot explain the paper-only and NOT READY boundary.

## Post-Demo Checklist

- Record feedback in `docs/customer-feedback-form.md` format.
- Do not commit customer secrets, screenshots with private data, account identifiers, or proprietary source material.
- Convert product requests into future roadmap items only after safety and compliance review.
- Keep live trading disabled by default.

Live trading remains disabled by default.
