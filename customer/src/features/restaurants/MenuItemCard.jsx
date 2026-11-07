import { useState } from "react";
import { Minus, Plus, Star } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { FoodTypeMark } from "@/components/FoodTypeMark";
import { SmartImage } from "@/components/SmartImage";
import { MAX_QUANTITY_PER_ITEM } from "@/features/cart/cart-store";
import { useCart } from "@/features/cart/useCart";
import { WishlistButton } from "@/features/wishlist/WishlistButton";
import { formatPrice } from "@/lib/format";

const STEP_BTN =
  "flex h-full w-8 shrink-0 items-center justify-center text-muted-foreground transition-colors " +
  "hover:bg-accent focus-visible:bg-accent focus-visible:outline-none disabled:opacity-40";

export function MenuItemCard({ item, restaurant, canOrder }) {
  const { requestAdd } = useCart();
  const [qty, setQty] = useState(1);
  const total = Number(item.price) * qty;

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

        {item.rating != null && (
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            <Star className="size-3.5 fill-warning text-warning" />
            <span className="font-semibold text-foreground">{Number(item.rating).toFixed(1)}</span>
            {item.ratingCount != null && <span>({item.ratingCount})</span>}
          </p>
        )}

        {item.description && (
          <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">{item.description}</p>
        )}

        <div className="mt-auto pt-1">
          {canOrder ? (
            <div className="flex items-center gap-2">
              <div className="inline-flex h-10 shrink-0 items-center overflow-hidden rounded-full border bg-card">
                <button
                  type="button"
                  className={STEP_BTN}
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  disabled={qty <= 1}
                  aria-label="Decrease quantity"
                >
                  <Minus className="size-4" />
                </button>
                <span className="min-w-5 text-center text-sm font-semibold tabular-nums" aria-live="polite">
                  {qty}
                </span>
                <button
                  type="button"
                  className={STEP_BTN}
                  onClick={() => setQty((q) => Math.min(MAX_QUANTITY_PER_ITEM, q + 1))}
                  disabled={qty >= MAX_QUANTITY_PER_ITEM}
                  aria-label="Increase quantity"
                >
                  <Plus className="size-4" />
                </button>
              </div>

              <Button
                className="h-10 min-w-0 flex-1 rounded-full bg-foreground px-2 font-semibold text-background hover:bg-foreground/90"
                onClick={handleAdd}
                aria-label={`Add ${qty} × ${item.dishName} to cart for ${formatPrice(total)}`}
              >
                <span className="truncate tabular-nums">Add · {formatPrice(total)}</span>
              </Button>
            </div>
          ) : (
            <Button disabled className="h-10 w-full rounded-full bg-foreground font-semibold text-background">
              Closed
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}