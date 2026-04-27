# Phase 3: Strategy SDK and Backtest

## Objective

Create a signal-only Strategy SDK and paper-safe backtest foundation.

## Deliverables

- Strategy signal model.
- Base strategy class.
- Example strategy that emits a signal-like object.
- Dataset manifest input contract from Phase 2.
- Research context wrapper for reproducible feature manifests.
- Backend research preview endpoint that emits signals only.
- Backtest preview contract that binds manifest, signal, strategy version, and
  parameter set without calculating performance.
- Backtest result schema preview that defines future result fields without filling
  real performance metrics.
- Fixture-only toy backtest runner that produces simulated research metrics from
  local bars only.
- Backtest run artifact preview/export that packages toy run output as local JSON
  metadata without database persistence.
- Backtest artifact index preview that catalogs local research artifacts without
  ranking or selecting strategies.
- Backtest research bundle index preview that catalogs local research bundles for
  UI, review, and audit workflows without ranking or selecting strategies.
- Research review queue preview that converts a local research bundle index into
  pending human-review items without approving live trading.
- Research review decision preview that records a dry-run research decision without
  approving paper execution or live trading.
- Research review decision index preview that summarizes dry-run decision counts
  without ranking strategies or approving execution.
- Documentation that prohibits broker access from strategies.

## Acceptance Criteria

- Strategy code emits target exposure signals only.
- No order placement API exists in the SDK.
- No broker SDK import exists under `strategy-engine/`.
- Feature dataset manifests are accepted only when `research_only=true` and
  `execution_eligible=false`.
- Strategy research preview returns `order_created=false`, `broker_api_called=false`,
  `risk_engine_called=false`, and `oms_called=false`.
- Backtest preview returns `performance_claim=false` and remains
  `execution_eligible=false`.
- Backtest result schema preview returns `simulated_metrics_only=true`, leaves metric
  values null, and keeps `performance_claim=false`.
- Toy backtest runner returns simulated metric values only, keeps
  `performance_claim=false`, and never creates orders.
- Backtest artifact preview returns `persisted=false` by default and includes an
  artifact checksum for auditability.
- Backtest artifact index returns artifact summaries only, warns on duplicate
  checksums, and keeps `performance_claim=false`.
- Backtest research bundle index returns bundle summaries only, warns on duplicate
  checksums, and keeps `ranking_generated=false` and
  `best_strategy_selected=false`.
- Research review queue returns `pending_review` items only and keeps
  `approval_for_live=false`.
- Research review decision accepts only `rejected`, `needs_data_review`, and
  `approved_for_paper_research`, while keeping `approval_for_paper_execution=false`
  and `approval_for_live=false`.
- Research review decision index may aggregate decision counts only; count
  distribution must not become a ranking, recommendation, or approval.

## Safety Constraints

- Strategies must never call broker SDKs directly.
- Strategies must not create orders.
- Strategies must not manage account credentials.
- Strategy research preview must not call Risk Engine, OMS, or Broker Gateway.
- Dataset manifests must remain research-only and non-execution-eligible.
- Backtest preview must not calculate real performance, create orders, call Risk
  Engine, call OMS, or call Broker Gateway.
- Backtest result schema preview must define schema only. It must not populate real
  metric values or make performance claims.
- Toy backtest must use local fixture bars only. It must not read external data, write
  databases, create orders, call Risk Engine, call OMS, or call Broker Gateway.
- Backtest artifact export must be local JSON only. It must not write databases, call
  broker APIs, or convert simulated metrics into performance claims.
- Backtest artifact index must not calculate rankings, choose best strategies, claim
  alpha, or write databases.
- Backtest research bundle index must not calculate rankings, choose best
  strategies, claim alpha, write databases, or become a performance report.
- Research review queue must not approve live trading, rank strategies, select
  winners, claim alpha, write databases, or become an advisory workflow.
- Research review decision must not approve paper execution or live trading. The
  `approved_for_paper_research` decision means continued research review only.
- Research review decision index must not approve paper execution, approve live
  trading, rank strategies, select best strategies, or claim performance.

## Dataset Manifest Input Contract

Phase 3 begins by consuming the Phase 2 feature dataset manifest:

- `strategy-engine/sdk/dataset_manifest.py` validates the manifest boundary.
- `strategy-engine/sdk/research_context.py` converts it into a research context.
- `strategy-engine/sdk/examples/manifest_signal_strategy.py` emits a sample `FLAT`
  signal from the manifest without creating orders.
- `POST /api/strategy/research/preview-signal` exposes the same signal-only preview
  through the backend.

This is not a backtest engine and does not evaluate strategy performance. It is the
handshake from governed data artifacts into signal-only strategy research.

## Backtest Preview Contract

The next Phase 3 boundary is the dry-run backtest preview contract:

- `backend/app/domain/backtest_preview.py` defines the backend request, response,
  reproducibility hash, and safety flags.
- `POST /api/strategy/backtest/preview` accepts a feature dataset manifest and a
  signal-only `StrategySignal`.
- `strategy-engine/sdk/backtest_contract.py` validates SDK-side preview payloads.
- `strategy-engine/sdk/examples/backtest_preview_example.py` prints a local
  no-execution preview artifact.

This contract is intentionally narrower than a backtest engine. It does not read
external data, write a database, calculate real strategy performance, create order
intents, call Risk Engine, call OMS, or call Broker Gateway. It only proves that a
future backtest can be tied to:

- feature manifest ID
- data version
- strategy ID and version
- parameter set ID
- signal summary
- reproducibility hash
- explicit safety flags

Required flags:

```text
research_only=true
execution_eligible=false
order_created=false
broker_api_called=false
risk_engine_called=false
oms_called=false
performance_claim=false
```

## Backtest Result Schema Preview

The result schema preview adds one more non-executable contract:

- `backend/app/domain/backtest_result.py` accepts a valid backtest preview and a
  result label.
- `POST /api/strategy/backtest/result-preview` returns the future result schema.
- `strategy-engine/sdk/backtest_result.py` validates SDK-side result preview payloads.
- `strategy-engine/sdk/examples/backtest_result_preview_example.py` prints a local
  dry-run result schema artifact.

This still is not a backtest engine. Metric names are present so future services can
share a stable output contract, but metric values are intentionally `null`.

Current schema placeholders include:

- `total_return_pct`
- `max_drawdown_pct`
- `trade_count`
- `tx_equivalent_turnover`
- `sharpe_like_ratio`

These placeholders are research schema definitions only. They are not investment
advice, not a performance report, and not evidence of profitability.

Additional required flag:

```text
simulated_metrics_only=true
```

## Toy Backtest Runner

The fixture-only toy backtest runner is the first minimal executable research path:

- `backend/app/domain/toy_backtest.py` validates a safe backtest result preview and
  local fixture bars.
- `POST /api/strategy/backtest/toy-run` returns simulated research metric values.
- `strategy-engine/sdk/toy_backtest.py` validates SDK-side toy run payloads.
- `strategy-engine/sdk/examples/toy_backtest_example.py` runs a local dry-run against
  `data-pipeline/fixtures/market_bars_valid.csv`.

The toy runner intentionally avoids a real execution or PnL engine. Current values are
simple fixture-derived research simulations:

- `total_return_pct`
- `max_drawdown_pct`
- `trade_count` fixed at `0`
- `tx_equivalent_turnover` fixed at `0`
- `sharpe_like_ratio`

Each output metric is marked:

```text
simulated=true
research_only=true
performance_claim=false
```

The toy runner does not model commissions, slippage, fills, margin, position netting,
order state, broker reconciliation, or live execution. Those are separate future
services and must stay behind Risk Engine, OMS, and Broker Gateway boundaries.

## Backtest Run Artifact Export

Backtest artifact export packages the toy run into auditable metadata:

- `backend/app/domain/backtest_artifact.py` validates a safe toy backtest run.
- `POST /api/strategy/backtest/artifact/preview` returns artifact metadata without
  writing files or databases.
- `strategy-engine/sdk/backtest_artifact.py` validates SDK-side artifact payloads.
- `strategy-engine/sdk/examples/export_backtest_artifact_example.py` previews the
  artifact on stdout by default.

The artifact includes:

- `artifact_id`
- `toy_backtest_run_id`
- `artifact_checksum`
- `reproducibility_hash`
- simulated metric values
- safety flags

Default behavior:

```text
persisted=false
```

The SDK example writes a local JSON file only when the user explicitly supplies
`--output`, for example:

```bash
PYTHONPATH=strategy-engine backend/.venv/bin/python \
  strategy-engine/sdk/examples/export_backtest_artifact_example.py \
  --output data-pipeline/reports/backtest_artifact.preview.json
```

Generated JSON reports under `data-pipeline/reports/*.json` are ignored by Git. Keep
only `.gitkeep` and `README.md` committed in that directory.

## Backtest Artifact Index

The artifact index turns one or more local artifacts into a small research catalog:

- `backend/app/domain/backtest_artifact_index.py` validates safe artifact payloads.
- `POST /api/strategy/backtest/artifact-index/preview` returns summary metadata only.
- `strategy-engine/sdk/backtest_artifact_index.py` validates SDK-side index payloads.
- `strategy-engine/sdk/examples/build_backtest_artifact_index_example.py` previews the
  index on stdout by default.

The index includes:

- artifact count
- artifact IDs
- toy run IDs
- strategy and parameter identifiers
- data version
- artifact checksums
- persisted flags
- index checksum
- reproducibility hash

The index deliberately omits:

- ranking fields
- "best strategy" fields
- alpha claims
- live or paper execution records
- broker-side records

Duplicate artifact checksums are allowed for local cataloging, but the index emits a
warning so future UI or review tooling can surface the duplication.

Optional local JSON export:

```bash
PYTHONPATH=strategy-engine backend/.venv/bin/python \
  strategy-engine/sdk/examples/build_backtest_artifact_index_example.py \
  --artifact-json data-pipeline/reports/backtest_artifact.preview.json \
  --output data-pipeline/reports/backtest_artifact_index.preview.json
```

Generated index JSON under `data-pipeline/reports/*.json` remains ignored by Git.

## Backtest Artifact Comparison Preview

The comparison preview turns a local artifact index into a safe comparison summary:

- `backend/app/domain/backtest_artifact_comparison.py` validates artifact index safety
  flags and checksum formats.
- `POST /api/strategy/backtest/artifact-comparison/preview` returns metadata
  comparison only.
- `strategy-engine/sdk/backtest_artifact_comparison.py` validates SDK-side comparison
  payloads.
- `strategy-engine/sdk/examples/compare_backtest_artifacts_example.py` previews the
  comparison on stdout by default.

The comparison summary includes:

- data versions represented by the index
- strategy ID and version combinations
- parameter set IDs
- simulated metric names
- checksum status, including duplicate artifact checksum warnings

The comparison deliberately omits:

- performance ranking
- best-strategy selection
- alpha claims
- advisory signals
- order intents
- broker execution records

Required safety flags:

```text
research_only=true
execution_eligible=false
order_created=false
broker_api_called=false
risk_engine_called=false
oms_called=false
performance_claim=false
simulated_metrics_only=true
ranking_generated=false
best_strategy_selected=false
```

Dry-run command:

```bash
make backtest-artifact-comparison-preview
```

Optional comparison from a previously exported local index:

```bash
PYTHONPATH=strategy-engine backend/.venv/bin/python \
  strategy-engine/sdk/examples/compare_backtest_artifacts_example.py \
  --index-json data-pipeline/reports/backtest_artifact_index.preview.json
```

The comparison preview does not write databases, read external data, call brokers, or
create orders.

## Backtest Research Bundle Preview

The research bundle preview packages the full Phase 3 research-only chain into a
single metadata artifact:

```text
Feature Manifest
-> Research Context / StrategySignal
-> Backtest Preview Contract
-> Backtest Result Schema Preview
-> Toy Backtest Runner
-> Backtest Artifact
-> Backtest Artifact Index
-> Backtest Artifact Comparison
-> Backtest Research Bundle
```

Implemented files:

- `backend/app/domain/backtest_research_bundle.py`
- `POST /api/strategy/backtest/research-bundle/preview`
- `strategy-engine/sdk/backtest_research_bundle.py`
- `strategy-engine/sdk/examples/build_backtest_research_bundle_example.py`

The bundle includes:

- manifest ID and data version
- strategy ID and version
- parameter set IDs
- artifact count
- included section names
- manifest, preview, result, toy run, artifact, index, comparison, and bundle
  checksums
- safety flags

The bundle is not:

- a performance report
- investment advice
- a strategy ranking
- a best-strategy selection
- a live-readiness approval
- an execution artifact

Required safety flags:

```text
research_only=true
execution_eligible=false
order_created=false
broker_api_called=false
risk_engine_called=false
oms_called=false
performance_claim=false
simulated_metrics_only=true
ranking_generated=false
best_strategy_selected=false
persisted=false
```

Dry-run command:

```bash
make backtest-research-bundle-preview
```

By default, the research bundle preview writes only to stdout and returns
`persisted=false`.

Optional explicit local JSON export:

```bash
PYTHONPATH=strategy-engine backend/.venv/bin/python \
  strategy-engine/sdk/examples/build_backtest_research_bundle_example.py \
  --output data-pipeline/reports/backtest_research_bundle.preview.json
```

Only explicit `--output` may write a local `.json` metadata file and mark the emitted
payload `persisted=true`. Generated JSON under `data-pipeline/reports/*.json` remains
ignored by Git.

The research bundle preview does not write databases, read external data, call brokers,
create order intents, or call Risk Engine / OMS / Broker Gateway.

## Backtest Research Bundle Index

The research bundle index turns one or more local research bundles into a small
catalog for future Web Command Center, review workflow, and audit trail views:

- `backend/app/domain/backtest_research_bundle_index.py` validates safe bundle
  payloads.
- `POST /api/strategy/backtest/research-bundle-index/preview` returns summary
  metadata only.
- `strategy-engine/sdk/backtest_research_bundle_index.py` validates SDK-side index
  payloads.
- `strategy-engine/sdk/examples/build_backtest_research_bundle_index_example.py`
  previews the index on stdout by default.

The index includes:

- bundle count
- bundle IDs
- manifest IDs and data versions
- strategy IDs and versions
- parameter set IDs
- artifact counts
- bundle checksums
- persisted flags from bundle metadata
- index checksum
- reproducibility hash

The index deliberately omits:

- performance ranking
- best-strategy selection
- alpha or profitability claims
- advisory recommendations
- order intents
- broker execution records
- database persistence

Duplicate bundle checksums are allowed for local cataloging, but the index emits a
warning so future UI or review tooling can surface the duplication.

Required safety flags:

```text
research_only=true
execution_eligible=false
order_created=false
broker_api_called=false
risk_engine_called=false
oms_called=false
performance_claim=false
simulated_metrics_only=true
external_data_downloaded=false
ranking_generated=false
best_strategy_selected=false
persisted=false
```

Dry-run command:

```bash
make backtest-research-bundle-index-preview
```

Optional index from previously exported local bundles:

```bash
PYTHONPATH=strategy-engine backend/.venv/bin/python \
  strategy-engine/sdk/examples/build_backtest_research_bundle_index_example.py \
  --bundle-json data-pipeline/reports/backtest_research_bundle.preview.json
```

The research bundle index does not write files, write databases, read external data,
call brokers, create orders, rank strategies, or call Risk Engine / OMS / Broker
Gateway.

## Research Review Queue Preview

The research review queue is the first Phase 3 workflow contract for future human
review screens. It consumes a safe backtest research bundle index and turns each
bundle summary into a `pending_review` item:

- `backend/app/domain/research_review_queue.py` validates bundle index safety flags.
- `POST /api/strategy/research-review/queue/preview` returns review metadata only.
- `strategy-engine/sdk/research_review_queue.py` validates SDK-side queue payloads.
- `strategy-engine/sdk/examples/build_research_review_queue_example.py` previews the
  queue on stdout by default.

The queue includes:

- review queue ID and label
- bundle count
- bundle IDs
- manifest IDs and data versions
- strategy IDs and versions
- parameter set IDs
- artifact counts
- bundle checksums
- review status, currently fixed at `pending_review`
- review reason text for UI display
- queue checksum
- reproducibility hash

The queue deliberately does not include:

- approval for live trading
- paper execution authorization
- performance ranking
- best-strategy selection
- alpha or profitability claims
- advisory recommendations
- order intents
- broker execution records
- database persistence

Required safety flags:

```text
research_only=true
execution_eligible=false
order_created=false
broker_api_called=false
risk_engine_called=false
oms_called=false
performance_claim=false
simulated_metrics_only=true
external_data_downloaded=false
ranking_generated=false
best_strategy_selected=false
approval_for_live=false
persisted=false
```

Dry-run command:

```bash
make research-review-queue-preview
```

Optional queue from a previously exported local bundle index:

```bash
PYTHONPATH=strategy-engine backend/.venv/bin/python \
  strategy-engine/sdk/examples/build_research_review_queue_example.py \
  --bundle-index-json data-pipeline/reports/backtest_research_bundle_index.preview.json
```

The review queue is suitable as an input contract for a future Web Command Center
research review page. It is not a live approval workflow, investment recommendation,
performance report, strategy ranking, or broker execution instruction.

## Research Review Decision Preview

The research review decision preview records a dry-run decision against one item in a
safe research review queue. It is designed as a future UI/review contract, not as an
execution approval path:

- `backend/app/domain/research_review_decision.py` validates queue safety flags and
  target bundle membership.
- `POST /api/strategy/research-review/decision/preview` returns decision metadata
  only.
- `strategy-engine/sdk/research_review_decision.py` validates SDK-side decision
  payloads.
- `strategy-engine/sdk/examples/build_research_review_decision_example.py` previews
  the decision on stdout by default.

Allowed decisions:

- `rejected`
- `needs_data_review`
- `approved_for_paper_research`

`approved_for_paper_research` means the bundle may continue through research review.
It does not approve paper execution, OMS routing, Broker Gateway submission, or live
trading.

The decision includes:

- decision ID
- review queue ID
- bundle ID
- decision value
- reviewer ID, using a non-secret local placeholder by default
- decision reason
- decision timestamp
- decision checksum
- reproducibility hash

Required safety flags:

```text
research_only=true
execution_eligible=false
order_created=false
broker_api_called=false
risk_engine_called=false
oms_called=false
performance_claim=false
simulated_metrics_only=true
external_data_downloaded=false
ranking_generated=false
best_strategy_selected=false
approval_for_live=false
approval_for_paper_execution=false
persisted=false
```

Dry-run command:

```bash
make research-review-decision-preview
```

Optional decision from a previously exported local queue:

```bash
PYTHONPATH=strategy-engine backend/.venv/bin/python \
  strategy-engine/sdk/examples/build_research_review_decision_example.py \
  --review-queue-json data-pipeline/reports/research_review_queue.preview.json \
  --decision needs_data_review
```

The decision preview writes no files or databases, downloads no external data, calls
no broker APIs, creates no orders, and does not call Risk Engine / OMS / Broker
Gateway.

## Research Review Decision Index Preview

The research review decision index summarizes one or more dry-run research review
decisions into a local catalog. It is intended for future Web Command Center review
status distribution views, not ranking or approval logic:

- `backend/app/domain/research_review_decision_index.py` validates decision safety
  flags and checksum formats.
- `POST /api/strategy/research-review/decision-index/preview` returns local index
  metadata only.
- `strategy-engine/sdk/research_review_decision_index.py` validates SDK-side index
  payloads.
- `strategy-engine/sdk/examples/build_research_review_decision_index_example.py`
  previews the index on stdout by default.

The index includes:

- decision index ID and label
- decision count
- decision summary counts for `rejected`, `needs_data_review`, and
  `approved_for_paper_research`
- decision IDs
- review queue IDs
- bundle IDs
- decision values
- reviewer IDs
- decision checksums
- index checksum
- reproducibility hash

The index deliberately does not include:

- performance ranking
- best-strategy selection
- advisory recommendations
- paper execution approval
- live trading approval
- order intents
- broker execution records
- database persistence

Required safety flags:

```text
research_only=true
execution_eligible=false
order_created=false
broker_api_called=false
risk_engine_called=false
oms_called=false
performance_claim=false
simulated_metrics_only=true
external_data_downloaded=false
ranking_generated=false
best_strategy_selected=false
approval_for_live=false
approval_for_paper_execution=false
persisted=false
```

Dry-run command:

```bash
make research-review-decision-index-preview
```

Optional index from previously exported local decisions:

```bash
PYTHONPATH=strategy-engine backend/.venv/bin/python \
  strategy-engine/sdk/examples/build_research_review_decision_index_example.py \
  --decision-json data-pipeline/reports/research_review_decision.preview.json
```

Decision counts are operational review metadata only. A higher count of
`approved_for_paper_research` does not mean a strategy is superior, profitable,
execution-ready, or approved for paper/live trading.

## Research Review Packet Preview

The research review packet packages the dry-run review workflow into one local
metadata object for future Web Command Center, audit trail, and reviewer handoff
views:

- `backend/app/domain/research_review_packet.py` validates queue, decision, and
  decision-index safety flags and consistency.
- `POST /api/strategy/research-review/packet/preview` returns packet metadata only.
- `strategy-engine/sdk/research_review_packet.py` validates SDK-side packet payloads.
- `strategy-engine/sdk/examples/build_research_review_packet_example.py` previews the
  packet on stdout by default.

The packet includes:

- packet ID and label
- review queue ID
- decision index ID
- bundle count
- decision count
- decision summary counts
- included section names
- queue checksum
- decision checksums
- decision index checksum
- packet checksum
- reproducibility hash

The packet deliberately does not include:

- strategy ranking
- best-strategy selection
- performance certification
- advisory recommendation
- paper execution approval
- live trading approval
- order intents
- broker execution records
- database persistence

Required safety flags:

```text
research_only=true
execution_eligible=false
order_created=false
broker_api_called=false
risk_engine_called=false
oms_called=false
performance_claim=false
simulated_metrics_only=true
external_data_downloaded=false
ranking_generated=false
best_strategy_selected=false
approval_for_live=false
approval_for_paper_execution=false
persisted=false
```

Dry-run command:

```bash
make research-review-packet-preview
```

The packet is a read model for future UI and audit workflows. It must not be treated
as a regulated report, deployment approval, execution approval, or evidence of
profitability.

## Suggested Commands

```bash
python -m compileall strategy-engine/sdk
make strategy-research-preview
make backtest-preview
make backtest-result-preview
make toy-backtest
make backtest-artifact-preview
make backtest-artifact-index-preview
make backtest-artifact-comparison-preview
make backtest-research-bundle-preview
make backtest-research-bundle-index-preview
make research-review-queue-preview
make research-review-decision-preview
make research-review-decision-index-preview
make research-review-packet-preview
cd backend && pytest
make check
```

## Next Implementation Notes

Future backtest work should bind each result to strategy version, data version, manifest
reproducibility hash, and parameter set. It must still avoid broker APIs and live trading.
The first real backtest service should begin from the preview contract and add simulated
research metrics only after the input/output and safety flags remain stable.
When result values are eventually introduced, they must be labeled as simulated research
metrics and must keep broker execution fully out of the backtest path.
The toy runner is the smallest validation of the Phase 3 contract chain; do not expand
it into a full execution simulator without a separate design review.
Backtest artifacts should remain small, local, and research-only until a separate
persistence design is approved.
Backtest artifact indexes should remain local catalogs until a separate persistence
and review design is approved.
Backtest artifact comparisons should remain metadata-only previews and must not rank
strategies, select winners, or make alpha claims.
Backtest research bundles should remain local metadata packages for UI, audit, and
review workflow input only; they must not become regulated reports or execution
approvals.
Backtest research bundle indexes should remain local catalogs for multiple research
bundles only; they must not rank strategies, select winners, make alpha claims, or
serve as live deployment approval.
Research review queues should remain pending human-review metadata only. Future
statuses such as `rejected`, `needs-data-review`, or `approved-for-paper-research`
require a separate review-workflow design and must never imply live approval.
Research review decisions may record `rejected`, `needs_data_review`, or
`approved_for_paper_research` as dry-run metadata only. They must never imply paper
execution approval, live approval, advisory recommendation, ranking, or performance
certification.
Research review decision indexes may summarize decision distributions only. They must
not rank strategies, select winners, certify performance, or convert review metadata
into execution approval.
Research review packets may package queue, decision, and decision-index metadata only.
They must remain local dry-run read models for UI, audit, and reviewer handoff; they
must not approve paper execution, approve live trading, rank strategies, certify
performance, or become regulated reports.
