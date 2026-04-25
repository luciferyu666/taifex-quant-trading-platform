from pydantic import BaseModel


class StrategyRegistration(BaseModel):
    strategy_id: str
    name: str
    version: str
    description: str = ""
    paper_only: bool = True


class StrategyRegistry:
    def __init__(self) -> None:
        self._strategies: dict[str, StrategyRegistration] = {}

    def register_strategy(self, strategy: StrategyRegistration) -> StrategyRegistration:
        self._strategies[strategy.strategy_id] = strategy
        return strategy

    def list_strategies(self) -> list[StrategyRegistration]:
        return list(self._strategies.values())

    def get_strategy(self, strategy_id: str) -> StrategyRegistration | None:
        return self._strategies.get(strategy_id)
