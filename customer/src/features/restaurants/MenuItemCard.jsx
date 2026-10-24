import { useState } from "react";
import { Clock } from "lucide-react";
import { FoodTypeMark } from "@/components/FoodTypeMark";
import { SmartImage } from "@/components/SmartImage";
import { QuantityStepper } from "@/features/cart/QuantityStepper";
import { MAX_QUANTITY_PER_ITEM } from "@/features/cart/cart-store";
import { useCart } from "@/features/cart/useCart";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/format";

export function MenuItemCard({ item, restaurant, canOrder }) {
  const { quantityOf, requestAdd, increment } = useCart();
  const inCart = quantityOf(item.id);
  const [qty, setQty] = useState(1);

  const remaining = MAX_QUANTITY_PER_ITEM - inCart;
  const maxSelectable = Math.max(remaining, 0);
  const selected = Math.min(qty, Math.max(maxSelectable, 1));

  const handleAdd = () => {
    requestAdd(restaurant, item);
    for (let i = 1; i < selected; i++) increment(item.id);
    setQty(1);
  };

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border bg-card transition-shadow hover:shadow-md">
      {/* Image */}
      <div className="relative overflow-hidden">
        <SmartImage
          src={item.imageUrl}
          name={item.dishName}
          width={400}
          height={300}
          className={cn(
            "aspect-4/3 w-full object-cover transition-transform duration-300 group-hover:scale-105",
            !canOrder && "grayscale",
          )}
        />
        <div className="absolute left-2 top-2 rounded bg-card/95 p-1 shadow-sm flex items-center justify-center">
            <FoodTypeMark type={item.foodType} />
        </div>

        {item.preparationTimeMinutes != null && (
          <span className="absolute bottom-2 left-2 flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-[11px] font-medium text-white backdrop-blur-sm">
            <Clock className="size-3" />
            {item.preparationTimeMinutes} min
          </span>
        )}
        {inCart > 0 && (
          <span className="absolute right-2 top-2 rounded-full bg-primary px-2 py-0.5 text-[11px] font-bold text-primary-foreground shadow-sm">
            {inCart} in cart
          </span>
        )}
      </div>

      {/* Details */}
      <div className="flex-1 space-y-1 p-3">
        <h4 className="line-clamp-2 min-h-10 text-sm font-bold leading-5">
          {item.dishName}
        </h4>
        {item.description && (
          <p className="line-clamp-2 text-xs leading-snug text-muted-foreground">
            {item.description}
          </p>
        )}
        <p className="pt-1 text-base font-bold">{formatPrice(item.price)}</p>
      </div>

      {/* Controls: selector and Add are separate */}
      <div className="flex items-center gap-2 border-t p-3">
        <QuantityStepper
          size="sm"
          className="h-9 shrink-0"
          quantity={selected}
          onIncrement={() => setQty((q) => Math.min(q + 1, Math.max(maxSelectable, 1)))}
          onDecrement={() => setQty((q) => Math.max(q - 1, 1))}
          disabledIncrement={selected >= maxSelectable}
        />

        <Button
          type="button"
          disabled={!canOrder || maxSelectable === 0}
          onClick={handleAdd}
          className="h-9 flex-1 font-extrabold uppercase tracking-wide"
        >
          {!canOrder ? "Closed" : maxSelectable === 0 ? "Max added" : "Add"}
        </Button>
      </div>
    </article>
  );
}