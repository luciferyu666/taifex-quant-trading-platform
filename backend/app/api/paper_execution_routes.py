from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.core.config import Settings, get_settings
from app.domain.paper_execution import (
    PaperExecutionWorkflowRequest,
    PaperExecutionWorkflowResponse,
)
from app.domain.paper_execution_records import (
    PaperAuditEventRecord,
    PaperExecutionPersistenceStatus,
    PaperExecutionRunRecord,
    PaperOmsEventRecord,
)
from app.domain.paper_oms_reliability import (
    PaperExecutionReport,
    PaperOmsOutboxItem,
    PaperOmsReliabilityStatus,
    PaperOrderTimeoutCandidate,
    PaperOrderTimeoutMarkRequest,
    PaperOrderTimeoutMarkResponse,
)
from app.domain.risk_rules import RiskPolicy
from app.services.paper_approval_store import PaperApprovalStore
from app.services.paper_execution_store import PaperExecutionStore
from app.services.paper_execution_workflow import PaperExecutionWorkflow

router = APIRouter(prefix="/api/paper-execution", tags=["paper-execution"])
SettingsDep = Annotated[Settings, Depends(get_settings)]


class PaperExecutionStatusResponse(BaseModel):
    trading_mode: str
    live_trading_enabled: bool
    broker_provider: str
    workflow_statuses: list[str]
    order_path: list[str]
    ui_mode: str
    broker_api_called: bool
    message: str


def _risk_policy_from_settings(settings: Settings) -> RiskPolicy:
    return RiskPolicy(
        trading_mode=settings.trading_mode,
        live_trading_enabled=settings.live_trading_enabled,
        broker_provider=settings.broker_provider,
        max_tx_equivalent_exposure=settings.max_tx_equivalent_exposure,
        max_daily_loss_twd=settings.max_daily_loss_twd,
        stale_quote_seconds=settings.stale_quote_seconds,
    )


def _paper_execution_store(settings: Settings) -> PaperExecutionStore:
    return PaperExecutionStore(settings.paper_execution_audit_db_path)


def _paper_approval_store(settings: Settings) -> PaperApprovalStore:
    return PaperApprovalStore(settings.paper_execution_audit_db_path)


@router.get("/status", response_model=PaperExecutionStatusResponse)
def paper_execution_status(settings: SettingsDep) -> PaperExecutionStatusResponse:
    return PaperExecutionStatusResponse(
        trading_mode=settings.trading_mode,
        live_trading_enabled=settings.live_trading_enabled,
        broker_provider=settings.broker_provider,
        workflow_statuses=[
            "research_approved",
            "approved_for_paper_simulation",
            "rejected",
            "needs_data_review",
        ],
        order_path=[
            "StrategySignal",
            "Platform PaperOrderIntent",
            "Risk Engine",
            "OMS",
            "Paper Broker Gateway",
            "Audit Event",
        ],
        ui_mode="Paper Only read-only workflow status. No live controls are exposed.",
        broker_api_called=False,
        message=(
            "Paper execution approval workflow is available for simulation only. "
            "Live trading remains disabled by default."
        ),
    )


@router.post("/workflow/preview", response_model=PaperExecutionWorkflowResponse)
def paper_execution_workflow_preview(
    request: PaperExecutionWorkflowRequest,
    settings: SettingsDep,
) -> PaperExecutionWorkflowResponse:
    try:
        approval_history = _paper_approval_store(settings).get_history(
            request.approval_request_id
        )
        return PaperExecutionWorkflow(_risk_policy_from_settings(settings)).preview(
            request,
            approval_history,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.post("/workflow/record", response_model=PaperExecutionWorkflowResponse)
def paper_execution_workflow_record(
    request: PaperExecutionWorkflowRequest,
    settings: SettingsDep,
) -> PaperExecutionWorkflowResponse:
    try:
        approval_history = _paper_approval_store(settings).get_history(
            request.approval_request_id
        )
        response = PaperExecutionWorkflow(_risk_policy_from_settings(settings)).preview(
            request,
            approval_history,
        )
        persisted_response = response.model_copy(
            update={"persisted": True, "persistence_backend": "sqlite"}
        )
        _paper_execution_store(settings).persist_workflow(persisted_response)
        return persisted_response
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.get("/persistence/status", response_model=PaperExecutionPersistenceStatus)
def paper_execution_persistence_status(
    settings: SettingsDep,
) -> PaperExecutionPersistenceStatus:
    return _paper_execution_store(settings).status()


@router.get("/reliability/status", response_model=PaperOmsReliabilityStatus)
def paper_execution_reliability_status(
    settings: SettingsDep,
) -> PaperOmsReliabilityStatus:
    return _paper_execution_store(settings).reliability_status()


@router.get("/runs", response_model=list[PaperExecutionRunRecord])
def paper_execution_runs(
    settings: SettingsDep,
    limit: int = 50,
) -> list[PaperExecutionRunRecord]:
    safe_limit = max(1, min(limit, 200))
    return _paper_execution_store(settings).list_runs(limit=safe_limit)


@router.get("/runs/{workflow_run_id}", response_model=PaperExecutionRunRecord)
def paper_execution_run(
    workflow_run_id: str,
    settings: SettingsDep,
) -> PaperExecutionRunRecord:
    record = _paper_execution_store(settings).get_run(workflow_run_id)
    if record is None:
        raise HTTPException(status_code=404, detail="paper execution run not found")
    return record


@router.get("/runs/{workflow_run_id}/oms-events", response_model=list[PaperOmsEventRecord])
def paper_execution_run_oms_events(
    workflow_run_id: str,
    settings: SettingsDep,
) -> list[PaperOmsEventRecord]:
    return _paper_execution_store(settings).list_oms_events(workflow_run_id=workflow_run_id)


@router.get("/runs/{workflow_run_id}/audit-events", response_model=list[PaperAuditEventRecord])
def paper_execution_run_audit_events(
    workflow_run_id: str,
    settings: SettingsDep,
) -> list[PaperAuditEventRecord]:
    return _paper_execution_store(settings).list_audit_events(
        workflow_run_id=workflow_run_id
    )


@router.get("/orders/{order_id}/oms-events", response_model=list[PaperOmsEventRecord])
def paper_execution_order_oms_events(
    order_id: str,
    settings: SettingsDep,
) -> list[PaperOmsEventRecord]:
    return _paper_execution_store(settings).list_oms_events(order_id=order_id)


@router.get(
    "/orders/{order_id}/execution-reports",
    response_model=list[PaperExecutionReport],
)
def paper_execution_order_execution_reports(
    order_id: str,
    settings: SettingsDep,
) -> list[PaperExecutionReport]:
    return _paper_execution_store(settings).list_execution_reports(order_id=order_id)


@router.get("/audit-events", response_model=list[PaperAuditEventRecord])
def paper_execution_audit_events(
    settings: SettingsDep,
    limit: int = 100,
) -> list[PaperAuditEventRecord]:
    safe_limit = max(1, min(limit, 500))
    return _paper_execution_store(settings).list_audit_events(limit=safe_limit)


@router.get("/outbox", response_model=list[PaperOmsOutboxItem])
def paper_execution_outbox_items(
    settings: SettingsDep,
    status: str | None = None,
    limit: int = 100,
) -> list[PaperOmsOutboxItem]:
    safe_limit = max(1, min(limit, 500))
    return _paper_execution_store(settings).list_outbox_items(
        status=status,
        limit=safe_limit,
    )


@router.get(
    "/reliability/timeout-candidates",
    response_model=list[PaperOrderTimeoutCandidate],
)
def paper_execution_timeout_candidates(
    settings: SettingsDep,
    timeout_seconds: int = 30,
) -> list[PaperOrderTimeoutCandidate]:
    safe_timeout = max(1, min(timeout_seconds, 86_400))
    return _paper_execution_store(settings).list_timeout_candidates(
        timeout_seconds=safe_timeout,
    )


@router.post(
    "/reliability/timeout-preview",
    response_model=PaperOrderTimeoutMarkResponse,
)
def paper_execution_timeout_preview(
    request: PaperOrderTimeoutMarkRequest,
    settings: SettingsDep,
) -> PaperOrderTimeoutMarkResponse:
    try:
        return _paper_execution_store(settings).preview_timeout_mark(request)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.post(
    "/reliability/timeout-mark",
    response_model=PaperOrderTimeoutMarkResponse,
)
def paper_execution_timeout_mark(
    request: PaperOrderTimeoutMarkRequest,
    settings: SettingsDep,
) -> PaperOrderTimeoutMarkResponse:
    try:
        return _paper_execution_store(settings).mark_timeout(request)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
