import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ProtectedRoute } from "./ProtectedRoute";
import {Home} from '../pages/Home'
import {Signup} from '../pages/Signup'
import {Login} from '../pages/Login'
import Onboarding from '../pages/Onboarding';

const Routes = () => {
    const {token} = useAuth();
    
    const routesForPublic = [
        {
            path:'/service',
            element:<div>Sevice page</div>
        },
        {
            path:'/about us',
            element:<div>About us page</div>
        }
    ]

    const routesForAuthenticateUsers = [
    {
        path: "/",
        element: <ProtectedRoute />,
        children: [
        { path: "home", element: <Home /> },
        { path: "dashboard", element: <div>Dashboard</div> },
        { path: "onboarding", element: <Onboarding /> },  // ✅ relative path
        { path: "logout", element: <div>Logout</div> }
        ]
    }
    ];


    const routesForNotAuthenticatedOnly = [
        {
            path:'/signup',
            element: <Signup/>
        },
        {
            path:'/login',
            element: <Login/>
        }
    ]

    const router = createBrowserRouter([
        ...routesForPublic,
        ...(!accessToken ? routesForNotAuthenticatedOnly : []),
        ...routesForAuthenticateUsers
    ]);

    return <RouterProvider router={router}/>
}

export default Routes;