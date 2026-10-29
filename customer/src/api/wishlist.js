import { http } from "@/lib/http";

export const wishlistApi = {
  list: () => http.get("/api/customer/wishlist"),
  add: (menuId) => http.put(`/api/customer/wishlist/${menuId}`),
  remove: (menuId) => http.delete(`/api/customer/wishlist/${menuId}`),
};