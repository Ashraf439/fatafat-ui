import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Rabbit, Loader2 } from "lucide-react";
import { login } from "../api/auth";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { setSession } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await login({ email, password });
      setSession(result);
      // Onboarding checks the applicant's real status on mount and resumes
      // wherever they left off — no need to branch here.
      navigate("/onboarding");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F6F7FF] font-sans flex items-center justify-center px-6">
      <div className="w-full max-w-sm bg-white rounded-xl shadow-xl p-7">
        <div className="flex items-center gap-2 mb-6">
          <Rabbit className="w-7 h-7" style={{ color: "#26187D" }} />
          <span className="font-extrabold text-lg text-[#26187D]">Fatafat Partner</span>
        </div>

        <h2 className="text-xl font-extrabold text-slate-900 mb-1">Log in</h2>
        <p className="text-sm text-slate-500 mb-6">
          Continue setting up your restaurant
        </p>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter Email"
            className="w-full border border-slate-300 rounded-lg px-4 py-3 text-sm mb-4 outline-none focus:border-[#26187D]"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter Password"
            className="w-full border border-slate-300 rounded-lg px-4 py-3 text-sm mb-4 outline-none focus:border-[#26187D]"
          />
          {error && <p className="text-xs text-red-600 mb-3">{error}</p>}
          <button
            type="submit"
            disabled={!email || !password || loading}
            className="w-full rounded-lg py-3 text-sm font-semibold text-white transition-colors
              bg-slate-300 disabled:cursor-not-allowed
              enabled:bg-[#26187D] enabled:hover:bg-[#1d1260] flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Log In
          </button>
        </form>

        <p className="text-xs text-center text-slate-500 mt-5">
          Don't have an account?{" "}
          <Link to="/" className="underline text-[#26187D] font-semibold">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}