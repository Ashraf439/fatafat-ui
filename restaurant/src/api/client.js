const BASE_URL = "http://localhost:8080"; 

export async function apiFetch(url, { method = "GET", body } = {}) {
  const isFormData = body instanceof FormData;

  const headers = isFormData
    ? {}
    : { "Content-Type": "application/json" };

  const response = await fetch(`${BASE_URL}${url}`, {
    method,
    headers,
    body,
    credentials: "include", 
  });

  if (!response.ok) {
    const text = await response.text();
    let message = text;
    try {
      message = JSON.parse(text).error || JSON.parse(text).message || text;
    } catch {
      // response wasn't JSON — use raw text
    }
    throw new Error(message || `Request failed (${response.status})`);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}