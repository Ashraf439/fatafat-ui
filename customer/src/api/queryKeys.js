export const queryKeys = {
  me: ["auth", "me"],
  cities: ["restaurants", "cities"],
  restaurants: (filters) => ["restaurants", "list", filters],
  restaurant: (id) => ["restaurants", "detail", String(id)],
  menu: (id) => ["restaurants", "menu", String(id)],
  addresses: ["addresses"],
  profile: ["profile", "me"],
  quote: (restaurantId, lines) => ["quote", String(restaurantId), lines],
  orders: (filters) => ["orders", "list", filters],
  order: (id) => ["orders", "detail", String(id)],
};