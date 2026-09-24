import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Banknote, CreditCard, Loader2, MapPin, Plus, ShoppingBag, Smartphone, Timer } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState, ErrorState } from "@/components/States";
import { FoodTypeMark } from "@/components/FoodTypeMark";
import { AddressFormDialog } from "@/features/addresses/AddressFormDialog";
import { AddressSummary } from "@/features/addresses/AddressSummary";
import { useAddresses } from "@/features/addresses/queries";
import { useCart } from "@/features/cart/useCart";
import { usePlaceOrder, useQuote } from "@/features/checkout/queries";
import { formatPrice, plural } from "@/lib/format";
import { cn } from "@/lib/utils";

const PAYMENT_OPTIONS = [
  { value: "CASH", label: "Cash on delivery", hint: "Pay when your order arrives", icon: Banknote, enabled: true },
  { value: "UPI", label: "UPI", hint: "Coming soon", icon: Smartphone, enabled: false },
  { value: "CARD", label: "Credit / debit card", hint: "Coming soon", icon: CreditCard, enabled: false },
];

function Section({ step, title, action, children }) {
  return (
    <Card className="p-5 sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-3 text-lg font-bold">
          <span className="flex size-7 items-center justify-center rounded-full bg-primary text-sm text-primary-foreground">{step}</span>
          {title}
        </h2>
        {action}
      </div>
      {children}
    </Card>
  );
}

function BillRow({ label, value, strong, free }) {
  return (
    <div className={cn("flex items-center justify-between text-sm", strong && "text-base font-extrabold")}>
      <span className={strong ? undefined : "text-muted-foreground"}>{label}</span>
      <span className={cn("tabular-nums", free && "font-bold text-success")}>{value}</span>
    </div>
  );
}

export default function CheckoutPage() {
  const { cart, count, clear } = useCart();
  const navigate = useNavigate();
  const addresses = useAddresses();
  const quote = useQuote(cart);
  const placeOrder = usePlaceOrder();

  const [chosenAddressId, setChosenAddressId] = useState(null);
  const [addressDialogOpen, setAddressDialogOpen] = useState(false);
  const [payment, setPayment] = useState("CASH");
  const [instructions, setInstructions] = useState("");
  const [placeError, setPlaceError] = useState(null);

  if (count === 0) {
    return (
      <EmptyState
        icon={ShoppingBag}
        title="Your cart is empty"
        description="Add a few dishes before checking out."
        action={
          <Button asChild>
            <Link to="/">Browse restaurants</Link>
          </Button>
        }
      />
    );
  }

  const addressList = addresses.data ?? [];
  const defaultAddress = addressList.find((a) => a.isDefault) ?? addressList[0];
  const selectedAddress = addressList.find((a) => a.id === chosenAddressId) ?? defaultAddress;
  const q = quote.data;
  const quoteBlocked = quote.isError;
  const canPlace = Boolean(selectedAddress && q && !quoteBlocked && !placeOrder.isPending);

  const handlePlace = async () => {
    setPlaceError(null);
    try {
      const order = await placeOrder.mutateAsync({
        restaurantId: cart.restaurant.id,
        addressId: selectedAddress.id,
        paymentMethod: payment,
        specialInstructions: instructions.trim() || null,
        items: cart.lines.map((l) => ({ menuId: l.menuId, quantity: l.quantity })),
      });
      clear();
      toast.success("Order placed! The restaurant has been notified.");
      navigate(`/orders/${order.id}`, { replace: true });
    } catch (err) {
      setPlaceError(err.message);
    }
  };

  return (
    <div className="space-y-6 pb-28 lg:pb-0">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Checkout</h1>
        <p className="text-sm text-muted-foreground">
          Ordering from{" "}
          <Link to={`/restaurants/${cart.restaurant.id}`} className="font-semibold text-foreground hover:underline">
            {cart.restaurant.name}
          </Link>
        </p>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-5">
          <Section
            step={1}
            title="Delivery address"
            action={
              addressList.length > 0 && (
                <Button variant="outline" size="sm" onClick={() => setAddressDialogOpen(true)}>
                  <Plus /> New
                </Button>
              )
            }
          >
            {addresses.isError ? (
              <ErrorState error={addresses.error} onRetry={() => addresses.refetch()} />
            ) : addresses.isPending ? (
              <Skeleton className="h-24 w-full" />
            ) : addressList.length === 0 ? (
              <EmptyState
                icon={MapPin}
                title="Where should we deliver?"
                action={<Button onClick={() => setAddressDialogOpen(true)}>Add an address</Button>}
              />
            ) : (
              <RadioGroup value={String(selectedAddress?.id)} onValueChange={(v) => setChosenAddressId(Number(v))}>
                {addressList.map((a) => (
                  <Label
                    key={a.id}
                    htmlFor={`address-${a.id}`}
                    className={cn(
                      "flex cursor-pointer items-start gap-3 rounded-xl border p-4 font-normal transition-colors",
                      selectedAddress?.id === a.id ? "border-primary bg-accent/50" : "hover:bg-secondary/60",
                    )}
                  >
                    <RadioGroupItem value={String(a.id)} id={`address-${a.id}`} className="mt-1" />
                    <AddressSummary address={a} />
                  </Label>
                ))}
              </RadioGroup>
            )}
          </Section>

          <Section step={2} title="Payment">
            <RadioGroup value={payment} onValueChange={setPayment}>
              {PAYMENT_OPTIONS.map(({ value, label, hint, icon: Icon, enabled }) => (
                <Label
                  key={value}
                  htmlFor={`pay-${value}`}
                  className={cn(
                    "flex items-center gap-3 rounded-xl border p-4 font-normal",
                    enabled ? "cursor-pointer" : "cursor-not-allowed opacity-55",
                    payment === value && enabled && "border-primary bg-accent/50",
                  )}
                >
                  <RadioGroupItem value={value} id={`pay-${value}`} disabled={!enabled} />
                  <Icon className="size-5 text-primary" />
                  <span className="flex flex-col">
                    <span className="font-bold">{label}</span>
                    <span className="text-xs text-muted-foreground">{hint}</span>
                  </span>
                </Label>
              ))}
            </RadioGroup>
          </Section>

          <Section step={3} title="Cooking instructions">
            <Textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              maxLength={500}
              placeholder="Anything the restaurant should know? e.g. less spicy, no onions"
              aria-label="Cooking instructions"
            />
            <p className="mt-1.5 text-right text-xs text-muted-foreground">{instructions.length}/500</p>
          </Section>
        </div>

        <Card className="p-5 sm:p-6 lg:sticky lg:top-[calc(var(--header-h)+1.5rem)]">
          <h2 className="mb-4 text-lg font-bold">Order summary</h2>

          {quote.isPending && quote.fetchStatus !== "idle" ? (
            <div className="space-y-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : quote.isError ? (
            <div role="alert" className="space-y-3 rounded-xl bg-red-50 p-4 text-sm text-red-900">
              <p className="font-semibold">{quote.error.message}</p>
              <Button variant="outline" size="sm" asChild>
                <Link to={`/restaurants/${cart.restaurant.id}`}>Review cart at the restaurant</Link>
              </Button>
            </div>
          ) : q ? (
            <div className={cn("space-y-4", quote.isPlaceholderData && "opacity-60")}>
              <ul className="space-y-3">
                {q.lines.map((l) => (
                  <li key={l.menuId} className="flex items-start justify-between gap-3 text-sm">
                    <span className="flex min-w-0 items-start gap-2">
                      <FoodTypeMark type={l.foodType} className="mt-0.5" />
                      <span className="min-w-0">
                        <span className="font-semibold">{l.dishName}</span>
                        <span className="text-muted-foreground"> × {l.quantity}</span>
                      </span>
                    </span>
                    <span className="font-semibold tabular-nums">{formatPrice(l.lineTotal)}</span>
                  </li>
                ))}
              </ul>
              <Separator />
              <div className="space-y-2">
                <BillRow label="Subtotal" value={formatPrice(q.subtotal)} />
                <BillRow label="Delivery fee" value={Number(q.deliveryFee) === 0 ? "FREE" : formatPrice(q.deliveryFee)} free={Number(q.deliveryFee) === 0} />
                <BillRow label="Taxes" value={formatPrice(q.taxAmount)} />
                {Number(q.discountAmount) > 0 && <BillRow label="Discount" value={`−${formatPrice(q.discountAmount)}`} free />}
              </div>
              <Separator />
              <BillRow strong label="To pay" value={formatPrice(q.totalAmount)} />
              {Number(q.amountForFreeDelivery) > 0 && (
                <p className="rounded-lg bg-accent px-3 py-2 text-xs font-medium text-accent-foreground">
                  Add {formatPrice(q.amountForFreeDelivery)} more for free delivery
                </p>
              )}
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Timer className="size-3.5" /> Arrives in about {q.estimatedDeliveryMinutes} min · {plural(count, "item")}
              </p>
            </div>
          ) : null}

          {placeError && (
            <div role="alert" className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-800">
              {placeError}
            </div>
          )}

          <Button size="lg" className="mt-5 hidden w-full lg:inline-flex" onClick={handlePlace} disabled={!canPlace}>
            {placeOrder.isPending && <Loader2 className="animate-spin" />}
            {q ? `Place order · ${formatPrice(q.totalAmount)}` : "Place order"}
          </Button>
          {!selectedAddress && !addresses.isPending && (
            <p className="mt-2 hidden text-center text-xs text-muted-foreground lg:block">Add a delivery address to continue.</p>
          )}
        </Card>
      </div>

      {/* Mobile-only sticky action bar: on small screens the summary card sits above the form
          sections instead of beside them, so without this the CTA would be scrolled out of reach. */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 p-3 backdrop-blur lg:hidden">
        <div className="mx-auto max-w-2xl space-y-1.5">
          {!selectedAddress && !addresses.isPending && (
            <p className="text-center text-xs text-muted-foreground">Add a delivery address to continue.</p>
          )}
          <Button size="lg" className="w-full" onClick={handlePlace} disabled={!canPlace}>
            {placeOrder.isPending && <Loader2 className="animate-spin" />}
            {q ? `Place order · ${formatPrice(q.totalAmount)}` : "Place order"}
          </Button>
        </div>
      </div>

      <AddressFormDialog
        open={addressDialogOpen}
        onOpenChange={setAddressDialogOpen}
        isFirst={addressList.length === 0}
        onSaved={(saved) => setChosenAddressId(saved.id)}
      />
    </div>
  );
}
