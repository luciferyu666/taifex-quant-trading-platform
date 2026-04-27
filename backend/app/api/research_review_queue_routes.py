from fastapi import APIRouter, HTTPException

from app.domain.research_review_queue import (
    ResearchReviewQueuePreviewRequest,
    ResearchReviewQueuePreviewResponse,
    preview_research_review_queue,
)

router = APIRouter(prefix="/api/strategy/research-review", tags=["strategy"])


@router.post("/queue/preview", response_model=ResearchReviewQueuePreviewResponse)
def preview_queue(
    request: ResearchReviewQueuePreviewRequest,
) -> ResearchReviewQueuePreviewResponse:
    try:
        return preview_research_review_queue(request)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
