from typing import Any

from pydantic import BaseModel, Field

from app.domain.risk_rules import PaperOrderIntent, RiskEvaluation


class PaperBrokerAck(BaseModel):
    broker_provider: str = "paper"
    paper_order_id: str
    accepted: bool
    message: str
    payload: dict[str, Any] = Field(default_factory=dict)


class PaperBrokerGateway:
    def submit_order(
        self,
        intent: PaperOrderIntent,
        risk_evaluation: RiskEvaluation,
    ) -> PaperBrokerAck:
        if not risk_evaluation.approved:
            raise ValueError("PaperBrokerGateway refuses unapproved order intents")

        return PaperBrokerAck(
            paper_order_id=f"paper-{intent.order_id}",
            accepted=True,
            message="Paper broker acknowledgement only. No real order was placed.",
            payload={
                "order_id": intent.order_id,
                "idempotency_key": intent.idempotency_key,
                "symbol": intent.symbol,
                "side": intent.side,
                "quantity": intent.quantity,
                "paper_only": True,
            },
        )
