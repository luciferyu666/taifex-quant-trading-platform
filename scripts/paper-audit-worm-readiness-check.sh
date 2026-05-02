#!/usr/bin/env bash
set -euo pipefail

required_files=(
  "docs/paper-audit-worm-readiness.md"
  "backend/app/domain/paper_audit_worm_readiness.py"
  "backend/app/api/paper_audit_integrity_routes.py"
  "backend/tests/test_paper_audit_worm_readiness_routes.py"
  "frontend/app/components/PaperAuditWormReadinessPanel.tsx"
)

for required_file in "${required_files[@]}"; do
  test -f "${required_file}"
done

grep -q "TRADING_MODE=paper" .env.example
grep -q "ENABLE_LIVE_TRADING=false" .env.example
grep -q "BROKER_PROVIDER=paper" .env.example

grep -q "local_sqlite_not_production_worm_ledger" \
  backend/app/domain/paper_audit_worm_readiness.py
grep -q "worm_storage_enabled: bool = False" \
  backend/app/domain/paper_audit_worm_readiness.py
grep -q "immutable_ledger_enabled: bool = False" \
  backend/app/domain/paper_audit_worm_readiness.py
grep -q "production_audit_compliance: bool = False" \
  backend/app/domain/paper_audit_worm_readiness.py
grep -q "/audit-integrity/worm-readiness" \
  backend/app/api/paper_audit_integrity_routes.py
grep -q "/api/paper-execution/audit-integrity/worm-readiness" \
  frontend/app/page.tsx
grep -q "SQLite audit is not a production WORM ledger" frontend/app/i18n.ts
grep -q "SQLite audit 不是 production WORM ledger" frontend/app/i18n.ts

if rg -n \
  --glob '!scripts/paper-audit-worm-readiness-check.sh' \
  "WORM compliance achieved|production WORM ready|immutable ledger ready" \
  backend/app docs frontend/app scripts; then
  echo "Unsafe WORM readiness claim detected." >&2
  exit 1
fi

echo "Paper audit WORM readiness OK. Live trading remains disabled by default."
