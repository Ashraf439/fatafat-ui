import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const ProtectedRoute = () => {
    const { accessToken } = useAuth();

    console.log("PROTECTED ROUTE ACCESS TOKEN:", accessToken);

    if (!accessToken) {
        console.log("NO TOKEN → REDIRECTING TO LOGIN");
        return <Navigate to="/login" replace />;
    }

    console.log("TOKEN EXISTS → SHOWING PAGE");

    return <Outlet />;
};