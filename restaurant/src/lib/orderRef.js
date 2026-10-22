export function orderRef(order) {
  if (order?.orderNumber != null) return `#${order.orderNumber}`;
  return order?.id ? `#${String(order.id).slice(0, 6).toUpperCase()}` : "";
}