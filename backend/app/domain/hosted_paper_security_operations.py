from __future__ import annotations

from pydantic import BaseModel, Field

from app.core.config import Settings
from app.domain.hosted_paper_readiness import HostedPaperSafetyDefaults


class HostedPaperSecurityControl(BaseModel):
    control: str
    purpose: str
    current_status: str
    enabled: bool = False
    required_before_hosted_customer_use: bool = True
    required_before_production_trading: bool = True
    notes: list[str] = Field(default_factory=list)


class HostedPaperSecurityOperationsCapabilities(BaseModel):
    secrets_management_enabled: bool = False
    vault_or_managed_secret_store_enabled: bool = False
    static_secret_scan_gate_enabled: bool = True
    rate_limiting_enabled: bool = False
    audit_monitoring_enabled: bool = False
    observability_pipeline_enabled: bool = False
    ci_release_readiness_gate_enabled: bool = True
    production_smoke_gate_enabled: bool = True
    staging_smoke_gate_enabled: bool = False
    load_test_gate_enabled: bool = False
    abuse_test_gate_enabled: bool = False
    auth_boundary_test_gate_enabled: bool = False
    incident_runbook_enabled: bool = False
    production_operations_ready: bool = False


class HostedPaperSecurityOperationsSafetyFlags(BaseModel):
    paper_only: bool
    read_only: bool = True
    live_trading_enabled: bool
    broker_provider: str
    secrets_stored: bool = False
    credentials_collected: bool = False
    broker_credentials_collected: bool = False
    auth_provider_enabled: bool = False
    customer_account_created: bool = False
    hosted_datastore_written: bool = False
    external_db_written: bool = False
    broker_api_called: bool = False
    order_created: bool = False
    load_test_executed: bool = False
    abuse_test_executed: bool = False
    production_security_approval: bool = False
    production_trading_ready: bool = False


class HostedPaperSecurityOperationsReadinessResponse(BaseModel):
    service: str = "hosted-paper-security-operations-readiness"
    readiness_state: str = "readiness_contract_only_not_operational"
    summary: str
    capabilities: HostedPaperSecurityOperationsCapabilities = Field(
        default_factory=HostedPaperSecurityOperationsCapabilities
    )
    controls: list[HostedPaperSecurityControl]
    required_next_slices: list[str]
    safety_defaults: HostedPaperSafetyDefaults
    safety_flags: HostedPaperSecurityOperationsSafetyFlags
    docs: dict[str, str]
    warnings: list[str]


def get_hosted_paper_security_operations_readiness(
    settings: Settings,
) -> HostedPaperSecurityOperationsReadinessResponse:
    return HostedPaperSecurityOperationsReadinessResponse(
        summary=(
            "Hosted paper security and operations readiness is a read-only "
            "contract. It documents required controls for a future hosted "
            "paper SaaS product, but does not store secrets, enable rate "
            "limits, create accounts, write hosted records, call brokers, or "
            "enable live trading."
        ),
        controls=build_security_operations_controls(),
        required_next_slices=[
            "Select managed secrets store and define rotation policy.",
            "Add non-production rate limit middleware and denial evidence.",
            "Define audit monitoring alerts for paper approval and OMS events.",
            "Wire OpenTelemetry/log drain preview in staging only.",
            "Add staging smoke test against a non-production hosted backend.",
            "Add basic load and abuse tests against read-only endpoints.",
            "Add auth boundary negative tests before any real login provider.",
            "Create incident response and rollback runbooks.",
        ],
        safety_defaults=HostedPaperSafetyDefaults(
            trading_mode=settings.trading_mode,
            enable_live_trading=settings.enable_live_trading,
            broker_provider=settings.broker_provider,
        ),
        safety_flags=HostedPaperSecurityOperationsSafetyFlags(
            paper_only=settings.trading_mode == "paper"
            and settings.broker_provider == "paper"
            and not settings.live_trading_enabled,
            live_trading_enabled=settings.live_trading_enabled,
            broker_provider=settings.broker_provider,
        ),
        docs={
            "security_operations_readiness": (
                "docs/hosted-paper-security-operations-readiness.md"
            ),
            "security_vault_asvs": "docs/security-vault-asvs.md",
            "observability_dr_event_sourcing": (
                "docs/observability-dr-event-sourcing.md"
            ),
            "hosted_backend_foundation": (
                "docs/hosted-backend-api-deployment-foundation.md"
            ),
            "hosted_paper_saas_foundation": (
                "docs/hosted-paper-saas-foundation-roadmap.md"
            ),
        },
        warnings=[
            "This endpoint is read-only security and operations metadata only.",
            "No real secret store, rate limiter, hosted audit monitor, or log drain is enabled.",
            "No load, abuse, or real auth boundary test was executed by this endpoint.",
            "Hosted paper SaaS remains NOT READY for customer production use.",
            "Production Trading Platform remains NOT READY.",
            "Live trading remains disabled by default.",
        ],
    )


def build_security_operations_controls() -> list[HostedPaperSecurityControl]:
    return [
        HostedPaperSecurityControl(
            control="secrets_management",
            purpose="Store hosted credentials and signing material outside source code.",
            current_status="contract_only_no_secret_store_connected",
            notes=[
                "Future implementation should use managed secrets or Vault.",
                "No secret, token, key, account ID, or certificate is added by this contract.",
            ],
        ),
        HostedPaperSecurityControl(
            control="rate_limiting",
            purpose="Protect hosted paper endpoints from accidental or abusive traffic.",
            current_status="not_enabled_rate_limit_policy_required",
            notes=[
                "Future implementation should cover auth, approval, submit, and evidence APIs.",
                "Current endpoint does not install middleware or edge rules.",
            ],
        ),
        HostedPaperSecurityControl(
            control="audit_monitoring",
            purpose="Alert on suspicious approval, OMS, audit, and integrity events.",
            current_status="not_enabled_monitoring_rules_required",
            notes=[
                "Local SQLite audit records are not centralized monitoring.",
                "Future hosted paper needs alert routing and escalation policy.",
            ],
        ),
        HostedPaperSecurityControl(
            control="observability",
            purpose="Trace paper request flow and collect logs/metrics safely.",
            current_status="placeholder_only_no_hosted_pipeline",
            notes=[
                "OpenTelemetry placeholder exists, but no production endpoint is configured.",
                "No secrets or production observability token is stored in source.",
            ],
        ),
        HostedPaperSecurityControl(
            control="ci_cd_deployment_gates",
            purpose="Block unsafe releases and verify production-facing safety copy.",
            current_status="release_readiness_and_production_smoke_gate_enabled",
            enabled=True,
            required_before_hosted_customer_use=False,
            notes=[
                "Release Readiness and production smoke gates are active.",
                "Hosted staging smoke gate is still required before SaaS customer use.",
            ],
        ),
        HostedPaperSecurityControl(
            control="staging_smoke_test",
            purpose="Verify a staging hosted backend before customer-facing rollout.",
            current_status="not_enabled_staging_backend_required",
            notes=[
                "Requires hosted backend staging URL and non-production datastore boundary.",
                "Must remain paper-only and must not collect credentials.",
            ],
        ),
        HostedPaperSecurityControl(
            control="basic_load_abuse_testing",
            purpose="Exercise rate limits, denial paths, and read-only endpoint resilience.",
            current_status="not_executed_test_plan_required",
            notes=[
                "Future tests should be authorized, scoped, and non-destructive.",
                "No crawler, load, or abuse test is executed by this contract.",
            ],
        ),
        HostedPaperSecurityControl(
            control="auth_boundary_testing",
            purpose="Verify unauthenticated, cross-tenant, and role-denied paths.",
            current_status="not_enabled_real_auth_required",
            notes=[
                "Requires real session provider and tenant model before enforcement tests.",
                "Current mock session remains read-only contract metadata.",
            ],
        ),
    ]
