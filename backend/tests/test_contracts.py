from app.domain.contracts import CONTRACT_SPECS, POINT_VALUES, ContractSymbol


def test_tx_mtx_tmf_point_values_are_correct() -> None:
    assert POINT_VALUES[ContractSymbol.TX] == 200
    assert POINT_VALUES[ContractSymbol.MTX] == 50
    assert POINT_VALUES[ContractSymbol.TMF] == 10


def test_contract_specs_include_tx_equivalent_ratios() -> None:
    assert CONTRACT_SPECS[ContractSymbol.TX].tx_equivalent_ratio == 1
    assert CONTRACT_SPECS[ContractSymbol.MTX].tx_equivalent_ratio == 0.25
    assert CONTRACT_SPECS[ContractSymbol.TMF].tx_equivalent_ratio == 0.05
