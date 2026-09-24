import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, Loader2 } from "lucide-react";
import { authApi } from "@/api/auth";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/FormField";
import { AuthCard } from "@/features/auth/AuthCard";
import { useForm } from "@/hooks/useForm";
import { password } from "@/lib/validators";

const RULES = {
  newPassword: [password],
  confirm: [(v, all) => (v === all.newPassword ? null : "Passwords don't match")],
};

/** Landing page for the emailed reset link: /set-password?token=... */
export default function SetPasswordPage() {
  const [params] = useSearchParams();
  const token = params.get("token");
  const form = useForm({ newPassword: "", confirm: "" }, RULES);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState(null);

  const onSubmit = form.submit(async (v) => {
    setSubmitting(true);
    setError(null);
    try {
      await authApi.setPassword(token, v.newPassword);
      setDone(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  });

  if (!token) {
    return (
      <AuthCard title="Link not valid" description="This password link is missing its token. Request a new one.">
        <Button asChild className="w-full">
          <Link to="/forgot-password">Request a new link</Link>
        </Button>
      </AuthCard>
    );
  }

  if (done) {
    return (
      <AuthCard title="Password updated">
        <div role="status" className="flex flex-col items-center gap-4 text-center">
          <CheckCircle2 className="size-14 text-success" />
          <p className="text-sm text-muted-foreground">Your password has been set. You can log in with it now.</p>
          <Button asChild className="w-full">
            <Link to="/login">Log in</Link>
          </Button>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Set a new password" description="Choose a strong password you don't use elsewhere.">
      <form onSubmit={onSubmit} noValidate className="grid gap-4">
        <FormField
          label="New password"
          type="password"
          autoComplete="new-password"
          hint="8–64 characters with a digit, lowercase, uppercase and one of @#$%^&+="
          error={form.error("newPassword")}
          {...form.field("newPassword")}
        />
        <FormField label="Confirm password" type="password" autoComplete="new-password" error={form.error("confirm")} {...form.field("confirm")} />
        {error && (
          <div role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-800">
            {error} <Link to="/forgot-password" className="font-bold underline">Request a new link</Link>
          </div>
        )}
        <Button type="submit" size="lg" disabled={submitting}>
          {submitting && <Loader2 className="animate-spin" />} Update password
        </Button>
      </form>
    </AuthCard>
  );
}
