import pytest

from app.domain.allocator import AllocationInput, allocate_tx_mtx_tmf


def test_allocator_exact_115_tx_equivalent() -> None:
    result = allocate_tx_mtx_tmf(AllocationInput(target_tx_equivalent=1.15))

    assert result.tx == 1
    assert result.mtx == 0
    assert result.tmf == 3
    assert result.actual_tx_equivalent == 1.15
    assert result.residual_tx_equivalent == 0


def test_allocator_rejects_negative_target() -> None:
    with pytest.raises(ValueError):
        allocate_tx_mtx_tmf(AllocationInput(target_tx_equivalent=-0.05))


def test_allocator_rejects_exposure_over_max() -> None:
    with pytest.raises(ValueError):
        allocate_tx_mtx_tmf(
            AllocationInput(
                target_tx_equivalent=0.3,
                max_tx_equivalent_exposure=0.25,
            )
        )
