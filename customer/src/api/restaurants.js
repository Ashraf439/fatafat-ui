import { http } from "@/lib/http";

export const restaurantsApi = {
  /** Paginated, filterable list. Returns { items, page, size, totalElements, totalPages, hasNext }. */
  list: ({ q, city, openOnly, pureVeg, page = 0, size = 12 } = {}, options) =>
    http.get("/api/customer/restaurants", { params: { q, city, openOnly, pureVeg, page, size }, ...options }),
  cities: () => http.get("/api/customer/restaurants/cities"),
  get: (id) => http.get(`/api/customer/restaurants/${id}`),
  /** { restaurantId, restaurantName, isOpen, imageUrl, categories: { [category]: MenuItem[] } } */
  menu: (id) => http.get(`/api/customer/restaurants/${id}/menu`),
};
