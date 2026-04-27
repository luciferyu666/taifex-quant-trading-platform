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
