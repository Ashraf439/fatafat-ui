import { RouterProvider, createBrowserRouter, Navigate } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";
import { RequireRole } from "./RequireRole";
import { RequirePermission } from "./RequirePermission";
import { Splash } from "../components/Splash";
import { AppShell } from "../components/layout/AppShell";

const page = (loader) => ({ lazy: async () => ({ Component: (await loader()).default }) });

const ORDER_ROLES = ["RESTAURANT", "RESTAURANT_MANAGER", "RESTAURANT_STAFF", "RESTAURANT_CASHIER"];
const MANAGER_ROLES = ["RESTAURANT", "RESTAURANT_MANAGER"]; // still used for Analytics only
const OWNER_ROLES = ["RESTAURANT"];
const MENU_PERMS = ["MENU_ITEM_ADD", "MENU_ITEM_REMOVE"];
const STAFF_PERMS = ["STAFF_ADD", "STAFF_REMOVE", "STAFF_MANAGE_PERMISSIONS"];

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

const permGuard = (perms, loader) => ({
  lazy: async () => {
    const Page = (await loader()).default;
    return {
      Component: () => (
        <RequirePermission permissions={perms}>
          <Page />
        </RequirePermission>
      ),
    };
  },
});

const router = createBrowserRouter([
  { path: "/service", element: <div>Service page</div> },
  { path: "/about-us", element: <div>About us page</div> },
  { path: "/signup", HydrateFallback: Splash, ...page(() => import("../pages/Signup")) },
  { path: "/login", HydrateFallback: Splash, ...page(() => import("../pages/Login")) },
  { path: "/forgot-password", HydrateFallback: Splash, ...page(() => import("../pages/ForgotPassword")) },
  { path: "/set-password", HydrateFallback: Splash, ...page(() => import("../pages/SetPassword")) },
  {
    path: "/",
    element: <ProtectedRoute />,
    HydrateFallback: Splash,
    children: [
      {
        element: <AppShell />,
        children: [
          { path: "home", ...page(() => import("../pages/Home")) },
          { path: "onboarding", ...guard(OWNER_ROLES, () => import("../pages/Onboarding")) },
        ],
      },
      {
        path: "dashboard",
        ...page(() => import("../pages/Dashboard")),
        children: [
          { index: true, element: <Navigate to="orders" replace /> },
          { path: "orders", ...guard(ORDER_ROLES, () => import("../pages/Orders")) },
          { path: "profile", ...guard(ORDER_ROLES, () => import("../pages/Profile")) },
          { path: "staff", ...permGuard(STAFF_PERMS, () => import("../pages/StaffManagement")) },
          { path: "menu", ...permGuard(MENU_PERMS, () => import("../pages/Menu")) },
          { path: "analytics", element: <RequireRole roles={MANAGER_ROLES}><div>Analytics</div></RequireRole> },
        ],
      },
      { path: "logout", element: <div>Logout</div> },
    ],
  },
]);

const Routes = () => <RouterProvider router={router} />;

export default Routes;