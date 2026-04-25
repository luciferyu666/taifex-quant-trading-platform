from uuid import uuid4

from app.domain.risk import OrderIntent


class PaperBrokerGateway:
    def submit_order(self, order_intent: OrderIntent) -> dict[str, str | bool]:
        return {
            "paper_order_id": f"paper-broker-{uuid4().hex}",
            "status": "ACKNOWLEDGED",
            "paper_only": True,
            "message": "Paper broker acknowledgement only. No real order was placed.",
            "intent_id": order_intent.intent_id,
        }
