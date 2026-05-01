from typing import Annotated

from fastapi import APIRouter, Depends

from app.core.config import Settings, get_settings
from app.domain.hosted_paper_readiness import (
    HostedPaperReadinessResponse,
    get_hosted_paper_readiness,
)

router = APIRouter(prefix="/api/hosted-paper", tags=["hosted-paper"])
SettingsDep = Annotated[Settings, Depends(get_settings)]


@router.get("/readiness", response_model=HostedPaperReadinessResponse)
def hosted_paper_readiness(settings: SettingsDep) -> HostedPaperReadinessResponse:
    return get_hosted_paper_readiness(settings)
