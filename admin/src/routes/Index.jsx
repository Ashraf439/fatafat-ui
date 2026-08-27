import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute"
import Dashboard from "../pages/Dashboard"
import Login from "../pages/Login";

const Routes = () => {
    const routesForAuthenticatedAdmin = [
        {
            path : "/",
            element : <ProtectedRoute />,
            children:[
                {
                    path: "dashboard",
                    element: <Dashboard/>
                }
            ]
        }
    ];

    const routesForNotAuthenticatedOnly = [
        {
            path: "/login",
            element: <Login />
        }
    ];

    const router = createBrowserRouter([
        ...routesForAuthenticatedAdmin,
        ...routesForNotAuthenticatedOnly
    ]);

    return <RouterProvider router={router} />;
}
export default Routes;