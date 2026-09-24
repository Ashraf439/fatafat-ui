import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle2, Loader2, MailWarning } from "lucide-react";
import { toast } from "sonner";
import { authApi } from "@/api/auth";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/FormField";
import { AuthCard } from "@/features/auth/AuthCard";
import { useAuth } from "@/features/auth/useAuth";
import { useForm } from "@/hooks/useForm";
import { email, required } from "@/lib/validators";

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [resending, setResending] = useState(false);

  const form = useForm({ email: "", password: "" }, { email: [required("Email"), email], password: [required("Password")] });
  const destination = location.state?.from ?? "/";

  if (isAuthenticated && !submitting) return <Navigate to={destination} replace />;

  const verified = params.get("verified");
  const needsVerification = error?.toLowerCase().includes("verify");

  const onSubmit = form.submit(async (values) => {
    setSubmitting(true);
    setError(null);
    try {
      await login(values.email.trim(), values.password);
      navigate(destination, { replace: true });
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  });

  const resend = async () => {
    setResending(true);
    try {
      await authApi.resendVerification(form.values.email.trim());
      toast.success("Verification email sent. Check your inbox.");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthCard
      title="Welcome back"
      description="Log in to order, track deliveries and manage addresses."
      footer={
        <>
          New to Fatafat?{" "}
          <Link to="/register" className="font-semibold text-primary hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      {verified === "true" && (
        <div role="status" className="mb-5 flex items-start gap-2 rounded-xl bg-green-50 px-4 py-3 text-sm font-medium text-green-800">
          <CheckCircle2 className="mt-0.5 size-4 shrink-0" /> Email verified! You can log in now.
        </div>
      )}
      {verified === "false" && (
        <div role="alert" className="mb-5 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-800">
          {params.get("error") ?? "That verification link isn't valid."} Log in below to request a new one.
        </div>
      )}

      <form onSubmit={onSubmit} noValidate className="grid gap-4">
        <FormField label="Email" type="email" autoComplete="email" placeholder="you@example.com" error={form.error("email")} {...form.field("email")} />
        <FormField label="Password" type="password" autoComplete="current-password" error={form.error("password")} {...form.field("password")} />

        {error && (
          <div role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-800">
            {error}
            {needsVerification && (
              <button type="button" onClick={resend} disabled={resending} className="mt-2 flex items-center gap-1.5 font-bold underline">
                <MailWarning className="size-4" /> {resending ? "Sending…" : "Resend verification email"}
              </button>
            )}
          </div>
        )}

        <div className="text-right">
          <Link to="/forgot-password" className="text-sm font-semibold text-primary hover:underline">
            Forgot password?
          </Link>
        </div>
        <Button type="submit" size="lg" disabled={submitting}>
          {submitting && <Loader2 className="animate-spin" />} Log in
        </Button>
      </form>
    </AuthCard>
  );
}
