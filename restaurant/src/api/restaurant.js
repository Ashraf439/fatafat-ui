import { apiFetch } from "./client";

export function getRestaurantStatus() {
  return apiFetch("/api/restaurant/status");
}

export function toggleRestaurantStatus() {
  return apiFetch("/api/restaurant/status", { method: "PATCH" });
}

export function getMyRestaurantProfile() {
  return apiFetch("/api/restaurant/me/profile");
}

export function updateMyRestaurantProfile(payload) {
  return apiFetch("/api/restaurant/me/profile", { method: "PATCH", body: JSON.stringify(payload) });
}