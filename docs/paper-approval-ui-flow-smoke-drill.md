# Paper Approval UI Flow Smoke Drill

## Purpose

This drill verifies the Web Command Center customer path from local approval
request creation to paper-only simulation audit review:

```text
Create Paper Approval Request
-> Record research_approved decision
-> Record approved_for_paper_simulation decision
-> Controlled Paper Submit
-> OMS / Audit Viewer
```

It is a browser-level local smoke test. It uses the Web UI, not direct API calls
from the test script, to exercise the customer-visible flow.

## Command

```bash
make paper-approval-ui-flow-smoke-check
```

The command starts:

- a local FastAPI backend on a random localhost port
- a local Next.js Web Command Center on a random localhost port
- a temporary local SQLite audit database
- a headless Chrome / Chromium / Edge browser through DevTools Protocol

No existing local database is modified. The temporary database is deleted when the
drill exits.

## Browser Requirements

The script looks for Chrome, Chrome Dev, Chromium, or Microsoft Edge. If the browser
cannot be found, set:

```bash
PAPER_UI_SMOKE_CHROME_PATH="/path/to/chrome" make paper-approval-ui-flow-smoke-check
```

On Windows / WSL, the default candidates include:

```text
/mnt/c/Program Files/Google/Chrome Dev/Application/chrome.exe
/mnt/c/Program Files/Google/Chrome/Application/chrome.exe
/mnt/c/Program Files (x86)/Microsoft/Edge/Application/msedge.exe
```

## What It Verifies

The smoke drill confirms:

- the frontend can load with a local backend
- the Paper OMS tab can be opened
- the UI can create a paper-only approval request
- the created request starts at `pending_review`
- the UI can record `research_approved`
- the UI can record `approved_for_paper_simulation` with a distinct reviewer
- Controlled Paper Submit can reference the persisted `approval_request_id`
- the resulting paper workflow shows `workflow_run_id`, `order_id`, and `FILLED`
- the OMS / Audit Viewer displays the persisted paper workflow
- safety flags remain paper-only

## Safety Boundary

This drill must remain:

- local-only
- paper-only
- browser-driven
- temporary SQLite only
- no real broker calls
- no broker SDK calls
- no credential collection
- no account login
- no real order submission
- no live approval
- no external database writes

The drill sets:

```text
TRADING_MODE=paper
ENABLE_LIVE_TRADING=false
BROKER_PROVIDER=paper
```

## Not Covered

This drill does not validate:

- production login
- RBAC / ABAC
- production WORM audit storage
- live trading readiness
- real broker connectivity
- broker certificate upload
- customer account integration
- regulatory approval for advisory or managed trading

## Related Checks

```bash
make paper-approval-workflow-check
make paper-simulation-submit-check
make frontend-i18n-check
make check
```

Live trading remains disabled by default.
