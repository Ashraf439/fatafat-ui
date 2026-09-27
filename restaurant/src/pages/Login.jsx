import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../api/auth";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

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
    <div className="relative flex min-h-screen flex-col justify-center overflow-hidden bg-background p-6">
      <Card className="mx-auto w-full lg:max-w-md">
        <CardHeader>
          <h1 className="text-center text-2xl font-bold text-foreground">Login</h1>
          <p className="text-center text-sm text-muted-foreground">
            Sign in to manage your restaurant.
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={formInput.email}
                onChange={(e) => setFormInput({ ...formInput, email: e.target.value })}
                type="email"
                autoComplete="email"
                required
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <a href="#" className="text-xs font-medium text-primary hover:underline">
                  Forgot password?
                </a>
              </div>
              <Input
                id="password"
                value={formInput.password}
                onChange={(e) => setFormInput({ ...formInput, password: e.target.value })}
                type="password"
                autoComplete="current-password"
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
              {loading ? "Logging in…" : "Login"}
            </Button>
          </form>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Don't have an account?{" "}
            <button
              type="button"
              onClick={() => navigateTo("/signup")}
              className="font-semibold text-primary hover:underline"
            >
              Sign up
            </button>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
