import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, Pencil, UserRound, Wallet, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/States";
import { useMyProfile, useUpdateProfile } from "@/features/profile/queries";
import { formatPrice } from "@/lib/format";

function toForm(profile) {
  return {
    name: profile.name ?? "",
    phoneNumber: profile.phoneNumber ?? "",
    dateOfBirth: profile.dateOfBirth ?? "",
  };
}

export default function ProfilePage() {
  const profile = useMyProfile();
  const update = useUpdateProfile();

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: "", phoneNumber: "", dateOfBirth: "" });

  useEffect(() => {
    if (profile.data) setForm(toForm(profile.data));
  }, [profile.data]);

  const updateField = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const startEditing = () => {
    setForm(toForm(profile.data));
    setEditing(true);
  };

  const cancelEditing = () => {
    setForm(toForm(profile.data));
    setEditing(false);
  };

  const handleSave = async () => {
    try {
      await update.mutateAsync({
        name: form.name,
        phoneNumber: form.phoneNumber,
        dateOfBirth: form.dateOfBirth || null,
      });
      setEditing(false);
      toast.success("Profile updated.");
    } catch (err) {
      toast.error(err.message || "Couldn't save your changes.");
    }
  };

  if (profile.isPending) {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-56 w-full rounded-xl" />
      </div>
    );
  }

  if (profile.error) {
    return <ErrorState error={profile.error} title="Couldn't load your profile" onRetry={() => profile.refetch()} />;
  }

  const p = profile.data;

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Profile</h1>
          <p className="text-sm text-muted-foreground">Your account details.</p>
        </div>
        {!editing && (
          <Button variant="outline" onClick={startEditing}>
            <Pencil /> Edit
          </Button>
        )}
      </div>

      {editing ? (
        <Card className="space-y-4 p-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Full name</Label>
            <Input id="name" value={form.name} onChange={(e) => updateField("name", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="phone">Phone number</Label>
            <Input id="phone" value={form.phoneNumber} onChange={(e) => updateField("phoneNumber", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="dob">Date of birth</Label>
            <Input
              id="dob"
              type="date"
              value={form.dateOfBirth}
              onChange={(e) => updateField("dateOfBirth", e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={cancelEditing} disabled={update.isPending}>
              <X /> Cancel
            </Button>
            <Button onClick={handleSave} disabled={update.isPending || !form.name.trim()}>
              {update.isPending && <Loader2 className="animate-spin" />} Save changes
            </Button>
          </div>
        </Card>
      ) : (
        <Card className="space-y-4 p-4">
          <div className="flex items-center gap-3">
            <span className="flex size-12 items-center justify-center rounded-xl bg-accent text-primary">
              <UserRound className="size-6" />
            </span>
            <div>
              <h2 className="text-lg font-bold">{p.name || "Add your name"}</h2>
              <p className="text-sm text-muted-foreground">{p.email}</p>
            </div>
          </div>

          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted-foreground">Phone number</dt>
              <dd className="font-medium">{p.phoneNumber || "—"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Date of birth</dt>
              <dd className="font-medium">{p.dateOfBirth || "—"}</dd>
            </div>
          </dl>

          <div className="flex items-center gap-2 rounded-lg bg-accent/50 px-3 py-2.5 text-sm">
            <Wallet className="size-4 text-primary" />
            <span className="font-semibold">{formatPrice(p.walletBalance ?? 0)}</span>
            <span className="text-muted-foreground">wallet balance</span>
            {p.loyaltyPoints != null && (
              <span className="ml-auto font-medium text-muted-foreground">{p.loyaltyPoints} points</span>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}