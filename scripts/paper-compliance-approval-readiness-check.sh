#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
cd "${REPO_ROOT}"

printf 'Checking paper compliance approval readiness boundary...\n'

required_files=(
  "docs/paper-compliance-approval-readiness.md"
  "docs/paper-approval-workflow.md"
  "backend/app/domain/paper_compliance_approval.py"
  "backend/app/api/paper_approval_routes.py"
  "backend/tests/test_paper_compliance_approval_readiness_routes.py"
  "frontend/app/components/PaperComplianceApprovalReadinessPanel.tsx"
)

for required_file in "${required_files[@]}"; do
  if [[ ! -f "${required_file}" ]]; then
    printf 'Missing required paper compliance approval file: %s\n' "${required_file}" >&2
    exit 1
  fi
done

required_doc_text=(
  "Paper Compliance Approval Readiness"
  "GET /api/paper-execution/approvals/compliance-readiness"
  "local paper scaffolding"
  "formal compliance approval is not enabled"
  "reviewer identity is not verified"
  "RBAC/ABAC is not enforced"
  "WORM ledger is not enabled"
  "centralized audit service is not enabled"
  "TRADING_MODE=paper"
  "ENABLE_LIVE_TRADING=false"
  "BROKER_PROVIDER=paper"
  "formal_compliance_approval_enabled=false"
  "production_approval_authority=false"
  "reviewer_identity_verified=false"
  "rbac_abac_enforced=false"
  "production_compliance_approval=false"
  "live_approval_granted=false"
  "paper_execution_approval_granted=false"
  "broker_api_called=false"
  "credentials_collected=false"
  "order_created=false"
  "Live trading remains disabled by default"
)

for text in "${required_doc_text[@]}"; do
  if ! grep -Fq "${text}" docs/paper-compliance-approval-readiness.md; then
    printf 'Paper compliance approval readiness doc must contain: %s\n' "${text}" >&2
    exit 1
  fi
done

required_code_text=(
  "PaperComplianceApprovalReadinessResponse"
  "get_paper_compliance_approval_readiness"
  "paper-compliance-approval-readiness"
  "local_paper_scaffolding_not_formal_compliance_system"
  "formal_compliance_approval_enabled"
  "production_approval_authority"
  "reviewer_identity_verified"
  "rbac_abac_enforced"
  "worm_ledger_enabled"
  "centralized_audit_service_enabled"
  "production_compliance_approval"
  "live_approval_granted"
  "paper_execution_approval_granted"
  "@router.get("
  "/compliance-readiness"
  "PaperComplianceApprovalReadinessPanel"
)

for text in "${required_code_text[@]}"; do
  if ! grep -R -Fq "${text}" backend/app/domain/paper_compliance_approval.py backend/app/api/paper_approval_routes.py backend/tests/test_paper_compliance_approval_readiness_routes.py frontend/app/components/PaperComplianceApprovalReadinessPanel.tsx; then
    printf 'Paper compliance approval readiness implementation must contain: %s\n' "${text}" >&2
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
  'formal compliance approval enabled' \
  'production approval authority=true' \
  'reviewer identity verified=true' \
  'RBAC/ABAC enforced=true' \
  'live approval granted' \
  'paper execution approval granted' \
  'broker credential upload enabled' \
  'guaranteed profit' \
  'risk-free'; do
  if grep -R -Fiq "${forbidden_text}" docs/paper-compliance-approval-readiness.md backend/app/domain/paper_compliance_approval.py backend/app/api/paper_approval_routes.py frontend/app/components/PaperComplianceApprovalReadinessPanel.tsx; then
    printf 'Paper compliance approval readiness contains forbidden text: %s\n' "${forbidden_text}" >&2
    exit 1
  fi
done

printf 'Paper compliance approval readiness OK. Live trading remains disabled by default.\n'
