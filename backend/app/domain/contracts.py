from enum import StrEnum
from typing import Final

from pydantic import BaseModel


class ContractSymbol(StrEnum):
    TX = "TX"
    MTX = "MTX"
    TMF = "TMF"


POINT_VALUES: Final[dict[ContractSymbol, int]] = {
    ContractSymbol.TX: 200,
    ContractSymbol.MTX: 50,
    ContractSymbol.TMF: 10,
}


class ContractSpec(BaseModel):
    symbol: ContractSymbol
    point_value_twd: int
    tx_equivalent_ratio: float
    description: str


def tx_equivalent_from_point_value(point_value: int) -> float:
    return point_value / POINT_VALUES[ContractSymbol.TX]


CONTRACT_SPECS: Final[dict[ContractSymbol, ContractSpec]] = {
    ContractSymbol.TX: ContractSpec(
        symbol=ContractSymbol.TX,
        point_value_twd=POINT_VALUES[ContractSymbol.TX],
        tx_equivalent_ratio=tx_equivalent_from_point_value(POINT_VALUES[ContractSymbol.TX]),
        description="Taiwan Index Futures",
    ),
    ContractSymbol.MTX: ContractSpec(
        symbol=ContractSymbol.MTX,
        point_value_twd=POINT_VALUES[ContractSymbol.MTX],
        tx_equivalent_ratio=tx_equivalent_from_point_value(POINT_VALUES[ContractSymbol.MTX]),
        description="Mini Taiwan Index Futures",
    ),
    ContractSymbol.TMF: ContractSpec(
        symbol=ContractSymbol.TMF,
        point_value_twd=POINT_VALUES[ContractSymbol.TMF],
        tx_equivalent_ratio=tx_equivalent_from_point_value(POINT_VALUES[ContractSymbol.TMF]),
        description="Micro Taiwan Index Futures",
    ),
}
