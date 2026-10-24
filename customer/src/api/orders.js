import { http } from "@/lib/http";

export const ordersApi = {
  /** Server-priced preview of a cart: { lines, subtotal, deliveryFee, taxAmount, totalAmount, ... }. */
  quote: (restaurantId, items) => http.post("/api/customer/orders/quote", { restaurantId, items }),
  place: (payload) => http.post("/api/customer/orders", payload),
  list: ({ page = 0, size = 10, sort = "date_desc", from, to } = {}) => http.get("/api/customer/orders", { params: { page, size, sort, from, to } }),
  get: (id) => http.get(`/api/customer/orders/${id}`),
  cancel: (id, reason) => http.patch(`/api/customer/orders/${id}/cancel`, { reason }),
  /** Creates (or reuses) the Razorpay order: { razorpayOrderId, amount (paise), currency, keyId }. */
  startPayment: (id) => http.post(`/api/customer/orders/${id}/payment`),
  /** Sends Razorpay's three checkout values to the backend, which verifies the signature. */
  verifyPayment: (id, payload) => http.post(`/api/customer/orders/${id}/payment/verify`, payload),
};