import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FoodTypeMark } from "@/components/FoodTypeMark";
import { SmartImage } from "@/components/SmartImage";
import { QuantityStepper } from "@/features/cart/QuantityStepper";
import { MAX_QUANTITY_PER_ITEM } from "@/features/cart/cart-store";
import { useCart } from "@/features/cart/useCart";
import { formatPrice } from "@/lib/format";

export function MenuItemRow({ item, restaurant, canOrder }) {
  const { quantityOf, requestAdd, increment, decrement } = useCart();
  const quantity = quantityOf(item.id);

  return (
    <article className="flex gap-4 py-5">
      <div className="min-w-0 flex-1 space-y-1.5">
        <FoodTypeMark type={item.foodType} />
        <h4 className="text-base leading-snug font-bold">{item.dishName}</h4>
        <p className="text-sm font-semibold">{formatPrice(item.price)}</p>
        {item.description && <p className="line-clamp-2 text-sm text-muted-foreground">{item.description}</p>}
        {item.preparationTimeMinutes != null && (
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="size-3" /> {item.preparationTimeMinutes} min prep
          </p>
        )}
      </div>

      <div className="relative w-28 shrink-0 sm:w-32">
        <SmartImage src={item.imageUrl} name={item.dishName} width={320} height={320} className="aspect-square w-full rounded-xl" />
        <div className="absolute inset-x-2 -bottom-3 flex justify-center">
          {quantity > 0 ? (
            <QuantityStepper
              size="sm"
              className="shadow-md"
              quantity={quantity}
              onIncrement={() => increment(item.id)}
              onDecrement={() => decrement(item.id)}
              disabledIncrement={quantity >= MAX_QUANTITY_PER_ITEM}
            />
          ) : (
            <Button
              size="sm"
              variant="outline"
              disabled={!canOrder}
              onClick={() => requestAdd(restaurant, item)}
              className="h-8 w-24 border-primary/30 bg-card font-extrabold tracking-wide text-primary uppercase shadow-md hover:bg-accent"
            >
              {canOrder ? "Add" : "Closed"}
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}
