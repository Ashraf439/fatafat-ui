import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { registerRestaurant, resendVerification, login } from "../api/auth";

const Signup = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setSession } = useAuth();

  const [formInput, setFormInput] = useState({ email: "", password: "" });
  const [mode, setMode] = useState("register"); 
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const verified = searchParams.get("verified");
    if (verified === "true") {
      setMode("login");
    } else if (verified === "false") {
      setMode("verify-failed");
      setError(
        searchParams.get("error") ||
          "Verification link is invalid or expired."
      );
    }
  }, [searchParams]);

  async function handleRegister() {
    setError("");
    setLoading(true);
    try {
      await registerRestaurant(formInput);
      setMode("awaiting-verification");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleLogin() {
    setError("");
    setLoading(true);
    try {
      const result = await login(formInput);
      setSession(result);
      navigate("/onboarding");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setError("");
    setNotice("");
    setLoading(true);
    try {
      await resendVerification(formInput.email);
      setNotice(
        "If that email is registered, a new verification link is on its way."
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    if (mode === "register") handleRegister();
    if (mode === "login") handleLogin();
  };

  return (
    <div className="bg-gray-100 flex flex-col justify-center min-h-screen overflow-hidden">
      {mode === "awaiting-verification" && (
        <div className="w-full max-w-md mx-auto bg-white p-6 rounded-md shadow-md">
          <h2 className="text-xl font-bold mb-2">Check your email</h2>
          <p>
            We have sent a verification link to your <strong>email</strong>.
          </p>
          {error && <p className="text-red-600 mt-2">{error}</p>}
          <button
            onClick={handleResend}
            disabled={loading}
            className="mt-4 w-full rounded-lg py-2 text-sm font-semibold text-white bg-purple-700 disabled:bg-slate-300"
          >
            {loading ? "Sending…" : "Resend Link"}
          </button>
          {notice && <p className="text-green-600 mt-2">{notice}</p>}
        </div>
      )}

      {mode === "verify-failed" && (
        <div className="w-full max-w-md mx-auto bg-white p-6 rounded-md shadow-md">
          <h2 className="text-xl font-bold mb-2">Verification Failed</h2>
          {error && <p className="text-red-600">{error}</p>}
          <p className="mt-2">Enter your email to get a new link:</p>
          <form onSubmit={(e) => e.preventDefault()}>
            <input
              value={formInput.email}
              onChange={(e) =>
                setFormInput({ ...formInput, email: e.target.value })
              }
              className="block w-full px-4 py-2 mt-2 border rounded-md"
              type="email"
              placeholder="Email"
            />
            <input
              value={formInput.password}
              onChange={(e) =>
                setFormInput({ ...formInput, password: e.target.value })
              }
              className="block w-full px-4 py-2 mt-2 border rounded-md"
              type="password"
              placeholder="Password"
            />
            <button
              onClick={handleResend}
              disabled={!formInput.email || loading}
              className="w-full mt-4 rounded-lg py-2 text-sm font-semibold text-white bg-purple-700 disabled:bg-slate-300"
            >
              {loading ? "Sending…" : "Resend verification link"}
            </button>
            {notice && <p className="text-green-600 mt-2">{notice}</p>}
            {error && <p className="text-red-600 mt-2">{error}</p>}
          </form>
        </div>
      )}

      {(mode === "register" || mode === "login") && (
        <div className="w-full max-w-xl mx-auto bg-white p-6 rounded-md shadow-md">
          <h1 className="text-3xl font-semibold text-center text-purple-700">
            Signup
          </h1>
          <form onSubmit={handleSubmit}>
            <div className="mb-2">
              <label className="block text-sm font-semibold text-gray-800">
                Email
              </label>
              <input
                value={formInput.email}
                onChange={(e) =>
                  setFormInput({ ...formInput, email: e.target.value })
                }
                className="block w-full px-4 py-2 mt-2 border rounded-md"
                type="email"
                required
              />
            </div>
            <div className="mb-2">
              <label className="block text-sm font-semibold text-gray-800">
                Password
              </label>
              <input
                value={formInput.password}
                onChange={(e) =>
                  setFormInput({ ...formInput, password: e.target.value })
                }
                className="block w-full px-4 py-2 mt-2 border rounded-md"
                type="password"
                required
              />
            </div>
            {error && <p className="text-red-600 mt-2">{error}</p>}
            <a
              href="#"
              className="text-xs text-purple-600 hover:underline"
            >
              Forgot Password?
            </a>
            <div className="mt-6">
              <button
                type="submit"
                disabled={!formInput.email || !formInput.password}
                className="w-full px-4 py-2 text-white bg-purple-700 rounded-md hover:bg-purple-600"
              >
                Sign Up
              </button>
            </div>
          </form>
          <p className="mt-8 text-xs text-center text-gray-700">
            Already have an account?{" "}
            <span
              onClick={() => navigate("/")}
              className="font-medium text-purple-600 hover:underline cursor-pointer"
            >
              Login
            </span>
          </p>
        </div>
      )}
    </div>
  );
};

export default Signup;
