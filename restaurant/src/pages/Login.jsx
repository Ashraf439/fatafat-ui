import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../api/auth";
import { toast } from "react-toastify";
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
      setSession(result.account); 
      navigateTo("/onboarding");
    } catch (err) {
      setError(err.message);
      toast.error(err.message); 
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-[#EFEDE6] relative flex flex-col justify-center min-h-screen overflow-hidden p-6">
      <div className="w-full p-8 m-auto bg-white rounded-xl shadow-sm border border-black/5 lg:max-w-md">
        <h1 className="text-2xl font-semibold text-center text-[#1C1B19]">
          Login
        </h1>

        <form onSubmit={handleSubmit} className="mt-6">
          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-[#1C1B19]"
            >
              Email
            </label>
            <input
              id="email"
              value={formInput.email}
              onChange={(e) =>
                setFormInput({ ...formInput, email: e.target.value })
              }
              className="block w-full px-4 py-2.5 mt-1.5 text-[#1C1B19] bg-[#EFEDE6] border border-transparent rounded-lg focus:bg-white focus:border-[#CD0000] focus:outline-none focus:ring-2 focus:ring-[#CD0000]/20 transition-colors"
              type="email"
              autoComplete="email"
              required
            />
          </div>

          <div className="mb-2">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-[#1C1B19]"
            >
              Password
            </label>
            <input
              id="password"
              value={formInput.password}
              onChange={(e) =>
                setFormInput({ ...formInput, password: e.target.value })
              }
              className="block w-full px-4 py-2.5 mt-1.5 text-[#1C1B19] bg-[#EFEDE6] border border-transparent rounded-lg focus:bg-white focus:border-[#CD0000] focus:outline-none focus:ring-2 focus:ring-[#CD0000]/20 transition-colors"
              type="password"
              autoComplete="current-password"
              required
            />
          </div>

          <a
            href="#"
            className="text-xs font-medium text-[#CD0000] hover:underline"
          >
            Forgot password?
          </a>

          {error && (
            <p
              role="alert"
              className="mt-3 px-3 py-2 rounded-lg bg-[#CD0000]/10 text-[#CD0000] text-sm"
            >
              {error}
            </p>
          )}

          <div className="mt-6">
            <button
              type="submit"
              disabled={!formInput.email || !formInput.password || loading}
              className="w-full px-4 py-2.5 tracking-wide text-white font-medium transition-colors duration-150 bg-[#CD0000] rounded-lg hover:bg-[#A80000] focus:outline-none focus:ring-2 focus:ring-[#CD0000]/40 focus:ring-offset-2 focus:ring-offset-white disabled:bg-[#1C1B19]/20 disabled:cursor-not-allowed"
            >
              {loading ? "Logging in…" : "Login"}
            </button>
          </div>
        </form>

        <p className="mt-8 text-xs text-center text-[#1C1B19]/60">
          Don't have an account?{" "}
          <b
            onClick={() => navigateTo("/signup")}
            className="font-semibold text-[#CD0000] hover:underline cursor-pointer"
          >
            Sign up
          </b>
        </p>
      </div>
    </div>
  );
};

export default Login;