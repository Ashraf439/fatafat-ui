import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function FullScreenSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FFFACD]">
      <span className="w-6 h-6 border-2 border-[#7C0B03] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

/** Only signed-in admins get through; everyone else is sent to /login. */
export const ProtectedRoute = () => {
  const { account, initializing } = useAuth();

  if (initializing) return <FullScreenSpinner />;
  if (!account) return <Navigate to="/login" replace />;
  return <Outlet />;
};

/** Pages like /login that a signed-in admin should skip straight past. */
export const PublicOnlyRoute = () => {
  const { account, initializing } = useAuth();

  if (initializing) return <FullScreenSpinner />;
  if (account) return <Navigate to="/admin-dashboard" replace />;
  return <Outlet />;
};