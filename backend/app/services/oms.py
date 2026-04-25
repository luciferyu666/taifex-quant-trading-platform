from uuid import uuid4

from app.domain.orders import Order, OrderEvent, OrderStatus
from app.domain.risk import OrderIntent


class OMS:
    def __init__(self) -> None:
        self._orders: dict[str, Order] = {}
        self._events: dict[str, list[OrderEvent]] = {}

    def create_order_intent(self, order_intent: OrderIntent) -> Order:
        order = Order(order_id=f"paper-{uuid4().hex}", intent=order_intent)
        self._orders[order.order_id] = order
        self._events[order.order_id] = [
            OrderEvent(
                order_id=order.order_id,
                status=OrderStatus.CREATED,
                message="Paper order intent created.",
            )
        ]
        return order

    def apply_event(self, event: OrderEvent) -> Order:
        order = self._orders[event.order_id]
        order.status = event.status
        order.updated_at = event.timestamp
        self._orders[event.order_id] = order
        self._events.setdefault(event.order_id, []).append(event)
        return order

    def current_status(self, order_id: str) -> OrderStatus:
        return self._orders[order_id].status

    def events_for_order(self, order_id: str) -> list[OrderEvent]:
        return list(self._events.get(order_id, []))
