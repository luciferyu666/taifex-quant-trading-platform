# Strategy Engine

Purpose: host future strategy runners that emit target exposure signals only.

Rules:

- Do not call broker SDKs from strategy code.
- Do not create orders directly.
- Emit structured signals for Risk Engine and OMS processing.
- Keep paper-trading and shadow-trading workflows separate from live trading.

## Strategy SDK Scaffold

The `sdk/` directory contains a minimal signal-only interface:

- `sdk/signal.py`: strategy signal dataclass.
- `sdk/base_strategy.py`: base class for signal generation.
- `sdk/dataset_manifest.py`: Phase 2 feature dataset manifest input contract.
- `sdk/research_context.py`: research context derived from a validated manifest.
- `sdk/backtest_contract.py`: Phase 3 dry-run backtest preview contract.
- `sdk/backtest_result.py`: Phase 3 dry-run backtest result schema preview contract.
- `sdk/toy_backtest.py`: fixture-only toy backtest runner contract.
- `sdk/backtest_artifact.py`: local JSON artifact preview/export contract.
- `sdk/backtest_artifact_index.py`: local artifact catalog/index preview contract.
- `sdk/backtest_research_bundle.py`: local research bundle packaging contract.
- `sdk/backtest_research_bundle_index.py`: local research bundle catalog contract.
- `sdk/research_review_queue.py`: local pending-review queue contract.
- `sdk/research_review_decision.py`: dry-run research review decision contract.
- `sdk/research_review_decision_index.py`: dry-run decision count catalog contract.
- `sdk/examples/simple_signal_strategy.py`: paper-safe example strategy.
- `sdk/examples/manifest_signal_strategy.py`: manifest-driven signal-only preview.
- `sdk/examples/backtest_preview_example.py`: manifest + signal + parameter set
  preview without performance calculation.
- `sdk/examples/backtest_result_preview_example.py`: future result schema preview
  with null metric values only.
- `sdk/examples/toy_backtest_example.py`: local fixture-only simulated research run.
- `sdk/examples/export_backtest_artifact_example.py`: stdout-first artifact preview;
  writes JSON only when `--output` is supplied.
- `sdk/examples/build_backtest_artifact_index_example.py`: stdout-first artifact index
  preview; writes JSON only when `--output` is supplied.
- `sdk/examples/build_backtest_research_bundle_example.py`: stdout-first research
  bundle preview; writes JSON only when `--output` is supplied.
- `sdk/examples/build_backtest_research_bundle_index_example.py`: stdout-first
  research bundle index preview.
- `sdk/examples/build_research_review_queue_example.py`: stdout-first pending-review
  queue preview.
- `sdk/examples/build_research_review_decision_example.py`: stdout-first review
  decision preview.
- `sdk/examples/build_research_review_decision_index_example.py`: stdout-first
  review decision index preview.

The SDK does not expose order submission or broker access. Future strategies should emit target TX-equivalent exposure only, then let Risk Engine and OMS handle any paper execution workflow.

## Phase 3 Manifest Research Preview

Run a local signal-only preview:

```bash
make strategy-research-preview
```

The manifest preview path enforces:

- `research_only=true`
- `execution_eligible=false`
- no order creation
- no Risk Engine, OMS, or Broker Gateway call
- no broker SDK import
- no external data download

This is a research input contract for future backtesting. It is not a trading engine.

## Phase 3 Backtest Preview Contract

Run a local dry-run backtest contract preview:

```bash
make backtest-preview
```

The backtest preview path enforces:

- `research_only=true`
- `execution_eligible=false`
- `order_created=false`
- `broker_api_called=false`
- `risk_engine_called=false`
- `oms_called=false`
- `performance_claim=false`

This is not a complete backtest engine. It does not calculate real performance, write
results, call broker APIs, or enter the execution path.

## Phase 3 Backtest Result Schema Preview

Run a local dry-run result schema preview:

```bash
make backtest-result-preview
```

The result schema preview adds:

- stable metric names for future backtest output
- `simulated_metrics_only=true`
- `performance_claim=false`
- null metric values only

It does not compute returns, drawdowns, ratios, fills, orders, or live execution data.

## Phase 3 Toy Backtest

Run a fixture-only toy backtest:

```bash
make toy-backtest
```

The toy backtest path enforces:

- local fixture bars only
- `execution_eligible=false`
- `order_created=false`
- `broker_api_called=false`
- `risk_engine_called=false`
- `oms_called=false`
- `performance_claim=false`
- `simulated_metrics_only=true`

Toy metrics are minimal research simulations for contract validation. They are not a
production backtest, not investment advice, and not evidence of profitability.

## Phase 3 Backtest Artifact Preview

Preview a local artifact without writing files:

```bash
make backtest-artifact-preview
```

Optionally export a small local JSON artifact:

```bash
PYTHONPATH=strategy-engine backend/.venv/bin/python \
  strategy-engine/sdk/examples/export_backtest_artifact_example.py \
  --output data-pipeline/reports/backtest_artifact.preview.json
```

Generated JSON artifacts in `data-pipeline/reports/` are local runtime output and are
ignored by Git. Artifact export does not write databases, call brokers, or certify
performance.

## Phase 3 Backtest Artifact Index

Preview a local artifact index without writing files:

```bash
make backtest-artifact-index-preview
```

Optionally build an index from local artifact JSON:

```bash
PYTHONPATH=strategy-engine backend/.venv/bin/python \
  strategy-engine/sdk/examples/build_backtest_artifact_index_example.py \
  --artifact-json data-pipeline/reports/backtest_artifact.preview.json \
  --output data-pipeline/reports/backtest_artifact_index.preview.json
```

The index is a catalog for research artifacts only. It does not rank strategies,
select a best result, claim alpha, write databases, or enter any execution path.

## Phase 3 Backtest Artifact Comparison

Preview a local artifact comparison without ranking or selecting winners:

```bash
make backtest-artifact-comparison-preview
```

The comparison reads a local artifact index and summarizes:

- data versions
- strategy versions
- parameter sets
- simulated metric names
- checksum status

It keeps `ranking_generated=false`, `best_strategy_selected=false`, and
`performance_claim=false`. It does not call brokers, write databases, create orders, or
enter any execution path.

## Phase 3 Backtest Research Bundle

Preview a local research bundle:

```bash
make backtest-research-bundle-preview
```

The research bundle packages the complete Phase 3 research chain into one metadata
payload for future UI, audit, and review workflows. It includes manifest, signal,
backtest preview, result schema, toy run, artifact, index, comparison, and checksum
references.

It keeps:

- `execution_eligible=false`
- `performance_claim=false`
- `ranking_generated=false`
- `best_strategy_selected=false`
- `persisted=false` by default

Optional explicit local JSON export:

```bash
PYTHONPATH=strategy-engine backend/.venv/bin/python \
  strategy-engine/sdk/examples/build_backtest_research_bundle_example.py \
  --output data-pipeline/reports/backtest_research_bundle.preview.json
```

Only explicit `--output` writes a local `.json` metadata file and marks
`persisted=true`. Generated JSON in `data-pipeline/reports/` is ignored by Git. This is
not a performance report, trading recommendation, ranking, database write, or
live-readiness approval.

## Phase 3 Backtest Research Bundle Index

Preview a local research bundle index without writing files:

```bash
make backtest-research-bundle-index-preview
```

The index catalogs multiple research bundles for future UI, review, and audit views.
It summarizes:

- bundle IDs
- manifest IDs and data versions
- strategy IDs and versions
- parameter set IDs
- artifact counts
- bundle checksums
- persisted flags

It keeps:

- `execution_eligible=false`
- `performance_claim=false`
- `ranking_generated=false`
- `best_strategy_selected=false`
- `persisted=false`

Duplicate bundle checksums are accepted with a warning. The index does not rank
strategies, select winners, claim alpha, write databases, call brokers, create orders,
or enter any execution path.

## Phase 3 Research Review Queue

Preview a local research review queue:

```bash
make research-review-queue-preview
```

The queue converts a safe research bundle index into pending human-review metadata for
future Web Command Center review screens. Every item is created with:

```text
review_status=pending_review
approval_for_live=false
```

The queue keeps:

- `execution_eligible=false`
- `performance_claim=false`
- `ranking_generated=false`
- `best_strategy_selected=false`
- `persisted=false`

It does not approve live trading, approve paper execution, rank strategies, select
winners, claim alpha, write databases, call brokers, create orders, or enter any
execution path.

## Phase 3 Research Review Decision

Preview a local research review decision:

```bash
make research-review-decision-preview
```

Allowed decisions:

- `rejected`
- `needs_data_review`
- `approved_for_paper_research`

`approved_for_paper_research` means continued research review only. It is not paper
execution approval, OMS routing approval, Broker Gateway submission approval, or live
trading approval.

The decision keeps:

- `execution_eligible=false`
- `performance_claim=false`
- `ranking_generated=false`
- `best_strategy_selected=false`
- `approval_for_live=false`
- `approval_for_paper_execution=false`
- `persisted=false`

It does not write databases, call brokers, create orders, call Risk Engine, call OMS,
route through Broker Gateway, rank strategies, or claim performance.

## Phase 3 Research Review Decision Index

Preview a local research review decision index:

```bash
make research-review-decision-index-preview
```

The index summarizes local review decisions for future UI status distribution views:

- `rejected_count`
- `needs_data_review_count`
- `approved_for_paper_research_count`

These counts are operational review metadata only. They are not strategy rankings,
trade recommendations, performance certification, paper execution approval, or live
trading approval.

The index keeps:

- `execution_eligible=false`
- `performance_claim=false`
- `ranking_generated=false`
- `best_strategy_selected=false`
- `approval_for_live=false`
- `approval_for_paper_execution=false`
- `persisted=false`

It does not write databases, call brokers, create orders, call Risk Engine, call OMS,
route through Broker Gateway, rank strategies, select winners, or claim performance.

## Phase 3 Research Review Packet

Preview a local research review packet:

```bash
make research-review-packet-preview
```

The packet packages a review queue, review decisions, and a decision index into one
research-only metadata object for future UI, audit, and reviewer handoff.

The packet keeps:

- `execution_eligible=false`
- `performance_claim=false`
- `ranking_generated=false`
- `best_strategy_selected=false`
- `approval_for_live=false`
- `approval_for_paper_execution=false`
- `persisted=false`

It does not write databases, call brokers, create orders, call Risk Engine, call OMS,
route through Broker Gateway, approve paper execution, approve live trading, rank
strategies, select winners, or claim performance.
