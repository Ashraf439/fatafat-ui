import { apiFetch } from "./client";

export function getRestaurantStatus() {
  return apiFetch("/api/restaurant/status");
}

export function toggleRestaurantStatus() {
  return apiFetch("/api/restaurant/status", { method: "PATCH" });
}