import { http } from "@/lib/http";

export const profileApi = {
  get: () => http.get("/api/customer/me/profile"),
  update: (payload) => http.patch("/api/customer/me/profile", payload),
};