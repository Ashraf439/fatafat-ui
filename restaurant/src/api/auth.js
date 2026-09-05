import { apiFetch } from "./client";

export function registerRestaurant({ email, password }) {
  return apiFetch("/api/auth/register/restaurant", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function login({ email, password }) {
  return apiFetch("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function logout() {
  return apiFetch("/api/auth/logout", { method: "POST" });
}

export function getCurrentUser() {
  return apiFetch("/api/auth/me");
}

export function resendVerification(email) {
  return apiFetch("/api/auth/resend-verification", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}