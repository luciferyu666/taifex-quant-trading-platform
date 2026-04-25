from app.domain.exposure import allocate_tx_mtx_tmf


def test_allocate_1_15_tx_equivalent() -> None:
    allocation = allocate_tx_mtx_tmf(1.15)

    assert allocation.tx == 1
    assert allocation.mtx == 0
    assert allocation.tmf == 3
    assert allocation.actual_tx_equivalent == 1.15
    assert allocation.residual_tx_equivalent == 0


def test_allocate_rounds_to_nearest_tmf_unit() -> None:
    allocation = allocate_tx_mtx_tmf(0.26)

    assert allocation.actual_tx_equivalent == 0.25
    assert allocation.mtx == 1
