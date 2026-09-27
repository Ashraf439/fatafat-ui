import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { registerRestaurant, resendVerification, login } from "../api/auth";
import { StatusScreen, IconMail } from "../components/StatusScreen";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

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
      setError(searchParams.get("error") || "Verification link is invalid or expired.");
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
      setNotice("If that email is registered, a new verification link is on its way.");
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
            <strong className="text-foreground">{formInput.email || "your email"}</strong>. Click it to
            activate your account.
          </>
        }
        error={error}
      >
        <Button onClick={handleResend} disabled={loading} className="w-full">
          {loading ? "Sending…" : "Resend link"}
        </Button>
        {notice && (
          <p className="mt-3 rounded-md bg-foreground/5 px-3 py-2 text-sm text-foreground/80">{notice}</p>
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
        <form onSubmit={(e) => e.preventDefault()} className="space-y-3">
          <Input
            value={formInput.email}
            onChange={(e) => setFormInput({ ...formInput, email: e.target.value })}
            type="email"
            placeholder="Email"
            autoComplete="email"
          />
          <Input
            value={formInput.password}
            onChange={(e) => setFormInput({ ...formInput, password: e.target.value })}
            type="password"
            placeholder="Password"
            autoComplete="current-password"
          />
          <Button
            onClick={handleResend}
            disabled={!formInput.email || loading}
            className="w-full"
          >
            {loading ? "Sending…" : "Resend verification link"}
          </Button>
          {notice && (
            <p className="rounded-md bg-foreground/5 px-3 py-2 text-sm text-foreground/80">{notice}</p>
          )}
        </form>
      </StatusScreen>
    );
  }

  return (
    <div className="flex min-h-screen flex-col justify-center overflow-hidden bg-background p-6">
      {(mode === "register" || mode === "login") && (
        <Card className="mx-auto w-full max-w-xl">
          <CardHeader>
            <h1 className="text-center text-2xl font-bold text-foreground">Signup</h1>
            <p className="text-center text-sm text-muted-foreground">
              Create your restaurant account to get started.
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="signup-email">Email</Label>
                <Input
                  id="signup-email"
                  value={formInput.email}
                  onChange={(e) => setFormInput({ ...formInput, email: e.target.value })}
                  type="email"
                  autoComplete="email"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="signup-password">Password</Label>
                  <a href="#" className="text-xs font-medium text-primary hover:underline">
                    Forgot Password?
                  </a>
                </div>
                <Input
                  id="signup-password"
                  value={formInput.password}
                  onChange={(e) => setFormInput({ ...formInput, password: e.target.value })}
                  type="password"
                  autoComplete="new-password"
                  required
                />
              </div>

              {error && (
                <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {error}
                </p>
              )}

              <Button
                type="submit"
                disabled={!formInput.email || !formInput.password || loading}
                className="w-full"
              >
                {loading ? "Signing up…" : "Sign Up"}
              </Button>
            </form>

            <p className="mt-6 text-center text-xs text-muted-foreground">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => navigate("/")}
                className="font-semibold text-primary hover:underline"
              >
                Login
              </button>
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Signup;
