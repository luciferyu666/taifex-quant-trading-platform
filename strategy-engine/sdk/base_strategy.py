from abc import ABC, abstractmethod
from typing import Any

from .signal import StrategySignal


class BaseStrategy(ABC):
    """Signal-only strategy interface.

    Strategies must not place orders or call broker SDKs. They emit target exposure
    signals that can be evaluated by Risk Engine and OMS in paper/shadow workflows.
    """

    strategy_id: str
    strategy_version: str

    @abstractmethod
    def generate_signal(self, market_snapshot: dict[str, Any]) -> StrategySignal:
        raise NotImplementedError
