import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Splash } from "../components/Splash";

export const ProtectedRoute = () => {
  const { account, loading } = useAuth();

  if (loading) return <Splash />;
  if (!account) return <Navigate to="/login" replace />;

  return <Outlet />;
};