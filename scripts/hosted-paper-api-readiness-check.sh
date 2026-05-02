#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
cd "${REPO_ROOT}"

printf 'Checking hosted paper backend/API readiness documentation...\n'

required_files=(
  "docs/hosted-paper-saas-foundation-roadmap.md"
  "docs/hosted-paper-backend-api-readiness.md"
  "docs/hosted-paper-managed-datastore-readiness.md"
  "docs/hosted-paper-managed-datastore-migration-plan.md"
  "docs/customer-self-service-paper-demo-roadmap.md"
  "docs/production-local-data-boundary.md"
  "docs/frontend-local-backend-demo-mode.md"
  "backend/app/domain/hosted_paper_environment.py"
  "backend/app/domain/hosted_paper_readiness.py"
  "backend/app/domain/hosted_paper_datastore.py"
  "backend/app/api/hosted_paper_routes.py"
  "backend/tests/test_hosted_paper_environment_routes.py"
  "backend/tests/test_hosted_paper_readiness_routes.py"
  "backend/tests/test_hosted_paper_datastore_readiness_routes.py"
  "backend/tests/test_hosted_paper_datastore_migration_plan_script.py"
  "scripts/hosted-paper-datastore-migration-plan.py"
  "frontend/app/components/HostedPaperEnvironmentPanel.tsx"
  "frontend/app/components/HostedPaperDatastoreReadinessPanel.tsx"
)

for required_file in "${required_files[@]}"; do
  if [[ ! -f "${required_file}" ]]; then
    printf 'Missing required hosted paper readiness file: %s\n' "${required_file}" >&2
    exit 1
  fi
done

required_text=(
  "hosted paper backend/API"
  "managed hosted datastore"
  "remains for local demo mode only"
  "GET /api/hosted-paper/environment"
  "authentication"
  "RBAC"
  "tenant"
  "GET /api/hosted-paper/datastore-readiness"
  "Broker SDK calls remain forbidden"
  "TRADING_MODE=paper"
  "ENABLE_LIVE_TRADING=false"
  "BROKER_PROVIDER=paper"
  "GET /api/hosted-paper/readiness"
  "Live trading remains disabled by default"
)

for text in "${required_text[@]}"; do
  if ! grep -R -Fq "${text}" docs/hosted-paper-backend-api-readiness.md; then
    printf 'Hosted paper readiness doc must contain: %s\n' "${text}" >&2
    exit 1
  fi
done

for text in \
  "Hosted Paper Managed Datastore Readiness Contract" \
  "GET /api/hosted-paper/datastore-readiness" \
  "tenant_id" \
  "hosted_paper_approval_requests" \
  "hosted_paper_approval_decisions" \
  "hosted_paper_workflow_runs" \
  "hosted_paper_oms_events" \
  "hosted_paper_audit_events" \
  "Dry-run only" \
  "No database connection is configured or attempted"; do
  if ! grep -R -Fq "${text}" docs/hosted-paper-managed-datastore-readiness.md; then
    printf 'Hosted paper datastore readiness doc must contain: %s\n' "${text}" >&2
    exit 1
  fi
done

for text in \
  "Hosted Paper Managed Datastore Migration Plan" \
  "scripts/hosted-paper-datastore-migration-plan.py" \
  "DATABASE_URL is not read" \
  "migration_apply_enabled=false" \
  "connection_attempted=false" \
  "hosted_paper_approval_requests" \
  "hosted_paper_approval_decisions" \
  "hosted_paper_workflow_runs" \
  "hosted_paper_oms_events" \
  "hosted_paper_audit_events" \
  "Live trading remains disabled by default"; do
  if ! grep -R -Fq "${text}" docs/hosted-paper-managed-datastore-migration-plan.md; then
    printf 'Hosted paper datastore migration plan doc must contain: %s\n' "${text}" >&2
    exit 1
  fi
done

for text in \
  "database_url_read" \
  "connection_attempted" \
  "migration_apply_enabled" \
  "hosted_records_written" \
  "hosted_paper_approval_requests" \
  "tenant_id"; do
  if ! grep -R -Fq "${text}" scripts/hosted-paper-datastore-migration-plan.py; then
    printf 'Hosted paper datastore migration plan script must contain: %s\n' "${text}" >&2
    exit 1
  fi
done

for text in \
  "Hosted Paper SaaS Foundation Roadmap" \
  "Local Demo Mode" \
  "Hosted Paper Mode" \
  "Production Trading Platform" \
  "Hosted Paper Mode | NOT ENABLED" \
  "Production Trading Platform | NOT READY" \
  "hosted backend" \
  "Managed database" \
  "Auth/session" \
  "Tenant isolation" \
  "Hosted customer demo tenant"; do
  if ! grep -R -Fq "${text}" docs/hosted-paper-saas-foundation-roadmap.md; then
    printf 'Hosted paper SaaS roadmap doc must contain: %s\n' "${text}" >&2
    exit 1
  fi
done

for route_text in \
  'prefix="/api/hosted-paper"' \
  '@router.get("/environment"' \
  '@router.get("/readiness"' \
  '"/datastore-readiness"' \
  'get_hosted_paper_environment' \
  'get_hosted_paper_readiness' \
  'get_hosted_paper_datastore_readiness' \
  'schema_only_no_hosted_datastore'; do
  if ! grep -R -Fq "${route_text}" \
    backend/app/domain/hosted_paper_environment.py \
    backend/app/domain/hosted_paper_readiness.py \
    backend/app/domain/hosted_paper_datastore.py \
    backend/app/api/hosted_paper_routes.py \
    backend/tests/test_hosted_paper_environment_routes.py \
    backend/tests/test_hosted_paper_readiness_routes.py \
    backend/tests/test_hosted_paper_datastore_readiness_routes.py; then
    printf 'Hosted paper readiness endpoint must contain: %s\n' "${route_text}" >&2
    exit 1
  fi
done

for frontend_text in \
  "HostedPaperEnvironmentPanel" \
  "/api/hosted-paper/environment" \
  "Local Demo Mode" \
  "Hosted Paper Mode" \
  "Production Trading Platform" \
  "current_customer_mode" \
  "not_enabled" \
  "not_ready"; do
  if ! grep -R -Fq "${frontend_text}" \
    frontend/app/page.tsx \
    frontend/app/i18n.ts \
    frontend/app/components/HostedPaperEnvironmentPanel.tsx; then
    printf 'Hosted paper environment UI must contain: %s\n' "${frontend_text}" >&2
    exit 1
  fi
done

for frontend_text in \
  "HostedPaperDatastoreReadinessPanel" \
  "/api/hosted-paper/datastore-readiness" \
  "tenant_id" \
  "schema_only_no_hosted_datastore" \
  "managed_datastore_enabled" \
  "hosted_records_writable" \
  "migration_boundary" \
  "retention_requirements"; do
  if ! grep -R -Fq "${frontend_text}" \
    frontend/app/page.tsx \
    frontend/app/i18n.ts \
    frontend/app/components/HostedPaperDatastoreReadinessPanel.tsx; then
    printf 'Hosted paper datastore UI must contain: %s\n' "${frontend_text}" >&2
    exit 1
  fi
done

for safety_default in \
  'TRADING_MODE=paper' \
  'ENABLE_LIVE_TRADING=false' \
  'BROKER_PROVIDER=paper'; do
  if ! grep -Fxq "${safety_default}" .env.example; then
    printf '.env.example must contain %s\n' "${safety_default}" >&2
    exit 1
  fi
done

if [[ -f .env ]] && grep -Eiq '^ENABLE_LIVE_TRADING=(true|1|yes)$' .env; then
  printf 'Unsafe local config: ENABLE_LIVE_TRADING is enabled in .env.\n' >&2
  exit 1
fi

for forbidden_text in \
  'ENABLE_LIVE_TRADING=true' \
  'BROKER_PROVIDER=shioaji' \
  'BROKER_PROVIDER=fubon' \
  'production trading ready'; do
  if grep -R -Fiq "${forbidden_text}" \
    docs/hosted-paper-backend-api-readiness.md \
    docs/hosted-paper-managed-datastore-readiness.md \
    docs/hosted-paper-managed-datastore-migration-plan.md \
    docs/hosted-paper-saas-foundation-roadmap.md; then
    printf 'Hosted paper readiness doc contains forbidden text: %s\n' "${forbidden_text}" >&2
    exit 1
  fi
done

printf 'Hosted paper backend/API readiness OK. Live trading remains disabled by default.\n'
