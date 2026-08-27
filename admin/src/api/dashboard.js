import { apiFetch } from "./client";

export function approveRestaurent(applicationId, accessToken) {
    return apiFetch(`api/admin/restaurant-applications/${applicationId}/approve`, {
        method: "PATCH",
        accessToken,
    });
}

export function rejectRestaurent(applicationId, accessToken, reason = "Application rejected by admin") {
    return apiFetch(`api/admin/restaurant-applications/${applicationId}/reject`, {
        method: "PATCH",
        accessToken,
        body: { reason } 
    });
}

export function getAllApplications(accessToken) {
    return apiFetch(`api/admin/restaurant-applications`, {
        method: "GET",
        accessToken,
    });
}
