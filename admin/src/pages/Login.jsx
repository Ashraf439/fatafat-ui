import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../api/auth";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const navigateTo = useNavigate();
  const { setSession } = useAuth();

  const [formInput, setFormInput] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await login(formInput);
      setSession(result);
      navigateTo("/admin-dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex flex-col justify-center min-h-screen overflow-hidden bg-linear-to-br from-[#F5EDA0] to-[#FFFACD] px-4">
      {/* decorative backdrop accents */}
      <div className="pointer-events-none absolute -top-24 -left-24 w-72 h-72 rounded-full bg-[#B81104]/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-[#B81104]/10 blur-3xl" />

      <div className="relative w-full max-w-md mx-auto">
        {/* Brand mark */}
        <div className="text-center mb-6">
          <p className="text-xs font-bold uppercase tracking-widest text-[#B81104] mb-1">
            Restaurant Onboarding
          </p>
          <h1 className="font-serif font-bold text-3xl text-[#7C0B03]">
            Admin Portal
          </h1>
        </div>

        <div className="bg-[#FFFDF6] border border-[#B81104]/20 rounded-2xl shadow-xl shadow-[#7C0B03]/10 p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-bold uppercase tracking-wide text-[#7C0B03]/70 mb-1.5"
              >
                Email
              </label>
              <input
                id="email"
                value={formInput.email}
                onChange={(e) =>
                  setFormInput({ ...formInput, email: e.target.value })
                }
                className="block w-full px-4 py-2.5 text-[#2A1810] bg-white border-2 border-[#B81104]/20 rounded-lg placeholder:text-[#7C0B03]/30 focus:border-[#B81104] focus:outline-none focus:ring-4 focus:ring-[#B81104]/10 transition-colors"
                type="email"
                placeholder="you@restaurant.com"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="password"
                  className="block text-xs font-bold uppercase tracking-wide text-[#7C0B03]/70"
                >
                  Password
                </label>
                <a href="#" className="text-xs font-semibold text-[#B81104] hover:underline">
                  Forgot password?
                </a>
              </div>
              <input
                id="password"
                value={formInput.password}
                onChange={(e) =>
                  setFormInput({ ...formInput, password: e.target.value })
                }
                className="block w-full px-4 py-2.5 text-[#2A1810] bg-white border-2 border-[#B81104]/20 rounded-lg placeholder:text-[#7C0B03]/30 focus:border-[#B81104] focus:outline-none focus:ring-4 focus:ring-[#B81104]/10 transition-colors"
                type="password"
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div className="bg-[#FFFACD] border-l-4 border-[#B81104] text-[#7C0B03] text-sm font-semibold px-3.5 py-2.5 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={!formInput.email || !formInput.password || loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 font-bold text-[#FFFACD] bg-[#B81104] rounded-lg hover:bg-[#7C0B03] active:translate-y-px transition-all disabled:bg-[#B81104]/30 disabled:text-[#7C0B03]/50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-[#FFFACD] border-t-transparent rounded-full animate-spin" />
                  Logging in…
                </>
              ) : (
                "Login"
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-[#7C0B03]/60 mt-6">
          Restricted access — admin credentials only.
        </p>
      </div>
    </div>
  );
};

export default Login;