import { FormField } from "@/components/FormField";

/** The address inputs shared by registration and the address dialog. `form` comes from useForm. */
export function AddressFields({ form }) {
  return (
    <div className="grid gap-4">
      <FormField label="Street / area" autoComplete="address-line1" placeholder="12-3, Main Road" error={form.error("street")} {...form.field("street")} />
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Landmark" placeholder="Near City Mall" error={form.error("landmark")} {...form.field("landmark")} />
        <FormField label="Flat / floor (optional)" autoComplete="address-line2" {...form.field("floorOrApartment")} />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <FormField label="City" autoComplete="address-level2" error={form.error("city")} {...form.field("city")} />
        <FormField label="State" autoComplete="address-level1" error={form.error("state")} {...form.field("state")} />
        <FormField label="Pincode" inputMode="numeric" maxLength={6} autoComplete="postal-code" error={form.error("pincode")} {...form.field("pincode")} />
      </div>
    </div>
  );
}
