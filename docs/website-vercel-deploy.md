# Website Vercel Deployment

The marketing website is a static Astro site in `website/`. It does not require the backend, broker services,
or trading infrastructure at runtime.

## Local Website Development

```bash
cd website
npm install
npm run dev
```

## Local Build

```bash
cd website
npm run build
```

## Preview

```bash
cd website
npm run preview
```

## Deploy From Repository Root

```bash
vercel --prod
```

## Deploy With Makefile

```bash
make website-deploy
```

The deployment helper builds the website first, then calls the Vercel CLI. It does not store tokens and does not
create `.vercel/project.json` manually.

## Vercel Dashboard Setup

Option A: repository root as Root Directory

- Root Directory: repository root
- Build Command: `cd website && npm install && npm run build`
- Output Directory: `website/dist`

Option B: `website` as Root Directory

- Root Directory: `website`
- Framework: Astro
- Build Command: `npm run build`
- Output Directory: `dist`

## Node Version

Use Node.js `22.12.0` or higher. The website includes `website/.nvmrc`.

## Safety and Compliance Copy Checklist

- Keep `TRADING_MODE=paper`, `ENABLE_LIVE_TRADING=false`, and `BROKER_PROVIDER=paper` visible.
- State that this project is not investment advice.
- Do not claim guaranteed profit, risk-free trading, passive income, or production trading readiness.
- Keep strategy/execution separation visible.
- Keep broker SDK isolation and Risk Engine / OMS routing visible.

## Troubleshooting

- Node version too old: install Node.js `22.12.0` or newer, then rerun `npm install`.
- Vercel CLI not installed: install it with `npm i -g vercel`.
- Not logged in to Vercel: run `vercel login`.
- Build fails due to missing dependencies: run `cd website && npm install`.
- Wrong output directory in Vercel: use `website/dist` for repo-root deployment or `dist` when Root Directory is `website`.
