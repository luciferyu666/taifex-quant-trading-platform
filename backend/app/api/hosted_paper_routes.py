from typing import Annotated

from fastapi import APIRouter, Depends

from app.core.config import Settings, get_settings
from app.domain.hosted_paper_auth_provider_selection import (
    HostedPaperAuthProviderSelectionResponse,
    get_hosted_paper_auth_provider_selection,
)
from app.domain.hosted_paper_datastore import (
    HostedPaperDatastoreReadinessResponse,
    get_hosted_paper_datastore_readiness,
)
from app.domain.hosted_paper_environment import (
    HostedPaperEnvironmentResponse,
    get_hosted_paper_environment,
)
from app.domain.hosted_paper_identity import (
    HostedPaperIdentityReadinessResponse,
    get_hosted_paper_identity_readiness,
)
from app.domain.hosted_paper_identity_access import (
    HostedPaperIdentityAccessContractResponse,
    get_hosted_paper_identity_access_contract,
)
from app.domain.hosted_paper_production_datastore import (
    HostedPaperProductionDatastoreReadinessResponse,
    get_hosted_paper_production_datastore_readiness,
)
from app.domain.hosted_paper_readiness import (
    HostedPaperReadinessResponse,
    get_hosted_paper_readiness,
)
from app.domain.hosted_paper_security_operations import (
    HostedPaperSecurityOperationsReadinessResponse,
    get_hosted_paper_security_operations_readiness,
)
from app.domain.hosted_paper_session import (
    HostedPaperMockSessionResponse,
    HostedPaperTenantContext,
    get_hosted_paper_mock_session,
)
from app.domain.hosted_web_command_center import (
    HostedWebCommandCenterReadinessResponse,
    get_hosted_web_command_center_readiness,
)

router = APIRouter(prefix="/api/hosted-paper", tags=["hosted-paper"])
SettingsDep = Annotated[Settings, Depends(get_settings)]


@router.get("/readiness", response_model=HostedPaperReadinessResponse)
def hosted_paper_readiness(settings: SettingsDep) -> HostedPaperReadinessResponse:
    return get_hosted_paper_readiness(settings)


@router.get("/environment", response_model=HostedPaperEnvironmentResponse)
def hosted_paper_environment(settings: SettingsDep) -> HostedPaperEnvironmentResponse:
    return get_hosted_paper_environment(settings)


@router.get(
    "/datastore-readiness",
    response_model=HostedPaperDatastoreReadinessResponse,
)
def hosted_paper_datastore_readiness(
    settings: SettingsDep,
) -> HostedPaperDatastoreReadinessResponse:
    return get_hosted_paper_datastore_readiness(settings)


@router.get(
    "/production-datastore/readiness",
    response_model=HostedPaperProductionDatastoreReadinessResponse,
)
def hosted_paper_production_datastore_readiness(
    settings: SettingsDep,
) -> HostedPaperProductionDatastoreReadinessResponse:
    return get_hosted_paper_production_datastore_readiness(settings)


@router.get("/session", response_model=HostedPaperMockSessionResponse)
def hosted_paper_mock_session(settings: SettingsDep) -> HostedPaperMockSessionResponse:
    return get_hosted_paper_mock_session(settings)


@router.get("/tenants/current", response_model=HostedPaperTenantContext)
def hosted_paper_current_tenant(settings: SettingsDep) -> HostedPaperTenantContext:
    return get_hosted_paper_mock_session(settings).tenant


@router.get(
    "/web-command-center/readiness",
    response_model=HostedWebCommandCenterReadinessResponse,
)
def hosted_web_command_center_readiness(
    settings: SettingsDep,
) -> HostedWebCommandCenterReadinessResponse:
    return get_hosted_web_command_center_readiness(settings)


@router.get(
    "/identity-readiness",
    response_model=HostedPaperIdentityReadinessResponse,
)
def hosted_paper_identity_readiness(
    settings: SettingsDep,
) -> HostedPaperIdentityReadinessResponse:
    return get_hosted_paper_identity_readiness(settings)


@router.get(
    "/identity-access-contract",
    response_model=HostedPaperIdentityAccessContractResponse,
)
def hosted_paper_identity_access_contract(
    settings: SettingsDep,
) -> HostedPaperIdentityAccessContractResponse:
    return get_hosted_paper_identity_access_contract(settings)


@router.get(
    "/auth-provider-selection",
    response_model=HostedPaperAuthProviderSelectionResponse,
)
def hosted_paper_auth_provider_selection(
    settings: SettingsDep,
) -> HostedPaperAuthProviderSelectionResponse:
    return get_hosted_paper_auth_provider_selection(settings)


@router.get(
    "/security-operations/readiness",
    response_model=HostedPaperSecurityOperationsReadinessResponse,
)
def hosted_paper_security_operations_readiness(
    settings: SettingsDep,
) -> HostedPaperSecurityOperationsReadinessResponse:
    return get_hosted_paper_security_operations_readiness(settings)
