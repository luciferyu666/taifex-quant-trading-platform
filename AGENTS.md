# AGENTS.md

High-signal project rules for Codex. Treat this file as the default context and avoid restating it unless the user asks.

## Project Snapshot

- Repo: `taifex-quant-trading-platform`.
- Domain: Taiwan Index Futures quant infrastructure for TX / MTX / TMF.
- Current posture: Marketing Website, Web Command Center, Local Paper Demo, and Hosted Paper readiness contracts.
- Not production trading. Hosted Paper SaaS is not enabled. Live trading remains disabled by default.
- Production Vercel frontend can show UI and fallback/readiness data, but cannot read local SQLite. Actual paper records require local backend + local SQLite until a reviewed hosted backend/datastore exists.

## Non-Negotiable Safety

- Keep `.env.example` safe: `TRADING_MODE=paper`, `ENABLE_LIVE_TRADING=false`, `BROKER_PROVIDER=paper`.
- Never edit `.env`, commit secrets, collect credentials, or add broker API keys/account IDs/certificates.
- Never enable live trading, live approval, broker login, real order submission, real account data, or investment advice.
- Keep live trading disabled by default.
- Do not write investment advice.
- Strategies emit standardized signals only. They must never call broker SDKs.
- Any order-like flow must go through Risk Engine -> OMS -> Paper Broker Gateway.
- Risk Engine must approve before OMS/Broker Gateway.
- Current broker path is paper-only. Real Shioaji/Fubon adapters are future work only.
- Do not claim profitability, alpha, risk-free trading, production OMS, WORM audit compliance, or production trading readiness.
- Do not claim guaranteed returns.

## Current Product Boundaries

- Paper execution is customer-demo capable, but still paper/local scaffolding.
- Approval workflow is local paper scaffolding, not a formal compliance approval system.
- Paper OMS is not production OMS: durable queue/outbox, async processing, amend/replace, execution reports, and reconciliation remain readiness/blueprint work.
- Audit persistence is local SQLite/hash-chain preview, not WORM or immutable ledger.
- Paper Risk Engine is expanded but paper/local state only, not cross-account production risk.
- Paper Broker simulation is deterministic/local quote-based, not real market matching or broker execution reports.
- Hosted backend/API, managed datastore, login/session, RBAC/ABAC, customer account, and tenant isolation are readiness contracts unless explicitly implemented later.

## Work Style

- Implement one narrow vertical slice at a time.
- Use `docs/web-app-ai-pipeline.md` and `.codex/prompts/20-web-app-ai-pipeline.md` for repeatable Web App tasks.
- Inspect existing files before patching. Preserve user work. Make changes idempotent.
- Prefer repo patterns over new abstractions.
- Add or update tests/docs/check scripts for API, domain, frontend, infra, or safety changes.
- Use `rg`, `sed`, `nl`, `git diff`, and `apply_patch`; avoid noisy chained shell output.
- Do not run Docker, deploy Kubernetes, apply Vault policy, or deploy to Vercel unless the user explicitly asks or an existing make target safely does it.
- Do not commit/push unless the user asks, or the task explicitly includes commit/push.

## Validation Shortcuts

- General gate: `make check`.
- Release gate: `make release-readiness-check` and `RELEASE_READINESS_STRICT=1 make release-readiness-check`.
- Frontend: `make frontend-i18n-check`, `cd frontend && npm run typecheck && npm run build`.
- Production smoke: `make frontend-production-smoke-check`.
- Website: `make website-content-check`, `cd website && npm run check && npm run build`.
- Paper workflow: `make paper-approval-workflow-check`, `make paper-simulation-submit-check`, `make paper-execution-persistence-check`.
- Risk/broker/audit readiness: use the matching `make paper-*-check` target if present.
- Hosted readiness: use the matching `make hosted-*-check` target if present.

If dependencies are unavailable, report the exact failed command and reason. Do not claim a skipped check passed.

## Docs And Release Trail

- Main release record: `docs/release-verification-record-2026-04-28.md`.
- Baseline: `docs/release-baseline-v0.1.0.md`.
- SaaS roadmap: `docs/hosted-paper-saas-foundation-roadmap.md`.
- Safety boundary: `docs/paper-shadow-live-boundary.md`, `docs/trading-safety.md`.
- Facebook public actions must be manual by the authorized account owner; Codex only prepares runbooks/content.
- Avoid infinite docs-only deployment refresh loops. Record feature verification once; only add deployment refresh entries when explicitly requested.

## Facebook Growth Operations Rules

- Do not automate Facebook login or posting.
- Do not scrape Facebook.
- Do not request or store Facebook credentials, cookies, sessions, tokens, passwords, or API keys.
- Content generation, content queues, UTM links, manual runbooks, and daily packs are allowed.
- Chrome tab opening for manual review is allowed; it must not click, submit, scrape, or publish.
- Manual account-owner publishing only.
- Avoid spam and repetitive content.
- Respect third-party group rules before posting.
- Preserve Paper Only, 不構成投資建議, and `ENABLE_LIVE_TRADING=false`.
- Never promise profit.
- Never offer signals, copy trading, managed accounts, or investment advice.

## Response Rules

- Be concise and factual.
- For “next best topic” requests, propose one safe next slice with reason, scope, safety boundary, and validation commands.
- For status/audit questions, clearly separate completed, partial, not ready, and blocked items.
- End safety-sensitive work with: `Live trading remains disabled by default.`
