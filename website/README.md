# Taifex Quant Trading Platform Website

Static Astro marketing website for the Taifex Quant Trading Platform monorepo.

The site is investor-facing and broker/enterprise friendly. It presents the platform vision, architecture,
commercial model, roadmap, and safety-first trading principles without requiring backend services at runtime.

## Local Development

```bash
cd website
npm install
npm run dev
```

## Build

```bash
cd website
npm run build
```

## Preview

```bash
cd website
npm run preview
```

## Internationalization

- English: `/`
- Traditional Chinese: `/zh/`
- Language switch links are static and do not require backend runtime.

## Commercial Pages

- English: `/business/`, `/pricing/`, `/go-to-market/`, `/compliance/`
- Traditional Chinese: `/zh/business/`, `/zh/pricing/`, `/zh/go-to-market/`, `/zh/compliance/`

Commercial pages must stay aligned with `../docs/compliance-boundary.md`.

## Safety Copy Rules

- Keep `TRADING_MODE=paper`, `ENABLE_LIVE_TRADING=false`, and `BROKER_PROVIDER=paper` visible.
- Do not add investment advice or profit claims.
- Do not add live-trading onboarding forms.
- Do not collect broker credentials, API keys, account IDs, or certificates.
