from app.domain.contracts import CONTRACT_SPECS, ContractSpec


class MarketDataService:
    def contract_master(self) -> dict[str, ContractSpec]:
        return {symbol.value: spec for symbol, spec in CONTRACT_SPECS.items()}

    def list_contract_specs(self) -> list[ContractSpec]:
        return list(CONTRACT_SPECS.values())
