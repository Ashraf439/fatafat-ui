/** Order lifecycle metadata, kept in one place so list, detail and badges never drift apart. */
export const ORDER_STEPS = [
  { status: "PLACED", label: "Order placed", hint: "Waiting for the restaurant to accept" },
  { status: "ACCEPTED", label: "Accepted", hint: "The restaurant confirmed your order" },
  { status: "PREPARING", label: "Preparing", hint: "Your food is being cooked" },
  { status: "OUT_FOR_DELIVERY", label: "Out for delivery", hint: "On its way to you" },
  { status: "DELIVERED", label: "Delivered", hint: "Enjoy your meal!" },
];

export const STATUS_META = {
  PLACED: { label: "Placed", variant: "warning" },
  ACCEPTED: { label: "Accepted", variant: "warning" },
  PREPARING: { label: "Preparing", variant: "warning" },
  OUT_FOR_DELIVERY: { label: "Out for delivery", variant: "warning" },
  DELIVERED: { label: "Delivered", variant: "success" },
  CANCELLED: { label: "Cancelled", variant: "destructive" },
};

export const isActiveStatus = (status) => Boolean(status) && status !== "DELIVERED" && status !== "CANCELLED";

export const PAYMENT_LABELS = { CASH: "Cash on delivery", UPI: "UPI", CARD: "Card", WALLET: "Wallet" };
