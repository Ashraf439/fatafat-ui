import { Routes, Route, Navigate } from "react-router-dom";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import { useAuth } from "./context/AuthContext";

function RequireAuth({ children }) {
  const { accessToken } = useAuth();
  if (!accessToken) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      {/*
        "/" renders Signup directly instead of redirecting to "/signup".
        This matters: the backend's email-verification link 302s to
        "http://localhost:5173/?verified=true". A <Navigate> redirect here
        would drop that query string before Signup ever sees it.
      */}
      <Map
        initialViewState={{
          longitude: -100,
          latitude: 40,
          zoom: 3.5
        }}
        style={{width: 600, height: 400}}
        mapStyle="https://demotiles.maplibre.org/style.json"
      />;
      <Route path="/" element={<Signup />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />
      <Route
        path="/onboarding"
        element={
          <RequireAuth>
            <Onboarding />
          </RequireAuth>
        }
      />
      <Route
        path="/dashboard"
        element={
          <RequireAuth>
            <Dashboard />
          </RequireAuth>
        }
      />
    </Routes>
  );
}