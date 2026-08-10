import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Rabbit, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { registerRestaurant, login, resendVerification } from "../api/auth";
import { useAuth } from "../context/AuthContext";

const steps = [
  { n: 1, title: "Install the Fatafat Owner App" },
  { n: 2, title: "Login/Register using your email" },
  { n: 3, title: "Enter restaurant details" },
];

const docs = [
  { label: "FSSAI License copy", link: "https://foscos.fssai.gov.in/" },
  { label: "Your Restaurant menu" },
  { label: "Bank details" },
  { label: "GSTIN", link: "https://www.gst.gov.in/" },
  { label: "PAN card copy" },
];

export default function FatafatPartnerPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setSession } = useAuth();

  // "register" | "awaiting-verification" | "login" | "verify-failed"
  const [mode, setMode] = useState("register");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const verified = searchParams.get("verified");
    if (verified === "true") {
      setMode("login");
    } else if (verified === "false") {
      setMode("verify-failed");
      setError(searchParams.get("error") || "Verification link is invalid or expired.");
    }
  }, [searchParams]);

  async function handleRegister() {
    setError("");
    setLoading(true);
    try {
      await registerRestaurant({ email, password });
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
      const result = await login({ email, password });
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
      await resendVerification(email);
      setNotice("If that email is registered, a new verification link is on its way.");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit() {
    if (mode === "register") handleRegister();
    if (mode === "login") handleLogin();
  }

  const cardCopy = {
    register: {
      title: "Get Started",
      subtitle: "Enter your email and password to continue",
    },
    login: {
      title: "Email verified",
      subtitle: "Log in to continue setting up your restaurant",
    },
  };

  return (
    <div className="min-h-screen bg-[#F6F7FF] font-sans">
      {/* HERO */}
      <div
        className="relative bg-cover bg-center"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.55)), url('https://images.unsplash.com/photo-1556740738-b6a63e27c4df?q=80&w=1600')",
        }}
      >
        <div className="max-w-7xl mx-auto px-6 pt-10 pb-24 relative">
          <div className="max-w-xl">
            <div className="w-10 h-10 mb-4">
              <Rabbit className="w-full h-full text-white" />
            </div>
            <p className="text-white text-xs font-bold tracking-widest uppercase mb-1">
              Partner with Fatafat!
            </p>
            <div className="w-10 h-0.5 bg-[#26187D] mb-4" />
            <h1 className="text-white text-4xl md:text-5xl font-extrabold leading-tight mb-6">
              Reach customers far away from you
            </h1>
          </div>

          {/* Get Started card */}
          <div className="absolute top-10 right-6 w-full max-w-sm bg-white rounded-xl shadow-xl p-7 hidden md:block">
            {mode === "awaiting-verification" && (
              <div className="text-center py-4">
                <CheckCircle2 className="w-10 h-10 text-[#26187D] mx-auto mb-3" />
                <h2 className="text-lg font-extrabold text-slate-900 mb-2">
                  Check your email
                </h2>
                <p className="text-sm text-slate-500 mb-4">
                  We sent a verification link to <strong>{email}</strong>.
                  Click it to continue setting up your restaurant.
                </p>
                <button
                  onClick={handleResend}
                  disabled={loading}
                  className="text-xs font-semibold text-[#26187D] underline disabled:opacity-50"
                >
                  Didn't get it? Resend link
                </button>
                {notice && <p className="text-xs text-green-600 mt-3">{notice}</p>}
              </div>
            )}

            {mode === "verify-failed" && (
              <div className="text-center py-4">
                <XCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
                <h2 className="text-lg font-extrabold text-slate-900 mb-2">
                  Verification failed
                </h2>
                <p className="text-sm text-red-600 mb-4">{error}</p>
                <p className="text-sm text-slate-500 mb-2">
                  Enter your email to get a new link
                </p>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter Email"
                  className="w-full border border-slate-300 rounded-lg px-4 py-3 text-sm mb-3 outline-none focus:border-[#26187D]"
                />
                <button
                  onClick={handleResend}
                  disabled={!email || loading}
                  className="w-full rounded-lg py-3 text-sm font-semibold text-white bg-[#26187D] disabled:bg-slate-300 disabled:cursor-not-allowed"
                >
                  {loading ? "Sending…" : "Resend verification link"}
                </button>
                {notice && <p className="text-xs text-green-600 mt-3">{notice}</p>}
              </div>
            )}

            {(mode === "register" || mode === "login") && (
              <>
                <h2 className="text-xl font-extrabold text-slate-900 mb-4">
                  {cardCopy[mode].title}
                </h2>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <p className="text-sm text-slate-500">{cardCopy[mode].subtitle}</p>
                  <Rabbit className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                </div>
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
                  onClick={handleSubmit}
                  disabled={!email || !password || loading}
                  className="w-full rounded-lg py-3 text-sm font-semibold text-white transition-colors
                    bg-slate-300 disabled:cursor-not-allowed
                    enabled:bg-[#26187D] enabled:hover:bg-[#1d1260] flex items-center justify-center gap-2"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {mode === "login" ? "Log In" : "Continue"}
                </button>
                <p className="text-xs text-center text-slate-500 mt-4">
                  By {mode === "login" ? "logging in" : "signing up"}, I agree to
                  Fatafat's{" "}
                  <span className="underline cursor-pointer text-[#26187D]">
                    terms & conditions
                  </span>
                </p>
                {mode === "register" && (
                  <p className="text-xs text-center text-slate-500 mt-3">
                    Already registered?{" "}
                    <Link to="/login" className="underline text-[#26187D] font-semibold">
                      Log in
                    </Link>
                  </p>
                )}
              </>
            )}
          </div>
        </div>

        <div className="max-w-8xl mx-auto px-6">
          <div className="absolute -bottom-6 left-6 flex bg-slate-100 rounded-full p-1 shadow w-[300px]">
            <button className="bg-[#26187D] text-white text-sm font-semibold px-10 py-2.5 rounded-full w-full">
              Food Delivery
            </button>
          </div>
        </div>
      </div>

      {/* BODY */}
      <div className="max-w-7xl mx-auto px-6 pt-16 pb-20 grid md:grid-cols-2 gap-16">
        <div>
          <p className="text-sm text-slate-400 mb-1">In just 3 easy steps</p>
          <h3 className="text-2xl font-extrabold text-slate-900 mb-2">
            Get your restaurant delivery-ready in 24hrs!
          </h3>
          <div className="w-10 h-1 bg-[#26187D] mb-6" />

          <div className="bg-slate-50 rounded-xl p-6">
            {steps.map((s, i) => (
              <div key={s.n} className="flex gap-4 relative">
                <div className="flex flex-col items-center">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#26187D] mt-1.5" />
                  {i < steps.length - 1 && (
                    <span className="flex-1 w-px bg-slate-300 my-1" />
                  )}
                </div>
                <div className={i < steps.length - 1 ? "pb-8" : ""}>
                  <p className="text-xs tracking-wide text-slate-400 font-semibold uppercase">
                    Step {s.n}
                  </p>
                  <p className="text-slate-900 font-bold">{s.title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-extrabold text-slate-900 leading-snug mb-1">
            For an easy form filling process,
          </h3>
          <p className="text-slate-500 mb-4">you can keep these documents handy.</p>
          <hr className="border-slate-200 mb-4" />
          <ul className="space-y-4">
            {docs.map((d) => (
              <li
                key={d.label}
                className="flex items-baseline gap-2 text-slate-900 font-bold"
              >
                <span className="text-[#26187D]">&bull;</span>
                {d.label}
                {d.link && (
                  <a
                    href={d.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#26187D] font-semibold cursor-pointer"
                  >
                    Apply Here
                  </a>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}