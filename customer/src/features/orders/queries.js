import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ordersApi } from "@/api/orders";
import { queryKeys } from "@/api/queryKeys";
import { useAuth } from "@/features/auth/useAuth";
import { ApiError } from "@/lib/http";
import { payWithRazorpay } from "@/lib/razorpay";
import { orderRef } from "@/lib/orderRef";
import { isActiveStatus } from "./order-status";

export const ORDERS_PAGE_SIZE = 10;

export function useOrders(filters = {}, page = 0) {
  const { isAuthenticated } = useAuth();
  const { sort = "date_desc", from = "", to = "" } = filters;
  return useQuery({
    queryKey: queryKeys.orders({ sort, from, to, page }),
    queryFn: () => ordersApi.list({ page, size: ORDERS_PAGE_SIZE, sort, from, to }),
    placeholderData: keepPreviousData,
    enabled: isAuthenticated,
    staleTime: 0,
  });
}

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
      queryClient.invalidateQueries({ queryKey: ["orders", "list"] });
    },
  });
}

export class PaymentConfirmingError extends Error {
  constructor() {
    super("Payment received, confirming with the server");
    this.name = "PaymentConfirmingError";
  }
}

export function usePayOrder() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (order) => {
      const session = await ordersApi.startPayment(order.id);

      const paid = await payWithRazorpay({
        session,
        description: `Order ${orderRef(order)} · ${order.restaurant.name}`,
        prefill: { name: user?.name, email: user?.email, contact: user?.phone },
      });

      try {
        return await ordersApi.verifyPayment(order.id, {
          razorpayOrderId: paid.razorpay_order_id,
          razorpayPaymentId: paid.razorpay_payment_id,
          razorpaySignature: paid.razorpay_signature,
        });
      } catch (err) {
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