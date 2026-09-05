import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const RequireRole = ({ roles, children }) => {
  const { account } = useAuth();
  const allowed = roles.some((r) => account?.roles?.includes(r));
  if (!allowed) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};