from typing import Any

from sdk.base_strategy import BaseStrategy
from sdk.signal import StrategySignal


class SimpleSignalStrategy(BaseStrategy):
    strategy_id = "simple-signal-strategy"
    strategy_version = "0.1.0"

    def generate_signal(self, market_snapshot: dict[str, Any]) -> StrategySignal:
        last_price = float(market_snapshot.get("last_price", 0))
        direction = "LONG" if last_price > 0 else "FLAT"
        target_tx_equivalent = 0.05 if direction == "LONG" else 0

        return StrategySignal(
            strategy_id=self.strategy_id,
            strategy_version=self.strategy_version,
            direction=direction,
            target_tx_equivalent=target_tx_equivalent,
            confidence=0.5,
            reason={"source": "example_only", "paper_safe": True},
        )
