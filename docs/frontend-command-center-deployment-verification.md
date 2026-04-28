# Frontend Command Center Deployment Verification

This runbook verifies that the standalone Web Command Center deployment on Vercel is current, reachable, bilingual, and still paper-first. It is a deployment verification checklist only; it does not deploy, approve live trading, call brokers, or write data.

## Scope

- Project: `taifex-quant-trading-platform-frontend`
- Production alias: `https://taifex-quant-trading-platform-front.vercel.app`
- Local project directory: `frontend/`
- Expected default posture: paper-only, read-only, and not production trading ready

## Preconditions

- Vercel CLI is installed and authenticated.
- The local repository is on `main`.
- Latest intended changes have already been pushed to GitHub.
- Vercel GitHub auto-deploy is configured for the frontend project.

```bash
cd "/mnt/f/From C download/taifex-quant-trading-platform/frontend"
vercel --version
```

## 1. List Recent Deployments

Use `vercel ls` to confirm a recent production deployment exists and is `Ready`.

```bash
cd "/mnt/f/From C download/taifex-quant-trading-platform/frontend"
vercel ls
```

Expected result:

- Project is `taifex-quant-trading-platform-frontend`.
- Latest deployment status is `Ready`.
- Latest deployment environment is `Production`.
- Deployment age matches the most recent `main` push or expected Vercel auto-deploy window.

## 2. Inspect Production Alias

Inspect the production alias, not only the generated deployment URL.

```bash
vercel inspect https://taifex-quant-trading-platform-front.vercel.app
```

Expected result:

- `target` is `production`.
- `status` is `Ready`.
- `Aliases` includes `https://taifex-quant-trading-platform-front.vercel.app`.
- The deployment id matches the latest expected production deployment.

## 3. Production Alias Smoke Check

Confirm the production alias returns HTTP 200.

```bash
curl -I https://taifex-quant-trading-platform-front.vercel.app/
curl -I "https://taifex-quant-trading-platform-front.vercel.app/?lang=zh"
```

Expected result:

- HTTP status is `200`.
- Response server is Vercel.
- The `data-dpl-id` or static asset query string in the HTML should match the deployment inspected above when checking full HTML.

## 4. Bilingual Safety Copy Smoke Check

Check that production HTML contains required safety copy in both Traditional Chinese and English.

```bash
curl -L -s "https://taifex-quant-trading-platform-front.vercel.app/?lang=zh" \
  | rg "實盤關閉|僅限紙上交易|NOT READY|ENABLE_LIVE_TRADING"

curl -L -s "https://taifex-quant-trading-platform-front.vercel.app/?lang=en" \
  | rg "Paper-first|Paper Only|NOT READY|ENABLE_LIVE_TRADING"
```

Expected result:

- Traditional Chinese page contains `實盤關閉`.
- Traditional Chinese page contains `僅限紙上交易`.
- English page contains `Paper-first`.
- English page contains `Paper Only`.
- Both pages contain `NOT READY`.
- Both pages contain `ENABLE_LIVE_TRADING`.

Note: Next.js production HTML may be minified into very long lines, so `rg` can print large HTML lines. This is acceptable as long as the command exits successfully and the matched text is present.

## 5. Local QA Gate

Before declaring the deployment verified, run the local frontend i18n gate and the repository check gate.

```bash
cd "/mnt/f/From C download/taifex-quant-trading-platform"
make frontend-i18n-check
make frontend-production-smoke-check
make check
```

Expected result:

- Command Center i18n QA check passes.
- Production Command Center smoke check returns HTTP 200 and finds bilingual safety copy.
- Required English and Traditional Chinese safety copy is present.
- Prohibited claims are not found.
- `make check` completes with live trading disabled.

The production smoke check is read-only. It fetches the production alias, checks deployment id markers, validates bilingual safety copy, and rejects unsafe positive claims. It does not deploy, write data, call brokers, or approve trading.

You can override the production URL for a staging alias without editing source files:

```bash
FRONTEND_PRODUCTION_URL="https://example.vercel.app" make frontend-production-smoke-check
```

## 6. Git Clean State Check

Confirm deployment verification did not generate local source changes.

```bash
git status --short --branch
```

Expected result:

```text
## main...origin/main
```

If files are modified, inspect them before committing or discarding. Do not commit generated build artifacts, Vercel local state, logs, report JSON, `.env`, or secrets.

## 7. Live Trading Disabled Confirmation

Verify safe environment defaults remain present.

```bash
grep -n "TRADING_MODE=paper" .env.example
grep -n "ENABLE_LIVE_TRADING=false" .env.example
grep -n "BROKER_PROVIDER=paper" .env.example
```

Expected result:

- `TRADING_MODE=paper`
- `ENABLE_LIVE_TRADING=false`
- `BROKER_PROVIDER=paper`

The Web Command Center must remain read-only. It must not expose live trading approval, paper execution approval, real broker login, account opening, order submission, or strategy ranking controls.

## Troubleshooting

### `vercel ls` does not show the latest push

- Confirm the frontend project is connected to the correct GitHub repository.
- Confirm Vercel project root points to `frontend/`.
- Check Vercel Dashboard deployments for failed builds.
- Re-run local checks:

```bash
cd "/mnt/f/From C download/taifex-quant-trading-platform/frontend"
npm run typecheck
npm run build
```

### Production alias points to an older deployment

- Inspect the latest deployment URL from `vercel ls`.
- Confirm the latest deployment is production, not preview.
- Check whether GitHub auto-deploy is enabled for `main`.
- If manual deployment is intentionally required, use:

```bash
cd "/mnt/f/From C download/taifex-quant-trading-platform/frontend"
vercel --prod
```

### Smoke check cannot find safety copy

- Run:

```bash
cd "/mnt/f/From C download/taifex-quant-trading-platform"
make frontend-i18n-check
make frontend-production-smoke-check
```

- Check `frontend/app/i18n.ts` and `frontend/app/page.tsx`.
- Do not remove paper-first, read-only, `NOT READY`, or live-disabled copy.

## Verification Record Template

Use this format in release notes or PR comments:

```text
Frontend Command Center deployment verification:
- Vercel project: taifex-quant-trading-platform-frontend
- Production alias: https://taifex-quant-trading-platform-front.vercel.app
- Deployment id:
- Deployment status: Ready
- Chinese smoke check: passed
- English smoke check: passed
- make frontend-i18n-check: passed
- make frontend-production-smoke-check: passed
- make check: passed
- git status: clean
- Live trading remains disabled by default.
```
