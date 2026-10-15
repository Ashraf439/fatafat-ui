import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ordersApi } from "@/api/orders";
import { queryKeys } from "@/api/queryKeys";
import { useAuth } from "@/features/auth/useAuth";
import { ApiError } from "@/lib/http";
import { payWithRazorpay } from "@/lib/razorpay";
import { isActiveStatus } from "./order-status";

const POLL_MS = 8000;

export function useOrders() {
  const { isAuthenticated } = useAuth();
  return useInfiniteQuery({
    queryKey: queryKeys.orders,
    queryFn: ({ pageParam }) => ordersApi.list({ page: pageParam, size: 10 }),
    initialPageParam: 0,
    getNextPageParam: (last) => (last.hasNext ? last.page + 1 : undefined),
    enabled: isAuthenticated,
    staleTime: 0,
  });
}

/** Single order; polls while the order is still in flight so tracking stays live. */
export function useOrder(id) {
  return useQuery({
    queryKey: queryKeys.order(id),
    queryFn: () => ordersApi.get(id),
    refetchInterval: (query) => (isActiveStatus(query.state.data?.status) ? POLL_MS : false),
  });
}

export function useCancelOrder(id) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (reason) => ordersApi.cancel(id, reason),
    onSuccess: (order) => {
      queryClient.setQueryData(queryKeys.order(id), order);
      queryClient.invalidateQueries({ queryKey: queryKeys.orders });
    },
  });
}

/** The customer paid, but we couldn't confirm it with the server (network/5xx). The webhook will settle it. */
export class PaymentConfirmingError extends Error {
  constructor() {
    super("Payment received, confirming with the server");
    this.name = "PaymentConfirmingError";
  }
}

/**
 * Pays for a PENDING_PAYMENT order: start (server creates the Razorpay order) -> checkout window ->
 * verify (server checks the signature and releases the order to the restaurant).
 * Rejects with PaymentCancelledError (window closed), PaymentConfirmingError, or an ApiError.
 */
export function usePayOrder() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (order) => {
      const session = await ordersApi.startPayment(order.id);

      const paid = await payWithRazorpay({
        session,
        description: `Order #${order.id} · ${order.restaurant.name}`,
        prefill: { name: user?.name, email: user?.email, contact: user?.phone },
      });

      try {
        return await ordersApi.verifyPayment(order.id, {
          razorpayOrderId: paid.razorpay_order_id,
          razorpayPaymentId: paid.razorpay_payment_id,
          razorpaySignature: paid.razorpay_signature,
        });
      } catch (err) {
        // Money may already have left the customer's account, so never report this as a failed payment.
        if (err instanceof ApiError && (err.status === 0 || err.status >= 500)) throw new PaymentConfirmingError();
        throw err;
      }
    },
    onSuccess: (updated, order) => {
      queryClient.setQueryData(queryKeys.order(order.id), updated);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["orders"] }),
  });
}