import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { Loader2, MailCheck } from "lucide-react";
import { toast } from "sonner";
import { authApi } from "@/api/auth";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/FormField";
import { AuthCard } from "@/features/auth/AuthCard";
import { useAuth } from "@/features/auth/useAuth";
import { AddressFields } from "@/features/addresses/AddressFields";
import { ADDRESS_RULES } from "@/features/addresses/address-rules";
import { useForm } from "@/hooks/useForm";
import { email, password, phone, required } from "@/lib/validators";

const INITIAL = {
  name: "", email: "", phoneNumber: "", password: "",
  street: "", landmark: "", floorOrApartment: "", city: "", state: "", pincode: "",
};

const RULES = {
  name: [required("Name")],
  email: [required("Email"), email],
  phoneNumber: [phone],
  password: [password],
  ...ADDRESS_RULES,
};

export default function RegisterPage() {
  const { isAuthenticated } = useAuth();
  const form = useForm(INITIAL, RULES);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [registeredEmail, setRegisteredEmail] = useState(null);
  const [resending, setResending] = useState(false);

  if (isAuthenticated && !registeredEmail) return <Navigate to="/" replace />;

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
      setRegisteredEmail(v.email.trim());
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  });

  const resend = async () => {
    setResending(true);
    try {
      await authApi.resendVerification(registeredEmail);
      toast.success("Verification email sent again.");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setResending(false);
    }
  };

  if (registeredEmail) {
    return (
      <AuthCard title="Check your inbox">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-accent text-primary">
            <MailCheck className="size-8" />
          </div>
          <p className="text-sm text-muted-foreground">
            We sent a verification link to <strong className="text-foreground">{registeredEmail}</strong>. Open it to activate your
            account, then log in.
          </p>
          <Button variant="outline" onClick={resend} disabled={resending}>
            {resending && <Loader2 className="animate-spin" />} Resend email
          </Button>
          <Button asChild>
            <Link to="/login">Go to log in</Link>
          </Button>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      wide
      title="Create your account"
      description="Order from local kitchens in minutes."
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-primary hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} noValidate className="grid gap-6">
        <fieldset className="grid gap-4">
          <legend className="mb-1 text-sm font-bold text-primary">About you</legend>
          <FormField label="Full name" autoComplete="name" error={form.error("name")} {...form.field("name")} />
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Email" type="email" autoComplete="email" error={form.error("email")} {...form.field("email")} />
            <FormField label="Mobile number" type="tel" inputMode="numeric" maxLength={10} autoComplete="tel-national" error={form.error("phoneNumber")} {...form.field("phoneNumber")} />
          </div>
          <FormField
            label="Password"
            type="password"
            autoComplete="new-password"
            hint="8–64 characters with a digit, lowercase, uppercase and one of @#$%^&+=!"
            error={form.error("password")}
            {...form.field("password")}
          />
        </fieldset>

        <fieldset className="grid gap-4">
          <legend className="mb-1 text-sm font-bold text-primary">Delivery address</legend>
          <AddressFields form={form} />
        </fieldset>

        {error && (
          <div role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-800">
            {error}
          </div>
        )}
        <Button type="submit" size="lg" disabled={submitting}>
          {submitting && <Loader2 className="animate-spin" />} Create account
        </Button>
      </form>
    </AuthCard>
  );
}
