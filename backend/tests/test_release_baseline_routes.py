from fastapi.testclient import TestClient

from app.core.config import Settings
from app.domain.release_baseline import get_release_baseline
from app.main import app


def test_release_baseline_domain_is_paper_first() -> None:
    baseline = get_release_baseline(Settings())

    assert baseline.version == "v0.1.0-paper-research-preview"
    assert baseline.release_level.marketing_website == "external presentation candidate"
    assert baseline.release_level.web_command_center == "internal demo candidate"
    assert baseline.release_level.paper_research_preview == "internal technical preview"
    assert baseline.release_level.production_trading_platform == "NOT READY"
    assert baseline.safety_defaults.trading_mode == "paper"
    assert baseline.safety_defaults.enable_live_trading is False
    assert baseline.safety_defaults.broker_provider == "paper"
    assert baseline.live_trading_enabled is False
    assert baseline.validation.release_readiness_check == "passed"
    assert baseline.validation.make_check == "passed"
    assert baseline.validation.github_actions_release_gate == "passed"
    assert baseline.known_non_production_gaps


def test_release_baseline_api_returns_read_only_status() -> None:
    client = TestClient(app)

    response = client.get("/api/release/baseline")

    assert response.status_code == 200
    payload = response.json()
    assert payload["version"] == "v0.1.0-paper-research-preview"
    assert payload["release_level"]["production_trading_platform"] == "NOT READY"
    assert payload["safety_defaults"]["trading_mode"] == "paper"
    assert payload["safety_defaults"]["enable_live_trading"] is False
    assert payload["safety_defaults"]["broker_provider"] == "paper"
    assert payload["live_trading_enabled"] is False
    assert payload["validation"]["release_readiness_check"] == "passed"
    assert payload["validation"]["make_check"] == "passed"
    assert payload["validation"]["github_actions_release_gate"] == "passed"
    assert "release_baseline" in payload["docs"]


def test_release_baseline_api_does_not_claim_production_ready() -> None:
    client = TestClient(app)

    payload = client.get("/api/release/baseline").json()

    assert payload["release_level"]["production_trading_platform"] == "NOT READY"
    assert any(
        "No production trading path exists." == gap
        for gap in payload["known_non_production_gaps"]
    )
