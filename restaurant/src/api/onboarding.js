import { apiFetch } from "./client";

export function submitApplication(data, accessToken) {
  return apiFetch("/api/restaurant/onboarding/applications", {
    method: "POST",
    accessToken,
    body: JSON.stringify(data),
  });
}

export function getMyApplication(accessToken) {
  return apiFetch("/api/restaurant/onboarding/applications/me", {
    accessToken,
  });
}

export function createPaymentOrder(applicationId, accessToken) {
  return apiFetch(
    `/api/restaurant/onboarding/applications/${applicationId}/payment-order`,
    {
      method: "POST",
      accessToken,
    }
  );
}

export function verifyPayment(
  orderId,
  paymentId,
  razorpaySignature,
  accessToken
) {
  return apiFetch("/api/payments/verify", {
    method: "POST",
    accessToken,
    body: JSON.stringify({
      orderId,
      paymentId,
      razorpaySignature,
    }),
  });
}
