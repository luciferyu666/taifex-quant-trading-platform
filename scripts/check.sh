#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
cd "${REPO_ROOT}"
BACKEND_PYTHON="${REPO_ROOT}/backend/.venv/bin/python"

printf 'Checking local safety defaults...\n'
if ! grep -Fxq 'ENABLE_LIVE_TRADING=false' .env.example; then
  printf '.env.example must contain ENABLE_LIVE_TRADING=false.\n' >&2
  exit 1
fi

if ! grep -Fxq 'TRADING_MODE=paper' .env.example; then
  printf '.env.example must contain TRADING_MODE=paper.\n' >&2
  exit 1
fi

if ! grep -Fxq 'BROKER_PROVIDER=paper' .env.example; then
  printf '.env.example must contain BROKER_PROVIDER=paper.\n' >&2
  exit 1
fi

if [[ -f .env ]] && grep -Eiq '^ENABLE_LIVE_TRADING=(true|1|yes)$' .env; then
  printf 'Unsafe local config: ENABLE_LIVE_TRADING is enabled in .env.\n' >&2
  exit 1
fi

printf 'Checking business operations files...\n'
missing_business_file=0
for required_file in \
  docs/business-operations-plan.md \
  docs/business-model.md \
  docs/pricing-strategy.md \
  docs/go-to-market.md \
  docs/compliance-boundary.md \
  docs/partner-profit-sharing.md \
  .codex/prompts/18-business-operations-implementation.md \
  scripts/business-status.sh; do
  if [[ ! -f "${required_file}" ]]; then
    printf 'Missing required business file: %s\n' "${required_file}" >&2
    missing_business_file=1
  fi
done

if ! grep -q 'Business Operations Plan' README.md; then
  printf 'README.md must contain Business Operations Plan section.\n' >&2
  missing_business_file=1
fi

if [[ "${missing_business_file}" -ne 0 ]]; then
  exit 1
fi

if [[ -x scripts/business-compliance-check.sh ]]; then
  bash scripts/business-compliance-check.sh
else
  printf 'scripts/business-compliance-check.sh is missing or not executable.\n' >&2
  exit 1
fi

printf 'Checking release readiness audit files...\n'
missing_release_file=0
for required_file in \
  docs/release-readiness-audit.md \
  docs/release-candidate-pr-notes.md \
  .github/pull_request_template.md \
  .github/workflows/release-readiness.yml \
  scripts/release-readiness-check.sh; do
  if [[ ! -f "${required_file}" ]]; then
    printf 'Missing required release readiness file: %s\n' "${required_file}" >&2
    missing_release_file=1
  fi
done

if [[ ! -x scripts/release-readiness-check.sh ]]; then
  printf 'scripts/release-readiness-check.sh must be executable.\n' >&2
  missing_release_file=1
fi

if [[ "${missing_release_file}" -ne 0 ]]; then
  exit 1
fi

printf 'Checking customer evaluation package...\n'
missing_customer_eval_file=0
for required_file in \
  docs/customer-evaluation-package.md \
  docs/customer-demo-script.md \
  docs/customer-evaluation-checklist.md \
  docs/customer-feedback-form.md \
  docs/paper-demo-evidence-export.md \
  docs/paper-broker-simulation-evidence-export.md \
  docs/paper-broker-simulation-readiness.md \
  docs/mock-backend-demo-mvp.md \
  docs/paper-risk-cross-account-readiness.md \
  docs/paper-risk-evidence-export.md \
  docs/paper-audit-integrity-preview.md \
  docs/frontend-local-backend-demo-mode.md \
  docs/local-backend-demo-browser-drill.md \
  docs/production-local-data-boundary.md \
  docs/customer-self-service-demo.md \
  docs/customer-self-service-paper-demo-roadmap.md \
  docs/customer-self-service-local-demo-launcher.md \
  docs/hosted-backend-api-deployment-foundation.md \
  docs/hosted-web-command-center.md \
  docs/hosted-paper-saas-foundation-roadmap.md \
  docs/hosted-paper-backend-api-readiness.md \
  docs/hosted-paper-managed-datastore-readiness.md \
  docs/hosted-paper-production-datastore-readiness.md \
  docs/hosted-paper-production-datastore-migration-plan-v2.md \
  docs/hosted-paper-managed-datastore-migration-plan.md \
  docs/hosted-paper-auth-boundary-spec.md \
  docs/hosted-paper-auth-provider-selection-matrix.md \
  docs/hosted-paper-security-operations-readiness.md \
  docs/hosted-paper-sandbox-tenant-onboarding-readiness.md \
  docs/hosted-paper-identity-rbac-tenant-readiness.md \
  docs/hosted-paper-identity-access-contract.md \
  docs/hosted-paper-mock-session-contract.md \
  docs/hosted-paper-tenant-boundary-evidence-export.md \
  infra/hosted-backend/README.md \
  infra/hosted-backend/env-boundary.placeholder.md \
  docs/paper-simulation-submit-verification.md \
  docs/paper-approval-ui-flow-smoke-drill.md \
  docs/paper-approval-workflow.md \
  docs/paper-compliance-approval-readiness.md \
  docs/paper-audit-worm-readiness.md \
  docs/paper-audit-compliance-trail-readiness.md \
  docs/paper-oms-production-readiness.md \
  docs/paper-oms-productionization-blueprint.md \
  scripts/customer-evaluation-check.sh \
  scripts/self-service-paper-demo-check.sh \
  scripts/launch-self-service-paper-demo.sh \
  scripts/check-customer-demo-env.sh \
  scripts/start-customer-demo.sh \
  scripts/start-customer-demo.ps1 \
  scripts/hosted-paper-api-readiness-check.sh \
  scripts/hosted-backend-readiness-check.sh \
  scripts/hosted-web-command-center-check.sh \
  scripts/hosted-paper-auth-boundary-check.sh \
  scripts/hosted-paper-auth-provider-selection-check.sh \
  scripts/hosted-paper-security-operations-check.sh \
  scripts/hosted-paper-sandbox-onboarding-check.sh \
  scripts/hosted-paper-identity-readiness-check.sh \
  scripts/hosted-paper-identity-access-check.sh \
  scripts/hosted-paper-mock-session-check.sh \
  scripts/hosted-paper-production-datastore-readiness-check.sh \
  scripts/hosted-paper-datastore-migration-plan.py \
  scripts/hosted-paper-production-datastore-migration-plan-v2.py \
  scripts/paper-compliance-approval-readiness-check.sh \
  scripts/paper-oms-production-readiness-check.sh \
  scripts/paper-oms-productionization-blueprint-check.sh \
  scripts/paper-audit-compliance-trail-readiness-check.sh \
  scripts/paper-broker-simulation-readiness-check.sh \
  scripts/paper-risk-cross-account-readiness-check.sh \
  scripts/export-hosted-paper-tenant-boundary-evidence.py \
  backend/app/domain/hosted_backend_environment.py \
  backend/app/domain/hosted_web_command_center.py \
  backend/app/domain/hosted_paper_environment.py \
  backend/app/domain/hosted_paper_datastore.py \
  backend/app/domain/hosted_paper_production_datastore.py \
  backend/app/domain/hosted_paper_auth_provider_selection.py \
  backend/app/domain/hosted_paper_security_operations.py \
  backend/app/domain/hosted_paper_sandbox_onboarding.py \
  backend/app/domain/hosted_paper_identity_access.py \
  backend/app/domain/paper_oms_productionization_blueprint.py \
  backend/app/domain/paper_audit_compliance_trail.py \
  backend/app/api/hosted_backend_routes.py \
  backend/tests/test_hosted_backend_environment_routes.py \
  backend/tests/test_hosted_web_command_center_routes.py \
  backend/tests/test_hosted_paper_environment_routes.py \
  backend/tests/test_hosted_paper_datastore_readiness_routes.py \
  backend/tests/test_hosted_paper_production_datastore_readiness_routes.py \
  backend/tests/test_hosted_paper_datastore_migration_plan_script.py \
  backend/tests/test_hosted_paper_production_datastore_migration_plan_v2_script.py \
  backend/tests/test_hosted_paper_auth_provider_selection_routes.py \
  backend/tests/test_hosted_paper_security_operations_routes.py \
  backend/tests/test_hosted_paper_sandbox_onboarding_routes.py \
  backend/tests/test_hosted_paper_identity_access_contract_routes.py \
  backend/tests/test_paper_oms_productionization_blueprint_routes.py \
  backend/tests/test_paper_audit_compliance_trail_routes.py \
  frontend/app/apiBase.ts \
  frontend/app/components/HostedWebCommandCenterPanel.tsx \
  frontend/app/components/HostedPaperEnvironmentPanel.tsx \
  frontend/app/components/HostedPaperDatastoreReadinessPanel.tsx \
  frontend/app/components/HostedPaperProductionDatastoreReadinessPanel.tsx \
  frontend/app/components/HostedPaperAuthProviderSelectionPanel.tsx \
  frontend/app/components/HostedPaperSandboxOnboardingPanel.tsx \
  frontend/app/components/HostedPaperIdentityAccessContractPanel.tsx \
  frontend/scripts/check-paper-approval-ui-flow.mjs; do
  if [[ ! -f "${required_file}" ]]; then
    printf 'Missing required customer evaluation file: %s\n' "${required_file}" >&2
    missing_customer_eval_file=1
  fi
done

if [[ ! -x scripts/customer-evaluation-check.sh ]]; then
  printf 'scripts/customer-evaluation-check.sh must be executable.\n' >&2
  missing_customer_eval_file=1
fi

if [[ ! -x scripts/self-service-paper-demo-check.sh ]]; then
  printf 'scripts/self-service-paper-demo-check.sh must be executable.\n' >&2
  missing_customer_eval_file=1
fi

if [[ ! -x scripts/launch-self-service-paper-demo.sh ]]; then
  printf 'scripts/launch-self-service-paper-demo.sh must be executable.\n' >&2
  missing_customer_eval_file=1
fi

if [[ ! -x scripts/check-customer-demo-env.sh ]]; then
  printf 'scripts/check-customer-demo-env.sh must be executable.\n' >&2
  missing_customer_eval_file=1
fi

if [[ ! -x scripts/start-customer-demo.sh ]]; then
  printf 'scripts/start-customer-demo.sh must be executable.\n' >&2
  missing_customer_eval_file=1
fi

if [[ ! -x scripts/hosted-paper-api-readiness-check.sh ]]; then
  printf 'scripts/hosted-paper-api-readiness-check.sh must be executable.\n' >&2
  missing_customer_eval_file=1
fi

if [[ ! -x scripts/hosted-backend-readiness-check.sh ]]; then
  printf 'scripts/hosted-backend-readiness-check.sh must be executable.\n' >&2
  missing_customer_eval_file=1
fi

if [[ ! -x scripts/hosted-web-command-center-check.sh ]]; then
  printf 'scripts/hosted-web-command-center-check.sh must be executable.\n' >&2
  missing_customer_eval_file=1
fi

if [[ ! -x scripts/hosted-paper-auth-boundary-check.sh ]]; then
  printf 'scripts/hosted-paper-auth-boundary-check.sh must be executable.\n' >&2
  missing_customer_eval_file=1
fi

if [[ ! -x scripts/hosted-paper-auth-provider-selection-check.sh ]]; then
  printf 'scripts/hosted-paper-auth-provider-selection-check.sh must be executable.\n' >&2
  missing_customer_eval_file=1
fi

if [[ ! -x scripts/hosted-paper-security-operations-check.sh ]]; then
  printf 'scripts/hosted-paper-security-operations-check.sh must be executable.\n' >&2
  missing_customer_eval_file=1
fi

if [[ ! -x scripts/hosted-paper-sandbox-onboarding-check.sh ]]; then
  printf 'scripts/hosted-paper-sandbox-onboarding-check.sh must be executable.\n' >&2
  missing_customer_eval_file=1
fi

if [[ ! -x scripts/hosted-paper-identity-readiness-check.sh ]]; then
  printf 'scripts/hosted-paper-identity-readiness-check.sh must be executable.\n' >&2
  missing_customer_eval_file=1
fi

if [[ ! -x scripts/hosted-paper-identity-access-check.sh ]]; then
  printf 'scripts/hosted-paper-identity-access-check.sh must be executable.\n' >&2
  missing_customer_eval_file=1
fi

if [[ ! -x scripts/hosted-paper-mock-session-check.sh ]]; then
  printf 'scripts/hosted-paper-mock-session-check.sh must be executable.\n' >&2
  missing_customer_eval_file=1
fi

if [[ ! -x scripts/hosted-paper-production-datastore-readiness-check.sh ]]; then
  printf 'scripts/hosted-paper-production-datastore-readiness-check.sh must be executable.\n' >&2
  missing_customer_eval_file=1
fi

if [[ ! -x scripts/hosted-paper-datastore-migration-plan.py ]]; then
  printf 'scripts/hosted-paper-datastore-migration-plan.py must be executable.\n' >&2
  missing_customer_eval_file=1
fi

if [[ ! -x scripts/hosted-paper-production-datastore-migration-plan-v2.py ]]; then
  printf 'scripts/hosted-paper-production-datastore-migration-plan-v2.py must be executable.\n' >&2
  missing_customer_eval_file=1
fi

if [[ ! -x scripts/paper-compliance-approval-readiness-check.sh ]]; then
  printf 'scripts/paper-compliance-approval-readiness-check.sh must be executable.\n' >&2
  missing_customer_eval_file=1
fi

if [[ ! -x scripts/paper-audit-worm-readiness-check.sh ]]; then
  printf 'scripts/paper-audit-worm-readiness-check.sh must be executable.\n' >&2
  missing_customer_eval_file=1
fi

if [[ ! -x scripts/paper-audit-compliance-trail-readiness-check.sh ]]; then
  printf 'scripts/paper-audit-compliance-trail-readiness-check.sh must be executable.\n' >&2
  missing_customer_eval_file=1
fi

if [[ ! -x scripts/paper-oms-production-readiness-check.sh ]]; then
  printf 'scripts/paper-oms-production-readiness-check.sh must be executable.\n' >&2
  missing_customer_eval_file=1
fi

if [[ ! -x scripts/paper-oms-productionization-blueprint-check.sh ]]; then
  printf 'scripts/paper-oms-productionization-blueprint-check.sh must be executable.\n' >&2
  missing_customer_eval_file=1
fi

if [[ ! -x scripts/paper-broker-simulation-readiness-check.sh ]]; then
  printf 'scripts/paper-broker-simulation-readiness-check.sh must be executable.\n' >&2
  missing_customer_eval_file=1
fi

if [[ ! -x scripts/mock-backend-demo-check.sh ]]; then
  printf 'scripts/mock-backend-demo-check.sh must be executable.\n' >&2
  missing_customer_eval_file=1
fi

if [[ ! -x scripts/paper-risk-cross-account-readiness-check.sh ]]; then
  printf 'scripts/paper-risk-cross-account-readiness-check.sh must be executable.\n' >&2
  missing_customer_eval_file=1
fi

if [[ "${missing_customer_eval_file}" -ne 0 ]]; then
  exit 1
fi

bash scripts/customer-evaluation-check.sh
bash scripts/check-customer-demo-env.sh
bash scripts/self-service-paper-demo-check.sh
bash scripts/launch-self-service-paper-demo.sh --check-only
bash scripts/hosted-backend-readiness-check.sh
bash scripts/hosted-web-command-center-check.sh
bash scripts/hosted-paper-api-readiness-check.sh
bash scripts/hosted-paper-sandbox-onboarding-check.sh
bash scripts/hosted-paper-auth-boundary-check.sh
bash scripts/hosted-paper-auth-provider-selection-check.sh
bash scripts/hosted-paper-security-operations-check.sh
bash scripts/hosted-paper-identity-readiness-check.sh
bash scripts/hosted-paper-identity-access-check.sh
bash scripts/hosted-paper-mock-session-check.sh
bash scripts/hosted-paper-production-datastore-readiness-check.sh
bash scripts/paper-compliance-approval-readiness-check.sh
bash scripts/paper-audit-worm-readiness-check.sh
bash scripts/paper-audit-compliance-trail-readiness-check.sh
bash scripts/paper-oms-production-readiness-check.sh
bash scripts/paper-oms-productionization-blueprint-check.sh
bash scripts/paper-broker-simulation-readiness-check.sh
bash scripts/mock-backend-demo-check.sh
bash scripts/paper-risk-cross-account-readiness-check.sh

printf 'Checking Facebook community launch content...\n'
if [[ -x scripts/social-content-check.sh ]]; then
  bash scripts/social-content-check.sh
else
  printf 'scripts/social-content-check.sh is missing or not executable.\n' >&2
  exit 1
fi

printf 'Checking roadmap scaffold files...\n'
missing_roadmap_file=0
for required_file in \
  docs/cloud-native-transformation-blueprint.md \
  docs/implementation-roadmap.md \
  docs/phase-0-compliance-boundary.md \
  docs/phase-1-infrastructure-foundation.md \
  docs/phase-2-data-platform.md \
  docs/phase-3-strategy-sdk-backtest.md \
  docs/phase-4-risk-oms-broker-gateway.md \
  docs/phase-5-command-center-shadow-trading.md \
  docs/phase-6-reliability-go-live-readiness.md \
  backend/app/domain/contracts.py \
  backend/app/domain/market_data.py \
  backend/app/domain/continuous_futures.py \
  backend/app/domain/feature_manifest.py \
  backend/app/domain/data_versions.py \
  backend/app/domain/strategy_research.py \
  backend/app/domain/backtest_preview.py \
  backend/app/domain/backtest_result.py \
  backend/app/domain/toy_backtest.py \
  backend/app/domain/backtest_artifact.py \
  backend/app/domain/backtest_artifact_index.py \
  backend/app/domain/backtest_artifact_comparison.py \
  backend/app/domain/backtest_research_bundle.py \
  backend/app/domain/backtest_research_bundle_index.py \
  backend/app/domain/research_review_queue.py \
  backend/app/domain/research_review_decision.py \
  backend/app/domain/research_review_decision_index.py \
  backend/app/domain/research_review_packet.py \
  backend/app/domain/paper_approval.py \
  backend/app/domain/paper_compliance_approval.py \
  backend/app/domain/paper_audit_worm_readiness.py \
  backend/app/domain/paper_broker_simulation.py \
  backend/app/domain/paper_broker_simulation_readiness.py \
  backend/app/domain/paper_risk_cross_account_readiness.py \
  backend/app/domain/paper_execution.py \
  backend/app/domain/paper_execution_records.py \
  backend/app/domain/audit_integrity.py \
  backend/app/domain/paper_oms_reliability.py \
  backend/app/domain/paper_oms_production_readiness.py \
  backend/app/domain/paper_risk_state.py \
  backend/app/domain/hosted_paper_environment.py \
  backend/app/domain/hosted_backend_environment.py \
  backend/app/domain/hosted_paper_production_datastore.py \
  backend/app/domain/hosted_paper_identity.py \
  backend/app/domain/hosted_paper_auth_provider_selection.py \
  backend/app/domain/hosted_paper_identity_access.py \
  backend/app/domain/hosted_paper_session.py \
  backend/app/domain/exposure.py \
  backend/app/services/risk_engine.py \
  backend/app/services/oms.py \
  backend/app/services/broker_gateway.py \
  backend/app/services/paper_execution_workflow.py \
  backend/app/services/paper_execution_store.py \
  backend/app/services/audit_integrity_service.py \
  backend/app/services/paper_approval_store.py \
  scripts/seed-paper-execution-demo.py \
  scripts/export-paper-demo-evidence.py \
  scripts/export-paper-broker-simulation-evidence.py \
  scripts/mock-backend-demo-check.sh \
  scripts/export-paper-risk-evidence.py \
  scripts/export-hosted-paper-tenant-boundary-evidence.py \
  scripts/verify-paper-audit-integrity.py \
  scripts/paper-audit-worm-readiness-check.sh \
  scripts/paper-simulation-submit-check.py \
  backend/app/api/data_routes.py \
  backend/app/api/continuous_futures_routes.py \
  backend/app/api/feature_manifest_routes.py \
  backend/app/api/data_version_routes.py \
  backend/app/api/strategy_research_routes.py \
  backend/app/api/backtest_preview_routes.py \
  backend/app/api/backtest_result_routes.py \
  backend/app/api/toy_backtest_routes.py \
  backend/app/api/backtest_artifact_routes.py \
  backend/app/api/backtest_artifact_index_routes.py \
  backend/app/api/backtest_artifact_comparison_routes.py \
  backend/app/api/backtest_research_bundle_routes.py \
  backend/app/api/backtest_research_bundle_index_routes.py \
  backend/app/api/research_review_queue_routes.py \
  backend/app/api/research_review_decision_routes.py \
  backend/app/api/research_review_decision_index_routes.py \
  backend/app/api/research_review_packet_routes.py \
  backend/app/api/paper_approval_routes.py \
  backend/app/api/paper_execution_routes.py \
  backend/app/api/paper_risk_routes.py \
  backend/app/api/hosted_backend_routes.py \
  backend/app/api/hosted_paper_routes.py \
  backend/app/api/mock_backend_routes.py \
  backend/app/domain/mock_backend.py \
  backend/tests/test_mock_backend_routes.py \
  frontend/app/components/MockBackendDemoPanel.tsx \
  backend/app/api/roadmap_routes.py \
  data-pipeline/migrations/001_phase_2_data_platform.sql \
  data-pipeline/migrations/apply_local_migrations.py \
  data-pipeline/migrations/verify_local_data_platform.py \
  data-pipeline/fixtures/market_bars_valid.csv \
  data-pipeline/fixtures/market_bars_invalid.csv \
  data-pipeline/fixtures/rollover_events_valid.csv \
  data-pipeline/fixtures/rollover_events_invalid.csv \
  data-pipeline/validation/validate_market_bar_fixtures.py \
  data-pipeline/validation/validate_rollover_event_fixtures.py \
  data-pipeline/validation/preview_continuous_futures.py \
  data-pipeline/validation/build_feature_manifest.py \
  data-pipeline/validation/persist_quality_report.py \
  data-pipeline/validation/register_data_version.py \
  data-pipeline/reports/README.md \
  data-pipeline/reports/.gitkeep \
  frontend/test-fixtures/research-review-packets/README.md \
  frontend/test-fixtures/research-review-packets/valid.sample.json \
  frontend/test-fixtures/research-review-packets/invalid-live-approval.json \
  frontend/test-fixtures/research-review-packets/invalid-execution-eligible.json \
  frontend/test-fixtures/research-review-packets/invalid-performance-claim.json \
  frontend/test-fixtures/research-review-packets/invalid-checksum.json \
  frontend/test-fixtures/research-review-packets/invalid-decision-summary.json \
  frontend/app/components/PaperApprovalQueuePanel.tsx \
  frontend/app/components/HostedPaperTenantBoundaryEvidencePanel.tsx \
  frontend/app/components/LocalBackendDemoModePanel.tsx \
  frontend/app/components/PaperExecutionRecordsPanel.tsx \
  frontend/app/components/PaperBrokerSimulationReadinessPanel.tsx \
  frontend/app/components/PaperRiskCrossAccountReadinessPanel.tsx \
  frontend/app/components/PaperOmsReliabilityPanel.tsx \
  frontend/app/components/PaperOmsProductionReadinessPanel.tsx \
  frontend/app/components/PaperSimulationSubmitPanel.tsx \
  frontend/app/components/PaperOmsTimelinePanel.tsx \
  frontend/app/components/PaperAuditTimelinePanel.tsx \
  frontend/app/components/researchReviewPacketValidation.ts \
  frontend/scripts/validate-research-review-packet-fixtures.mjs \
  data-pipeline/schemas/contract_master.sql \
  data-pipeline/schemas/market_bars.sql \
  data-pipeline/schemas/rollover_events.sql \
  data-pipeline/schemas/data_quality_checks.sql \
  data-pipeline/schemas/data_versions.sql \
  strategy-engine/sdk/dataset_manifest.py \
  strategy-engine/sdk/research_context.py \
  strategy-engine/sdk/backtest_contract.py \
  strategy-engine/sdk/backtest_result.py \
  strategy-engine/sdk/toy_backtest.py \
  strategy-engine/sdk/backtest_artifact.py \
  strategy-engine/sdk/backtest_artifact_index.py \
  strategy-engine/sdk/backtest_artifact_comparison.py \
  strategy-engine/sdk/backtest_research_bundle.py \
  strategy-engine/sdk/backtest_research_bundle_index.py \
  strategy-engine/sdk/research_review_queue.py \
  strategy-engine/sdk/research_review_decision.py \
  strategy-engine/sdk/research_review_decision_index.py \
  strategy-engine/sdk/research_review_packet.py \
  strategy-engine/sdk/base_strategy.py \
  strategy-engine/sdk/examples/manifest_signal_strategy.py \
  strategy-engine/sdk/examples/backtest_preview_example.py \
  strategy-engine/sdk/examples/backtest_result_preview_example.py \
  strategy-engine/sdk/examples/toy_backtest_example.py \
  strategy-engine/sdk/examples/export_backtest_artifact_example.py \
  strategy-engine/sdk/examples/build_backtest_artifact_index_example.py \
  strategy-engine/sdk/examples/compare_backtest_artifacts_example.py \
  strategy-engine/sdk/examples/build_backtest_research_bundle_example.py \
  strategy-engine/sdk/examples/build_backtest_research_bundle_index_example.py \
  strategy-engine/sdk/examples/build_research_review_queue_example.py \
  strategy-engine/sdk/examples/build_research_review_decision_example.py \
  strategy-engine/sdk/examples/build_research_review_decision_index_example.py \
  strategy-engine/sdk/examples/build_research_review_packet_example.py \
  strategy-engine/sdk/examples/export_sample_research_review_packet.py \
  scripts/roadmap-status.sh; do
  if [[ ! -f "${required_file}" ]]; then
    printf 'Missing required roadmap scaffold file: %s\n' "${required_file}" >&2
    missing_roadmap_file=1
  fi
done

if [[ "${missing_roadmap_file}" -ne 0 ]]; then
  exit 1
fi

printf 'Checking system architecture scaffold files...\n'
missing_architecture_file=0
for required_file in \
  docs/system-architecture-spec.md \
  docs/control-plane.md \
  docs/trading-data-plane.md \
  docs/data-lakehouse-architecture.md \
  docs/oms-state-machine.md \
  docs/broker-gateway-adapter-pattern.md \
  docs/risk-engine-spec.md \
  docs/security-vault-asvs.md \
  docs/observability-dr-event-sourcing.md \
  backend/app/domain/order_state_machine.py \
  backend/app/domain/allocator.py \
  backend/app/domain/risk_rules.py \
  backend/app/domain/paper_broker_simulation.py \
  backend/app/domain/paper_execution.py \
  backend/app/domain/paper_execution_records.py \
  backend/app/domain/paper_oms_reliability.py \
  backend/app/domain/paper_risk_state.py \
  backend/app/services/paper_broker_gateway.py \
  backend/app/services/paper_execution_workflow.py \
  backend/app/services/paper_execution_store.py \
  backend/app/services/reconciliation.py \
  backend/app/api/paper_execution_routes.py \
  backend/app/api/paper_risk_routes.py \
  backend/app/api/architecture_routes.py \
  infra/k8s/control-plane/README.md \
  infra/k8s/trading-data-plane/README.md \
  infra/vault/transit-policy.placeholder.hcl \
  infra/observability/opentelemetry-collector.placeholder.yaml \
  .codex/prompts/19-system-architecture-implementation.md \
  scripts/architecture-status.sh; do
  if [[ ! -f "${required_file}" ]]; then
    printf 'Missing required architecture scaffold file: %s\n' "${required_file}" >&2
    missing_architecture_file=1
  fi
done

if [[ "${missing_architecture_file}" -ne 0 ]]; then
  exit 1
fi

if [[ -x scripts/architecture-safety-check.sh ]]; then
  bash scripts/architecture-safety-check.sh
else
  printf 'scripts/architecture-safety-check.sh is missing or not executable.\n' >&2
  exit 1
fi

if [[ -x "${BACKEND_PYTHON}" ]]; then
  printf 'Checking backend syntax...\n'
  "${BACKEND_PYTHON}" -m compileall -q backend/app backend/tests

  if "${BACKEND_PYTHON}" -m ruff --version >/dev/null 2>&1; then
    printf 'Running backend Ruff checks...\n'
    "${BACKEND_PYTHON}" -m ruff check backend
  else
    printf 'backend ruff is not installed; skipping Ruff checks.\n' >&2
  fi

  if "${BACKEND_PYTHON}" -m pytest --version >/dev/null 2>&1; then
    printf 'Running backend tests...\n'
    (cd backend && .venv/bin/python -m pytest)
  else
    printf 'backend pytest is not installed; skipping backend tests.\n' >&2
  fi

  printf 'Running local data fixture validation...\n'
  "${BACKEND_PYTHON}" data-pipeline/validation/validate_market_bar_fixtures.py

  printf 'Running local rollover fixture validation...\n'
  "${BACKEND_PYTHON}" data-pipeline/validation/validate_rollover_event_fixtures.py

  printf 'Running continuous futures preview dry-run...\n'
  "${BACKEND_PYTHON}" data-pipeline/validation/preview_continuous_futures.py

  printf 'Running feature dataset manifest dry-run...\n'
  "${BACKEND_PYTHON}" data-pipeline/validation/build_feature_manifest.py

  printf 'Running strategy research preview dry-run...\n'
  PYTHONPATH=strategy-engine "${BACKEND_PYTHON}" \
    strategy-engine/sdk/examples/manifest_signal_strategy.py

  printf 'Running backtest preview contract dry-run...\n'
  PYTHONPATH=strategy-engine "${BACKEND_PYTHON}" \
    strategy-engine/sdk/examples/backtest_preview_example.py

  printf 'Running backtest result schema preview dry-run...\n'
  PYTHONPATH=strategy-engine "${BACKEND_PYTHON}" \
    strategy-engine/sdk/examples/backtest_result_preview_example.py

  printf 'Running fixture-only toy backtest dry-run...\n'
  PYTHONPATH=strategy-engine "${BACKEND_PYTHON}" \
    strategy-engine/sdk/examples/toy_backtest_example.py

  printf 'Running backtest artifact preview dry-run...\n'
  PYTHONPATH=strategy-engine "${BACKEND_PYTHON}" \
    strategy-engine/sdk/examples/export_backtest_artifact_example.py

  printf 'Running backtest artifact index preview dry-run...\n'
  PYTHONPATH=strategy-engine "${BACKEND_PYTHON}" \
    strategy-engine/sdk/examples/build_backtest_artifact_index_example.py

  printf 'Running backtest artifact comparison preview dry-run...\n'
  PYTHONPATH=strategy-engine "${BACKEND_PYTHON}" \
    strategy-engine/sdk/examples/compare_backtest_artifacts_example.py

  printf 'Running backtest research bundle preview dry-run...\n'
  PYTHONPATH=strategy-engine "${BACKEND_PYTHON}" \
    strategy-engine/sdk/examples/build_backtest_research_bundle_example.py

  printf 'Running backtest research bundle index preview dry-run...\n'
  PYTHONPATH=strategy-engine "${BACKEND_PYTHON}" \
    strategy-engine/sdk/examples/build_backtest_research_bundle_index_example.py

  printf 'Running research review queue preview dry-run...\n'
  PYTHONPATH=strategy-engine "${BACKEND_PYTHON}" \
    strategy-engine/sdk/examples/build_research_review_queue_example.py

  printf 'Running research review decision preview dry-run...\n'
  PYTHONPATH=strategy-engine "${BACKEND_PYTHON}" \
    strategy-engine/sdk/examples/build_research_review_decision_example.py

  printf 'Running research review decision index preview dry-run...\n'
  PYTHONPATH=strategy-engine "${BACKEND_PYTHON}" \
    strategy-engine/sdk/examples/build_research_review_decision_index_example.py

  printf 'Running research review packet preview dry-run...\n'
  PYTHONPATH=strategy-engine "${BACKEND_PYTHON}" \
    strategy-engine/sdk/examples/build_research_review_packet_example.py

  printf 'Running safe research review packet sample stdout dry-run...\n'
  PYTHONPATH=strategy-engine "${BACKEND_PYTHON}" \
    strategy-engine/sdk/examples/export_sample_research_review_packet.py

  printf 'Running data quality report persistence dry-run...\n'
  "${BACKEND_PYTHON}" data-pipeline/validation/persist_quality_report.py

  printf 'Running data version registry dry-run...\n'
  "${BACKEND_PYTHON}" data-pipeline/validation/register_data_version.py

  printf 'Running local data migration dry-run...\n'
  "${BACKEND_PYTHON}" data-pipeline/migrations/apply_local_migrations.py

  printf 'Running local data platform verification dry-run...\n'
  "${BACKEND_PYTHON}" data-pipeline/migrations/verify_local_data_platform.py

  printf 'Running Paper Only submit UX audit trace drill...\n'
  "${BACKEND_PYTHON}" scripts/paper-simulation-submit-check.py

  printf 'Running expanded Paper Risk guardrail tests...\n'
  (cd backend && .venv/bin/python -m pytest tests/test_paper_risk_guardrails.py)

  printf 'Running Paper Only demo evidence export dry-run...\n'
  paper_evidence_tmp="$(mktemp -d)"
  PAPER_EXECUTION_AUDIT_DB_PATH="${paper_evidence_tmp}/paper_demo.sqlite" \
    "${BACKEND_PYTHON}" scripts/seed-paper-execution-demo.py >/dev/null
  PAPER_EXECUTION_AUDIT_DB_PATH="${paper_evidence_tmp}/paper_demo.sqlite" \
    "${BACKEND_PYTHON}" scripts/export-paper-demo-evidence.py >/dev/null
  rm -rf "${paper_evidence_tmp}"

  printf 'Running Paper Broker simulation evidence export dry-run...\n'
  "${BACKEND_PYTHON}" scripts/export-paper-broker-simulation-evidence.py >/dev/null

  printf 'Running Mock Backend Demo MVP route tests...\n'
  (cd backend && .venv/bin/python -m pytest tests/test_mock_backend_routes.py)

  printf 'Running Paper Risk evidence export dry-run...\n'
  "${BACKEND_PYTHON}" scripts/export-paper-risk-evidence.py >/dev/null

  printf 'Running Paper Audit integrity verification dry-run...\n'
  paper_integrity_tmp="$(mktemp -d)"
  PAPER_EXECUTION_AUDIT_DB_PATH="${paper_integrity_tmp}/paper_integrity.sqlite" \
    "${BACKEND_PYTHON}" scripts/seed-paper-execution-demo.py >/dev/null
  PAPER_EXECUTION_AUDIT_DB_PATH="${paper_integrity_tmp}/paper_integrity.sqlite" \
    "${BACKEND_PYTHON}" scripts/verify-paper-audit-integrity.py >/dev/null
  rm -rf "${paper_integrity_tmp}"

  printf 'Running Hosted Paper tenant boundary evidence export dry-run...\n'
  "${BACKEND_PYTHON}" scripts/export-hosted-paper-tenant-boundary-evidence.py >/dev/null

  printf 'Running Hosted Paper datastore migration plan dry-run...\n'
  "${BACKEND_PYTHON}" scripts/hosted-paper-datastore-migration-plan.py >/dev/null

  printf 'Running Hosted Paper production datastore migration blueprint v2 dry-run...\n'
  "${BACKEND_PYTHON}" scripts/hosted-paper-production-datastore-migration-plan-v2.py >/dev/null
else
  printf 'backend/.venv/bin/python is missing; skipping backend runtime checks. Run bash scripts/bootstrap.sh.\n' >&2
fi

if command -v python3 >/dev/null 2>&1; then
  printf 'Checking Strategy SDK syntax...\n'
  python3 -m compileall -q strategy-engine/sdk
else
  printf 'python3 is not available; skipping Strategy SDK syntax check.\n' >&2
fi

if command -v npm >/dev/null 2>&1; then
  if [[ -d frontend/node_modules ]]; then
    printf 'Running frontend typecheck...\n'
    (cd frontend && npm run typecheck)

    printf 'Running frontend build...\n'
    (cd frontend && npm run build)
  else
    printf 'frontend/node_modules is missing; skipping frontend checks. Run bash scripts/bootstrap.sh.\n' >&2
  fi
else
  printf 'npm is not available; skipping frontend checks.\n' >&2
fi

if command -v node >/dev/null 2>&1; then
  printf 'Checking frontend Command Center i18n and safety copy...\n'
  node frontend/scripts/check-command-center-i18n.mjs

  printf 'Checking deployed frontend Command Center production safety copy...\n'
  node frontend/scripts/check-production-command-center.mjs

  printf 'Checking deployed frontend Customer Demo Guided Flow UI...\n'
  node frontend/scripts/check-customer-demo-ui.mjs

  printf 'Checking frontend Research Review Packet loader fixtures...\n'
  node --experimental-strip-types frontend/scripts/validate-research-review-packet-fixtures.mjs
else
  printf 'node is not available; skipping packet loader fixture checks.\n' >&2
fi

printf 'Checking website skeleton files...\n'
missing_website_file=0
for required_file in \
  docs/website-conversion-qa.md \
  website/package.json \
  website/tsconfig.json \
  website/astro.config.mjs \
  website/vercel.json \
  website/src/pages/index.astro \
  website/src/styles/global.css \
  website/scripts/check-content-safety.mjs \
  website/scripts/check-i18n-content.mjs; do
  if [[ ! -f "${required_file}" ]]; then
    printf 'Missing required website file: %s\n' "${required_file}" >&2
    missing_website_file=1
  fi
done

if [[ "${missing_website_file}" -ne 0 ]]; then
  exit 1
fi

if command -v node >/dev/null 2>&1; then
  printf 'Running website conversion and i18n content checks...\n'
  (cd website && node scripts/check-content-safety.mjs)
  (cd website && node scripts/check-i18n-content.mjs)
else
  printf 'node is not available; skipping website content checks.\n' >&2
fi

if command -v npm >/dev/null 2>&1; then
  if [[ -d website/node_modules ]]; then
    printf 'Running website Astro check...\n'
    (cd website && npm run check)

    printf 'Running website Astro build...\n'
    (cd website && npm run build)
  else
    printf 'Skipping website Astro build because dependencies are not installed. Run: cd website && npm install\n' >&2
  fi
else
  printf 'npm is not available; skipping website Astro checks.\n' >&2
fi

if command -v docker >/dev/null 2>&1 && docker compose version >/dev/null 2>&1; then
  printf 'Validating Docker Compose configuration...\n'
  docker compose config >/dev/null
else
  printf 'Docker Compose is not available; skipping docker compose config.\n' >&2
fi

printf '\nCheck summary: available checks completed with live trading disabled.\n'
