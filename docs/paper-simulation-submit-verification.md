# Paper Simulation Submit Verification

## Purpose

This runbook verifies that the Paper Simulation Controlled Submit UI has a complete
paper-only audit trail:

```text
UI submit
-> /api/paper-execution/workflow/record
-> Risk Engine
-> OMS lifecycle
-> Paper Broker Gateway simulation
-> Audit events
-> Query Viewer
```

This is a simulation verification flow only. It is not a live trading workflow and
does not create real broker orders.

## Safety Boundary

The drill must preserve these constraints:

- `TRADING_MODE=paper`
- `ENABLE_LIVE_TRADING=false`
- `BROKER_PROVIDER=paper`
- Strategy signals remain signal-only.
- The platform creates `PaperOrderIntent` only after loading a persisted
  `approval_request_id` whose local approval history has reached
  `approved_for_paper_simulation`.
- The submitted StrategySignal must match the signal payload associated with the
  approval request.
- Paper order intents pass through Risk Engine and OMS.
- Broker Gateway is paper-only.
- No broker credentials, account IDs, API keys, certificates, or customer
  financial data are collected.
- No broker SDK is called.
- No external market data is downloaded.
- No live approval or paper execution escalation is created.
- Records are local SQLite paper OMS / audit records only.

## Automated Local Drill

Run from the repository root:

```bash
make paper-simulation-submit-check
```

The Make target runs:

```bash
backend/.venv/bin/python scripts/paper-simulation-submit-check.py
```

Default behavior:

- Uses FastAPI `TestClient`.
- Posts a bounded Paper Only payload to
  `/api/paper-execution/workflow/record`.
- Creates a local paper approval request and two reviewer decisions first, then
  references the resulting `approval_request_id`.
- Uses a temporary local SQLite database.
- Verifies `paper_only=true`.
- Verifies `live_trading_enabled=false`.
- Verifies `broker_api_called=false`.
- Verifies `workflow_run_id` and `order_id` are present.
- Verifies the workflow run is queryable.
- Verifies OMS events are queryable by workflow and by order.
- Verifies audit events are queryable.
- Removes the temporary database when the check exits.

Expected output includes:

```text
Paper simulation submit UX audit trace drill passed.
workflow_run_id=paper-workflow-...
approval_request_id=paper-approval-request-...
order_id=paper-order-...
final_oms_status=FILLED
oms_events_count=5
audit_events_count=...
paper_only=True
live_trading_enabled=False
broker_api_called=False
```

## Optional Persistent Local Drill

To keep the generated record for manual inspection:

```bash
backend/.venv/bin/python scripts/paper-simulation-submit-check.py \
  --db-path data/paper_execution_submit_drill.sqlite
```

This still writes only to a local SQLite file. Do not commit generated SQLite
files.

## Manual UI Drill

1. Start the backend locally:

```bash
cd backend
.venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000
```

2. Open the Web Command Center:

```text
https://taifex-quant-trading-platform-front.vercel.app/?lang=zh
```

3. Open the `Paper OMS` tab.

4. In `Paper Approval Queue / History`, verify an approval request has reached
   `approved_for_paper_simulation`. If none exists, the submit button must remain
   disabled.

5. In `Controlled Paper Submit`, verify the UI states:

- Paper Only.
- `ENABLE_LIVE_TRADING=false`.
- A persisted `approval_request_id` is selected.
- No live approval.
- No credential collection.
- Endpoint is `/api/paper-execution/workflow/record`.

6. Submit the bounded demo payload.

7. Confirm the result displays:

- `workflow_run_id`
- `approval_request_id`
- `order_id`
- final OMS status
- persisted SQLite backend
- paper broker simulation message

8. Refresh paper records.

9. Select the generated workflow row and inspect:

- OMS timeline.
- Audit timeline.
- Paper-only safety fields.

## Rejection Conditions

Stop the demo if any of these are observed:

- The UI asks for broker credentials or account login.
- The UI offers live approval.
- The UI claims production trading readiness.
- API response has `live_trading_enabled=true`.
- API response has `broker_api_called=true`.
- API response has `approval_for_live=true`.
- Paper records cannot be queried after submit.

## Validation Commands

```bash
make paper-simulation-submit-check
make paper-execution-persistence-check
cd backend && .venv/bin/python -m pytest \
  tests/test_paper_execution_routes.py \
  tests/test_paper_execution_store.py \
  tests/test_paper_simulation_submit_check_script.py
make check
```

## Current Release Level

This verification supports customer evaluation and internal demo use only:

- Marketing Website: external presentation candidate.
- Web Command Center: internal demo candidate.
- Paper Research Preview: internal technical preview.
- Paper Simulation Submit: local paper-only demo workflow.
- Production Trading Platform: **NOT READY**.

Live trading remains disabled by default.
