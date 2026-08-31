import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { registerRestaurant, resendVerification, login } from "../api/auth";
import { StatusScreen, IconMail } from "../components/StatusScreen";

const inputClass =
  "block w-full px-4 py-2.5 mt-1.5 text-[#1C1B19] bg-[#EFEDE6] border border-transparent rounded-lg focus:bg-white focus:border-[#CD0000] focus:outline-none focus:ring-2 focus:ring-[#CD0000]/20 transition-colors";

const primaryButtonClass =
  "w-full px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-[#CD0000] hover:bg-[#A80000] focus:outline-none focus:ring-2 focus:ring-[#CD0000]/40 focus:ring-offset-2 focus:ring-offset-white transition-colors disabled:bg-[#1C1B19]/20 disabled:cursor-not-allowed";

const cardClass =
  "w-full max-w-md mx-auto bg-white p-8 rounded-xl shadow-sm border border-black/5";

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

  if (mode === "awaiting-verification") {
    return (
      <StatusScreen
        icon={<IconMail />}
        tone="accent"
        eyebrow="Signup"
        title="Check your email"
        message={
          <>
            We've sent a verification link to{" "}
            <strong className="text-[#1C1B19]">
              {formInput.email || "your email"}
            </strong>
            . Click it to activate your account.
          </>
        }
        error={error}
      >
        <button
          onClick={handleResend}
          disabled={loading}
          className={primaryButtonClass}
        >
          {loading ? "Sending…" : "Resend link"}
        </button>
        {notice && (
          <p className="mt-3 px-3 py-2 rounded-md bg-[#1C1B19]/5 text-[#1C1B19]/80 text-sm">
            {notice}
          </p>
        )}
      </StatusScreen>
    );
  }

  if (mode === "verify-failed") {
    return (
      <StatusScreen
        icon={<IconMail />}
        tone="danger"
        eyebrow="Signup"
        title="Verification failed"
        message="That link is invalid or expired. Enter your email to get a new one."
        error={error}
      >
        <form onSubmit={(e) => e.preventDefault()}>
          <input
            value={formInput.email}
            onChange={(e) =>
              setFormInput({ ...formInput, email: e.target.value })
            }
            className={inputClass}
            type="email"
            placeholder="Email"
            autoComplete="email"
          />
          <input
            value={formInput.password}
            onChange={(e) =>
              setFormInput({ ...formInput, password: e.target.value })
            }
            className={inputClass}
            type="password"
            placeholder="Password"
            autoComplete="current-password"
          />
          <button
            onClick={handleResend}
            disabled={!formInput.email || loading}
            className={`mt-4 ${primaryButtonClass}`}
          >
            {loading ? "Sending…" : "Resend verification link"}
          </button>
          {notice && (
            <p className="mt-3 px-3 py-2 rounded-md bg-[#1C1B19]/5 text-[#1C1B19]/80 text-sm">
              {notice}
            </p>
          )}
        </form>
      </StatusScreen>
    );
  }

  return (
    <div className="bg-[#EFEDE6] flex flex-col justify-center min-h-screen overflow-hidden p-6">
      {(mode === "register" || mode === "login") && (
        <div className={`${cardClass} max-w-xl`}>
          <h1 className="text-2xl font-semibold text-center text-[#1C1B19]">
            Signup
          </h1>
          <form onSubmit={handleSubmit} className="mt-6">
            <div className="mb-4">
              <label className="block text-sm font-medium text-[#1C1B19]">
                Email
              </label>
              <input
                value={formInput.email}
                onChange={(e) =>
                  setFormInput({ ...formInput, email: e.target.value })
                }
                className={inputClass}
                type="email"
                autoComplete="email"
                required
              />
            </div>
            <div className="mb-2">
              <label className="block text-sm font-medium text-[#1C1B19]">
                Password
              </label>
              <input
                value={formInput.password}
                onChange={(e) =>
                  setFormInput({ ...formInput, password: e.target.value })
                }
                className={inputClass}
                type="password"
                autoComplete="new-password"
                required
              />
            </div>
            {error && (
              <p
                role="alert"
                className="mt-3 px-3 py-2 rounded-lg bg-[#CD0000]/10 text-[#CD0000] text-sm"
              >
                {error}
              </p>
            )}
            <a
              href="#"
              className="text-xs font-medium text-[#CD0000] hover:underline"
            >
              Forgot Password?
            </a>
            <div className="mt-6">
              <button
                type="submit"
                disabled={!formInput.email || !formInput.password || loading}
                className={primaryButtonClass}
              >
                {loading ? "Signing up…" : "Sign Up"}
              </button>
            </div>
          </form>
          <p className="mt-8 text-xs text-center text-[#1C1B19]/60">
            Already have an account?{" "}
            <span
              onClick={() => navigate("/")}
              className="font-semibold text-[#CD0000] hover:underline cursor-pointer"
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