# Web App AI Pipeline Prompt

Use this prompt for repeatable Web App work without pasting the full project history.

## Required First Reads

1. `AGENTS.md`
2. `docs/web-app-ai-pipeline.md`
3. Only the docs directly related to the requested slice

## Operating Mode

Work as a small-slice implementation agent:

- Inspect before editing.
- Preserve user work.
- Keep changes idempotent.
- Prefer existing repo patterns.
- Add tests/docs/check scripts only where the slice needs them.
- Do not commit/push/deploy unless explicitly requested.

## Safety Boundary

- Paper Only.
- `TRADING_MODE=paper`
- `ENABLE_LIVE_TRADING=false`
- `BROKER_PROVIDER=paper`
- No secrets.
- No `.env` edits.
- No broker SDK calls.
- No credential collection.
- No live approval.
- No real orders.
- No investment advice or performance claims.
- No production trading readiness claim.

## Slice Classifier

Classify the task as one of:

- frontend-read-only-panel
- backend-readiness-contract
- paper-workflow
- evidence-export
- evidence-viewer
- website-content
- release-verification-record
- docs-runbook
- next-topic-advice

Then implement only that slice.

## Default Validation

Always run:

```bash
git diff --check
```

Add the narrow relevant checks:

```bash
make frontend-i18n-check
cd frontend && npm run typecheck
cd frontend && npm run build
cd backend && .venv/bin/python -m pytest <targeted tests>
make check
```

For production-facing frontend changes:

```bash
make frontend-production-smoke-check
```

## Final Report

Report:

1. What changed
2. Files changed
3. Validation passed
4. Commit/push/deploy status
5. Next best slice
6. Safety confirmation

Final sentence:

```text
Live trading remains disabled by default.
```
