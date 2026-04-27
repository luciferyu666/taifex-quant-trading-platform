from fastapi import APIRouter, HTTPException

from app.domain.research_review_decision import (
    ResearchReviewDecisionPreviewRequest,
    ResearchReviewDecisionPreviewResponse,
    preview_research_review_decision,
)

router = APIRouter(prefix="/api/strategy/research-review", tags=["strategy"])


@router.post("/decision/preview", response_model=ResearchReviewDecisionPreviewResponse)
def preview_decision(
    request: ResearchReviewDecisionPreviewRequest,
) -> ResearchReviewDecisionPreviewResponse:
    try:
        return preview_research_review_decision(request)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
