import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "./useCart";

export function CartButton() {
  const { count, setOpen } = useCart();
  return (
    <Button variant="outline" size="icon" className="relative" onClick={() => setOpen(true)} aria-label={`Open cart, ${count} items`}>
      <ShoppingBag />
      {count > 0 && (
        <span className="absolute -top-1.5 -right-1.5 flex min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[11px] font-bold leading-5 text-primary-foreground">
          {count}
        </span>
      )}
    </Button>
  );
}
