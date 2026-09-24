// Pure cart logic + persistence. No React in here, so it is trivially testable.
//
// Shape:  { restaurant: { id, name, imageUrl } | null, lines: [{ menuId, name, price, foodType, imageUrl, quantity }] }
// Prices held here are display hints only; the server re-prices everything at quote/checkout.

export const MAX_QUANTITY_PER_ITEM = 20;
export const EMPTY_CART = { restaurant: null, lines: [] };
const STORAGE_KEY = "fatafat.cart.v1";

function toLine(item) {
  return {
    menuId: item.id,
    name: item.dishName,
    price: Number(item.price),
    foodType: item.foodType ?? null,
    imageUrl: item.imageUrl ?? null,
    quantity: 1,
  };
}

export function cartReducer(state, action) {
  switch (action.type) {
    case "ADD": {
      const { restaurant, item } = action;
      if (state.restaurant && state.restaurant.id !== restaurant.id) return state; // guarded by the provider
      const existing = state.lines.find((l) => l.menuId === item.id);
      const lines = existing
        ? state.lines.map((l) =>
            l.menuId === item.id ? { ...l, quantity: Math.min(l.quantity + 1, MAX_QUANTITY_PER_ITEM) } : l,
          )
        : [...state.lines, toLine(item)];
      return { restaurant, lines };
    }
    case "REPLACE":
      return { restaurant: action.restaurant, lines: [toLine(action.item)] };
    case "INCREMENT": {
      const lines = state.lines.map((l) =>
        l.menuId === action.menuId ? { ...l, quantity: Math.min(l.quantity + 1, MAX_QUANTITY_PER_ITEM) } : l,
      );
      return { ...state, lines };
    }
    case "DECREMENT": {
      const lines = state.lines
        .map((l) => (l.menuId === action.menuId ? { ...l, quantity: l.quantity - 1 } : l))
        .filter((l) => l.quantity > 0);
      return lines.length === 0 ? EMPTY_CART : { ...state, lines };
    }
    case "REMOVE": {
      const lines = state.lines.filter((l) => l.menuId !== action.menuId);
      return lines.length === 0 ? EMPTY_CART : { ...state, lines };
    }
    case "CLEAR":
      return EMPTY_CART;
    default:
      return state;
  }
}

export function cartCount(cart) {
  return cart.lines.reduce((sum, l) => sum + l.quantity, 0);
}

export function cartSubtotal(cart) {
  return cart.lines.reduce((sum, l) => sum + l.price * l.quantity, 0);
}

export function loadCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_CART;
    const parsed = JSON.parse(raw);
    const valid =
      parsed &&
      parsed.restaurant &&
      typeof parsed.restaurant.id === "number" &&
      Array.isArray(parsed.lines) &&
      parsed.lines.every((l) => typeof l.menuId === "number" && l.quantity > 0 && Number.isFinite(l.price));
    return valid && parsed.lines.length > 0 ? parsed : EMPTY_CART;
  } catch {
    return EMPTY_CART;
  }
}

export function saveCart(cart) {
  try {
    if (cart.lines.length === 0) localStorage.removeItem(STORAGE_KEY);
    else localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  } catch {
    // Storage may be unavailable (private mode / quota); the cart still works for this session.
  }
}
