# Codex Project Rules

This repository contains the local development skeleton for the Taifex Quant Trading Platform: an enterprise-grade web platform for Taiwan Index Futures (TX/MTX/TMF) quantitative trading research, paper trading, and future controlled execution.

## Project Mission

- Provide a stable full-stack monorepo for FastAPI backend services, Next.js + TypeScript frontend surfaces, and Docker Compose local infrastructure.
- Preserve production-minded architecture from day one, especially the separation between strategy signals, risk checks, OMS state, and broker access.
- Keep local development safe, boring, idempotent, and immediately usable in VS Code and Codex IDE Extension.

## Hard Safety Rules

- Always preserve paper-trading defaults.
- Never enable live trading by default.
- Default runtime must remain `TRADING_MODE=paper`, `ENABLE_LIVE_TRADING=false`, and `BROKER_PROVIDER=paper`.
- Never place real broker credentials, API keys, account IDs, certificates, private keys, or secrets in source code.
- Never commit or generate `.env` with real values. Use `.env.example` for safe local defaults only.
- Strategy code must output signals only. Strategies must never call broker SDKs directly.
- Broker access must go through `broker-gateway`.
- All future orders must go through Risk Engine checks and OMS state management.
- Default broker provider must remain `paper` unless a human explicitly changes it in a safe environment.

## Architecture Rules

- Preserve the signal/execution split: Strategy Engine -> Risk Engine -> OMS -> Broker Gateway.
- Keep live trading gated behind explicit configuration, review, and operational controls.
- Broker SDKs belong only behind the Broker Gateway adapter boundary.
- OMS and Risk Engine boundaries must not be bypassed by UI, strategies, scripts, or tests.
- Preferred stack:
  - Backend: FastAPI
  - Frontend: Next.js + TypeScript
  - Local infrastructure: Docker Compose
- Document every new service or module in `docs/`.
- Keep local development boring, deterministic, and easy to re-run.

## Workflow Rules

- Work in small vertical slices that can be checked independently.
- Inspect existing files before patching them.
- Do not delete existing user work.
- Prefer explicit scripts over hidden setup logic.
- Keep changes idempotent so setup can be re-run safely.
- Run checks before finishing:
  - `bash scripts/check.sh`
  - `make check`
- If Docker, Node, Python, or network access is unavailable, report the exact blocked command and continue with the safest skeleton changes.

## Cloud-Native Roadmap Execution Rules

- Always implement one phase or one vertical slice at a time.
- Never bypass Risk Engine or OMS.
- Never place broker SDK calls inside `strategy-engine`.
- Never enable live trading.
- Keep the paper broker as the default.
- Add tests for backend APIs.
- Add docs for every new service.
- Run `make check` before finishing.
- Keep roadmap docs current.

## Business Operations and Marketing Rules

- Do not claim guaranteed returns.
- Do not write investment advice.
- Do not imply the platform trades for users.
- Do not market copy trading, managed accounts, signal subscriptions, or performance fees as available unless explicitly approved and legally reviewed.
- Position early revenue as SaaS tooling, data services, AI diagnostics, training, implementation, and enterprise licensing.
- Any broker fee-sharing, advisory, or discretionary trading model must be labeled compliance-dependent.
- Keep commercial copy aligned with `docs/compliance-boundary.md`.
- Keep live trading disabled by default.

## System Architecture Implementation Rules

- Control Plane must not execute trades.
- Trading/Data Plane owns market data, strategy runner, risk, OMS, broker gateway, and reconciliation.
- Strategies emit signals only.
- Broker SDK calls are forbidden outside `broker-gateway`.
- Risk Engine must approve before OMS/Broker Gateway.
- OMS must use deterministic state transitions and idempotency keys.
- `PaperBrokerGateway` is the only broker gateway allowed in the current implementation.
- Live trading remains disabled by default.
- No secrets in source code.
- K8s, Vault, and OpenTelemetry files are placeholders unless explicitly reviewed.
- Run `make architecture-safety-check` for architecture changes.
- Run `make check` before finishing.

## Website / Vercel Rules

- Website lives in `website/`.
- Keep the marketing website as a static Astro site unless explicitly changed later.
- Do not add analytics or third-party tracking without approval.
- Do not add investment advice, profit claims, risk-free claims, or passive income claims.
- Do not add live-trading onboarding forms or broker credential collection.
- Do not store Vercel tokens or manually create `.vercel/project.json`.
- Run `make website-build` before website deployment.
- Keep paper trading defaults visible in marketing copy.
