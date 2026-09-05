import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const ProtectedRoute = () => {
  const { account, loading } = useAuth();

  if (loading) {
    return <div>Loading…</div>;
  }

  if (!account) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};