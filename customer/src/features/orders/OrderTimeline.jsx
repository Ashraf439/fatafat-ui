import { Check, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { ORDER_STEPS } from "./order-status";

/** Vertical progress tracker: done steps are filled, the current step pulses. */
export function OrderTimeline({ status, cancelReason }) {
  if (status === "CANCELLED") {
    return (
      <div role="status" className="flex items-start gap-3 rounded-xl bg-red-50 p-4 text-red-900">
        <XCircle className="mt-0.5 size-5 shrink-0" />
        <div>
          <p className="font-bold">Order cancelled</p>
          {cancelReason && <p className="text-sm">{cancelReason}</p>}
        </div>
      </div>
    );
  }

  const currentIndex = ORDER_STEPS.findIndex((s) => s.status === status);

  return (
    <ol className="space-y-0" aria-label="Order progress">
      {ORDER_STEPS.map((step, index) => {
        const done = index < currentIndex || status === "DELIVERED";
        const current = index === currentIndex && status !== "DELIVERED";
        const last = index === ORDER_STEPS.length - 1;
        return (
          <li key={step.status} className="relative flex gap-4 pb-6 last:pb-0" aria-current={current ? "step" : undefined}>
            {!last && <span aria-hidden className={cn("absolute top-8 left-[15px] h-[calc(100%-2rem)] w-0.5", done ? "bg-success" : "bg-border")} />}
            <span
              className={cn(
                "relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold",
                done && "border-success bg-success text-white",
                current && "border-primary bg-primary text-primary-foreground",
                !done && !current && "border-border bg-card text-muted-foreground",
              )}
            >
              {done ? <Check className="size-4" /> : index + 1}
              {current && <span aria-hidden className="absolute inset-0 animate-ping rounded-full bg-primary/40" />}
            </span>
            <div className="pt-1">
              <p className={cn("text-sm font-bold", !done && !current && "text-muted-foreground")}>{step.label}</p>
              {(current || (status === "DELIVERED" && last)) && <p className="text-xs text-muted-foreground">{step.hint}</p>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
