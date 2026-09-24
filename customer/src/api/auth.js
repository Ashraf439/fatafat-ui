import { http } from "@/lib/http";

export const authApi = {
  /** Returns the current account, or null when there is no valid session. */
  async me() {
    try {
      return await http.get("/api/auth/me");
    } catch (err) {
      if (err.status === 401) return null;
      throw err;
    }
  },
  login: (email, password) => http.post("/api/auth/login", { email, password }),
  logout: () => http.post("/api/auth/logout"),
  registerCustomer: (payload) => http.post("/api/auth/register/customer", payload),
  resendVerification: (email) => http.post("/api/auth/resend-verification", { email }),
  forgotPassword: (email) => http.post("/api/auth/forgot-password", { email }),
  setPassword: (token, newPassword) => http.post("/api/auth/set-password", { token, newPassword }),
};
