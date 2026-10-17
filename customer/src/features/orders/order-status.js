import { formatPrice } from "@/lib/format";

/** Order lifecycle metadata, kept in one place so list, detail and badges never drift apart. */
export const ORDER_STEPS = [
  { status: "PLACED", label: "Order placed", hint: "Waiting for the restaurant to accept" },
  { status: "ACCEPTED", label: "Accepted", hint: "The restaurant confirmed your order" },
  { status: "PREPARING", label: "Preparing", hint: "Your food is being cooked" },
  { status: "OUT_FOR_DELIVERY", label: "Out for delivery", hint: "On its way to you" },
  { status: "DELIVERED", label: "Delivered", hint: "Enjoy your meal!" },
];

export const STATUS_META = {
  PENDING_PAYMENT: { label: "Awaiting payment", variant: "warning" },
  PLACED: { label: "Placed", variant: "warning" },
  ACCEPTED: { label: "Accepted", variant: "warning" },
  PREPARING: { label: "Preparing", variant: "warning" },
  OUT_FOR_DELIVERY: { label: "Out for delivery", variant: "warning" },
  DELIVERED: { label: "Delivered", variant: "success" },
  CANCELLED: { label: "Cancelled", variant: "destructive" },
};

export const isActiveStatus = (status) => Boolean(status) && status !== "DELIVERED" && status !== "CANCELLED";

export const PAYMENT_LABELS = {
  ONLINE: "Online payment",
  CASH: "Cash on delivery",
  UPI: "UPI",
  CARD: "Card",
  WALLET: "Wallet",
};

/** One-line payment state shown on the order page. */
export function paymentNote(order) {
  // A refund in flight (or finished) is the most useful thing to say, so it wins over the raw status.
  if (order.refund) {
    const amount = formatPrice(order.refund.amount);
    return order.refund.status === "PROCESSED"
      ? `Refunded ${amount}`
      : `Refund of ${amount} is on its way (usually 5–7 working days)`;
  }
  switch (order.paymentStatus) {
    case "PAID":
      return "Paid";
    case "REFUNDED":
      return "Refunded";
    case "FAILED":
      return "Payment not completed";
    default:
      if (order.status === "CANCELLED") return "No payment taken";
      return order.paymentMethod === "CASH" ? "Pay when it arrives" : "Payment pending";
  }
}