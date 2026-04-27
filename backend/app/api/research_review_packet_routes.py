from fastapi import APIRouter, HTTPException

from app.domain.research_review_packet import (
    ResearchReviewPacketPreviewRequest,
    ResearchReviewPacketPreviewResponse,
    preview_research_review_packet,
    sample_research_review_packet,
)

router = APIRouter(prefix="/api/strategy/research-review", tags=["strategy"])


@router.post("/packet/preview", response_model=ResearchReviewPacketPreviewResponse)
def preview_packet(
    request: ResearchReviewPacketPreviewRequest,
) -> ResearchReviewPacketPreviewResponse:
    try:
        return preview_research_review_packet(request)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc


@router.get("/packet/sample", response_model=ResearchReviewPacketPreviewResponse)
def sample_packet() -> ResearchReviewPacketPreviewResponse:
    return sample_research_review_packet()
