import * as SheetPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const Sheet = SheetPrimitive.Root;
const SheetTrigger = SheetPrimitive.Trigger;
const SheetClose = SheetPrimitive.Close;

function SheetContent({ className, children, side = "right", ...props }) {
  const sides = {
    right:
      "inset-y-0 right-0 h-full w-full max-w-md border-l data-[state=open]:slide-in-from-right data-[state=closed]:slide-out-to-right",
    left:
      "inset-y-0 left-0 h-full w-full max-w-md border-r data-[state=open]:slide-in-from-left data-[state=closed]:slide-out-to-left",
    bottom:
      "inset-x-0 bottom-0 max-h-[85vh] rounded-t-2xl border-t data-[state=open]:slide-in-from-bottom data-[state=closed]:slide-out-to-bottom",
  };
  return (
    <SheetPrimitive.Portal>
      <SheetPrimitive.Overlay
        className="fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0"
      />
      <SheetPrimitive.Content
        data-slot="sheet-content"
        className={cn(
          "fixed z-50 flex flex-col gap-4 bg-card shadow-xl transition ease-in-out data-[state=open]:animate-in data-[state=open]:duration-300 data-[state=closed]:animate-out data-[state=closed]:duration-200",
          sides[side],
          className,
        )}
        {...props}
      >
        {children}
        <SheetPrimitive.Close className="absolute top-4 right-4 rounded-md p-1 text-muted-foreground transition hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none">
          <X className="size-5" />
          <span className="sr-only">Close</span>
        </SheetPrimitive.Close>
      </SheetPrimitive.Content>
    </SheetPrimitive.Portal>
  );
}

function SheetHeader({ className, ...props }) {
  return <div data-slot="sheet-header" className={cn("flex flex-col gap-1 p-5 pb-0", className)} {...props} />;
}
function SheetFooter({ className, ...props }) {
  return <div data-slot="sheet-footer" className={cn("mt-auto flex flex-col gap-2 border-t p-5", className)} {...props} />;
}
function SheetTitle({ className, ...props }) {
  return <SheetPrimitive.Title data-slot="sheet-title" className={cn("text-lg font-bold", className)} {...props} />;
}
function SheetDescription({ className, ...props }) {
  return <SheetPrimitive.Description className={cn("text-sm text-muted-foreground", className)} {...props} />;
}

export { Sheet, SheetTrigger, SheetClose, SheetContent, SheetHeader, SheetFooter, SheetTitle, SheetDescription };
