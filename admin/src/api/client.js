const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080").replace(/\/+$/, "");

export class ApiError extends Error {
  constructor(message, status = 0, data = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

// Lets the auth context drop the session when a request fails with 401 even after a refresh attempt.
let unauthorizedHandler = () => {};
export function setUnauthorizedHandler(fn) {
  unauthorizedHandler = typeof fn === "function" ? fn : () => {};
}

// Auth endpoints never trigger a silent refresh, except /me (the session bootstrap).
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
      if (value === undefined || value === null || value === "") continue;
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
  if (status >= 500) return "Something went wrong on the server. Please try again.";
  return "Request failed.";
}

/**
 * @param {string} path  e.g. "/api/admin/restaurant-applications"
 * @param {{method?: string, body?: object, params?: object}} [options]  `body` is sent as JSON
 */
export async function apiFetch(path, { method = "GET", body, params, retried = false } = {}) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  let res;
  try {
    res = await fetch(buildUrl(normalizedPath, params), {
      method,
      credentials: "include",
      headers: body !== undefined ? { "Content-Type": "application/json" } : undefined,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError("Can't reach the server. Check your connection and try again.", 0);
  }

  if (res.status === 401 && !retried && isRefreshable(normalizedPath)) {
    if (await refreshSession()) {
      return apiFetch(normalizedPath, { method, body, params, retried: true });
    }
    unauthorizedHandler();
  }

  const data = await parseBody(res);
  if (!res.ok) throw new ApiError(messageFor(res.status, data), res.status, data);
  return data;
}