import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { wishlistApi } from "@/api/wishlist";
import { useAuth } from "@/features/auth/useAuth";

const WISHLIST_KEY = ["wishlist"];

export function useWishlist() {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: WISHLIST_KEY,
    queryFn: wishlistApi.list,
    enabled: isAuthenticated,
    staleTime: 60_000,
  });
}

export function useIsWishlisted(menuId) {
  const { data } = useWishlist();
  return data?.some((w) => w.menuId === menuId) ?? false;
}

export function useToggleWishlist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ menuId, inWishlist }) => (inWishlist ? wishlistApi.remove(menuId) : wishlistApi.add(menuId)),
    onMutate: async ({ menuId, inWishlist, item, restaurant }) => {
      await qc.cancelQueries({ queryKey: WISHLIST_KEY });
      const previous = qc.getQueryData(WISHLIST_KEY) ?? [];
      const next = inWishlist
        ? previous.filter((w) => w.menuId !== menuId)
        : [
            {
              menuId,
              dishName: item?.dishName,
              imageUrl: item?.imageUrl,
              price: item?.price,
              foodType: item?.foodType,
              restaurantId: restaurant?.id,
              restaurantName: restaurant?.name,
              restaurantOpen: true,
            },
            ...previous,
          ];
      qc.setQueryData(WISHLIST_KEY, next);
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) qc.setQueryData(WISHLIST_KEY, context.previous);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: WISHLIST_KEY }),
  });
}