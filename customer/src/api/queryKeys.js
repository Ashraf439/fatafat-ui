/** Central query-key factory: one place to see (and invalidate) every cache entry. */
export const queryKeys = {
  me: ["auth", "me"],
  cities: ["restaurants", "cities"],
  restaurants: (filters) => ["restaurants", "list", filters],
  restaurant: (id) => ["restaurants", "detail", String(id)],
  menu: (id) => ["restaurants", "menu", String(id)],
  addresses: ["addresses"],
  quote: (restaurantId, lines) => ["quote", String(restaurantId), lines],
  orders: ["orders", "list"],
  order: (id) => ["orders", "detail", String(id)],
};
