import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { setPassword } from "../api/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SetPassword() {
  const [params] = useSearchParams();
  const token = params.get("token");
  const navigate = useNavigate();
  const [password, setPasswordValue] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (password !== confirm) return setError("Passwords don't match.");
    setLoading(true);
    try {
      await setPassword(token, password);
      setDone(true);
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return <p className="p-6">This link is missing its token. <Link to="/forgot-password" className="text-primary underline">Request a new one</Link>.</p>;
  }

  return (
    <div className="mx-auto mt-20 max-w-sm space-y-4 p-6">
      <h1 className="text-xl font-semibold">Set your password</h1>
      {done ? (
        <p>Password set. Redirecting to login…</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="pw">New password</Label>
            <Input id="pw" type="password" value={password} onChange={(e) => setPasswordValue(e.target.value)} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pw2">Confirm password</Label>
            <Input id="pw2" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Saving…" : "Set password"}
          </Button>
        </form>
      )}
    </div>
  );
}