from app.services.reconciliation import PositionSnapshot, ReconciliationService


def test_reconciliation_locks_on_mismatch() -> None:
    result = ReconciliationService().compare(
        PositionSnapshot(source="platform", positions={"TMF": 1}),
        PositionSnapshot(source="broker", positions={"TMF": 0}),
    )

    assert result.matched is False
    assert result.locked is True
    assert result.differences["TMF"] == {"platform": 1, "broker": 0}
    assert "Paper-only simulated reconciliation" in result.message


def test_reconciliation_passes_when_positions_match() -> None:
    result = ReconciliationService().compare(
        PositionSnapshot(source="platform", positions={"TMF": 1}),
        PositionSnapshot(source="broker", positions={"TMF": 1}),
    )

    assert result.matched is True
    assert result.locked is False
    assert result.differences == {}
