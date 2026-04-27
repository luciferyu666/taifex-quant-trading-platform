from typing import Annotated

from fastapi import APIRouter, Depends

from app.core.config import Settings, get_settings
from app.domain.release_baseline import ReleaseBaselineResponse, get_release_baseline

router = APIRouter(prefix="/api/release", tags=["release"])
SettingsDep = Annotated[Settings, Depends(get_settings)]


@router.get("/baseline", response_model=ReleaseBaselineResponse)
def release_baseline(settings: SettingsDep) -> ReleaseBaselineResponse:
    return get_release_baseline(settings)
