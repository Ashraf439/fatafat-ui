import { apiFetch } from "./client";

/** Sets the access/refresh cookies. Resolves to `{ account, expiresAt }`. */
export function login({ email, password }) {
  return apiFetch("/api/auth/login", { method: "POST", body: { email, password } });
}

/** Revokes the refresh token and clears both cookies. */
export function logout() {
  return apiFetch("/api/auth/logout", { method: "POST" });
}

/** The signed-in account (id, name, email, roles, ...). Rejects with 401 if there is no session. */
export function getCurrentAccount() {
  return apiFetch("/api/auth/me");
}