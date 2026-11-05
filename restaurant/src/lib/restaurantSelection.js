const STORAGE_KEY = "fatafat.restaurant.selectedId";

/** The restaurant (by its public UUID) the owner has switched to, for accounts with more than one. */
export function getSelectedRestaurantId() {
  try {
    return localStorage.getItem(STORAGE_KEY) || null;
  } catch {
    return null;
  }
}

export function setSelectedRestaurantId(id) {
  try {
    if (id) localStorage.setItem(STORAGE_KEY, id);
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    // storage unavailable (private browsing, etc.) — the backend will just fall back to the default restaurant
  }
}