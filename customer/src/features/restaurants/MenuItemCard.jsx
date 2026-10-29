import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { FoodTypeMark } from "@/components/FoodTypeMark";
import { SmartImage } from "@/components/SmartImage";
import { MAX_QUANTITY_PER_ITEM } from "@/features/cart/cart-store";
import { useCart } from "@/features/cart/useCart";
import { WishlistButton } from "@/features/wishlist/WishlistButton";
import { formatPrice } from "@/lib/format";

export function MenuItemCard({ item, restaurant, canOrder }) {
  const { requestAdd } = useCart();
  const [qty, setQty] = useState(1);

  const handleAdd = () => {
    requestAdd(restaurant, item, qty);
    toast.success(`Added ${qty} × ${item.dishName}`);
    setQty(1);
  };

  return (
    <article className="flex flex-col overflow-hidden rounded-xl border bg-card">
      <div className="relative aspect-square w-full">
        <SmartImage src={item.imageUrl} name={item.dishName} width={320} height={320} className="h-full w-full" />
        <WishlistButton item={item} restaurant={restaurant} className="absolute right-2 top-2" />
      </div>

      <div className="flex flex-1 flex-col gap-2 p-3">
        <div className="flex items-start gap-1.5">
          <FoodTypeMark type={item.foodType} className="mt-0.5" />
          <h4 className="line-clamp-2 text-sm font-medium leading-snug">{item.dishName}</h4>
        </div>

        <p className="text-base font-bold">{formatPrice(item.price)}</p>

        <div className="mt-auto flex flex-col gap-2 pt-1">
          <div className="inline-flex h-9 items-center justify-between rounded-md border">
            <button
              type="button"
              className="flex h-full w-9 items-center justify-center text-muted-foreground transition-colors hover:bg-accent disabled:opacity-40"
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              disabled={qty <= 1}
              aria-label="Decrease quantity"
            >
              <Minus className="size-4" />
            </button>
            <span className="min-w-6 text-center text-sm font-semibold tabular-nums" aria-live="polite">
              {qty}
            </span>
            <button
              type="button"
              className="flex h-full w-9 items-center justify-center text-muted-foreground transition-colors hover:bg-accent disabled:opacity-40"
              onClick={() => setQty((q) => Math.min(MAX_QUANTITY_PER_ITEM, q + 1))}
              disabled={qty >= MAX_QUANTITY_PER_ITEM}
              aria-label="Increase quantity"
            >
              <Plus className="size-4" />
            </button>
          </div>

          <Button
            className="h-9 w-full rounded-full bg-foreground font-semibold text-background hover:bg-foreground/90"
            disabled={!canOrder}
            onClick={handleAdd}
          >
            {canOrder ? "Add to Cart" : "Closed"}
          </Button>
        </div>
      </div>
    </article>
  );
}