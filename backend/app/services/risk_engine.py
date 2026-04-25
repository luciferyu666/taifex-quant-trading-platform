from app.domain.risk import OrderIntent, RiskConfig, RiskDecision


class RiskEngine:
    def __init__(self, config: RiskConfig) -> None:
        self.config = config

    def evaluate_order_intent(self, order_intent: OrderIntent) -> RiskDecision:
        checks = {
            "live_trading_disabled": not self.config.live_trading_enabled,
            "paper_or_shadow_mode": order_intent.trading_mode in {"paper", "shadow"},
            "paper_only_intent": order_intent.paper_only,
            "within_max_tx_equivalent_exposure": (
                order_intent.tx_equivalent_exposure <= self.config.max_tx_equivalent_exposure
            ),
        }

        if self.config.live_trading_enabled:
            return RiskDecision(
                approved=False,
                reason="Live trading is disabled in this roadmap implementation.",
                checks=checks,
            )

        if not checks["paper_or_shadow_mode"] or not checks["paper_only_intent"]:
            return RiskDecision(
                approved=False,
                reason=(
                    "Only paper/shadow order intents are accepted in this roadmap implementation."
                ),
                checks=checks,
            )

        if not checks["within_max_tx_equivalent_exposure"]:
            return RiskDecision(
                approved=False,
                reason="Requested TX-equivalent exposure exceeds configured paper risk limit.",
                checks=checks,
            )

        return RiskDecision(
            approved=True,
            reason="Approved for paper-only simulation.",
            checks=checks,
        )
