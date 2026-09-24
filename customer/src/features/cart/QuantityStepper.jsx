import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

/** Compact −/qty/+ control used in menu rows and the cart. */
export function QuantityStepper({ quantity, onIncrement, onDecrement, disabledIncrement, size = "md", className }) {
  const dims = size === "sm" ? "h-8 text-sm" : "h-10 text-base";
  const btn = "flex h-full w-9 items-center justify-center text-primary transition-colors hover:bg-accent disabled:opacity-40";
  return (
    <div
      className={cn("inline-flex items-center overflow-hidden rounded-lg border border-primary/30 bg-card font-bold", dims, className)}
    >
      <button type="button" className={btn} onClick={onDecrement} aria-label="Decrease quantity">
        <Minus className="size-4" />
      </button>
      <span className="min-w-6 text-center tabular-nums" aria-live="polite">
        {quantity}
      </span>
      <button type="button" className={btn} onClick={onIncrement} disabled={disabledIncrement} aria-label="Increase quantity">
        <Plus className="size-4" />
      </button>
    </div>
  );
}
