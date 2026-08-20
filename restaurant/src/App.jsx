import { Routes, Route, Navigate } from "react-router-dom";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Onboarding from "./pages/Onboarding"; // ✅ default import

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/home" element={<Home />} />
      <Route path="/onboarding" element={<Onboarding />} /> {/* ✅ added */}
      <Route path="*" element={<Navigate to="/" replace />} /> {/* fallback */}
    </Routes>
  );
}
