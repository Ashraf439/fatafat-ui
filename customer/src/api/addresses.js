import { http } from "@/lib/http";

export const addressesApi = {
  list: () => http.get("/api/customer/addresses"),
  create: (payload) => http.post("/api/customer/addresses", payload),
  update: (id, payload) => http.put(`/api/customer/addresses/${id}`, payload),
  setDefault: (id) => http.patch(`/api/customer/addresses/${id}/default`),
  remove: (id) => http.delete(`/api/customer/addresses/${id}`),
};
