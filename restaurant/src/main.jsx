import { createRoot } from "react-dom/client";
import { ToastContainer } from "react-toastify";
import { AuthProvider } from "./context/AuthContext";
import Routes from "./routes";

import "./index.css";

createRoot(document.getElementById("root")).render(
    <AuthProvider>
        <Routes />
        {}
        <ToastContainer position="top-right" autoClose={4000} newestOnTop closeOnClick />
    </AuthProvider>
);