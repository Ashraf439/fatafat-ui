export function orderRef(order) {
  return order?.orderNumber != null ? `#${order.orderNumber}` : "";
}