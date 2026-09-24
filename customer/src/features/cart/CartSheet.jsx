import { Link, useNavigate } from "react-router-dom";
import { ShoppingBag, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { FoodTypeMark } from "@/components/FoodTypeMark";
import { SmartImage } from "@/components/SmartImage";
import { formatPrice, plural } from "@/lib/format";
import { MAX_QUANTITY_PER_ITEM } from "./cart-store";
import { QuantityStepper } from "./QuantityStepper";
import { useCart } from "./useCart";

/** Slide-over cart, opened from the header or the "View cart" bar. */
export function CartSheet() {
  const { cart, count, subtotal, isOpen, setOpen, increment, decrement, clear } = useCart();
  const navigate = useNavigate();

  const goToCheckout = () => {
    setOpen(false);
    navigate("/checkout");
  };

  return (
    <Sheet open={isOpen} onOpenChange={setOpen}>
      <SheetContent className="gap-0 p-0">
        <SheetHeader className="p-5 pb-4">
          <SheetTitle>Your cart</SheetTitle>
          <SheetDescription>
            {count === 0 ? (
              "Nothing here yet."
            ) : (
              <>
                {plural(count, "item")} from{" "}
                <Link
                  to={`/restaurants/${cart.restaurant.id}`}
                  onClick={() => setOpen(false)}
                  className="font-semibold text-foreground underline-offset-2 hover:underline"
                >
                  {cart.restaurant.name}
                </Link>
              </>
            )}
          </SheetDescription>
        </SheetHeader>
        <Separator />

        {count === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
            <div className="flex size-16 items-center justify-center rounded-full bg-accent text-primary">
              <ShoppingBag className="size-8" />
            </div>
            <p className="font-bold">Your cart is empty</p>
            <p className="text-sm text-muted-foreground">Pick a restaurant and add something delicious.</p>
            <Button onClick={() => setOpen(false)} asChild>
              <Link to="/">Browse restaurants</Link>
            </Button>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y overflow-y-auto px-5">
              {cart.lines.map((line) => (
                <li key={line.menuId} className="flex items-center gap-3 py-4">
                  <SmartImage src={line.imageUrl} name={line.name} width={120} height={120} className="size-14 shrink-0 rounded-lg" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start gap-1.5">
                      <FoodTypeMark type={line.foodType} className="mt-0.5" />
                      <p className="line-clamp-2 text-sm font-semibold leading-snug">{line.name}</p>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{formatPrice(line.price)}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <QuantityStepper
                      size="sm"
                      quantity={line.quantity}
                      onIncrement={() => increment(line.menuId)}
                      onDecrement={() => decrement(line.menuId)}
                      disabledIncrement={line.quantity >= MAX_QUANTITY_PER_ITEM}
                    />
                    <span className="text-sm font-bold tabular-nums">{formatPrice(line.price * line.quantity)}</span>
                  </div>
                </li>
              ))}
            </ul>
            <SheetFooter className="gap-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="text-base font-bold">{formatPrice(subtotal)}</span>
              </div>
              <p className="text-xs text-muted-foreground">Delivery fee and taxes are calculated at checkout.</p>
              <Button size="lg" onClick={goToCheckout}>
                Proceed to checkout
              </Button>
              <Button variant="ghost" size="sm" onClick={clear} className="text-muted-foreground">
                <Trash2 /> Clear cart
              </Button>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
