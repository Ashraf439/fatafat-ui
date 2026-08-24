import { createRoot } from "react-dom/client";
import { AuthProvider } from "./context/AuthContext";
import Routes from "./routes";

import "./index.css";

createRoot(document.getElementById("root")).render(
    <AuthProvider>
        <Routes />
    </AuthProvider>
);