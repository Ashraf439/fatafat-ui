import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Loader2, MailCheck } from "lucide-react";
import { authApi } from "@/api/auth";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/FormField";
import { AuthCard } from "@/features/auth/AuthCard";
import { AddressFields } from "@/features/addresses/AddressFields";
import { ADDRESS_RULES } from "@/features/addresses/address-rules";
import { useAuth } from "@/features/auth/useAuth";
import { useForm } from "@/hooks/useForm";
import { email, password, phone, required } from "@/lib/validators";

const RULES = {
  name: [required("Name")],
  email: [required("Email"), email],
  phoneNumber: [required("Mobile number"), phone],
  password: [required("Password"), password],
  ...ADDRESS_RULES,
};

export default function RegisterPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [sent, setSent] = useState(false);

  const form = useForm(
    { name: "", email: "", phoneNumber: "", password: "", street: "", landmark: "", floorOrApartment: "", city: "", state: "", pincode: "" },
    RULES,
  );

  if (isAuthenticated) return <Navigate to="/" replace />;

  const onSubmit = form.submit(async (v) => {
    setSubmitting(true);
    setError(null);
    try {
      await authApi.registerCustomer({
        name: v.name.trim(),
        email: v.email.trim(),
        phoneNumber: v.phoneNumber.trim(),
        password: v.password,
        address: {
          street: v.street.trim(),
          landmark: v.landmark.trim(),
          city: v.city.trim(),
          state: v.state.trim(),
          pincode: v.pincode.trim(),
        },
      });
      setSent(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <AuthCard
      title="Create your account"
      description="Sign up to order from restaurants near you."
      wide
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-primary hover:underline">
            Log in
          </Link>
        </>
      }
    >
      {sent ? (
        <div role="status" className="flex flex-col items-center gap-3 text-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-accent text-primary">
            <MailCheck className="size-7" />
          </div>
          <p className="text-sm text-muted-foreground">
            We've sent a verification link to <strong className="text-foreground">{form.values.email}</strong>. Verify your
            email, then log in to start ordering.
          </p>
          <Button className="mt-2" onClick={() => navigate("/login")}>
            Go to login
          </Button>
        </div>
      ) : (
        <form onSubmit={onSubmit} noValidate className="grid gap-4">
          <FormField label="Full name" autoComplete="name" placeholder="Your name" error={form.error("name")} {...form.field("name")} />
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Email" type="email" autoComplete="email" placeholder="you@example.com" error={form.error("email")} {...form.field("email")} />
            <FormField
              label="Mobile number"
              type="tel"
              inputMode="numeric"
              autoComplete="tel"
              placeholder="10-digit mobile number"
              error={form.error("phoneNumber")}
              {...form.field("phoneNumber")}
            />
          </div>
          <FormField
            label="Password"
            type="password"
            autoComplete="new-password"
            hint="8+ characters, with a digit, uppercase, lowercase and a symbol."
            error={form.error("password")}
            {...form.field("password")}
          />

          <div className="mt-1 border-t pt-4">
            <p className="mb-3 text-sm font-semibold">Delivery address</p>
            <AddressFields form={form} />
          </div>

          {error && (
            <div role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-800">
              {error}
            </div>
          )}

          <Button type="submit" size="lg" disabled={submitting}>
            {submitting && <Loader2 className="animate-spin" />} Create account
          </Button>
        </form>
      )}
    </AuthCard>
  );
}