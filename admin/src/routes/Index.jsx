import { Navigate, RouterProvider, createBrowserRouter } from "react-router-dom";
import { ProtectedRoute, PublicOnlyRoute } from "./ProtectedRoute";
import Dashboard from "../pages/Dashboard";
import Profile from "../pages/Profile";
import Login from "../pages/Login";

const router = createBrowserRouter([
  {
    path: "/",
    element: <ProtectedRoute />,
    children: [
      { index: true, element: <Navigate to="/admin-dashboard" replace /> },
      { path: "admin-dashboard", element: <Dashboard /> },
      { path: "profile", element: <Profile /> },
    ],
  },
  {
    element: <PublicOnlyRoute />,
    children: [{ path: "/login", element: <Login /> }],
  },
  { path: "*", element: <Navigate to="/" replace /> },
]);

const Routes = () => <RouterProvider router={router} />;

export default Routes;