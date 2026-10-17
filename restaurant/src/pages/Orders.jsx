import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { Banknote, CreditCard, Loader2, MapPin, Phone, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
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

function waiting(iso, now) {
  if (!iso) return "";
  const mins = Math.max(0, Math.floor((now - new Date(iso).getTime()) / 60_000));
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  return `${Math.floor(mins / 60)} h ${mins % 60} min ago`;
}

const Orders = () => {
  const [view, setView] = useState("active");
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
        const placed = data.filter((o) => o.status === "PLACED").map((o) => o.id);
        if (knownNew.current) {
          const fresh = placed.filter((id) => !knownNew.current.has(id));
          if (fresh.length) {
            toast.info(fresh.length === 1 ? `New order #${fresh[0]}` : `${fresh.length} new orders`);
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
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {COLUMNS.map((col) => {
            const colOrders = orders.filter((o) => o.status === col.status);
            return (
              <Card key={col.status} className="flex flex-col">
                <div className="flex items-center justify-between border-b border-border px-4 py-3">
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

  return (
    <div className="rounded-lg border border-border bg-secondary/40 p-3">
      <div className="mb-1 flex items-center justify-between">
        <span className="font-mono text-xs text-muted-foreground">#{order.id} · {waiting(order.placedAt, now)}</span>
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
          <Button size="sm" className="flex-1 rounded-full text-xs" disabled={busy} onClick={() => onAdvance(order)}>
            {busy && <Loader2 className="animate-spin" />}
            {ACTION_LABEL[order.nextStatus]}
          </Button>
        )}
        {order.cancellable && (
          <Button size="sm" variant="outline" className="rounded-full text-xs" disabled={busy} onClick={() => onCancel(order)}>
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