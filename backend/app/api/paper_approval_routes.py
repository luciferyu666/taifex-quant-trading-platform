from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException

from app.core.config import Settings, get_settings
from app.domain.paper_approval import (
    PaperApprovalDecisionCreate,
    PaperApprovalHistory,
    PaperApprovalRequestCreate,
    PaperApprovalStatusResponse,
)
from app.services.paper_approval_store import PaperApprovalStore

router = APIRouter(
    prefix="/api/paper-execution/approvals",
    tags=["paper-execution-approvals"],
)
SettingsDep = Annotated[Settings, Depends(get_settings)]


def _paper_approval_store(settings: Settings) -> PaperApprovalStore:
    return PaperApprovalStore(settings.paper_execution_audit_db_path)


@router.get("/status", response_model=PaperApprovalStatusResponse)
def paper_approval_status(settings: SettingsDep) -> PaperApprovalStatusResponse:
    return PaperApprovalStatusResponse(
        trading_mode=settings.trading_mode,
        live_trading_enabled=settings.live_trading_enabled,
        broker_provider=settings.broker_provider,
        approval_mode="paper_only_local_approval_foundation",
        supported_decisions=[
            "research_approved",
            "approved_for_paper_simulation",
            "rejected",
            "needs_data_review",
        ],
        reviewer_roles=[
            "research_reviewer",
            "risk_reviewer",
            "compliance_reviewer",
        ],
        dual_review_required=True,
        immutable_record_policy=(
            "Append-only local SQLite records with hash chaining. This is not a "
            "production WORM ledger or production identity system."
        ),
        message=(
            "Paper approval workflow foundation is available for local simulation "
            "governance only. Live approval is not supported."
        ),
    )


@router.post("/requests", response_model=PaperApprovalHistory)
def create_paper_approval_request(
    request: PaperApprovalRequestCreate,
    settings: SettingsDep,
) -> PaperApprovalHistory:
    try:
        return _paper_approval_store(settings).create_request(request)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.get("/queue", response_model=list[PaperApprovalHistory])
def list_paper_approval_queue(
    settings: SettingsDep,
    limit: int = 50,
) -> list[PaperApprovalHistory]:
    safe_limit = max(1, min(limit, 200))
    return _paper_approval_store(settings).list_queue(limit=safe_limit)


@router.get("/history", response_model=list[PaperApprovalHistory])
def list_paper_approval_history(
    settings: SettingsDep,
    limit: int = 50,
) -> list[PaperApprovalHistory]:
    safe_limit = max(1, min(limit, 200))
    return _paper_approval_store(settings).list_histories(limit=safe_limit)


@router.get("/requests/{approval_request_id}", response_model=PaperApprovalHistory)
def get_paper_approval_request(
    approval_request_id: str,
    settings: SettingsDep,
) -> PaperApprovalHistory:
    try:
        return _paper_approval_store(settings).get_history(approval_request_id)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.get(
    "/requests/{approval_request_id}/history",
    response_model=PaperApprovalHistory,
)
def get_paper_approval_request_history(
    approval_request_id: str,
    settings: SettingsDep,
) -> PaperApprovalHistory:
    try:
        return _paper_approval_store(settings).get_history(approval_request_id)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.post(
    "/requests/{approval_request_id}/decisions",
    response_model=PaperApprovalHistory,
)
def record_paper_approval_decision(
    approval_request_id: str,
    decision: PaperApprovalDecisionCreate,
    settings: SettingsDep,
) -> PaperApprovalHistory:
    try:
        return _paper_approval_store(settings).record_decision(
            approval_request_id,
            decision,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
