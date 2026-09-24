import { useCallback, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { authApi } from "@/api/auth";
import { queryKeys } from "@/api/queryKeys";
import { ApiError } from "@/lib/http";
import { AuthContext } from "./auth-context";

const CUSTOMER_ROLE = "CUSTOMER";

/**
 * Cookie-session auth. The session lives in httpOnly cookies set by the backend, so the app
 * only tracks "who am I" (GET /api/auth/me) in the query cache.
 */
export function AuthProvider({ children }) {
  const queryClient = useQueryClient();

  const { data: user = null, isPending } = useQuery({
    queryKey: queryKeys.me,
    queryFn: authApi.me,
    staleTime: Infinity,
    retry: false,
  });

  const clearPrivateData = useCallback(() => {
    queryClient.removeQueries({ queryKey: queryKeys.addresses });
    queryClient.removeQueries({ queryKey: ["orders"] });
    queryClient.removeQueries({ queryKey: ["quote"] });
  }, [queryClient]);

  const login = useCallback(
    async (email, password) => {
      const result = await authApi.login(email, password);
      const account = result?.account;
      if (!account?.roles?.includes(CUSTOMER_ROLE)) {
        // A restaurant/admin account signed in here: don't keep that session in the customer app.
        await authApi.logout().catch(() => {});
        throw new ApiError("This app is for customers. Please use the restaurant app for that account.", 403);
      }
      clearPrivateData();
      queryClient.setQueryData(queryKeys.me, account);
      return account;
    },
    [queryClient, clearPrivateData],
  );

  const logout = useCallback(async () => {
    await authApi.logout().catch(() => {});
    queryClient.setQueryData(queryKeys.me, null);
    clearPrivateData();
  }, [queryClient, clearPrivateData]);

  const value = useMemo(
    () => ({ user, isLoading: isPending, isAuthenticated: Boolean(user), login, logout }),
    [user, isPending, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
