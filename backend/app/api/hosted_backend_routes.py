from typing import Annotated

from fastapi import APIRouter, Depends

from app.core.config import Settings, get_settings
from app.domain.hosted_backend_environment import (
    HostedBackendEnvironmentResponse,
    HostedBackendReadinessResponse,
    get_hosted_backend_environment,
    get_hosted_backend_readiness,
)

router = APIRouter(prefix="/api/hosted-backend", tags=["hosted-backend"])
SettingsDep = Annotated[Settings, Depends(get_settings)]


@router.get("/environment", response_model=HostedBackendEnvironmentResponse)
def hosted_backend_environment(settings: SettingsDep) -> HostedBackendEnvironmentResponse:
    return get_hosted_backend_environment(settings)


@router.get("/readiness", response_model=HostedBackendReadinessResponse)
def hosted_backend_readiness(settings: SettingsDep) -> HostedBackendReadinessResponse:
    return get_hosted_backend_readiness(settings)
