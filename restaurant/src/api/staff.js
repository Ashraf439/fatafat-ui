import { apiFetch } from "./client";

export function listStaff() {
  return apiFetch("/api/restaurant/staff");
}

export function addStaff({ email, role }) {
  return apiFetch("/api/restaurant/staff", {
    method: "POST",
    body: JSON.stringify({ email, role }),
  });
}

export function removeStaff(staffUserId) {
  return apiFetch(`/api/restaurant/staff/${staffUserId}`, {
    method: "DELETE",
  });
}

export function updateStaffPermission(staffUserId, { permissionName, effect }) {
  return apiFetch(`/api/restaurant/staff/${staffUserId}/permissions`, {
    method: "PATCH",
    body: JSON.stringify({ permissionName, effect }),
  });
}