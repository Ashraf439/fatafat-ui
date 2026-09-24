import { Briefcase, Home, MapPin } from "lucide-react";

const ICONS = { HOME: Home, OFFICE: Briefcase, OTHER: MapPin };
const LABELS = { HOME: "Home", OFFICE: "Office", OTHER: "Other" };

/** Read-only address block: type label + formatted lines. Used in lists, checkout and orders. */
export function AddressSummary({ address, showType = true }) {
  const Icon = ICONS[address.addressType] ?? MapPin;
  const line1 = [address.floorOrApartment, address.street].filter(Boolean).join(", ");
  const line2 = [address.landmark, address.city, address.state, address.pincode]
    .filter(Boolean)
    .join(", ");
  return (
    <div className="flex min-w-0 items-start gap-3">
      <Icon className="mt-0.5 size-4.5 shrink-0 text-primary" />
      <div className="min-w-0 space-y-0.5 text-sm">
        {showType && <p className="font-bold">{LABELS[address.addressType] ?? "Address"}</p>}
        <p>{line1}</p>
        <p className="text-muted-foreground">{line2}</p>
      </div>
    </div>
  );
}
