const KEY = "fatafat:city";

/** Sentinel value for the "All cities" option in city <Select>s (Radix Select rejects value=""). */
export const ALL_CITIES = "all";

export function getSavedCity() {
  try {
    return localStorage.getItem(KEY) || "";
  } catch {
    return "";
  }
}

export function setSavedCity(city) {
  try {
    if (city) localStorage.setItem(KEY, city);
    else localStorage.removeItem(KEY);
  } catch {
    // localStorage unavailable (private mode, etc.) — city preference just won't persist.
  }
}