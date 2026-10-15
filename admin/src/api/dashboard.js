import { apiFetch } from "./client";

export function approveRestaurent(applicationId) {
  return apiFetch(`/api/admin/restaurant-applications/${applicationId}/approve`, {
    method: "PATCH",
  });
}

/** The backend requires a non-blank `rejectionReason`. */
export function rejectRestaurent(applicationId, rejectionReason) {
  return apiFetch(`/api/admin/restaurant-applications/${applicationId}/reject`, {
    method: "PATCH",
    body: { rejectionReason },
  });
}

/** Optionally filtered server-side by RestaurantOnboardingStatus. */
export function getAllApplications(status) {
  return apiFetch("/api/admin/restaurant-applications", { params: { status } });
}