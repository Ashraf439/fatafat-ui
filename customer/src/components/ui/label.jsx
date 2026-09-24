import * as LabelPrimitive from "@radix-ui/react-label";
import { cn } from "@/lib/utils";

function Label({ className, ...props }) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn("flex items-center gap-2 text-sm font-semibold leading-none select-none peer-disabled:opacity-50", className)}
      {...props}
    />
  );
}

export { Label };
