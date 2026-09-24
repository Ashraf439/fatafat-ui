import { http } from "@/lib/http";

export const ordersApi = {
  /** Server-priced preview of a cart: { lines, subtotal, deliveryFee, taxAmount, totalAmount, ... }. */
  quote: (restaurantId, items) => http.post("/api/customer/orders/quote", { restaurantId, items }),
  place: (payload) => http.post("/api/customer/orders", payload),
  list: ({ page = 0, size = 10 } = {}) => http.get("/api/customer/orders", { params: { page, size } }),
  get: (id) => http.get(`/api/customer/orders/${id}`),
  cancel: (id, reason) => http.patch(`/api/customer/orders/${id}/cancel`, { reason }),
};
