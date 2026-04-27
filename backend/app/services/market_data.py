from app.domain.contracts import CONTRACT_SPECS, ContractSpec
from app.domain.market_data import (
    ContractMasterRecord,
    DataQualityReport,
    MarketBar,
    MarketBarBatchValidationReport,
    MarketBarBatchValidationRequest,
    contract_master_records,
    data_layer_plan,
    quality_rule_catalog,
    validate_market_bar,
    validate_market_bar_rows,
)


class MarketDataService:
    def contract_master(self) -> dict[str, ContractSpec]:
        return {symbol.value: spec for symbol, spec in CONTRACT_SPECS.items()}

    def list_contract_specs(self) -> list[ContractSpec]:
        return list(CONTRACT_SPECS.values())

    def list_contract_master_records(self) -> list[ContractMasterRecord]:
        return contract_master_records()

    def layer_plan(self) -> list[dict[str, str]]:
        return data_layer_plan()

    def quality_rules(self) -> list[dict[str, str]]:
        return quality_rule_catalog()

    def validate_bar(self, bar: MarketBar) -> DataQualityReport:
        return validate_market_bar(bar)

    def validate_bar_batch(
        self,
        request: MarketBarBatchValidationRequest,
    ) -> MarketBarBatchValidationReport:
        return validate_market_bar_rows(
            rows=request.rows,
            dataset_name=request.dataset_name,
            data_version=request.data_version,
        )
