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

## Safety Copy Rules

- Keep `TRADING_MODE=paper`, `ENABLE_LIVE_TRADING=false`, and `BROKER_PROVIDER=paper` visible.
- Do not add investment advice or profit claims.
- Do not add live-trading onboarding forms.
- Do not collect broker credentials, API keys, account IDs, or certificates.
