#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
cd "${REPO_ROOT}"

printf 'Checking hosted paper production datastore readiness boundary...\n'

required_files=(
  "docs/hosted-paper-production-datastore-readiness.md"
  "docs/hosted-paper-managed-datastore-readiness.md"
  "docs/hosted-paper-saas-foundation-roadmap.md"
  "backend/app/domain/hosted_paper_production_datastore.py"
  "backend/app/api/hosted_paper_routes.py"
  "backend/tests/test_hosted_paper_production_datastore_readiness_routes.py"
  "frontend/app/components/HostedPaperProductionDatastoreReadinessPanel.tsx"
)

for required_file in "${required_files[@]}"; do
  if [[ ! -f "${required_file}" ]]; then
    printf 'Missing required hosted paper production datastore file: %s\n' "${required_file}" >&2
    exit 1
  fi
done

required_doc_text=(
  "Hosted Paper Production Datastore Readiness"
  "GET /api/hosted-paper/production-datastore/readiness"
  "contract_only_no_production_datastore"
  "managed_postgres_via_marketplace_candidate"
  "paper_approval"
  "paper_order"
  "oms_event"
  "audit_event"
  "hosted_paper_approval_requests"
  "hosted_paper_orders"
  "hosted_paper_oms_events"
  "hosted_paper_audit_events"
  "migration"
  "backup"
  "retention"
  "restore"
  "It does not read \`DATABASE_URL\`"
  "TRADING_MODE=paper"
  "ENABLE_LIVE_TRADING=false"
  "BROKER_PROVIDER=paper"
  "production_datastore_enabled=false"
  "managed_postgres_selected=false"
  "marketplace_provisioning_enabled=false"
  "hosted_records_writable=false"
  "hosted_records_readable=false"
  "migrations_apply_enabled=false"
  "backup_policy_configured=false"
  "restore_drill_verified=false"
  "retention_policy_enforced=false"
  "local_sqlite_allowed_for_production=false"
  "database_url_read=false"
  "connection_attempted=false"
  "apply_enabled=false"
  "database_written=false"
  "external_db_written=false"
  "broker_api_called=false"
  "order_created=false"
  "production_trading_ready=false"
  "Live trading remains disabled by default"
)

for text in "${required_doc_text[@]}"; do
  if ! grep -Fq "${text}" docs/hosted-paper-production-datastore-readiness.md; then
    printf 'Hosted paper production datastore doc must contain: %s\n' "${text}" >&2
    exit 1
  fi
done

required_code_text=(
  "HostedPaperProductionDatastoreReadinessResponse"
  "get_hosted_paper_production_datastore_readiness"
  "hosted-paper-production-datastore-readiness"
  "contract_only_no_production_datastore"
  "managed_postgres_via_marketplace_candidate"
  "/production-datastore/readiness"
  "HostedPaperProductionDatastoreReadinessPanel"
  "hosted_paper_approval_requests"
  "hosted_paper_orders"
  "hosted_paper_oms_events"
  "hosted_paper_audit_events"
  "local_sqlite_allowed_for_production"
  "database_url_read"
  "connection_attempted"
  "apply_enabled"
)

for text in "${required_code_text[@]}"; do
  if ! grep -R -Fq "${text}" \
    backend/app/domain/hosted_paper_production_datastore.py \
    backend/app/api/hosted_paper_routes.py \
    backend/tests/test_hosted_paper_production_datastore_readiness_routes.py \
    frontend/app/components/HostedPaperProductionDatastoreReadinessPanel.tsx \
    frontend/app/page.tsx; then
    printf 'Hosted paper production datastore implementation must contain: %s\n' "${text}" >&2
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

for forbidden_text in \
  'ENABLE_LIVE_TRADING=true' \
  'BROKER_PROVIDER=shioaji' \
  'BROKER_PROVIDER=fubon' \
  'production trading ready' \
  'production_datastore_enabled=true' \
  'managed_postgres_selected=true' \
  'marketplace_provisioning_enabled=true' \
  'hosted_records_writable=true' \
  'migrations_apply_enabled=true' \
  'database_url_read=true' \
  'connection_attempted=true' \
  'apply_enabled=true' \
  'database_written=true' \
  'external_db_written=true' \
  'broker_api_called=true' \
  'order_created=true' \
  'guaranteed profit' \
  'risk-free'; do
  if grep -R -Fiq "${forbidden_text}" \
    docs/hosted-paper-production-datastore-readiness.md \
    docs/hosted-paper-managed-datastore-readiness.md \
    docs/hosted-paper-saas-foundation-roadmap.md \
    backend/app/domain/hosted_paper_production_datastore.py \
    backend/app/api/hosted_paper_routes.py \
    frontend/app/components/HostedPaperProductionDatastoreReadinessPanel.tsx; then
    printf 'Hosted paper production datastore boundary contains forbidden text: %s\n' "${forbidden_text}" >&2
    exit 1
  fi
done

printf 'Hosted paper production datastore readiness OK. Live trading remains disabled by default.\n'
