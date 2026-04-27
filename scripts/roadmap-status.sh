#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
cd "${REPO_ROOT}"

printf 'Taifex Quant Trading Platform roadmap status\n\n'

required_docs=(
  docs/cloud-native-transformation-blueprint.md
  docs/implementation-roadmap.md
  docs/phase-0-compliance-boundary.md
  docs/phase-1-infrastructure-foundation.md
  docs/phase-2-data-platform.md
  docs/phase-3-strategy-sdk-backtest.md
  docs/phase-4-risk-oms-broker-gateway.md
  docs/phase-5-command-center-shadow-trading.md
  docs/phase-6-reliability-go-live-readiness.md
)

required_backend=(
  backend/app/domain/contracts.py
  backend/app/domain/market_data.py
  backend/app/domain/continuous_futures.py
  backend/app/domain/feature_manifest.py
  backend/app/domain/data_versions.py
  backend/app/domain/strategy_research.py
  backend/app/domain/backtest_preview.py
  backend/app/domain/backtest_result.py
  backend/app/domain/toy_backtest.py
  backend/app/domain/backtest_artifact.py
  backend/app/domain/backtest_artifact_index.py
  backend/app/domain/backtest_artifact_comparison.py
  backend/app/domain/backtest_research_bundle.py
  backend/app/domain/backtest_research_bundle_index.py
  backend/app/domain/research_review_queue.py
  backend/app/domain/research_review_decision.py
  backend/app/domain/research_review_decision_index.py
  backend/app/domain/research_review_packet.py
  backend/app/domain/signals.py
  backend/app/domain/exposure.py
  backend/app/domain/risk.py
  backend/app/domain/orders.py
  backend/app/domain/events.py
  backend/app/services/risk_engine.py
  backend/app/services/oms.py
  backend/app/services/broker_gateway.py
  backend/app/services/strategy_registry.py
  backend/app/services/market_data.py
  backend/app/api/data_routes.py
  backend/app/api/continuous_futures_routes.py
  backend/app/api/feature_manifest_routes.py
  backend/app/api/data_version_routes.py
  backend/app/api/strategy_research_routes.py
  backend/app/api/backtest_preview_routes.py
  backend/app/api/backtest_result_routes.py
  backend/app/api/toy_backtest_routes.py
  backend/app/api/backtest_artifact_routes.py
  backend/app/api/backtest_artifact_index_routes.py
  backend/app/api/backtest_artifact_comparison_routes.py
  backend/app/api/backtest_research_bundle_routes.py
  backend/app/api/backtest_research_bundle_index_routes.py
  backend/app/api/research_review_queue_routes.py
  backend/app/api/research_review_decision_routes.py
  backend/app/api/research_review_decision_index_routes.py
  backend/app/api/research_review_packet_routes.py
  backend/app/api/roadmap_routes.py
)

required_data_platform=(
  data-pipeline/migrations/001_phase_2_data_platform.sql
  data-pipeline/migrations/apply_local_migrations.py
  data-pipeline/migrations/verify_local_data_platform.py
  data-pipeline/fixtures/market_bars_valid.csv
  data-pipeline/fixtures/market_bars_invalid.csv
  data-pipeline/fixtures/rollover_events_valid.csv
  data-pipeline/fixtures/rollover_events_invalid.csv
  data-pipeline/validation/validate_market_bar_fixtures.py
  data-pipeline/validation/validate_rollover_event_fixtures.py
  data-pipeline/validation/preview_continuous_futures.py
  data-pipeline/validation/build_feature_manifest.py
  data-pipeline/validation/persist_quality_report.py
  data-pipeline/validation/register_data_version.py
  data-pipeline/reports/README.md
  data-pipeline/reports/.gitkeep
  data-pipeline/schemas/contract_master.sql
  data-pipeline/schemas/market_bars.sql
  data-pipeline/schemas/rollover_events.sql
  data-pipeline/schemas/data_quality_checks.sql
  data-pipeline/schemas/data_versions.sql
  strategy-engine/sdk/dataset_manifest.py
  strategy-engine/sdk/research_context.py
  strategy-engine/sdk/backtest_contract.py
  strategy-engine/sdk/backtest_result.py
  strategy-engine/sdk/toy_backtest.py
  strategy-engine/sdk/backtest_artifact.py
  strategy-engine/sdk/backtest_artifact_index.py
  strategy-engine/sdk/backtest_artifact_comparison.py
  strategy-engine/sdk/backtest_research_bundle.py
  strategy-engine/sdk/backtest_research_bundle_index.py
  strategy-engine/sdk/research_review_queue.py
  strategy-engine/sdk/research_review_decision.py
  strategy-engine/sdk/research_review_decision_index.py
  strategy-engine/sdk/research_review_packet.py
  data-pipeline/phase-2-plan.md
  strategy-engine/sdk/examples/manifest_signal_strategy.py
  strategy-engine/sdk/examples/backtest_preview_example.py
  strategy-engine/sdk/examples/backtest_result_preview_example.py
  strategy-engine/sdk/examples/toy_backtest_example.py
  strategy-engine/sdk/examples/export_backtest_artifact_example.py
  strategy-engine/sdk/examples/build_backtest_artifact_index_example.py
  strategy-engine/sdk/examples/compare_backtest_artifacts_example.py
  strategy-engine/sdk/examples/build_backtest_research_bundle_example.py
  strategy-engine/sdk/examples/build_backtest_research_bundle_index_example.py
  strategy-engine/sdk/examples/build_research_review_queue_example.py
  strategy-engine/sdk/examples/build_research_review_decision_example.py
  strategy-engine/sdk/examples/build_research_review_decision_index_example.py
  strategy-engine/sdk/examples/build_research_review_packet_example.py
)

missing=0

printf 'Roadmap docs:\n'
for file in "${required_docs[@]}"; do
  if [[ -f "${file}" ]]; then
    printf '  present  %s\n' "${file}"
  else
    printf '  missing  %s\n' "${file}"
    missing=1
  fi
done

printf '\nBackend scaffold:\n'
for file in "${required_backend[@]}"; do
  if [[ -f "${file}" ]]; then
    printf '  present  %s\n' "${file}"
  else
    printf '  missing  %s\n' "${file}"
    missing=1
  fi
done

printf '\nData platform scaffold:\n'
for file in "${required_data_platform[@]}"; do
  if [[ -f "${file}" ]]; then
    printf '  present  %s\n' "${file}"
  else
    printf '  missing  %s\n' "${file}"
    missing=1
  fi
done

printf '\nSafety defaults from .env.example:\n'
grep -E '^(TRADING_MODE|ENABLE_LIVE_TRADING|BROKER_PROVIDER|MAX_TX_EQUIVALENT_EXPOSURE|MAX_DAILY_LOSS_TWD|STALE_QUOTE_SECONDS)=' .env.example || true

printf '\nSuggested next Codex prompt:\n'
printf '  .codex/prompts/17-roadmap-next-safe-slice.md\n'

if [[ "${missing}" -ne 0 ]]; then
  printf '\nRoadmap status: missing required scaffold files.\n' >&2
  exit 1
fi

printf '\nRoadmap status: required scaffold files are present. Live trading remains disabled by default.\n'
