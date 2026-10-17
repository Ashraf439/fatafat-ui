import { apiFetch } from "./client";

/** view: "active" (kitchen queue) or "history" (last 50 delivered / cancelled). */
export function listOrders(view = "active") {
  return apiFetch(`/api/restaurant/orders?view=${encodeURIComponent(view)}`);
}

/** Moves an order one step forward: ACCEPTED -> PREPARING -> OUT_FOR_DELIVERY -> DELIVERED. */
export function updateOrderStatus(orderId, status) {
  return apiFetch(`/api/restaurant/orders/${orderId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

/** Rejects (while new) or cancels an order. Online-paid orders are refunded automatically. */
export function cancelOrder(orderId, reason) {
  return apiFetch(`/api/restaurant/orders/${orderId}/cancel`, {
    method: "PATCH",
    body: JSON.stringify({ reason }),
  });
}