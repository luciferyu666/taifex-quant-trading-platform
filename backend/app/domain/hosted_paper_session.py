from __future__ import annotations

from typing import Any

from pydantic import BaseModel, Field

from app.core.config import Settings
from app.domain.hosted_paper_readiness import HostedPaperSafetyDefaults


class HostedPaperRoleDefinition(BaseModel):
    role: str
    description: str
    paper_only: bool = True
    can_enable_live_trading: bool = False
    can_upload_broker_credentials: bool = False


class HostedPaperPermissionDefinition(BaseModel):
    permission: str
    description: str
    granted_in_mock_session: bool
    mutation: bool = False
    requires_rbac: bool = True
    requires_abac: bool = True
    requires_completed_approval_request: bool = False


class HostedPaperTenantContext(BaseModel):
    tenant_id: str = "mock-tenant-paper-evaluation"
    tenant_name: str = "Mock Paper Evaluation Tenant"
    tenant_mode: str = "paper_only_mock"
    tenant_isolation_required: bool = True
    hosted_datastore_enabled: bool = False
    local_sqlite_access: bool = False
    live_trading_enabled: bool = False
    broker_provider: str = "paper"


class HostedPaperMockSessionContext(BaseModel):
    user_id: str = "mock-user-read-only"
    session_id: str = "mock-session-read-only"
    authenticated: bool = False
    authentication_provider: str = "none"
    authentication_mode: str = "mock_contract_only"
    roles: list[str] = Field(default_factory=lambda: ["viewer"])
    attributes: dict[str, Any] = Field(
        default_factory=lambda: {
            "environment": "hosted-paper-preview",
            "paper_only": True,
            "read_only": True,
            "tenant_scope": "mock-tenant-paper-evaluation",
        }
    )


class HostedPaperMockSessionSafetyFlags(BaseModel):
    paper_only: bool
    read_only: bool = True
    live_trading_enabled: bool
    broker_api_called: bool = False
    order_created: bool = False
    credentials_collected: bool = False
    broker_credentials_collected: bool = False
    hosted_auth_provider_enabled: bool = False
    session_cookie_issued: bool = False
    hosted_datastore_written: bool = False
    external_db_written: bool = False
    production_trading_ready: bool = False


class HostedPaperMockSessionResponse(BaseModel):
    service: str = "hosted-paper-mock-session-contract"
    contract_state: str = "mock_read_only"
    summary: str
    session: HostedPaperMockSessionContext = Field(
        default_factory=HostedPaperMockSessionContext
    )
    tenant: HostedPaperTenantContext = Field(default_factory=HostedPaperTenantContext)
    role_schema: list[HostedPaperRoleDefinition]
    permission_schema: list[HostedPaperPermissionDefinition]
    safety_defaults: HostedPaperSafetyDefaults
    safety_flags: HostedPaperMockSessionSafetyFlags
    docs: dict[str, str]
    warnings: list[str]


ROLE_SCHEMA = [
    HostedPaperRoleDefinition(
        role="viewer",
        description="Read hosted readiness, mock session, tenant context, and evidence metadata.",
    ),
    HostedPaperRoleDefinition(
        role="research_reviewer",
        description="Future paper-only role for research review decisions.",
    ),
    HostedPaperRoleDefinition(
        role="risk_reviewer",
        description="Future paper-only role for risk review decisions.",
    ),
    HostedPaperRoleDefinition(
        role="paper_operator",
        description="Future paper-only role for submitting approved paper workflows.",
    ),
    HostedPaperRoleDefinition(
        role="tenant_admin",
        description="Future paper-only role for tenant workspace administration.",
    ),
]


PERMISSION_SCHEMA = [
    HostedPaperPermissionDefinition(
        permission="read_hosted_readiness",
        description="Read hosted paper readiness metadata.",
        granted_in_mock_session=True,
        mutation=False,
    ),
    HostedPaperPermissionDefinition(
        permission="read_mock_session",
        description="Read the mock session contract sample.",
        granted_in_mock_session=True,
        mutation=False,
    ),
    HostedPaperPermissionDefinition(
        permission="read_current_tenant",
        description="Read the mock tenant context sample.",
        granted_in_mock_session=True,
        mutation=False,
    ),
    HostedPaperPermissionDefinition(
        permission="read_tenant_paper_records",
        description="Future read access to tenant-scoped hosted paper records.",
        granted_in_mock_session=False,
        mutation=False,
    ),
    HostedPaperPermissionDefinition(
        permission="create_paper_approval_request",
        description="Future paper-only mutation for creating approval requests.",
        granted_in_mock_session=False,
        mutation=True,
    ),
    HostedPaperPermissionDefinition(
        permission="record_paper_reviewer_decision",
        description="Future paper-only mutation for reviewer decisions.",
        granted_in_mock_session=False,
        mutation=True,
    ),
    HostedPaperPermissionDefinition(
        permission="submit_approved_paper_workflow",
        description="Future paper-only mutation requiring a completed approval_request_id.",
        granted_in_mock_session=False,
        mutation=True,
        requires_completed_approval_request=True,
    ),
    HostedPaperPermissionDefinition(
        permission="enable_live_trading",
        description="Forbidden in hosted paper mode.",
        granted_in_mock_session=False,
        mutation=True,
    ),
    HostedPaperPermissionDefinition(
        permission="upload_broker_credentials",
        description="Forbidden in hosted paper mode.",
        granted_in_mock_session=False,
        mutation=True,
    ),
]


def get_hosted_paper_mock_session(
    settings: Settings,
) -> HostedPaperMockSessionResponse:
    paper_only = (
        settings.trading_mode == "paper"
        and settings.broker_provider == "paper"
        and not settings.live_trading_enabled
    )
    return HostedPaperMockSessionResponse(
        summary=(
            "Read-only mock session contract for future hosted paper mode. "
            "This is not real authentication and does not create a hosted session."
        ),
        role_schema=ROLE_SCHEMA,
        permission_schema=PERMISSION_SCHEMA,
        safety_defaults=HostedPaperSafetyDefaults(
            trading_mode=settings.trading_mode,
            enable_live_trading=settings.enable_live_trading,
            broker_provider=settings.broker_provider,
        ),
        safety_flags=HostedPaperMockSessionSafetyFlags(
            paper_only=paper_only,
            live_trading_enabled=settings.live_trading_enabled,
        ),
        docs={
            "hosted_paper_auth_boundary": "docs/hosted-paper-auth-boundary-spec.md",
            "hosted_paper_mock_session": "docs/hosted-paper-mock-session-contract.md",
            "hosted_paper_readiness": "docs/hosted-paper-backend-api-readiness.md",
        },
        warnings=[
            "This endpoint is a mock contract only; no hosted authentication provider is enabled.",
            (
                "No credentials are collected, no session cookie is issued, "
                "and no hosted datastore is written."
            ),
            "Mock permissions do not authorize paper workflow mutations or live trading.",
            "Production Trading Platform remains NOT READY.",
        ],
    )
