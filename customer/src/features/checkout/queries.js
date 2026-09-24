import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ordersApi } from "@/api/orders";
import { queryKeys } from "@/api/queryKeys";

/** Server-priced preview of the current cart. Re-runs whenever the cart contents change. */
export function useQuote(cart) {
  const restaurantId = cart.restaurant?.id;
  const items = cart.lines.map((l) => ({ menuId: l.menuId, quantity: l.quantity }));
  return useQuery({
    queryKey: queryKeys.quote(restaurantId, items),
    queryFn: () => ordersApi.quote(restaurantId, items),
    enabled: Boolean(restaurantId) && items.length > 0,
    staleTime: 0,
    gcTime: 0,
    retry: false,
    placeholderData: keepPreviousData,
  });
}

export function usePlaceOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ordersApi.place,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["orders"] }),
  });
}
