import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";

const STAGES = [
  { key: "ORDERED", label: "Ordered" },
  { key: "PREPARING", label: "Preparing" },
  { key: "DELIVERED", label: "Delivered" },
];

const NEXT_STAGE = {
  ORDERED: "PREPARING",
  PREPARING: "DELIVERED",
  DELIVERED: null,
};

const Orders = () => {
  const [orders, setOrders] = useState([]);

  const advanceOrder = (id) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== id) return o;
        const next = NEXT_STAGE[o.stage];
        return next ? { ...o, stage: next } : o;
      })
    );
  };

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {STAGES.map((stage) => {
        const stageOrders = orders.filter((o) => o.stage === stage.key);
        return (
          <Card key={stage.key} className="flex flex-col">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <h3 className="font-semibold text-foreground">{stage.label}</h3>
              <Badge variant="secondary">{stageOrders.length}</Badge>
            </div>

            <div className="flex min-h-50 flex-col gap-3 p-3">
              {stageOrders.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground/70">No orders here</p>
              ) : (
                stageOrders.map((order) => (
                  <OrderCard key={order.id} order={order} onAdvance={advanceOrder} />
                ))
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
};

const OrderCard = ({ order, onAdvance }) => {
  const next = NEXT_STAGE[order.stage];

  return (
    <div className="rounded-lg border border-border bg-secondary/40 p-3">
      <div className="mb-1 flex items-center justify-between">
        <span className="font-mono text-xs text-muted-foreground">{order.id}</span>
        <span className="text-sm font-semibold text-foreground">₹{order.total}</span>
      </div>
      <div className="mb-1 text-sm font-medium text-foreground">{order.customer}</div>
      <ul className="mb-3 list-inside list-disc text-xs text-muted-foreground">
        {order.items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>

      {next && (
        <Button onClick={() => onAdvance(order.id)} size="sm" className="w-full rounded-full text-xs">
          Move to {STAGES.find((s) => s.key === next).label}
          <ArrowRight className="h-3.5 w-3.5" />
        </Button>
      )}
    </div>
  );
};

export default Orders;
