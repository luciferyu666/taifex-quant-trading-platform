# Website Conversion QA

This checklist keeps the investor-facing Astro website aligned with the platform's commercial positioning and trading safety boundary. It is intended for every website copy, visual hierarchy, or conversion-focused change.

## Purpose

The website should communicate the platform as a Taiwan Index Futures Trading OS: data governance, strategy research, reproducible backtests, paper/shadow workflows, risk controls, OMS, broker-gateway isolation, auditability, and future enterprise controls.

It must not drift into investment advice, profit promises, broker onboarding, live-trading activation, or checkout flows.

## Automated Checks

Run:

```bash
make website-content-check
```

This runs:

```bash
cd website && node scripts/check-content-safety.mjs
cd website && node scripts/check-i18n-content.mjs
```

The checks validate:

- Hero copy keeps the Trading OS positioning in English and Traditional Chinese.
- Safety defaults remain visible: `TRADING_MODE=paper`, `ENABLE_LIVE_TRADING=false`, `BROKER_PROVIDER=paper`.
- English and Chinese copy include a clear not-investment-advice / non-advisory statement.
- KPI content on the go-to-market pages is rendered as cards instead of a long text run.
- CTA labels and links do not imply account opening, live-trading activation, order submission, copy trading, or broker onboarding.
- Prohibited claims are not used as positive marketing copy.
- Bilingual routes and key content sections remain paired.

## Prohibited Positive Claims

These phrases may only appear in compliance-warning contexts, never as promotional copy:

- `guaranteed profit`
- `risk-free`
- `fully automated money machine`
- `guaranteed alpha`
- `principal guaranteed`
- `no loss`
- `保證獲利`
- `零風險`
- `全自動賺錢機器`
- `保證 alpha`
- `本金保證`
- `不會虧損`

Safer wording:

- research tooling
- paper trading
- infrastructure
- risk controls
- auditability
- user-controlled workflows
- compliance-dependent future service

## Visual Regression Checklist

Before deploying website changes, inspect the pages below on desktop and mobile widths:

- `/`
- `/zh/`
- `/business/`
- `/zh/business/`
- `/go-to-market/`
- `/zh/go-to-market/`
- `/pricing/`
- `/zh/pricing/`
- `/compliance/`
- `/zh/compliance/`

Verify:

- Hero headline, subtitle, CTA row, and value cards do not overlap.
- KPI dashboard uses separate cards with clear group labels, metric names, and explanatory copy.
- Commercial model cards retain distinct headings, service logic, use cases, customer value, and compliance notes.
- Section headings have enough vertical spacing from cards below them.
- Buttons fit their text on mobile.
- Navigation wraps cleanly and does not cover content.
- Chinese text does not overflow cards.
- English text does not collapse into a single dense paragraph.
- Safety defaults remain visually prominent.

## Deployment Gate

Before pushing a website deployment:

```bash
make website-content-check
cd website && npm run check
cd website && npm run build
make check
```

If a visual change is intentional but an automated content check fails, update the check and this document in the same commit so the new rule is explicit.

## Non-Goals

- Do not add analytics or third-party tracking without approval.
- Do not add payment checkout, subscriptions, or account onboarding.
- Do not add broker credential forms.
- Do not add live-trading activation flows.
- Do not market copy trading, signal subscriptions, managed accounts, performance fees, or broker fee-sharing as available products.
