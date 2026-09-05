import { RouterProvider, createBrowserRouter, Navigate } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";
import Home from "../pages/Home";
import Signup from "../pages/Signup";
import Login from "../pages/Login";
import Onboarding from "../pages/Onboarding";
import Dashboard from "../pages/Dashboard";
import StaffManagement from "../pages/StaffManagement";
import MenuUpload from "../pages/MenuUpload";
import Orders from "../pages/Orders"; 
import {RequireRole} from "./RequireRole";

const Routes = () => {
  const routesForPublic = [
    { path: "/service", element: <div>Service page</div> },
    { path: "/about-us", element: <div>About us page</div> }
  ];

  const routesForAuthenticateUsers = [
    {
      path: "/",
      element: <ProtectedRoute />,
      children: [
        { path: "home", element: <Home /> },
        {
          path: "dashboard",
          element: <Dashboard />, 
          children: [
            { index: true, element: <Navigate to="orders" replace /> },
            {
              path: "orders",
              element: (
                <RequireRole roles={["RESTAURANT","RESTAURANT_MANAGER","RESTAURANT_STAFF","RESTAURANT_CASHIER"]}>
                  <Orders />
                </RequireRole>
              )
            },
            {
              path: "staff",
              element: (
                <RequireRole roles={["RESTAURANT","RESTAURANT_MANAGER"]}>
                  <StaffManagement />
                </RequireRole>
              )
            },
            {
              path: "menu",
              element: (
                <RequireRole roles={["RESTAURANT","RESTAURANT_MANAGER"]}>
                  <MenuUpload />
                </RequireRole>
              )
            }
          ]
        },
        { path: "onboarding", element: <Onboarding /> },
        { path: "logout", element: <div>Logout</div> }
      ]
    }
  ];

  const routesForNotAuthenticatedOnly = [
    { path: "/signup", element: <Signup /> },
    { path: "/login", element: <Login /> }
  ];

  const router = createBrowserRouter([
    ...routesForPublic,
    ...routesForNotAuthenticatedOnly,
    ...routesForAuthenticateUsers
  ]);

  return <RouterProvider router={router} />;
};

export default Routes;
