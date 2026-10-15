const CHECKOUT_SRC = "https://checkout.razorpay.com/v1/checkout.js";

/** Thrown when the customer closes the payment window without paying. */
export class PaymentCancelledError extends Error {
  constructor() {
    super("Payment cancelled");
    this.name = "PaymentCancelledError";
  }
}

let scriptPromise = null;

/** Loads Razorpay's checkout script once, on demand (so it never slows down normal browsing). */
export function loadRazorpay() {
  if (typeof window !== "undefined" && window.Razorpay) return Promise.resolve();
  scriptPromise ??= new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = CHECKOUT_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      script.remove();
      scriptPromise = null; // allow a retry
      reject(new Error("Couldn't load the payment window. Check your connection and try again."));
    };
    document.head.appendChild(script);
  });
  return scriptPromise;
}

/**
 * Opens Razorpay's checkout for a server-created order.
 *
 * @param session  `{ razorpayOrderId, amount (paise), currency, keyId }` from POST /orders/{id}/payment
 * @returns        `{ razorpay_order_id, razorpay_payment_id, razorpay_signature }` once the customer has paid.
 *                 The caller must send these to the backend, which is the only place that can verify them.
 * @throws         PaymentCancelledError if the window is closed without paying.
 */
export async function payWithRazorpay({ session, description, prefill }) {
  await loadRazorpay();

  return new Promise((resolve, reject) => {
    const checkout = new window.Razorpay({
      key: session.keyId,
      order_id: session.razorpayOrderId,
      amount: session.amount,
      currency: session.currency,
      name: "Fatafat",
      description,
      prefill,
      theme: { color: "#cd0000" },
      handler: (response) => resolve(response),
      // Failures inside the window (declined card, wrong UPI PIN) let the customer retry in place,
      // so we only settle on success or on the window being closed.
      modal: { ondismiss: () => reject(new PaymentCancelledError()) },
    });
    checkout.open();
  });
}