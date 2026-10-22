import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { cn } from "@/lib/utils";
import { Banknote, CreditCard, Loader2, MapPin, Phone, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { orderRef } from "../lib/orderRef"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cancelOrder, listOrders, updateOrderStatus } from "../api/orders";

const POLL_MS = 10_000;

const COLUMNS = [
  { status: "PLACED", title: "New" },
  { status: "ACCEPTED", title: "Accepted" },
  { status: "PREPARING", title: "Preparing" },
  { status: "OUT_FOR_DELIVERY", title: "Out for delivery" },
];

// Label for the button that moves an order INTO the given status.
const ACTION_LABEL = {
  ACCEPTED: "Accept order",
  PREPARING: "Start preparing",
  OUT_FOR_DELIVERY: "Dispatch order",
  DELIVERED: "Mark delivered",
};

const rupees = (n) => `₹${Number(n).toFixed(2)}`;

function useNow(intervalMs = 30_000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}

const LATE_AFTER_MIN = 5; // a new order sitting this long is flagged so it isn't missed

function minutesSince(iso, now) {
  if (!iso) return 0;
  return Math.max(0, Math.floor((now - new Date(iso).getTime()) / 60_000));
}

// Short two-tone chime so a busy kitchen hears new orders even when the tab is in the background.
function chime() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    [880, 1175].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.15, ctx.currentTime + i * 0.18);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.18 + 0.25);
      osc.connect(gain).connect(ctx.destination);
      osc.start(ctx.currentTime + i * 0.18);
      osc.stop(ctx.currentTime + i * 0.18 + 0.25);
    });
    setTimeout(() => ctx.close(), 800);
  } catch {
    // Audio not available — the toast and tab title still alert the user.
  }
}

function waiting(iso, now) {
  if (!iso) return "";
  const mins = Math.max(0, Math.floor((now - new Date(iso).getTime()) / 60_000));
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  return `${Math.floor(mins / 60)} h ${mins % 60} min ago`;
}

const Orders = () => {
  const [view, setView] = useState("active");
  const [mobileCol, setMobileCol] = useState("PLACED");
  // Remember which view the data belongs to, so switching tabs never shows the wrong list.
  const [snapshot, setSnapshot] = useState({ view: null, data: null });
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [reason, setReason] = useState("");
  const knownNew = useRef(null);
  const now = useNow();

  const load = useCallback(async () => {
    try {
      const data = await listOrders(view);
      setSnapshot({ view, data });
      setError("");

      if (view === "active") {
        const placedOrders = data.filter((o) => o.status === "PLACED");
        const placed = placedOrders.map((o) => o.id);
        if (knownNew.current) {
          const fresh = placedOrders.filter((o) => !knownNew.current.has(o.id));
          if (fresh.length) {
            toast.info(fresh.length === 1 ? `New order ${orderRef(fresh[0])}` : `${fresh.length} new orders`);
            chime();
          }
        }
        knownNew.current = new Set(placed);
      }
    } catch (e) {
      setError(e.message);
    }
  }, [view]);

  // No websockets yet: poll while the tab is visible.
  useEffect(() => {
    load();
    const id = setInterval(() => {
      if (document.visibilityState === "visible") load();
    }, POLL_MS);
    return () => clearInterval(id);
  }, [load]);

  const orders = snapshot.view === view ? snapshot.data : null;
  const newCount = orders && view === "active" ? orders.filter((o) => o.status === "PLACED").length : 0;

  useEffect(() => {
    const original = document.title;
    if (newCount > 0) document.title = `(${newCount}) New orders · ${original}`;
    return () => {
      document.title = original;
    };
  }, [newCount]);

  async function handleAdvance(order) {
    setBusyId(order.id);
    try {
      await updateOrderStatus(order.id, order.nextStatus);
    } catch (e) {
      toast.error(e.message); // e.g. the customer cancelled a moment ago
    } finally {
      setBusyId(null);
      load();
    }
  }

  function openCancel(order) {
    setCancelTarget(order);
    setReason("");
  }

  async function handleCancel() {
    if (!cancelTarget || !reason.trim()) return;
    setBusyId(cancelTarget.id);
    try {
      await cancelOrder(cancelTarget.id, reason.trim());
      toast.success(
        cancelTarget.paymentMethod === "ONLINE" ? "Order cancelled. The customer is being refunded." : "Order cancelled.",
      );
      setCancelTarget(null);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusyId(null);
      load();
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          <Button size="sm" variant={view === "active" ? "default" : "outline"} onClick={() => setView("active")}>
            Live orders
            {newCount > 0 && <Badge variant="warning">{newCount} new</Badge>}
          </Button>
          <Button size="sm" variant={view === "history" ? "default" : "outline"} onClick={() => setView("history")}>
            History
          </Button>
        </div>
        <Button size="sm" variant="ghost" onClick={load}>
          <RefreshCw /> Refresh
        </Button>
      </div>

      {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      {orders === null ? (
        <div className="flex justify-center py-16 text-muted-foreground">
          <Loader2 className="animate-spin" />
        </div>
      ) : view === "active" ? (
        <>
        {/* Phones show one stage at a time; tablets and desktops show the whole board. */}
        <div className="grid grid-cols-4 gap-1 rounded-xl bg-secondary p-1 md:hidden" role="tablist" aria-label="Order stage">
          {COLUMNS.map((col) => {
            const n = orders.filter((o) => o.status === col.status).length;
            return (
              <button
                key={col.status}
                type="button"
                role="tab"
                aria-selected={mobileCol === col.status}
                onClick={() => setMobileCol(col.status)}
                className={cn(
                  "flex flex-col items-center rounded-lg px-1 py-2 text-[11px] leading-tight font-semibold transition-colors",
                  mobileCol === col.status ? "bg-card text-foreground shadow-xs" : "text-muted-foreground",
                )}
              >
                <span className={cn("text-base font-extrabold", col.status === "PLACED" && n > 0 && "text-primary")}>{n}</span>
                {col.title}
              </button>
            );
          })}
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {COLUMNS.map((col) => {
            const colOrders = orders.filter((o) => o.status === col.status);
            return (
              <Card key={col.status} className={cn("flex-col", col.status === mobileCol ? "flex" : "hidden md:flex")}>
                <div className="hidden items-center justify-between border-b border-border px-4 py-3 md:flex">
                  <h3 className="font-semibold text-foreground">{col.title}</h3>
                  <Badge variant="secondary">{colOrders.length}</Badge>
                </div>
                <div className="flex min-h-40 flex-col gap-3 p-3">
                  {colOrders.length === 0 ? (
                    <p className="py-6 text-center text-sm text-muted-foreground/70">No orders here</p>
                  ) : (
                    colOrders.map((order) => (
                      <OrderCard
                        key={order.id}
                        order={order}
                        now={now}
                        busy={busyId === order.id}
                        onAdvance={handleAdvance}
                        onCancel={openCancel}
                      />
                    ))
                  )}
                </div>
              </Card>
            );
          })}
        </div>
        </>
      ) : (
        <HistoryList orders={orders} />
      )}

      <Dialog open={Boolean(cancelTarget)} onOpenChange={(open) => !open && setCancelTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{cancelTarget?.status === "PLACED" ? "Reject" : "Cancel"} order #{cancelTarget?.id}?</DialogTitle>
            <DialogDescription>
              The customer will see your reason.
              {cancelTarget?.paymentMethod === "ONLINE" && " They paid online, so they will be refunded automatically."}
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            maxLength={200}
            placeholder="e.g. We've run out of an item in this order"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelTarget(null)}>
              Keep order
            </Button>
            <Button variant="destructive" onClick={handleCancel} disabled={!reason.trim() || busyId === cancelTarget?.id}>
              {busyId === cancelTarget?.id && <Loader2 className="animate-spin" />}
              {cancelTarget?.status === "PLACED" ? "Reject order" : "Cancel order"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const OrderCard = ({ order, now, busy, onAdvance, onCancel }) => {
  const cash = order.paymentMethod === "CASH";
  const late = order.status === "PLACED" && minutesSince(order.placedAt, now) >= LATE_AFTER_MIN;

  return (
    <div className={cn("rounded-lg border bg-secondary/40 p-3", late ? "border-red-300 bg-red-50/60" : "border-border")}>
      <div className="mb-1 flex items-center justify-between">
        <span className={cn("font-mono text-xs", late ? "font-bold text-red-700" : "text-muted-foreground")}>
          #{order.id} · {waiting(order.placedAt, now)}
        </span>
        <span className="text-sm font-semibold text-foreground">{rupees(order.totalAmount)}</span>
      </div>
      <div className="mb-1 text-sm font-medium text-foreground">{order.customerName}</div>

      <ul className="mb-2 space-y-0.5 text-sm text-foreground">
        {order.items.map((item, i) => (
          <li key={i}>
            <span className="font-semibold">{item.quantity}×</span> {item.name}
            {item.instructions && <span className="block text-xs text-muted-foreground">“{item.instructions}”</span>}
          </li>
        ))}
      </ul>

      {order.specialInstructions && (
        <p className="mb-2 rounded bg-amber-50 p-2 text-xs text-amber-900">Note: {order.specialInstructions}</p>
      )}

      <Badge variant={cash ? "warning" : "success"} className="mb-2">
        {cash ? <Banknote className="size-3" /> : <CreditCard className="size-3" />}
        {cash ? `Collect ${rupees(order.totalAmount)} in cash` : "Paid online"}
      </Badge>

      {order.customerPhone && (
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Phone className="size-3" /> {order.customerPhone}
        </p>
      )}
      {order.deliveryAddress && (
        <p className="mb-2 flex items-start gap-1.5 text-xs text-muted-foreground">
          <MapPin className="mt-0.5 size-3 shrink-0" />
          {[
            order.deliveryAddress.floorOrApartment,
            order.deliveryAddress.street,
            order.deliveryAddress.landmark,
            order.deliveryAddress.city,
            order.deliveryAddress.pincode,
          ]
            .filter(Boolean)
            .join(", ")}
        </p>
      )}

      <div className="mt-2 flex gap-2">
        {order.nextStatus && (
          <Button className="h-10 flex-1 rounded-full" disabled={busy} onClick={() => onAdvance(order)}>
            {busy && <Loader2 className="animate-spin" />}
            {ACTION_LABEL[order.nextStatus]}
          </Button>
        )}
        {order.cancellable && (
          <Button variant="outline" className="h-10 rounded-full" disabled={busy} onClick={() => onCancel(order)}>
            {order.status === "PLACED" ? "Reject" : "Cancel"}
          </Button>
        )}
      </div>
    </div>
  );
};

const HistoryList = ({ orders }) =>
  orders.length === 0 ? (
    <p className="py-12 text-center text-sm text-muted-foreground">No finished orders yet.</p>
  ) : (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {orders.map((o) => (
        <Card key={o.id} className="space-y-1 p-4">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-muted-foreground">#{o.id}</span>
            <Badge variant={o.status === "DELIVERED" ? "success" : "destructive"}>
              {o.status === "DELIVERED" ? "Delivered" : "Cancelled"}
            </Badge>
          </div>
          <p className="text-sm font-medium text-foreground">
            {o.customerName} · {rupees(o.totalAmount)}
          </p>
          <p className="text-xs text-muted-foreground">
            {o.items.map((i) => `${i.quantity}× ${i.name}`).join(", ")}
          </p>
          {o.cancelReason && <p className="text-xs text-red-700">{o.cancelReason}</p>}
        </Card>
      ))}
    </div>
  );

export default Orders;