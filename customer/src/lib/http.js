import { API_BASE_URL } from "@/config/env";

/** Error thrown for every non-2xx response, network failure and malformed reply. */
export class ApiError extends Error {
  constructor(message, status = 0, data = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

// Auth endpoints never trigger a silent token refresh, except /me (the session bootstrap).
const isRefreshable = (path) => path === "/api/auth/me" || !path.startsWith("/api/auth/");

let refreshInFlight = null;

/** Single-flight refresh so parallel 401s share one /refresh call. */
function refreshSession() {
  if (!refreshInFlight) {
    refreshInFlight = fetch(`${API_BASE_URL}/api/auth/refresh`, { method: "POST", credentials: "include" })
      .then((res) => res.ok)
      .catch(() => false)
      .finally(() => {
        refreshInFlight = null;
      });
  }
  return refreshInFlight;
}

function buildUrl(path, params) {
  const url = new URL(`${API_BASE_URL}${path}`);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value === undefined || value === null || value === "" || value === false) continue;
      url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

async function parseBody(res) {
  if (res.status === 204) return null;
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function messageFor(status, data) {
  if (data && typeof data === "object") {
    if (typeof data.error === "string") return data.error;
    if (typeof data.message === "string") return data.message;
  }
  if (typeof data === "string" && data.length < 200) return data;
  if (status === 429) return "Too many attempts. Please wait a moment and try again.";
  if (status === 401) return "Please log in to continue.";
  if (status === 403) return "You don't have access to that.";
  if (status === 404) return "We couldn't find that.";
  if (status >= 500) return "Something went wrong on our side. Please try again.";
  return "Request failed.";
}

async function request(path, { method = "GET", body, params, signal, retried = false } = {}) {
  let res;
  try {
    res = await fetch(buildUrl(path, params), {
      method,
      credentials: "include",
      headers: body !== undefined ? { "Content-Type": "application/json" } : undefined,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal,
    });
  } catch (err) {
    if (err?.name === "AbortError") throw err;
    throw new ApiError("Can't reach the server. Check your connection and try again.", 0);
  }

  if (res.status === 401 && !retried && isRefreshable(path) && (await refreshSession())) {
    return request(path, { method, body, params, signal, retried: true });
  }

  const data = await parseBody(res);
  if (!res.ok) throw new ApiError(messageFor(res.status, data), res.status, data);
  return data;
}

export const http = {
  get: (path, options) => request(path, { ...options, method: "GET" }),
  post: (path, body, options) => request(path, { ...options, method: "POST", body: body ?? {} }),
  put: (path, body, options) => request(path, { ...options, method: "PUT", body }),
  patch: (path, body, options) => request(path, { ...options, method: "PATCH", body: body ?? {} }),
  delete: (path, options) => request(path, { ...options, method: "DELETE" }),
};
