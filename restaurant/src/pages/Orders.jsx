import { useState } from "react";

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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {STAGES.map((stage) => {
        const stageOrders = orders.filter((o) => o.stage === stage.key);
        return (
          <div key={stage.key} className="bg-white rounded-xl shadow-sm flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-black/5">
              <h3 className="font-semibold text-[#1C1B19]">{stage.label}</h3>
              <span className="text-xs font-medium bg-[#EFEDE6] text-[#1C1B19]/60 rounded-full px-2 py-0.5">
                {stageOrders.length}
              </span>
            </div>

            <div className="flex flex-col gap-3 p-3 min-h-50">
              {stageOrders.length === 0 ? (
                <p className="text-sm text-[#1C1B19]/40 text-center py-6">No orders here</p>
              ) : (
                stageOrders.map((order) => (
                  <OrderCard key={order.id} order={order} onAdvance={advanceOrder} />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

const OrderCard = ({ order, onAdvance }) => {
  const next = NEXT_STAGE[order.stage];

  return (
    <div className="bg-[#EFEDE6] rounded-lg p-3 border border-black/5">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-mono text-[#1C1B19]/50">{order.id}</span>
        <span className="text-sm font-semibold text-[#1C1B19]">₹{order.total}</span>
      </div>
      <div className="font-medium text-sm text-[#1C1B19] mb-1">{order.customer}</div>
      <ul className="text-xs text-[#1C1B19]/60 mb-3 list-disc list-inside">
        {order.items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>

      {next && (
        <button
          onClick={() => onAdvance(order.id)}
          className="w-full text-xs font-medium bg-[#CD0000] text-white rounded-full py-1.5 hover:bg-[#a80000] transition-colors"
        >
          Move to {STAGES.find((s) => s.key === next).label} →
        </button>
      )}
    </div>
  );
};

export default Orders;