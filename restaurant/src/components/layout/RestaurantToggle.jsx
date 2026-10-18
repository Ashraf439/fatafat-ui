import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { getRestaurantStatus, toggleRestaurantStatus } from "../../api/restaurant";
import { cn } from "@/lib/utils";

export function RestaurantToggle() {
  const [isOpen, setIsOpen] = useState(null); 
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getRestaurantStatus()
      .then((res) => !cancelled && setIsOpen(Boolean(res.isOpen)))
      .catch(() => !cancelled && setIsOpen(false));
    return () => {
      cancelled = true;
    };
  }, []);

  const handleToggle = async () => {
    if (busy || isOpen === null) return;
    setBusy(true);
    try {
      const res = await toggleRestaurantStatus();
      setIsOpen(Boolean(res.isOpen));
      toast.success(res.isOpen ? "You're open — customers can order again." : "You're closed — no new orders will come in.");
    } catch (err) {
      toast.error(err.message || "Couldn't change your status. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  if (isOpen === null) return <Skeleton className="h-9 w-28 rounded-full" />;

  return (
    <label
      className={cn(
        "flex cursor-pointer items-center gap-2 rounded-full border py-1.5 pr-2 pl-3 text-sm font-semibold transition-colors",
        isOpen ? "border-green-200 bg-green-50 text-green-800" : "border-border bg-secondary text-muted-foreground",
      )}
    >
      <span className={cn("size-2 rounded-full", isOpen ? "bg-success" : "bg-muted-foreground/50")} aria-hidden="true" />
      {isOpen ? "Open" : "Closed"}
      <Switch checked={isOpen} onCheckedChange={handleToggle} disabled={busy} aria-label="Accepting orders" className="data-[state=checked]:bg-success" />
    </label>
  );
}