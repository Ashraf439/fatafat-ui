import { API_BASE_URL } from "@/config/env";
import { http } from "@/lib/http";

export const ordersApi = {
  quote: (restaurantId, items) => http.post("/api/customer/orders/quote", { restaurantId, items }),
  place: (payload) => http.post("/api/customer/orders", payload),
  list: ({ page = 0, size = 10, sort = "date_desc", from, to } = {}) =>
    http.get("/api/customer/orders", { params: { page, size, sort, from, to } }),
  get: (id) => http.get(`/api/customer/orders/${id}`),
  invoiceUrl: (id) => `${API_BASE_URL}/api/customer/orders/${id}/invoice`,
  cancel: (id, reason) => http.patch(`/api/customer/orders/${id}/cancel`, { reason }),
  startPayment: (id) => http.post(`/api/customer/orders/${id}/payment`),
  verifyPayment: (id, payload) => http.post(`/api/customer/orders/${id}/payment/verify`, payload),
};