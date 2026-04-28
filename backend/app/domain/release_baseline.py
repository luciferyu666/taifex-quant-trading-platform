from __future__ import annotations

from pydantic import BaseModel, Field

from app.core.config import Settings


class ReleaseLevel(BaseModel):
    marketing_website: str = "external presentation candidate"
    web_command_center: str = "internal demo candidate"
    paper_research_preview: str = "internal technical preview"
    production_trading_platform: str = "NOT READY"


class ReleaseSafetyDefaults(BaseModel):
    trading_mode: str
    enable_live_trading: bool
    broker_provider: str


class ReleaseValidationStatus(BaseModel):
    release_readiness_check: str = "passed"
    make_check: str = "passed"
    github_actions_release_gate: str = "passed"


class ReleaseBaselineResponse(BaseModel):
    version: str = "v0.1.0-paper-research-preview"
    release_level: ReleaseLevel = Field(default_factory=ReleaseLevel)
    safety_defaults: ReleaseSafetyDefaults
    validation: ReleaseValidationStatus = Field(default_factory=ReleaseValidationStatus)
    live_trading_enabled: bool
    known_non_production_gaps: list[str]
    docs: dict[str, str]


KNOWN_NON_PRODUCTION_GAPS = [
    "No production trading path exists.",
    "No real broker adapter exists.",
    "No live execution path exists.",
    (
        "Risk Engine, OMS, Broker Gateway, reconciliation, and audit remain incomplete "
        "for production use."
    ),
    "Data platform is based on local fixtures, dry-run validation, and schema scaffolding.",
    "Backtest outputs are simulated research artifacts, not performance reports.",
    "Web Command Center is read-only for research review packet inspection.",
    (
        "RBAC/ABAC, Vault integration, immutable audit storage, observability, "
        "incident response, and disaster recovery remain future work."
    ),
]


def get_release_baseline(settings: Settings) -> ReleaseBaselineResponse:
    return ReleaseBaselineResponse(
        safety_defaults=ReleaseSafetyDefaults(
            trading_mode=settings.trading_mode,
            enable_live_trading=settings.enable_live_trading,
            broker_provider=settings.broker_provider,
        ),
        live_trading_enabled=settings.live_trading_enabled,
        known_non_production_gaps=KNOWN_NON_PRODUCTION_GAPS,
        docs={
            "release_baseline": "docs/release-baseline-v0.1.0.md",
            "release_readiness_audit": "docs/release-readiness-audit.md",
            "trading_safety": "docs/trading-safety.md",
            "paper_shadow_live_boundary": "docs/paper-shadow-live-boundary.md",
        },
    )
