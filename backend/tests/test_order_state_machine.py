import pytest

from app.domain.order_state_machine import (
    OrderEvent,
    OrderEventType,
    OrderStatus,
    apply_order_event,
    new_order_state,
)


def _event(order_id: str, event_type: OrderEventType) -> OrderEvent:
    return OrderEvent(
        event_id=f"event-{event_type.value}",
        order_id=order_id,
        event_type=event_type,
    )


def test_valid_oms_transition_sequence() -> None:
    state = new_order_state("order-1", "idem-1")

    for event_type in [
        OrderEventType.CREATE,
        OrderEventType.RISK_APPROVE,
        OrderEventType.SUBMIT,
        OrderEventType.ACKNOWLEDGE,
        OrderEventType.FILL,
    ]:
        state = apply_order_event(state, _event("order-1", event_type))

    assert state.status == OrderStatus.FILLED
    assert len(state.history) == 5


def test_invalid_oms_transition_raises() -> None:
    state = new_order_state("order-2", "idem-2")

    with pytest.raises(ValueError):
        apply_order_event(state, _event("order-2", OrderEventType.FILL))


def test_mark_unknown_works_from_any_state() -> None:
    state = new_order_state("order-3", "idem-3")
    state = apply_order_event(state, _event("order-3", OrderEventType.MARK_UNKNOWN))

    assert state.status == OrderStatus.UNKNOWN_NEEDS_RECONCILIATION
    assert len(state.history) == 1
