import { createBrowserRouter } from "react-router-dom";
import { Splash } from "@/components/Splash";
import { AppLayout } from "@/components/layout/AppLayout";
import { RequireAuth } from "@/features/auth/RequireAuth";
import RouteError from "@/pages/RouteError";

// Every page is code-split: the initial bundle only carries the shell.
const page = (loader) => ({ lazy: async () => ({ Component: (await loader()).default }) });

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    errorElement: <RouteError />,
    HydrateFallback: Splash,
    children: [
      { index: true, ...page(() => import("@/pages/HomePage")) },
      { path: "restaurants/:id", ...page(() => import("@/pages/RestaurantPage")) },
      { path: "login", ...page(() => import("@/pages/LoginPage")) },
      { path: "register", ...page(() => import("@/pages/RegisterPage")) },
      { path: "forgot-password", ...page(() => import("@/pages/ForgotPasswordPage")) },
      { path: "set-password", ...page(() => import("@/pages/SetPasswordPage")) },
      {
        element: <RequireAuth />,
        children: [
          { path: "checkout", ...page(() => import("@/pages/CheckoutPage")) },
          { path: "orders", ...page(() => import("@/pages/OrdersPage")) },
          { path: "orders/:id", ...page(() => import("@/pages/OrderDetailPage")) },
          { path: "account/addresses", ...page(() => import("@/pages/AddressesPage")) },
        ],
      },
      { path: "*", ...page(() => import("@/pages/NotFoundPage")) },
    ],
  },
]);
