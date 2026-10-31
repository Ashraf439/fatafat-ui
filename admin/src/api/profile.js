import { apiFetch } from "./client";

/** Admins are added manually — this is view-only, there's no update endpoint. */
export function getMyProfile() {
  return apiFetch("/api/admin/me/profile");
}