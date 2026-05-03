# Web App AI Pipeline

This pipeline lets Codex work on the Web App without re-reading or re-stating the full project history every turn.

## Goal

Convert user requests into small, safe, testable Web App slices while preserving the platform boundary:

```text
Paper Only -> no broker -> no secrets -> no live trading -> no production trading claim
```

Use this file with `AGENTS.md`. Do not paste the full README or release record into every prompt.

## Minimal Intake

Every Web App task should provide only:

```text
Goal:
Target slice:
Allowed files or surfaces:
Required checks:
Commit/push/deploy: yes/no
```

If omitted, Codex should infer the smallest safe slice and avoid commit/push/deploy.

## Standard Pipeline

1. **Orient**
   - Read `AGENTS.md`.
   - Read only the docs directly related to the requested slice.
   - Check `git status --short --branch`.

2. **Classify Slice**
   - Frontend UI
   - Backend API/domain
   - Paper workflow
   - Hosted readiness contract
   - Evidence export/viewer
   - Website/marketing
   - Release verification record
   - Docs/runbook only

3. **Apply Boundary**
   - Read-only UI must not call mutation endpoints.
   - Paper actions must remain Paper Only and local/simulated.
   - Hosted readiness contracts must not create accounts, tenants, sessions, DB writes, broker calls, or orders.
   - Evidence exports default to stdout and only write local JSON with explicit `--output`.

4. **Patch**
   - Add domain/API tests for backend changes.
   - Add i18n and safety-copy checks for frontend changes.
   - Add Makefile/script checks when a new contract or evidence flow is created.
   - Update the nearest docs page, not every docs page.

5. **Validate**
   - Always: `git diff --check`.
   - Backend: targeted `pytest`, then `make check` when feasible.
   - Frontend: `make frontend-i18n-check`, `cd frontend && npm run typecheck && npm run build`.
   - Hosted/frontend production copy: `make frontend-production-smoke-check`.
   - Website: `make website-content-check`, `cd website && npm run check && npm run build`.

6. **Ship**
   - Commit/push only when requested.
   - If pushed to `main`, check `gh run list --workflow "Release Readiness" --limit 5`.
   - If frontend changed, check Vercel alias and run production smoke.
   - Update release record only when explicitly requested, or when the task is a verification-record slice.

## File Map

| Area | Primary paths |
| --- | --- |
| Backend API | `backend/app/api/` |
| Backend domain | `backend/app/domain/` |
| Backend services | `backend/app/services/` |
| Backend tests | `backend/tests/` |
| Command Center | `frontend/app/`, `frontend/app/components/`, `frontend/app/i18n.ts` |
| Frontend QA | `frontend/scripts/` |
| Marketing site | `website/` |
| Data pipeline | `data-pipeline/` |
| Scripts | `scripts/` |
| Docs | `docs/` |
| Codex prompts | `.codex/prompts/` |

## Slice Recipes

### Frontend Read-Only Panel

Required:
- component in `frontend/app/components/`
- i18n keys in `frontend/app/i18n.ts`
- page wiring in `frontend/app/page.tsx`
- safety checks in `frontend/scripts/check-command-center-i18n.mjs`
- docs update

Validation:

```bash
make frontend-i18n-check
cd frontend && npm run typecheck
cd frontend && npm run build
make check
```

### Backend Readiness Contract

Required:
- domain response model
- read-only API route
- backend route tests
- docs page
- Makefile/check script if contract becomes a gate

Validation:

```bash
make <matching-readiness-check>
cd backend && .venv/bin/python -m pytest tests/<matching_test>.py
make check
```

### Paper Workflow Slice

Required:
- Paper Only flags
- Risk Engine and OMS in path
- no real broker
- audit event coverage
- backend tests
- UI cannot show live approval

Validation:

```bash
make paper-approval-workflow-check
make paper-simulation-submit-check
make paper-execution-persistence-check
make check
```

### Evidence Export / Viewer

Required:
- export script defaults to stdout
- `--output` only for local small JSON
- read-only local JSON viewer if UI is added
- reject unsafe flags

Validation:

```bash
make <evidence-export-target>
make frontend-i18n-check
cd frontend && npm run typecheck
make check
```

### Verification Record Slice

Required:
- update only `docs/release-verification-record-2026-04-28.md`
- include commit, CI run, Vercel deployment id if relevant, production smoke result, and safety boundary
- avoid recursive docs-only deployment refresh unless explicitly requested

Validation:

```bash
git diff --check
make frontend-production-smoke-check
git status --short --branch
```

## Token-Saving Prompt Pattern

Use this instead of long background prompts:

```text
Read AGENTS.md and docs/web-app-ai-pipeline.md.
Task: <one-sentence goal>
Slice type: <frontend/backend/paper/hosted/evidence/docs/release>
Constraints: Paper Only, no broker, no secrets, no live trading.
Validation: <commands>
Commit/push: <yes/no>
```

## Stop Conditions

Stop and report instead of guessing if:

- target repo path is inaccessible
- dependency install is required but unsafe
- task asks for live trading, real broker integration, credential collection, or real account data
- a change would require modifying `.env`
- a requested deployment/action would publish externally without explicit approval

Live trading remains disabled by default.
