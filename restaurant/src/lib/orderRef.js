export function orderRef(order) {
  if (order?.orderCode) return order.orderCode;
  return order?.orderNumber != null ? `#${order.orderNumber}` : "";
}