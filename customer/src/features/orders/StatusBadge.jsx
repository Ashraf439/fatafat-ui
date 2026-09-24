import { Badge } from "@/components/ui/badge";
import { STATUS_META } from "./order-status";

export function StatusBadge({ status, className }) {
  const meta = STATUS_META[status] ?? { label: status, variant: "muted" };
  return (
    <Badge variant={meta.variant} className={className}>
      {meta.label}
    </Badge>
  );
}
