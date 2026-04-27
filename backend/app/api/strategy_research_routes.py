from fastapi import APIRouter, HTTPException

from app.domain.strategy_research import (
    StrategyResearchPreviewRequest,
    StrategyResearchPreviewResponse,
    preview_research_signal,
)

router = APIRouter(prefix="/api/strategy/research", tags=["strategy-research"])


@router.post("/preview-signal", response_model=StrategyResearchPreviewResponse)
def preview_signal(
    request: StrategyResearchPreviewRequest,
) -> StrategyResearchPreviewResponse:
    try:
        return preview_research_signal(request)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
