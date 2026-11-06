import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const RequirePermission = ({ permissions: required, children }) => {
  const { permissions } = useAuth();
  const allowed = required.some((perm) => Boolean(permissions?.[perm]));

  if (!allowed) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};