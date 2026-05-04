# Quant Workflow Standardization

This document defines the standard workflow for Taiwan index futures strategy
research, backtesting, rollover data, Paper Trading, risk controls, OMS, and
audit review.

It converts platform methodology into a repeatable operating model:

```text
Data standardization
-> Strategy research standardization
-> Backtest standardization
-> Rollover data standardization
-> Paper Trading standardization
-> Risk / OMS / audit standardization
-> Future Shadow / supervised production readiness review
```

The current platform remains Paper Only. This document is not investment advice,
not a performance claim, and not production trading approval. Live trading
remains disabled by default.

## Purpose

Standardization means every research, backtest, Paper Trading run, risk check,
OMS event, and audit record has a defined input, output, version reference,
review trail, and acceptance condition.

The goal is to avoid common failure modes:

- A strategy cannot be reproduced because data, code, or parameters were not
  versioned.
- Backtest results cannot be compared because cost, slippage, rollover, or
  session rules were inconsistent.
- Paper Trading cannot validate execution because simulated orders, fills,
  positions, and audit events were not recorded.
- Strategy code bypasses platform risk controls or OMS state transitions.

## Product Boundary

This standard applies to:

- TX / MTX / TMF research workflows.
- Browser-only mock demo workflows.
- Local Paper Only backend workflows.
- Data versioning, rollover metadata, backtest contracts, Paper Order Intents,
  risk evaluation, OMS lifecycle, and audit evidence.

This standard does not enable:

- Broker login.
- Broker SDK calls.
- Real account data.
- Real order submission.
- Credential upload.
- Managed account operations.
- Copy trading.
- Investment advice.
- Production trading readiness.

## TX / MTX / TMF Exposure Standard

The platform uses normalized TX-equivalent exposure as the common risk language.
Current platform assumptions are:

| Instrument | Point value | TX-equivalent unit |
| --- | ---: | ---: |
| TX | NTD 200 per index point | `1.00` |
| MTX | NTD 50 per index point | `0.25` |
| TMF | NTD 10 per index point | `0.05` |

Exposure conversion:

```text
TX-equivalent exposure =
  TX contracts  * 1.00
+ MTX contracts * 0.25
+ TMF contracts * 0.05
```

Example:

```text
1 TX + 1 MTX + 3 TMF
= 1.00 + 0.25 + 0.15
= 1.40 TX-equivalent
```

Every strategy signal, position display, risk limit, and paper order preview
should be interpretable in TX-equivalent terms. Contract count alone is not
enough for platform-level risk review.

## Strategy Research Standard

Strategy research turns a trading idea into a managed research asset.

Each strategy should have a strategy specification with:

| Field | Requirement |
| --- | --- |
| `strategy_id` | Stable identifier, for example `tx_breakout_v1`. |
| Hypothesis | Why the strategy is expected to have signal value. |
| Instruments | TX, MTX, TMF, or research-only continuous contracts. |
| Timeframe | For example 1m, 5m, 15m, or daily. |
| Dataset | Raw contract data, near-month data, adjusted continuous data, or feature manifest. |
| Entry rule | Explicit programmable logic. |
| Exit rule | Stop, take-profit, reversal, time exit, or other deterministic rule. |
| Position model | Fixed quantity, volatility-based sizing, or TX-equivalent exposure target. |
| Risk assumptions | Max exposure, daily loss boundary, stale quote threshold, order size limit. |
| Inapplicable cases | Event days, rollover days, stale quotes, thin liquidity, or regime mismatch. |
| Acceptance criteria | Trade count, drawdown threshold, sample split, cost sensitivity, review decision. |

Strategies must emit standardized signals only. They must not create orders or
call broker APIs directly.

Example signal shape:

```json
{
  "signal_id": "sig_20260504_084501_001",
  "strategy_id": "tx_breakout_v1",
  "strategy_version": "1.0.0",
  "timestamp": "2026-05-04T08:45:01+08:00",
  "symbol_group": "TAIEX_FUTURES",
  "direction": "long",
  "target_tx_equivalent": 0.35,
  "confidence": 0.72,
  "reason": {
    "signal_type": "breakout",
    "signals_only": true,
    "paper_only": true
  }
}
```

Platform responsibilities remain separate:

```text
Strategy -> StrategySignal
Platform -> PaperOrderIntent, risk evaluation, OMS lifecycle, audit record
```

## Backtest Standard

Backtests must be reproducible and comparable. A backtest result without version
references should not advance to Paper Trading review.

Required references:

```json
{
  "backtest_id": "bt_20260504_001",
  "strategy_id": "tx_breakout_v1",
  "strategy_version": "1.0.0",
  "git_commit_sha": "abc1234",
  "dataset_version": "tx_continuous_back_adjusted_20260504_v1",
  "rollover_rule_version": "rollover_v1.0",
  "fee_model_version": "fee_v1",
  "slippage_model_version": "slippage_v1",
  "parameter_set": {
    "lookback": 20,
    "atr_multiplier": 2.5
  },
  "performance_claim": false
}
```

Minimum cost assumptions:

- Fees.
- Transaction tax assumptions where applicable.
- Slippage.
- Bid/ask spread.
- Rollover cost.
- Stop execution slippage assumptions.

Minimum review dimensions:

| Category | Examples |
| --- | --- |
| Return | Total return, monthly return, annualized return. |
| Risk | Drawdown, tail loss proxy, adverse excursion. |
| Stability | Sharpe, Sortino, Calmar, parameter sensitivity. |
| Trade quality | Win rate, profit factor, average win/loss, trade count. |
| Behavior | Holding period, max losing streak, trading frequency. |
| Cost | Fees, slippage, rollover cost, spread sensitivity. |
| Robustness | Walk-forward, out-of-sample, cost stress, regime split. |
| Execution gap | Backtest vs Paper vs Shadow differences. |

Acceptance gates should be treated as review filters, not profit promises. A
passing backtest only means the result is structured enough for further review.

## Rollover Data Standard

Taiwan futures contracts expire. Research data and executable contract data must
be separated.

The platform should preserve:

| Dataset | Purpose |
| --- | --- |
| Real contract data | Paper execution, future production execution mapping, and audit. |
| Back-adjusted continuous data | Research and trend/backtest analysis. |
| Ratio-adjusted continuous data | Long-horizon proportional analysis and volatility research. |

Core rule:

```text
Research may use adjusted continuous data.
Paper and future execution workflows must map to real contract symbols and real contract prices.
```

Rollover event metadata should include:

```sql
rollover_events
- rollover_id
- symbol_group
- from_contract
- to_contract
- rollover_timestamp
- from_price
- to_price
- basis
- adjustment_method
- adjustment_factor
- volume_from
- volume_to
- open_interest_from
- open_interest_to
- data_version
- research_only
- created_at
```

Each rollover must answer:

- When did rollover occur?
- Which contract changed to which contract?
- What was the basis?
- Which adjustment method was used?
- Which data version was affected?
- Was the event research-only?

Night session records must also distinguish `calendar_date`, `trading_date`,
and `session`, because futures sessions can cross calendar days.

## Paper Trading Standard

Paper Trading is the engineering validation stage before any future broker or
production execution work. It validates workflow behavior, not real execution
quality.

Paper Trading should validate:

| Area | Validation question |
| --- | --- |
| Signal | Did the strategy emit a valid standardized signal? |
| Intent | Did the platform create a PaperOrderIntent from the signal? |
| Risk | Did risk guardrails approve or reject with explainable checks? |
| OMS | Did order lifecycle events transition correctly? |
| Broker simulation | Did the paper broker model produce deterministic simulated outcomes? |
| Position | Did simulated fills update paper positions consistently? |
| Audit | Did the workflow leave queryable audit events and integrity metadata? |
| Recovery | Can the local paper state be queried after restart? |

Standard flow:

```text
StrategySignal
-> platform-owned PaperOrderIntent
-> Risk Engine
-> Paper OMS
-> Paper Broker Gateway simulation
-> Paper position / simulated PnL
-> Audit event
-> Evidence export or reviewer notes
```

Paper Trading acceptance criteria:

- No direct broker call.
- No real order.
- No credential collection.
- Risk Engine runs before OMS.
- OMS event sequence is queryable.
- Audit events are queryable.
- Paper fills reconcile to paper positions.
- Duplicate idempotency keys are rejected.
- Stale quotes are rejected.
- Safety flags remain Paper Only.

## Shadow And Production Readiness Boundary

Shadow and production execution are future readiness stages. They are not enabled
by this repository state.

Future Shadow Trading should mean:

```text
Real market observation + real-time signal generation + no order submission
```

Future supervised production stages would require separate implementation,
security review, legal/regulatory review, broker adapter review, operational
controls, immutable audit design, reconciliation, incident response, and explicit
approval gates.

## Risk Standard

Risk controls must be platform-owned. Strategy code must not bypass them.

Pre-trade checks should include:

| Check | Purpose |
| --- | --- |
| `live_trading_enabled` | Must remain false in current platform state. |
| `trading_mode` | Must explicitly be paper for current workflows. |
| `broker_provider` | Must remain paper for current workflows. |
| `idempotency_key` | Prevent duplicate order creation. |
| `max_tx_equivalent` | Bound normalized exposure. |
| `max_order_size_by_contract` | Bound per-contract size. |
| `stale_quote` | Reject old market snapshots. |
| `price_reasonability` | Reject prices outside configured reasonability bands. |
| `margin_proxy` | Block unrealistic paper exposure assumptions. |
| `position_limit` | Prevent position buildup beyond policy. |
| `daily_loss_state` | Lock new paper orders after configured loss proxy threshold. |
| `kill_switch_status` | Reject when paper kill switch is active. |
| `broker_heartbeat_status` | Reject when simulated paper heartbeat is unhealthy. |

Example risk output:

```json
{
  "approved": false,
  "reason": "quote age exceeds stale_quote_seconds",
  "checks": [
    {"name": "live_trading_disabled", "passed": true},
    {"name": "idempotency_key_present", "passed": true},
    {"name": "max_exposure_ok", "passed": true},
    {"name": "quote_fresh", "passed": false}
  ],
  "safety_flags": {
    "paper_only": true,
    "broker_api_called": false,
    "real_order_created": false
  }
}
```

## OMS Standard

OMS owns order lifecycle state. Strategy code does not.

Paper OMS states should remain explicit:

```text
PENDING
NEW
RISK_CHECKED
SUBMITTED
ACCEPTED
PARTIALLY_FILLED
FILLED
CANCEL_REQUESTED
CANCELLED
REJECTED
EXPIRED
UNKNOWN_NEEDS_RECONCILIATION
```

Idempotency is mandatory. A duplicate key must not create another paper order
for the same logical signal or intent.

Production-grade OMS capabilities remain future work:

- Durable queue / outbox.
- Async workers.
- Broker execution report ingestion.
- Amend / replace lifecycle.
- Formal timeout handling.
- Reconciliation loop.
- Production incident response.

## Audit And Observability Standard

The platform must be able to answer:

- Which data version produced this signal?
- Which strategy version emitted it?
- Which risk checks passed or failed?
- Which OMS states occurred?
- Which simulated broker outcome was applied?
- Which position state changed?
- Which reviewer or evidence artifact observed the result?

Every paper workflow should preserve identifiers such as:

```text
trace_id
signal_id
risk_decision_id
paper_order_intent_id
order_id
workflow_run_id
position_update_id
audit_event_id
```

Current audit persistence is local SQLite and hash-chain verification preview.
It is useful for customer demo and local review, but it is not production WORM,
not an immutable audit ledger, and not formal compliance infrastructure.

## Stage Gates

| Stage | Minimum condition |
| --- | --- |
| Research | Strategy spec exists, dataset version fixed, safety boundary clear. |
| Backtest | Cost/slippage/rollover/session assumptions recorded; no performance claim. |
| Paper | Signal -> intent -> risk -> OMS -> paper broker -> position -> audit chain works. |
| Review | Evidence JSON or review notes can explain what happened and what remains simulated. |
| Shadow | Future stage only; real-market observation without order submission. |
| Supervised production | Future stage only; requires separate legal, compliance, security, broker, OMS, audit, and operations review. |

## Standard Documents To Maintain

The platform should keep these documents current:

- `docs/strategy-research-standard.md`
- `docs/backtesting-standard.md`
- `docs/rollover-data-standard.md`
- `docs/paper-trading-standard.md`
- `docs/risk-management-standard.md`
- `docs/oms-standard.md`
- `docs/paper-shadow-live-boundary.md`
- `docs/trading-safety.md`
- `docs/customer-interactive-demo-trial.md`
- `docs/customer-trial-feedback-workflow.md`

This file provides the consolidated workflow standard until those topic-specific
documents are split further.

## Common Failure Modes

### Using adjusted continuous prices for executable orders

Adjusted continuous data is a research tool. Paper execution and future
execution mapping must use real contract symbols and real contract prices.

### Letting strategy code call broker APIs

Strategies emit signals only. Platform services own intent creation, risk
checks, OMS state, broker gateway isolation, reconciliation, and audit.

### Treating Paper Trading as performance proof

Paper Trading validates workflow behavior and safety controls. It is not real
execution, not a broker confirmation, and not a performance claim.

### Ignoring night session trading-date rules

Session-aware `trading_date` and `session` fields are required. Calendar date
alone is not sufficient for Taiwan futures research data.

### Skipping audit records

Every Paper Only workflow needs traceable evidence. If a reviewer cannot answer
what signal, data, risk result, OMS event, simulated fill, and paper position
were involved, the workflow is not ready for the next review stage.

## Validation

Use the general project gate:

```bash
make check
```

For customer-facing interactive demo validation, also run:

```bash
make interactive-demo-conversion-check
make frontend-production-smoke-check
```

Live trading remains disabled by default.
