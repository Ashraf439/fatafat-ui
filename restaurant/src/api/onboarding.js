import { apiFetch } from "./client";

export function submitApplication(data) {
  return apiFetch("/api/restaurant/onboarding/applications", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function getMyApplication() {
  return apiFetch("/api/restaurant/onboarding/applications/me");
}

export function createPaymentOrder(applicationId) {
  return apiFetch(
    `/api/restaurant/onboarding/applications/${applicationId}/payment-order`,
    { method: "POST" }
  );
}

export function verifyPayment(orderId, paymentId, razorpaySignature) {
  return apiFetch("/api/payments/verify", {
    method: "POST",
    body: JSON.stringify({ orderId, paymentId, razorpaySignature }),
  });
}