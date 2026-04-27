from fastapi import APIRouter, HTTPException

from app.domain.research_review_decision_index import (
    ResearchReviewDecisionIndexPreviewRequest,
    ResearchReviewDecisionIndexPreviewResponse,
    preview_research_review_decision_index,
)

router = APIRouter(prefix="/api/strategy/research-review", tags=["strategy"])


@router.post(
    "/decision-index/preview",
    response_model=ResearchReviewDecisionIndexPreviewResponse,
)
def preview_decision_index(
    request: ResearchReviewDecisionIndexPreviewRequest,
) -> ResearchReviewDecisionIndexPreviewResponse:
    try:
        return preview_research_review_decision_index(request)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
