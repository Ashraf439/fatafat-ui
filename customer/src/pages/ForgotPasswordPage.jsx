import { useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, MailCheck } from "lucide-react";
import { authApi } from "@/api/auth";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/FormField";
import { AuthCard } from "@/features/auth/AuthCard";
import { useForm } from "@/hooks/useForm";
import { email, required } from "@/lib/validators";

export default function ForgotPasswordPage() {
  const form = useForm({ email: "" }, { email: [required("Email"), email] });
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(null);

  const onSubmit = form.submit(async (v) => {
    setSubmitting(true);
    setError(null);
    try {
      await authApi.forgotPassword(v.email.trim());
      setSent(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <AuthCard
      title="Forgot your password?"
      description="Enter your email and we'll send a link to set a new one."
      footer={
        <Link to="/login" className="font-semibold text-primary hover:underline">
          Back to log in
        </Link>
      }
    >
      {sent ? (
        <div role="status" className="flex flex-col items-center gap-3 text-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-accent text-primary">
            <MailCheck className="size-7" />
          </div>
          <p className="text-sm text-muted-foreground">
            If an account exists for <strong className="text-foreground">{form.values.email}</strong>, a reset link is on its way. It
            expires in 30 minutes.
          </p>
        </div>
      ) : (
        <form onSubmit={onSubmit} noValidate className="grid gap-4">
          <FormField label="Email" type="email" autoComplete="email" error={form.error("email")} {...form.field("email")} />
          {error && (
            <div role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-800">
              {error}
            </div>
          )}
          <Button type="submit" size="lg" disabled={submitting}>
            {submitting && <Loader2 className="animate-spin" />} Send reset link
          </Button>
        </form>
      )}
    </AuthCard>
  );
}
