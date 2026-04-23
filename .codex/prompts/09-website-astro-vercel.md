# Website Astro + Vercel Task

Read `AGENTS.md`, then inspect `website/`, `README.md`, `docs/website-vercel-deploy.md`, and `.env.example`.

Preserve all safety and compliance wording:

- Do not add investment advice or profit claims.
- Do not add secrets, broker credentials, account IDs, API keys, or certificates.
- Keep `TRADING_MODE=paper`, `ENABLE_LIVE_TRADING=false`, and `BROKER_PROVIDER=paper` visible.
- Keep strategies signal-only and broker SDK access isolated behind `broker-gateway`.
- Keep the Astro site static unless explicitly asked to change it.

Run `make website-build` before finishing. If dependencies are missing, install them in `website/` and rerun the failing command.
