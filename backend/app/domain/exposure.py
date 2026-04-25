from pydantic import BaseModel, Field


class ContractAllocation(BaseModel):
    tx: int = Field(ge=0)
    mtx: int = Field(ge=0)
    tmf: int = Field(ge=0)
    actual_tx_equivalent: float
    residual_tx_equivalent: float


class PositionPlan(BaseModel):
    target_tx_equivalent: float = Field(ge=0)
    allocation: ContractAllocation


def allocate_tx_mtx_tmf(target_tx_equivalent: float) -> ContractAllocation:
    if target_tx_equivalent < 0:
        raise ValueError("target_tx_equivalent must be non-negative")

    total_tmf_units = round(target_tx_equivalent * 20)
    tx = total_tmf_units // 20
    remaining_units = total_tmf_units % 20
    mtx = remaining_units // 5
    tmf = remaining_units % 5
    actual_tx_equivalent = total_tmf_units / 20
    residual_tx_equivalent = round(target_tx_equivalent - actual_tx_equivalent, 10)

    return ContractAllocation(
        tx=tx,
        mtx=mtx,
        tmf=tmf,
        actual_tx_equivalent=actual_tx_equivalent,
        residual_tx_equivalent=residual_tx_equivalent,
    )
