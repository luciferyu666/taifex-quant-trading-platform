from fastapi import APIRouter, HTTPException

from app.domain.continuous_futures import (
    ContinuousFuturesPreview,
    ContinuousFuturesPreviewRequest,
    preview_continuous_futures,
)

router = APIRouter(prefix="/api/data/continuous-futures", tags=["continuous-futures"])


@router.post("/preview", response_model=ContinuousFuturesPreview)
def continuous_futures_preview(
    request: ContinuousFuturesPreviewRequest,
) -> ContinuousFuturesPreview:
    try:
        return preview_continuous_futures(request)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
