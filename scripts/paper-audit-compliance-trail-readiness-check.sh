#!/usr/bin/env bash
set -euo pipefail

required_files=(
  "docs/paper-audit-compliance-trail-readiness.md"
  "backend/app/domain/paper_audit_compliance_trail.py"
  "backend/app/api/paper_audit_integrity_routes.py"
  "backend/tests/test_paper_audit_compliance_trail_routes.py"
)

for required_file in "${required_files[@]}"; do
  test -f "${required_file}"
done

grep -q "TRADING_MODE=paper" .env.example
grep -q "ENABLE_LIVE_TRADING=false" .env.example
grep -q "BROKER_PROVIDER=paper" .env.example

grep -q "local_sqlite_hash_chain_not_formal_compliance_trail" \
  backend/app/domain/paper_audit_compliance_trail.py
grep -q "append_only_audit_service_enabled: bool = False" \
  backend/app/domain/paper_audit_compliance_trail.py
grep -q "immutable_audit_log_enabled: bool = False" \
  backend/app/domain/paper_audit_compliance_trail.py
grep -q "reviewer_identity_enforced: bool = False" \
  backend/app/domain/paper_audit_compliance_trail.py
grep -q "decision_history_immutable: bool = False" \
  backend/app/domain/paper_audit_compliance_trail.py
grep -q "retention_policy_enforced: bool = False" \
  backend/app/domain/paper_audit_compliance_trail.py
grep -q "export_policy_enforced: bool = False" \
  backend/app/domain/paper_audit_compliance_trail.py
grep -q "compliance_claim: bool = False" \
  backend/app/domain/paper_audit_compliance_trail.py
grep -q "/audit-integrity/compliance-trail-readiness" \
  backend/app/api/paper_audit_integrity_routes.py
grep -q "Paper Audit Compliance Trail Readiness" \
  docs/paper-audit-compliance-trail-readiness.md
grep -q "not a formal append-only audit service" \
  docs/paper-audit-compliance-trail-readiness.md
grep -q "Live trading remains disabled by default" \
  docs/paper-audit-compliance-trail-readiness.md

if rg -n \
  --glob '!scripts/paper-audit-compliance-trail-readiness-check.sh' \
  "formal compliance trail ready|append-only audit service enabled|production audit compliance achieved|正式合規稽核已就緒|正式 append-only audit 已啟用" \
  backend/app docs frontend/app scripts; then
  echo "Unsafe audit compliance readiness claim detected." >&2
  exit 1
fi

echo "Paper audit compliance trail readiness OK. Live trading remains disabled by default."
