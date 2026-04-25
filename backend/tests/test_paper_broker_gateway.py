import pytest

from app.domain.risk_rules import PaperOrderIntent, RiskEvaluation
from app.services.paper_broker_gateway import PaperBrokerGateway


def test_paper_broker_returns_ack_only_when_approved() -> None:
    intent = PaperOrderIntent(
        order_id="order-paper-gateway",
        idempotency_key="idem-paper-gateway",
        symbol="TMF",
        side="BUY",
        quantity=1,
        tx_equivalent_exposure=0.05,
    )
    gateway = PaperBrokerGateway()
    ack = gateway.submit_order(
        intent,
        RiskEvaluation(approved=True, checks=[], reason="approved"),
    )

    assert ack.accepted is True
    assert ack.broker_provider == "paper"
    assert ack.payload["idempotency_key"] == "idem-paper-gateway"
    assert "No real order was placed" in ack.message


def test_paper_broker_rejects_unapproved_intent() -> None:
    intent = PaperOrderIntent(
        order_id="order-paper-reject",
        idempotency_key="idem-paper-reject",
        symbol="TMF",
        side="BUY",
        quantity=1,
        tx_equivalent_exposure=0.05,
    )

    with pytest.raises(ValueError):
        PaperBrokerGateway().submit_order(
            intent,
            RiskEvaluation(approved=False, checks=[], reason="rejected"),
        )
