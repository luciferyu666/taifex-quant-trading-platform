from typing import Annotated

from fastapi import APIRouter, Depends

from app.core.config import Settings, get_settings
from app.domain.hosted_paper_identity import (
    HostedPaperIdentityReadinessResponse,
    get_hosted_paper_identity_readiness,
)
from app.domain.hosted_paper_readiness import (
    HostedPaperReadinessResponse,
    get_hosted_paper_readiness,
)
from app.domain.hosted_paper_session import (
    HostedPaperMockSessionResponse,
    HostedPaperTenantContext,
    get_hosted_paper_mock_session,
)

router = APIRouter(prefix="/api/hosted-paper", tags=["hosted-paper"])
SettingsDep = Annotated[Settings, Depends(get_settings)]


@router.get("/readiness", response_model=HostedPaperReadinessResponse)
def hosted_paper_readiness(settings: SettingsDep) -> HostedPaperReadinessResponse:
    return get_hosted_paper_readiness(settings)


@router.get("/session", response_model=HostedPaperMockSessionResponse)
def hosted_paper_mock_session(settings: SettingsDep) -> HostedPaperMockSessionResponse:
    return get_hosted_paper_mock_session(settings)


@router.get("/tenants/current", response_model=HostedPaperTenantContext)
def hosted_paper_current_tenant(settings: SettingsDep) -> HostedPaperTenantContext:
    return get_hosted_paper_mock_session(settings).tenant


@router.get(
    "/identity-readiness",
    response_model=HostedPaperIdentityReadinessResponse,
)
def hosted_paper_identity_readiness(
    settings: SettingsDep,
) -> HostedPaperIdentityReadinessResponse:
    return get_hosted_paper_identity_readiness(settings)
