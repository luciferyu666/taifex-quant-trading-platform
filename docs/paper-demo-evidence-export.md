# Paper Demo Evidence Export

## Purpose

`scripts/export-paper-demo-evidence.py` creates a small, local evidence summary for a Paper Only customer demo. It reads the local SQLite paper execution audit store and reports the approval request, reviewer decisions, workflow run, OMS timeline count, audit event count, and safety flags.

This is a demo and review artifact. It is not a production WORM ledger, not an investment report, not live approval, and not evidence of real broker execution.

## Safe Defaults

- Paper Only.
- Local SQLite only.
- Read-only export.
- No upload.
- No external database write.
- No broker SDK call.
- No credential collection.
- No real order.
- No live approval.
- No investment advice.

The command refuses to run unless runtime settings remain:

```text
TRADING_MODE=paper
ENABLE_LIVE_TRADING=false
BROKER_PROVIDER=paper
```

## Basic Flow

Create a local demo paper workflow record:

```bash
make seed-paper-execution-demo
```

Print evidence JSON to stdout:

```bash
make paper-demo-evidence-export
```

Run the persistence and evidence tests:

```bash
make paper-execution-persistence-check
```

## Explicit Output

The export command prints to stdout by default. It writes a file only when `--output` is explicitly provided.

JSON example:

```bash
backend/.venv/bin/python scripts/export-paper-demo-evidence.py \
  --output data-pipeline/reports/paper_demo_evidence.preview.json
```

Markdown example:

```bash
backend/.venv/bin/python scripts/export-paper-demo-evidence.py \
  --format markdown \
  --output data-pipeline/reports/paper_demo_evidence.preview.md
```

Generated report files under `data-pipeline/reports/*.json` are ignored by git and should not be committed as customer data.

## Evidence Fields

The evidence payload includes:

- `approval_request_id`
- `reviewer_decisions`
- `workflow_run_id`
- `order_id`
- `final_oms_status`
- `oms_event_count`
- `audit_event_count`
- `safety_flags`
- `local_sqlite_path`
- `generated_at`

Safety flags include:

- `paper_only=true`
- `live_trading_enabled=false`
- `broker_api_called=false`
- `local_sqlite_only=true`
- `external_db_written=false`
- `broker_credentials_collected=false`
- `real_order_created=false`
- `approval_for_live=false`
- `investment_advice=false`

## Customer Demo Use

For a customer demo, run:

```bash
make seed-paper-execution-demo
make paper-demo-evidence-export
```

Then open the Web Command Center and inspect the Paper OMS / Audit viewer. The evidence output gives the reviewer a compact reference for the same workflow run shown in the UI.

## Review Notes

- Evidence export is for test/demo traceability only.
- It must not be described as live trading evidence.
- It must not be used as a performance claim.
- It must not include broker credentials, account IDs, API keys, certificates, or private customer data.
- If a customer needs to return evidence, prefer a small Markdown summary or JSON file generated from a demo-only local SQLite store.
