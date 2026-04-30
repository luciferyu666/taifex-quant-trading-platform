# Paper Risk Evidence Export

## Purpose

`scripts/export-paper-risk-evidence.py` exports one local Paper Only Risk Engine
guardrail evaluation as a small JSON evidence artifact. It is intended for customer
demo review, reviewer handoff, and audit-style troubleshooting of paper risk
checks.

This evidence is not production risk approval, live readiness, investment advice,
broker confirmation, or a real order record.

## Command

Default stdout-only dry run:

```bash
make paper-risk-evidence-export
```

Explicit local JSON export:

```bash
backend/.venv/bin/python scripts/export-paper-risk-evidence.py \
  --output data-pipeline/reports/paper_risk_evidence.preview.json
```

`data-pipeline/reports/*.json` remains ignored and should not be committed.

## Included Fields

The JSON payload includes:

- `evidence_id`
- `generated_at`
- `intent`
- `policy`
- `state`
- `risk_evaluation`
- `passed_checks`
- `failed_checks`
- `safety_flags`
- `warnings`

The risk evaluation uses the same paper-only `RiskEvaluation` contract as the
expanded Paper Risk Engine guardrails.

## Safety Flags

Required safe values:

```text
paper_only=true
live_trading_enabled=false
broker_provider=paper
broker_api_called=false
order_created=false
oms_called=false
broker_gateway_called=false
database_written=false
broker_credentials_collected=false
production_risk_approval=false
investment_advice=false
```

`risk_engine_called=true` only means the local paper risk evaluation function was
called. It does not mean the OMS, Broker Gateway, broker SDK, or production risk
approval path was used.

## Example Rejection Preview

```bash
backend/.venv/bin/python scripts/export-paper-risk-evidence.py \
  --order-price 21000 \
  --reference-price 20000
```

Expected result:

- `risk_evaluation.approved=false`
- `failed_checks` contains `PRICE_REASONABILITY`
- no order is created
- no broker API is called

## Guardrails

- stdout by default
- writes only when `--output` is explicitly supplied
- local `.json` output only
- no database writes
- no broker calls
- no order creation
- no OMS calls
- no Broker Gateway execution path
- no credential collection
- no live trading

## Validation

```bash
make paper-risk-evidence-export
cd backend && .venv/bin/python -m pytest tests/test_paper_risk_evidence_export_script.py
make paper-risk-guardrails-check
make check
```

Live trading remains disabled by default.
