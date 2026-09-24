import { useCallback, useEffect, useMemo, useReducer, useState } from "react";
import { CartContext } from "./cart-context";
import { cartCount, cartReducer, cartSubtotal, loadCart, saveCart } from "./cart-store";

/**
 * Holds the shopping cart (one restaurant at a time) and persists it to localStorage.
 * Adding from a different restaurant raises a `conflict` the UI resolves via <CartConflictDialog>.
 */
export function CartProvider({ children }) {
  const [cart, dispatch] = useReducer(cartReducer, undefined, loadCart);
  const [conflict, setConflict] = useState(null);
  const [isOpen, setOpen] = useState(false);

  useEffect(() => {
    saveCart(cart);
  }, [cart]);

  const requestAdd = useCallback(
    (restaurant, item) => {
      if (cart.restaurant && cart.restaurant.id !== restaurant.id) {
        setConflict({ restaurant, item });
        return;
      }
      dispatch({ type: "ADD", restaurant, item });
    },
    [cart.restaurant],
  );

  const resolveConflict = useCallback(
    (replace) => {
      if (replace && conflict) dispatch({ type: "REPLACE", restaurant: conflict.restaurant, item: conflict.item });
      setConflict(null);
    },
    [conflict],
  );

  const value = useMemo(() => {
    const quantities = new Map(cart.lines.map((l) => [l.menuId, l.quantity]));
    return {
      cart,
      count: cartCount(cart),
      subtotal: cartSubtotal(cart),
      quantityOf: (menuId) => quantities.get(menuId) ?? 0,
      requestAdd,
      increment: (menuId) => dispatch({ type: "INCREMENT", menuId }),
      decrement: (menuId) => dispatch({ type: "DECREMENT", menuId }),
      remove: (menuId) => dispatch({ type: "REMOVE", menuId }),
      clear: () => dispatch({ type: "CLEAR" }),
      conflict,
      resolveConflict,
      isOpen,
      setOpen,
    };
  }, [cart, conflict, isOpen, requestAdd, resolveConflict]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
