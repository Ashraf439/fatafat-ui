import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useForm } from "@/hooks/useForm";
import { AddressFields } from "./AddressFields";
import { ADDRESS_RULES } from "./address-rules";
import { useCreateAddress, useUpdateAddress } from "./queries";

const TYPES = [
  { value: "HOME", label: "Home" },
  { value: "OFFICE", label: "Office" },
  { value: "OTHER", label: "Other" },
];

function AddressForm({ address, isFirst, onDone }) {
  const editing = Boolean(address);
  const create = useCreateAddress();
  const update = useUpdateAddress();
  const [error, setError] = useState(null);

  const form = useForm(
    {
      street: address?.street ?? "",
      landmark: address?.landmark ?? "",
      floorOrApartment: address?.floorOrApartment ?? "",
      city: address?.city ?? "",
      state: address?.state ?? "",
      pincode: address?.pincode ?? "",
      addressType: address?.addressType ?? "HOME",
      makeDefault: address?.isDefault ?? isFirst,
    },
    ADDRESS_RULES,
  );

  const pending = create.isPending || update.isPending;

  const onSubmit = form.submit(async (v) => {
    setError(null);
    const payload = {
      street: v.street.trim(),
      landmark: v.landmark.trim(),
      floorOrApartment: v.floorOrApartment.trim(),
      city: v.city.trim(),
      state: v.state.trim(),
      pincode: v.pincode.trim(),
      addressType: v.addressType,
      makeDefault: v.makeDefault,
    };
    try {
      const saved = editing ? await update.mutateAsync({ id: address.id, payload }) : await create.mutateAsync(payload);
      toast.success(editing ? "Address updated" : "Address saved");
      onDone(saved);
    } catch (err) {
      setError(err.message);
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-4">
      <div className="grid gap-1.5">
        <Label>Save as</Label>
        <Select value={form.values.addressType} onValueChange={(v) => form.setValue("addressType", v)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TYPES.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <AddressFields form={form} />

      <div className="flex items-center gap-3">
        <Switch
          id="make-default"
          checked={form.values.makeDefault}
          onCheckedChange={(v) => form.setValue("makeDefault", v)}
          disabled={address?.isDefault}
        />
        <Label htmlFor="make-default" className="cursor-pointer">
          Use as my default address
        </Label>
      </div>

      {error && (
        <div role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-800">
          {error}
        </div>
      )}
      <Button type="submit" size="lg" disabled={pending}>
        {pending && <Loader2 className="animate-spin" />} {editing ? "Save changes" : "Save address"}
      </Button>
    </form>
  );
}

/** Add / edit dialog. Content is unmounted on close, so the form always starts fresh. */
export function AddressFormDialog({ open, onOpenChange, address = null, isFirst = false, onSaved }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{address ? "Edit address" : "Add a new address"}</DialogTitle>
          <DialogDescription>We'll deliver your orders here.</DialogDescription>
        </DialogHeader>
        <AddressForm
          address={address}
          isFirst={isFirst}
          onDone={(saved) => {
            onOpenChange(false);
            onSaved?.(saved);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
