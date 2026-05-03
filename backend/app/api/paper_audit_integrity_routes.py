from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends

from app.core.config import Settings, get_settings
from app.domain.audit_integrity import (
    PaperAuditIntegrityStatus,
    PaperAuditIntegrityVerification,
)
from app.domain.paper_audit_compliance_trail import (
    PaperAuditComplianceTrailReadinessResponse,
    get_paper_audit_compliance_trail_readiness,
)
from app.domain.paper_audit_worm_readiness import (
    PaperAuditWormReadinessResponse,
    get_paper_audit_worm_readiness,
)
from app.services.audit_integrity_service import PaperAuditIntegrityService

router = APIRouter(prefix="/api/paper-execution", tags=["paper-audit-integrity"])
SettingsDep = Annotated[Settings, Depends(get_settings)]


def _audit_integrity_service(settings: Settings) -> PaperAuditIntegrityService:
    return PaperAuditIntegrityService(settings.paper_execution_audit_db_path)


@router.get("/audit-integrity/status", response_model=PaperAuditIntegrityStatus)
def paper_audit_integrity_status(
    settings: SettingsDep,
) -> PaperAuditIntegrityStatus:
    return _audit_integrity_service(settings).status()


@router.get(
    "/audit-integrity/worm-readiness",
    response_model=PaperAuditWormReadinessResponse,
)
def paper_audit_worm_readiness(
    settings: SettingsDep,
) -> PaperAuditWormReadinessResponse:
    return get_paper_audit_worm_readiness(settings)


@router.get(
    "/audit-integrity/compliance-trail-readiness",
    response_model=PaperAuditComplianceTrailReadinessResponse,
)
def paper_audit_compliance_trail_readiness(
    settings: SettingsDep,
) -> PaperAuditComplianceTrailReadinessResponse:
    return get_paper_audit_compliance_trail_readiness(settings)


@router.get("/audit-integrity/verify", response_model=PaperAuditIntegrityVerification)
def paper_audit_integrity_verify(
    settings: SettingsDep,
    workflow_run_id: str | None = None,
) -> PaperAuditIntegrityVerification:
    return _audit_integrity_service(settings).verify(workflow_run_id=workflow_run_id)


@router.get(
    "/runs/{workflow_run_id}/audit-integrity",
    response_model=PaperAuditIntegrityVerification,
)
def paper_audit_integrity_for_run(
    workflow_run_id: str,
    settings: SettingsDep,
) -> PaperAuditIntegrityVerification:
    return _audit_integrity_service(settings).verify(workflow_run_id=workflow_run_id)
