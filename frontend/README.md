# Frontend

Next.js + TypeScript dashboard skeleton for the Taifex Quant Trading Platform.

## Responsibilities

- Show local system health and safety defaults.
- Present the module roadmap without direct broker access.
- Render safely even when the backend is unavailable.

## Local Commands

```bash
npm run dev
npm run lint
npm run typecheck
npm run build
```

## Bilingual Safety QA

The Command Center supports English and Traditional Chinese through
`frontend/app/i18n.ts`.

Run the local content gate before changing dashboard copy:

```bash
make frontend-i18n-check
```

The check verifies:

- English and Traditional Chinese copy blocks are present.
- `TRADING_MODE`, `ENABLE_LIVE_TRADING`, `BROKER_PROVIDER`, `paper`, and
  `NOT READY` remain visible in the UI copy.
- Traditional Chinese safety copy keeps `實盤關閉` and `僅限紙上交易`.
- High-risk phrases such as guaranteed profit, risk-free, 保證獲利, 零風險,
  and unqualified live-trading approval language are rejected.

## Vercel Deployment

The Web Command Center is deployed as a separate Vercel project from the
marketing website.

- Vercel project: `taifex-quant-trading-platform-frontend`
- Git repository: `luciferyu666/taifex-quant-trading-platform`
- Production branch: `main`
- Root directory: `frontend`
- Framework preset: `Next.js`
- Install command: `npm install`
- Build command: `npm run build`
- Production URL: <https://taifex-quant-trading-platform-front.vercel.app>

The dashboard is read-only and uses paper-safe fallback data when the backend is
not publicly reachable. It must not add live-trading controls, broker
credentials, order approval controls, or production-trading claims.
