import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, CreditCard, Loader2, Receipt, Timer } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState, ErrorState } from "@/components/States";
import { AddressSummary } from "@/features/addresses/AddressSummary";
import { OrderTimeline } from "@/features/orders/OrderTimeline";
import { StatusBadge } from "@/features/orders/StatusBadge";
import { PAYMENT_LABELS, isActiveStatus, paymentNote } from "@/features/orders/order-status";
import { PaymentConfirmingError, useCancelOrder, useOrder, usePayOrder } from "@/features/orders/queries";
import { formatDateTime, formatPrice, formatTimeOfDay } from "@/lib/format";
import { PaymentCancelledError } from "@/lib/razorpay";

function Row({ label, value, strong, free }) {
  return (
    <div className={`flex items-center justify-between text-sm ${strong ? "text-base font-extrabold" : ""}`}>
      <span className={strong ? undefined : "text-muted-foreground"}>{label}</span>
      <span className={`tabular-nums ${free ? "font-bold text-success" : ""}`}>{value}</span>
    </div>
  );
}

export default function OrderDetailPage() {
  const { id } = useParams();
  const order = useOrder(id);
  const cancel = useCancelOrder(id);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [reason, setReason] = useState("");

  const { mutateAsync: payAsync, isPending: paying } = usePayOrder();
  const [searchParams, setSearchParams] = useSearchParams();
  const wantsAutoPay = searchParams.get("pay") === "1";
  const autoPayHandled = useRef(false);
  const orderData = order.data;

  const handlePay = useCallback(
    async (target) => {
      try {
        await payAsync(target);
        toast.success("Payment received. Your order is confirmed!");
      } catch (err) {
        if (err instanceof PaymentCancelledError) {
          toast.info("Payment cancelled. You can pay any time from this page.");
        } else if (err instanceof PaymentConfirmingError) {
          toast.info("We're confirming your payment. This page will update in a moment.");
        } else {
          toast.error(err.message || "Payment failed. Please try again.");
        }
      }
    },
    [payAsync],
  );

  // Checkout sends online orders here with ?pay=1 so the payment window opens once the order has loaded.
  // The same page doubles as the retry screen, so there is a single place that handles payment.
  useEffect(() => {
    if (!wantsAutoPay || autoPayHandled.current || !orderData) return;
    autoPayHandled.current = true;
    setSearchParams({}, { replace: true });
    if (orderData.status === "PENDING_PAYMENT") handlePay(orderData);
  }, [wantsAutoPay, orderData, handlePay, setSearchParams]);

  if (order.isPending) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <Skeleton className="h-10 w-1/2" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (order.isError) {
    return order.error.status === 404 ? (
      <EmptyState
        icon={Receipt}
        title="Order not found"
        action={
          <Button asChild>
            <Link to="/orders">Back to my orders</Link>
          </Button>
        }
      />
    ) : (
      <ErrorState error={order.error} onRetry={() => order.refetch()} />
    );
  }

  const o = order.data;
  const active = isActiveStatus(o.status);

  const confirmCancel = async () => {
    try {
      await cancel.mutateAsync(reason.trim() || undefined);
      toast.success("Order cancelled");
      setCancelOpen(false);
    } catch (err) {
      toast.error(err.message);
      setCancelOpen(false);
      order.refetch();
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link to="/orders" className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> My orders
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold tracking-tight">Order #{o.id}</h1>
          <p className="text-sm text-muted-foreground">
            {o.restaurant.name} · {formatDateTime(o.placedAt)}
          </p>
        </div>
        <StatusBadge status={o.status} className="text-sm" />
      </div>

      {o.status === "PENDING_PAYMENT" && (
        <Card className="flex flex-wrap items-center justify-between gap-4 border-primary/40 bg-accent/40 p-5 sm:p-6">
          <div className="space-y-1">
            <h2 className="text-lg font-extrabold">Complete your payment</h2>
            <p className="text-sm text-muted-foreground">
              {o.restaurant.name} receives your order as soon as payment succeeds. Unpaid orders are cancelled automatically.
            </p>
          </div>
          <Button size="lg" onClick={() => handlePay(o)} disabled={paying}>
            {paying ? <Loader2 className="animate-spin" /> : <CreditCard />} Pay {formatPrice(o.totalAmount)}
          </Button>
        </Card>
      )}

      <Card className="space-y-5 p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-extrabold">Tracking</h2>
          {active && o.status !== "PENDING_PAYMENT" && o.estimatedDeliveryTime && (
            <span className="flex items-center gap-1.5 text-sm font-semibold text-primary">
              <Timer className="size-4" /> Arriving by {formatTimeOfDay(o.estimatedDeliveryTime)}
            </span>
          )}
        </div>
        <OrderTimeline status={o.status} cancelReason={o.cancelReason} />
        {o.cancellable && (
          <Button variant="outline" className="text-destructive" onClick={() => setCancelOpen(true)}>
            Cancel order
          </Button>
        )}
      </Card>

      <Card className="space-y-4 p-5 sm:p-6">
        <h2 className="text-lg font-extrabold">Items</h2>
        <ul className="space-y-3">
          {o.items.map((i) => (
            <li key={i.menuId} className="flex items-start justify-between gap-3 text-sm">
              <div>
                <span className="font-semibold">{i.dishName}</span>
                <span className="text-muted-foreground"> × {i.quantity}</span>
                {i.specialInstructions && <p className="text-xs text-muted-foreground">“{i.specialInstructions}”</p>}
              </div>
              <span className="font-semibold tabular-nums">{formatPrice(i.lineTotal)}</span>
            </li>
          ))}
        </ul>
        <Separator />
        <div className="space-y-2">
          <Row label="Subtotal" value={formatPrice(o.subtotal)} />
          <Row label="Delivery fee" value={Number(o.deliveryFee) === 0 ? "FREE" : formatPrice(o.deliveryFee)} free={Number(o.deliveryFee) === 0} />
          <Row label="Taxes" value={formatPrice(o.taxAmount)} />
          {Number(o.discountAmount) > 0 && <Row label="Discount" value={`−${formatPrice(o.discountAmount)}`} free />}
        </div>
        <Separator />
        <Row strong label="Total" value={formatPrice(o.totalAmount)} />
      </Card>

      <Card className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
        <div className="space-y-2">
          <h2 className="text-sm font-extrabold tracking-wide text-muted-foreground uppercase">Delivering to</h2>
          <AddressSummary address={o.deliveryAddress} />
        </div>
        <div className="space-y-2">
          <h2 className="text-sm font-extrabold tracking-wide text-muted-foreground uppercase">Payment</h2>
          <p className="text-sm font-semibold">{PAYMENT_LABELS[o.paymentMethod] ?? o.paymentMethod}</p>
          <p className="text-xs text-muted-foreground">{paymentNote(o)}</p>
        </div>
        {o.specialInstructions && (
          <div className="space-y-2 sm:col-span-2">
            <h2 className="text-sm font-extrabold tracking-wide text-muted-foreground uppercase">Your instructions</h2>
            <p className="text-sm">{o.specialInstructions}</p>
          </div>
        )}
      </Card>

      <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <DialogContent showClose={false}>
          <DialogHeader>
            <DialogTitle>Cancel this order?</DialogTitle>
            <DialogDescription>You can only cancel before the restaurant accepts it.</DialogDescription>
          </DialogHeader>
          <Textarea value={reason} onChange={(e) => setReason(e.target.value)} maxLength={255} placeholder="Reason (optional)" aria-label="Cancellation reason" />
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelOpen(false)}>
              Keep order
            </Button>
            <Button variant="destructive" onClick={confirmCancel} disabled={cancel.isPending}>
              {cancel.isPending && <Loader2 className="animate-spin" />} Cancel order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}