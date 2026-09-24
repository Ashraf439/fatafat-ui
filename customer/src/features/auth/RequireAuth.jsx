import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "./useAuth";

/** Route guard: renders nested routes only for signed-in customers. */
export function RequireAuth() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-muted-foreground">
        <Loader2 className="size-6 animate-spin" />
      </div>
    );
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  }
  return <Outlet />;
}
