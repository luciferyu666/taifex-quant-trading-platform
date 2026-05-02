from fastapi.testclient import TestClient

from app.core.config import Settings
from app.domain.paper_risk_cross_account_readiness import (
    get_paper_risk_cross_account_readiness,
)
from app.main import app


def test_paper_risk_cross_account_readiness_domain_is_not_production_risk() -> None:
    readiness = get_paper_risk_cross_account_readiness(Settings())

    assert readiness.service == "paper-risk-cross-account-readiness"
    assert (
        readiness.readiness_state
        == "local_paper_risk_state_not_cross_account_risk_system"
    )
    assert readiness.capabilities.local_paper_guardrails_enabled is True
    assert readiness.capabilities.local_paper_state_enabled is True
    assert readiness.capabilities.single_account_demo_state_enabled is True
    assert readiness.capabilities.risk_evaluation_detail_enabled is True
    assert readiness.capabilities.cross_account_aggregation_enabled is False
    assert readiness.capabilities.account_hierarchy_enabled is False
    assert readiness.capabilities.tenant_isolated_risk_state_enabled is False
    assert readiness.capabilities.real_account_margin_feed_enabled is False
    assert readiness.capabilities.broker_position_feed_enabled is False
    assert readiness.capabilities.centralized_risk_limits_enabled is False
    assert readiness.capabilities.distributed_kill_switch_enabled is False
    assert readiness.capabilities.durable_risk_state_store_enabled is False
    assert readiness.capabilities.production_cross_account_risk_system is False
    assert readiness.safety_flags.paper_only is True
    assert readiness.safety_flags.read_only is True
    assert readiness.safety_flags.live_trading_enabled is False
    assert readiness.safety_flags.broker_api_called is False
    assert readiness.safety_flags.real_account_data_loaded is False
    assert readiness.safety_flags.production_risk_approval is False


def test_paper_risk_cross_account_readiness_api_is_read_only_boundary() -> None:
    client = TestClient(app)

    response = client.get("/api/paper-risk/cross-account-readiness")

    assert response.status_code == 200
    payload = response.json()
    assert payload["service"] == "paper-risk-cross-account-readiness"
    assert (
        payload["readiness_state"]
        == "local_paper_risk_state_not_cross_account_risk_system"
    )
    assert payload["capabilities"]["local_paper_guardrails_enabled"] is True
    assert payload["capabilities"]["local_paper_state_enabled"] is True
    assert payload["capabilities"]["single_account_demo_state_enabled"] is True
    assert payload["capabilities"]["cross_account_aggregation_enabled"] is False
    assert payload["capabilities"]["account_hierarchy_enabled"] is False
    assert payload["capabilities"]["tenant_isolated_risk_state_enabled"] is False
    assert payload["capabilities"]["real_account_margin_feed_enabled"] is False
    assert payload["capabilities"]["broker_position_feed_enabled"] is False
    assert payload["capabilities"]["centralized_risk_limits_enabled"] is False
    assert payload["capabilities"]["distributed_kill_switch_enabled"] is False
    assert payload["capabilities"]["durable_risk_state_store_enabled"] is False
    assert payload["capabilities"]["production_cross_account_risk_system"] is False
    assert payload["safety_defaults"]["trading_mode"] == "paper"
    assert payload["safety_defaults"]["enable_live_trading"] is False
    assert payload["safety_defaults"]["broker_provider"] == "paper"
    assert payload["safety_flags"]["paper_only"] is True
    assert payload["safety_flags"]["read_only"] is True
    assert payload["safety_flags"]["live_trading_enabled"] is False
    assert payload["safety_flags"]["broker_provider"] == "paper"
    assert payload["safety_flags"]["broker_api_called"] is False
    assert payload["safety_flags"]["external_account_data_loaded"] is False
    assert payload["safety_flags"]["real_account_data_loaded"] is False
    assert payload["safety_flags"]["order_created"] is False
    assert payload["safety_flags"]["credentials_collected"] is False
    assert payload["safety_flags"]["database_written"] is False
    assert payload["safety_flags"]["hosted_datastore_written"] is False
    assert payload["safety_flags"]["production_risk_approval"] is False
    assert payload["safety_flags"]["production_cross_account_risk"] is False
    assert payload["safety_flags"]["production_trading_ready"] is False
    assert any(
        "Cross-account exposure aggregation" in item
        for item in payload["missing_for_cross_account_risk"]
    )
    assert any(
        "tenant, account, portfolio" in item
        for item in payload["required_before_cross_account_risk"]
    )
    assert "Production Trading Platform remains NOT READY." in payload["warnings"]


def test_paper_risk_cross_account_readiness_does_not_mutate_state() -> None:
    client = TestClient(app)

    payload = client.get("/api/paper-risk/cross-account-readiness").json()

    assert payload["safety_flags"]["order_created"] is False
    assert payload["safety_flags"]["database_written"] is False
    assert payload["safety_flags"]["hosted_datastore_written"] is False
    assert payload["safety_flags"]["broker_api_called"] is False
    assert payload["safety_flags"]["production_risk_approval"] is False
    assert payload["capabilities"]["production_cross_account_risk_system"] is False
