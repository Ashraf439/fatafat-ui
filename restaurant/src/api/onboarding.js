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
    { method: "POST", accessToken }
  );
}

// Dev-only stand-in for a real payment gateway. In production this endpoint
// is meant to be called server-to-server by the gateway (it's permitAll() in
// SecurityConfig with a TODO to add signature verification) — not by this
// frontend. Calling it directly here only works because there's no real
// gateway wired up yet.
export function confirmPaymentDev({ orderId, paymentReference }) {
  return apiFetch("/api/restaurant/onboarding/payments/webhook", {
    method: "POST",
    body: JSON.stringify({ orderId, paymentReference }),
  });
}
export async function getLocation() {
    try{
        const response = await fetch("http://ip-api.com/json/");
        const json = await response.json();
        if(typeof json.lat === "number" && typeof  json.lon === "number") {
            return [json.lat, json.lon]
        }
    }catch {}
    return [21,83];
}