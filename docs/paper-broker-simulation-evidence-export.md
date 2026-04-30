# Paper Broker Simulation Evidence Export

## Purpose

`scripts/export-paper-broker-simulation-evidence.py` exports a small, local evidence
artifact for a Paper Only broker simulation preview. It captures the caller-provided
quote snapshot, the previewed simulation result, and explicit safety flags so a
customer demo or reviewer handoff can preserve what was inspected.

This is not a broker execution report, production matching result, investment
advice, or live trading approval.

## Scope

The export covers one local quote-based preview:

- input: symbol, side, order type, quantity, bid, ask, last, bid size, ask size,
  quote age, liquidity score, limit price when applicable
- result: simulation outcome, simulated fill quantity, simulated fill price,
  remaining quantity, reason, checks, and warnings
- safety flags: Paper Only status, live trading disabled, no broker call, no
  external market data, and no production execution model

## Command

Default behavior prints JSON to stdout and writes no file:

```bash
make paper-broker-simulation-evidence-export
```

Equivalent direct command:

```bash
backend/.venv/bin/python scripts/export-paper-broker-simulation-evidence.py
```

Example with custom local inputs:

```bash
backend/.venv/bin/python scripts/export-paper-broker-simulation-evidence.py \
  --symbol TMF \
  --side BUY \
  --order-type MARKET \
  --quantity 10 \
  --bid-price 19999 \
  --ask-price 20000 \
  --last-price 19999.5 \
  --bid-size 10 \
  --ask-size 10 \
  --liquidity-score 0.3
```

## Explicit Local Output

The command writes a file only when `--output` is provided. The output must be a
local `.json` file:

```bash
backend/.venv/bin/python scripts/export-paper-broker-simulation-evidence.py \
  --output data-pipeline/reports/paper_broker_simulation_evidence.preview.json
```

Generated report JSON files under `data-pipeline/reports/*.json` are ignored by
git. Keep artifacts small and attach them manually to review notes only when
needed.

## Safety Flags

Every evidence payload must preserve these flags:

```json
{
  "paper_only": true,
  "live_trading_enabled": false,
  "broker_api_called": false,
  "external_market_data_downloaded": false,
  "production_execution_model": false,
  "database_written": false,
  "order_created": false,
  "risk_engine_called": false,
  "oms_called": false,
  "broker_credentials_collected": false
}
```

## Non-Goals

- No database writes.
- No market data downloads.
- No broker API calls.
- No real or paper order creation.
- No Risk Engine, OMS, or Broker Gateway execution path call.
- No credential collection.
- No live approval.
- No production matching or liquidity model claim.

## Validation

Run:

```bash
make paper-broker-simulation-evidence-export
make paper-broker-simulation-model-check
make paper-broker-simulation-ui-check
make check
```

If any safety flag changes, treat the evidence as invalid and block release.
