SHELL := /usr/bin/env bash

.PHONY: help init infra dev backend frontend frontend-i18n-check frontend-production-smoke-check customer-demo-ui-smoke-check paper-approval-ui-flow-smoke-check website website-build website-preview website-check website-content-check website-deploy roadmap-status release-readiness-check customer-evaluation-check social-content-check seed-paper-execution-demo paper-demo-evidence-export paper-simulation-submit-check paper-approval-workflow-check paper-execution-workflow-check paper-execution-persistence-check paper-oms-reliability-check paper-oms-timeout-check data-fixtures-check rollover-fixtures-check continuous-futures-preview feature-manifest-preview strategy-research-preview backtest-preview backtest-result-preview toy-backtest backtest-artifact-preview backtest-artifact-index-preview backtest-artifact-comparison-preview backtest-research-bundle-preview backtest-research-bundle-index-preview research-review-queue-preview research-review-decision-preview research-review-decision-index-preview research-review-packet-preview sample-research-review-packet research-review-packet-fixtures-check data-quality-reports-dry-run data-version-register-dry-run data-migrations-dry-run data-platform-verify architecture-status architecture-docs-check architecture-safety-check business-docs-check business-compliance-check business-status check test codex-prompt clean

help:
	@printf 'Taifex Quant Trading Platform commands\n'
	@printf '\n'
	@printf '  make init          Bootstrap local dependencies\n'
	@printf '  make infra         Start database/cache/analytics services\n'
	@printf '  make dev           Start the full Docker Compose stack\n'
	@printf '  make backend       Run FastAPI backend locally\n'
	@printf '  make frontend      Run Next.js frontend locally\n'
	@printf '  make frontend-i18n-check Validate Command Center bilingual safety copy\n'
	@printf '  make frontend-production-smoke-check Validate deployed Command Center safety copy\n'
	@printf '  make customer-demo-ui-smoke-check Validate deployed customer demo guide UI copy\n'
	@printf '  make paper-approval-ui-flow-smoke-check Run local browser drill for request -> decision -> submit -> audit viewer\n'
	@printf '  make website       Run Astro marketing website locally\n'
	@printf '  make website-build Build Astro marketing website\n'
	@printf '  make website-preview Preview built Astro website locally\n'
	@printf '  make website-check Run Astro website checks\n'
	@printf '  make website-content-check Validate website conversion, safety, and i18n copy\n'
	@printf '  make website-deploy Build and deploy website with Vercel CLI\n'
	@printf '  make roadmap-status Print Phase 0-6 roadmap scaffold status\n'
	@printf '  make release-readiness-check Audit release level, dirty worktree, and safety gates\n'
	@printf '  make customer-evaluation-check Validate controlled customer evaluation package\n'
	@printf '  make social-content-check Validate Facebook community launch safety copy\n'
	@printf '  make seed-paper-execution-demo Create local paper OMS/audit demo record\n'
	@printf '  make paper-demo-evidence-export Export local Paper Only demo evidence to stdout\n'
	@printf '  make paper-simulation-submit-check Verify Paper Only submit trace through API, OMS, and audit queries\n'
	@printf '  make paper-approval-workflow-check Validate paper-only approval queue and history\n'
	@printf '  make paper-execution-workflow-check Validate paper-only execution approval workflow\n'
	@printf '  make paper-execution-persistence-check Validate local paper OMS/audit persistence\n'
	@printf '  make paper-oms-reliability-check Validate local paper OMS reliability metadata\n'
	@printf '  make paper-oms-timeout-check Validate paper-only OMS timeout preview/mark flow\n'
	@printf '  make data-fixtures-check Validate local market data CSV fixtures\n'
	@printf '  make rollover-fixtures-check Validate local rollover event CSV fixtures\n'
	@printf '  make continuous-futures-preview Preview research-only continuous futures locally\n'
	@printf '  make feature-manifest-preview Build research-only feature dataset manifest locally\n'
	@printf '  make strategy-research-preview Preview signal-only strategy research locally\n'
	@printf '  make backtest-preview Preview dry-run backtest contract locally\n'
	@printf '  make backtest-result-preview Preview dry-run backtest result schema locally\n'
	@printf '  make toy-backtest  Run fixture-only toy backtest research simulation\n'
	@printf '  make backtest-artifact-preview Preview local JSON backtest artifact metadata\n'
	@printf '  make backtest-artifact-index-preview Preview local JSON artifact index metadata\n'
	@printf '  make backtest-artifact-comparison-preview Preview local JSON artifact comparison metadata\n'
	@printf '  make backtest-research-bundle-preview Preview local JSON research bundle metadata\n'
	@printf '  make backtest-research-bundle-index-preview Preview local JSON research bundle index metadata\n'
	@printf '  make research-review-queue-preview Preview local research review queue metadata\n'
	@printf '  make research-review-decision-preview Preview local research review decision metadata\n'
	@printf '  make research-review-decision-index-preview Preview local research review decision index metadata\n'
	@printf '  make research-review-packet-preview Preview local research review packet metadata\n'
	@printf '  make sample-research-review-packet Print safe local sample packet for UI loader\n'
	@printf '  make research-review-packet-fixtures-check Validate local packet loader fixtures\n'
	@printf '  make data-quality-reports-dry-run Validate report artifacts without DB writes\n'
	@printf '  make data-version-register-dry-run Dry-run data version registry record creation\n'
	@printf '  make data-migrations-dry-run List local data-platform migrations without DB writes\n'
	@printf '  make data-platform-verify Dry-run local data-platform schema verification\n'
	@printf '  make architecture-status Print system architecture scaffold status\n'
	@printf '  make architecture-docs-check Validate architecture documentation files\n'
	@printf '  make architecture-safety-check Validate architecture safety guardrails\n'
	@printf '  make business-docs-check Validate business documentation files\n'
	@printf '  make business-compliance-check Validate business compliance guardrails\n'
	@printf '  make business-status Print business artifact status\n'
	@printf '  make check         Run validation checks\n'
	@printf '  make test          Run backend tests\n'
	@printf '  make codex-prompt  Print the recommended Codex prompt\n'
	@printf '  make clean         Remove local caches and build artifacts\n'

init:
	bash scripts/bootstrap.sh

infra:
	@if command -v docker >/dev/null 2>&1 && docker compose version >/dev/null 2>&1; then \
		docker compose up -d postgres redis clickhouse; \
	else \
		printf 'Docker Compose is not available. Install Docker Desktop or Docker Engine with Compose v2.\n' >&2; \
		exit 1; \
	fi

dev:
	@if command -v docker >/dev/null 2>&1 && docker compose version >/dev/null 2>&1; then \
		docker compose up --build; \
	else \
		printf 'Docker Compose is not available. Install Docker Desktop or Docker Engine with Compose v2.\n' >&2; \
		exit 1; \
	fi

backend:
	cd backend && . .venv/bin/activate && uvicorn app.main:app --reload --host "$${BACKEND_HOST:-0.0.0.0}" --port "$${BACKEND_PORT:-8000}"

frontend:
	cd frontend && npm run dev -- --hostname 0.0.0.0 --port "$${FRONTEND_PORT:-3000}"

frontend-i18n-check:
	node frontend/scripts/check-command-center-i18n.mjs

frontend-production-smoke-check:
	node frontend/scripts/check-production-command-center.mjs

customer-demo-ui-smoke-check:
	node frontend/scripts/check-customer-demo-ui.mjs

paper-approval-ui-flow-smoke-check:
	node frontend/scripts/check-paper-approval-ui-flow.mjs

website:
	cd website && npm run dev

website-build:
	cd website && npm run build

website-preview:
	cd website && npm run preview

website-check:
	cd website && npm run check

website-content-check:
	cd website && node scripts/check-content-safety.mjs
	cd website && node scripts/check-i18n-content.mjs

website-deploy:
	bash scripts/deploy-website-vercel.sh

roadmap-status:
	bash scripts/roadmap-status.sh

release-readiness-check:
	bash scripts/release-readiness-check.sh

customer-evaluation-check:
	bash scripts/customer-evaluation-check.sh

social-content-check:
	bash scripts/social-content-check.sh

seed-paper-execution-demo:
	backend/.venv/bin/python scripts/seed-paper-execution-demo.py

paper-demo-evidence-export:
	backend/.venv/bin/python scripts/export-paper-demo-evidence.py

paper-simulation-submit-check:
	backend/.venv/bin/python scripts/paper-simulation-submit-check.py

paper-approval-workflow-check:
	cd backend && . .venv/bin/activate && pytest tests/test_paper_approval_store.py tests/test_paper_approval_routes.py

paper-execution-workflow-check:
	cd backend && . .venv/bin/activate && pytest tests/test_paper_approval_store.py tests/test_paper_approval_routes.py tests/test_paper_execution_workflow.py tests/test_paper_execution_routes.py tests/test_paper_execution_store.py tests/test_seed_paper_execution_demo_script.py tests/test_paper_simulation_submit_check_script.py tests/test_paper_demo_evidence_export_script.py

paper-execution-persistence-check:
	cd backend && . .venv/bin/activate && pytest tests/test_paper_execution_store.py tests/test_paper_execution_routes.py tests/test_seed_paper_execution_demo_script.py tests/test_paper_simulation_submit_check_script.py tests/test_paper_demo_evidence_export_script.py

paper-oms-reliability-check:
	cd backend && . .venv/bin/activate && pytest tests/test_paper_execution_workflow.py tests/test_paper_execution_store.py tests/test_paper_execution_routes.py

paper-oms-timeout-check:
	cd backend && . .venv/bin/activate && pytest tests/test_paper_execution_store.py tests/test_paper_execution_routes.py

data-fixtures-check:
	backend/.venv/bin/python data-pipeline/validation/validate_market_bar_fixtures.py

rollover-fixtures-check:
	backend/.venv/bin/python data-pipeline/validation/validate_rollover_event_fixtures.py

continuous-futures-preview:
	backend/.venv/bin/python data-pipeline/validation/preview_continuous_futures.py

feature-manifest-preview:
	backend/.venv/bin/python data-pipeline/validation/build_feature_manifest.py

strategy-research-preview:
	PYTHONPATH=strategy-engine backend/.venv/bin/python strategy-engine/sdk/examples/manifest_signal_strategy.py

backtest-preview:
	PYTHONPATH=strategy-engine backend/.venv/bin/python strategy-engine/sdk/examples/backtest_preview_example.py

backtest-result-preview:
	PYTHONPATH=strategy-engine backend/.venv/bin/python strategy-engine/sdk/examples/backtest_result_preview_example.py

toy-backtest:
	PYTHONPATH=strategy-engine backend/.venv/bin/python strategy-engine/sdk/examples/toy_backtest_example.py

backtest-artifact-preview:
	PYTHONPATH=strategy-engine backend/.venv/bin/python strategy-engine/sdk/examples/export_backtest_artifact_example.py

backtest-artifact-index-preview:
	PYTHONPATH=strategy-engine backend/.venv/bin/python strategy-engine/sdk/examples/build_backtest_artifact_index_example.py

backtest-artifact-comparison-preview:
	PYTHONPATH=strategy-engine backend/.venv/bin/python strategy-engine/sdk/examples/compare_backtest_artifacts_example.py

backtest-research-bundle-preview:
	PYTHONPATH=strategy-engine backend/.venv/bin/python strategy-engine/sdk/examples/build_backtest_research_bundle_example.py

backtest-research-bundle-index-preview:
	PYTHONPATH=strategy-engine backend/.venv/bin/python strategy-engine/sdk/examples/build_backtest_research_bundle_index_example.py

research-review-queue-preview:
	PYTHONPATH=strategy-engine backend/.venv/bin/python strategy-engine/sdk/examples/build_research_review_queue_example.py

research-review-decision-preview:
	PYTHONPATH=strategy-engine backend/.venv/bin/python strategy-engine/sdk/examples/build_research_review_decision_example.py

research-review-decision-index-preview:
	PYTHONPATH=strategy-engine backend/.venv/bin/python strategy-engine/sdk/examples/build_research_review_decision_index_example.py

research-review-packet-preview:
	PYTHONPATH=strategy-engine backend/.venv/bin/python strategy-engine/sdk/examples/build_research_review_packet_example.py

sample-research-review-packet:
	PYTHONPATH=strategy-engine backend/.venv/bin/python strategy-engine/sdk/examples/export_sample_research_review_packet.py

research-review-packet-fixtures-check:
	node --experimental-strip-types frontend/scripts/validate-research-review-packet-fixtures.mjs

data-quality-reports-dry-run:
	backend/.venv/bin/python data-pipeline/validation/persist_quality_report.py

data-version-register-dry-run:
	backend/.venv/bin/python data-pipeline/validation/register_data_version.py

data-migrations-dry-run:
	backend/.venv/bin/python data-pipeline/migrations/apply_local_migrations.py

data-platform-verify:
	backend/.venv/bin/python data-pipeline/migrations/verify_local_data_platform.py

architecture-status:
	bash scripts/architecture-status.sh

architecture-docs-check:
	@test -f docs/system-architecture-spec.md
	@test -f docs/control-plane.md
	@test -f docs/trading-data-plane.md
	@test -f docs/data-lakehouse-architecture.md
	@test -f docs/oms-state-machine.md
	@test -f docs/broker-gateway-adapter-pattern.md
	@test -f docs/risk-engine-spec.md
	@test -f docs/security-vault-asvs.md
	@test -f docs/observability-dr-event-sourcing.md
	@echo "Architecture docs OK"

architecture-safety-check:
	bash scripts/architecture-safety-check.sh

business-docs-check:
	@test -f docs/business-model.md
	@test -f docs/pricing-strategy.md
	@test -f docs/go-to-market.md
	@test -f docs/compliance-boundary.md
	@test -f docs/partner-profit-sharing.md
	@echo "Business docs OK"

business-compliance-check:
	bash scripts/business-compliance-check.sh

business-status:
	bash scripts/business-status.sh

check:
	bash scripts/check.sh

test:
	cd backend && . .venv/bin/activate && pytest

codex-prompt:
	bash scripts/codex-prompt.sh

clean:
	@printf 'Removing local caches and build artifacts only.\n'
	find . -type d \( -name '__pycache__' -o -name '.pytest_cache' -o -name '.ruff_cache' -o -name '.next' -o -name 'dist' -o -name 'build' \) -prune -exec rm -r {} +
