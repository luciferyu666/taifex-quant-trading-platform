from enum import StrEnum

from pydantic import BaseModel, Field


class ContractCode(StrEnum):
    TX = "TX"
    MTX = "MTX"
    TMF = "TMF"


class ContractSpec(BaseModel):
    code: ContractCode
    point_value_twd: int
    tmf_units: int
    tx_equivalent: float


CONTRACT_SPECS: dict[ContractCode, ContractSpec] = {
    ContractCode.TX: ContractSpec(
        code=ContractCode.TX,
        point_value_twd=200,
        tmf_units=20,
        tx_equivalent=1.0,
    ),
    ContractCode.MTX: ContractSpec(
        code=ContractCode.MTX,
        point_value_twd=50,
        tmf_units=5,
        tx_equivalent=0.25,
    ),
    ContractCode.TMF: ContractSpec(
        code=ContractCode.TMF,
        point_value_twd=10,
        tmf_units=1,
        tx_equivalent=0.05,
    ),
}


class AllocationInput(BaseModel):
    target_tx_equivalent: float
    current_tx: int = 0
    current_mtx: int = 0
    current_tmf: int = 0
    max_tx_equivalent_exposure: float | None = None
    atr_points: float | None = None
    margin_usage_pct: float | None = None
    liquidity_score: float | None = None


class AllocationResult(BaseModel):
    tx: int = Field(ge=0)
    mtx: int = Field(ge=0)
    tmf: int = Field(ge=0)
    actual_tx_equivalent: float
    residual_tx_equivalent: float
    target_tmf_units: int
    notes: list[str] = Field(default_factory=list)


def allocate_tx_mtx_tmf(input: AllocationInput) -> AllocationResult:
    if input.target_tx_equivalent < 0:
        raise ValueError("target_tx_equivalent must be non-negative")

    target_tmf_units = round(input.target_tx_equivalent * 20)
    tx = target_tmf_units // CONTRACT_SPECS[ContractCode.TX].tmf_units
    remaining_units = target_tmf_units % CONTRACT_SPECS[ContractCode.TX].tmf_units
    mtx = remaining_units // CONTRACT_SPECS[ContractCode.MTX].tmf_units
    tmf = remaining_units % CONTRACT_SPECS[ContractCode.MTX].tmf_units
    actual_tx_equivalent = target_tmf_units / 20
    residual_tx_equivalent = round(input.target_tx_equivalent - actual_tx_equivalent, 10)

    if (
        input.max_tx_equivalent_exposure is not None
        and actual_tx_equivalent > input.max_tx_equivalent_exposure
    ):
        raise ValueError("allocated exposure exceeds max_tx_equivalent_exposure")

    notes = [
        "Initial deterministic allocator using integer TMF-equivalent units.",
        (
            "Future allocator should consider liquidity, ATR, margin usage, "
            "current position, and residual exposure."
        ),
    ]

    if any(
        value is not None
        for value in (input.atr_points, input.margin_usage_pct, input.liquidity_score)
    ):
        notes.append("ATR, margin, and liquidity inputs are accepted for future optimizers only.")

    return AllocationResult(
        tx=tx,
        mtx=mtx,
        tmf=tmf,
        actual_tx_equivalent=actual_tx_equivalent,
        residual_tx_equivalent=residual_tx_equivalent,
        target_tmf_units=target_tmf_units,
        notes=notes,
    )
