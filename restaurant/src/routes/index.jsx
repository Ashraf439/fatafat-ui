import { RouterProvider, createBrowserRouter, Navigate } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";
import { RequireRole } from "./RequireRole";
import { Splash } from "../components/Splash";

const page = (loader) => ({ lazy: async () => ({ Component: (await loader()).default }) });

const ORDER_ROLES = ["RESTAURANT", "RESTAURANT_MANAGER", "RESTAURANT_STAFF", "RESTAURANT_CASHIER"];
const MANAGER_ROLES = ["RESTAURANT", "RESTAURANT_MANAGER"];

const guard = (roles, loader) => ({
  lazy: async () => {
    const Page = (await loader()).default;
    return {
      Component: () => (
        <RequireRole roles={roles}>
          <Page />
        </RequireRole>
      ),
    };
  },
});

const router = createBrowserRouter([
  { path: "/service", element: <div>Service page</div> },
  { path: "/about-us", element: <div>About us page</div> },
  { path: "/signup", HydrateFallback: Splash, ...page(() => import("../pages/Signup")) },
  { path: "/login", HydrateFallback: Splash, ...page(() => import("../pages/Login")) },
  {
    path: "/",
    element: <ProtectedRoute />,
    HydrateFallback: Splash,
    children: [
      { path: "home", ...page(() => import("../pages/Home")) },
      {
        path: "dashboard",
        ...page(() => import("../pages/Dashboard")),
        children: [
          { index: true, element: <Navigate to="orders" replace /> },
          { path: "orders", ...guard(ORDER_ROLES, () => import("../pages/Orders")) },
          { path: "profile", ...guard(ORDER_ROLES, () => import("../pages/Profile")) },
          { path: "staff", ...guard(MANAGER_ROLES, () => import("../pages/StaffManagement")) },
          { path: "menu", ...guard(MANAGER_ROLES, () => import("../pages/Menu")) },
          { path: "analytics", element: <RequireRole roles={MANAGER_ROLES}><div>Analytics</div></RequireRole> },
        ],
      },
      { path: "onboarding", ...page(() => import("../pages/Onboarding")) },
      { path: "logout", element: <div>Logout</div> },
    ],
  },
]);

const Routes = () => <RouterProvider router={router} />;

export default Routes;