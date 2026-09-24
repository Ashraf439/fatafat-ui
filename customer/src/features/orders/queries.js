import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ordersApi } from "@/api/orders";
import { queryKeys } from "@/api/queryKeys";
import { useAuth } from "@/features/auth/useAuth";
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
