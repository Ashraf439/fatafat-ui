import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Loader2, MapPin, Pencil, Store, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "../context/AuthContext";
import { getMyRestaurantProfile, updateMyRestaurantProfile } from "../api/restaurant";
import { MapAddressPicker } from "../components/MapAddressPicker";
import { ViewOnMap } from "../components/ViewOnMap";

const emptyForm = { name: "", street: "", landmark: "", city: "", state: "", pincode: "", lat: null, lng: null };

function toForm(profile) {
  return {
    name: profile.name ?? "",
    street: profile.street ?? "",
    landmark: profile.landmark ?? "",
    city: profile.city ?? "",
    state: profile.state ?? "",
    pincode: profile.pincode ?? "",
    lat: profile.latitude ?? null,
    lng: profile.longitude ?? null,
  };
}

export default function Profile() {
  const { permissions } = useAuth();
  const canEdit = Boolean(permissions.RESTAURANT_EDIT);

  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getMyRestaurantProfile()
      .then((p) => {
        setProfile(p);
        setForm(toForm(p));
      })
      .catch((err) => setError(err.message || "Couldn't load your restaurant profile."));
  }, []);

  function startEditing() {
    setForm(toForm(profile));
    setEditing(true);
  }

  function cancelEditing() {
    setForm(toForm(profile));
    setEditing(false);
  }

  function updateField(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleAddressSelect({ street, city, state, pincode, lat, lng }) {
    setForm((f) => ({
      ...f,
      street: street || f.street,
      city: city || f.city,
      state: state || f.state,
      pincode: pincode || f.pincode,
      lat,
      lng,
    }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      const updated = await updateMyRestaurantProfile({
        name: form.name,
        street: form.street,
        landmark: form.landmark,
        city: form.city,
        state: form.state,
        pincode: form.pincode,
        latitude: form.lat,
        longitude: form.lng,
      });
      setProfile(updated);
      setForm(toForm(updated));
      setEditing(false);
      toast.success("Profile updated.");
    } catch (err) {
      toast.error(err.message || "Couldn't save your changes.");
    } finally {
      setSaving(false);
    }
  }

  if (error) {
    return <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>;
  }

  if (!profile) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-56 w-full rounded-xl" />
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Profile</h1>
          <p className="text-sm text-muted-foreground">Your restaurant's details, as customers see them.</p>
        </div>
        {canEdit && !editing && (
          <Button variant="outline" onClick={startEditing}>
            <Pencil /> Edit
          </Button>
        )}
      </div>

      {editing ? (
        <Card className="space-y-4 p-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Restaurant name</Label>
            <Input id="name" value={form.name} onChange={(e) => updateField("name", e.target.value)} />
          </div>

          <div className="space-y-1.5">
            <Label>Location</Label>
            <MapAddressPicker
              initialCenter={form.lat != null ? { lat: form.lat, lng: form.lng } : undefined}
              initialZoom={form.lat != null ? 16 : undefined}
              onAddressSelect={handleAddressSelect}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="street">Street / area</Label>
              <Input id="street" value={form.street} onChange={(e) => updateField("street", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="landmark">Landmark (optional)</Label>
              <Input id="landmark" value={form.landmark} onChange={(e) => updateField("landmark", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="city">City</Label>
              <Input id="city" value={form.city} onChange={(e) => updateField("city", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="state">State</Label>
              <Input id="state" value={form.state} onChange={(e) => updateField("state", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pincode">Pincode</Label>
              <Input id="pincode" value={form.pincode} onChange={(e) => updateField("pincode", e.target.value)} />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={cancelEditing} disabled={saving}>
              <X /> Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving || !form.name.trim()}>
              {saving && <Loader2 className="animate-spin" />} Save changes
            </Button>
          </div>
        </Card>
      ) : (
        <Card className="space-y-4 p-4">
          <div className="flex items-center gap-3">
            <span className="flex size-12 items-center justify-center rounded-xl bg-accent text-primary">
              <Store className="size-6" />
            </span>
            <div>
              <h2 className="text-lg font-bold">{profile.name}</h2>
              {profile.ownerName && <p className="text-sm text-muted-foreground">Owner: {profile.ownerName}</p>}
            </div>
          </div>

          <div className="flex items-start gap-2 text-sm">
            <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
            {profile.street || profile.city ? (
              <p>
                {[profile.street, profile.landmark, profile.city, profile.state, profile.pincode].filter(Boolean).join(", ")}
              </p>
            ) : (
              <p className="text-muted-foreground">No address on file yet.</p>
            )}
          </div>

          {profile.latitude != null && profile.longitude != null ? (
            <ViewOnMap lat={profile.latitude} lng={profile.longitude} name={profile.name} />
          ) : (
            <p className="rounded-lg border border-dashed p-4 text-center text-xs text-muted-foreground">
              {canEdit
                ? 'No pinned location yet — tap "Edit" and drop a pin so customers can find you on the map.'
                : "This restaurant doesn't have a pinned location yet."}
            </p>
          )}
        </Card>
      )}
    </div>
  );
}