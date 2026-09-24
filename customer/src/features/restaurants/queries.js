import { keepPreviousData, useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/api/queryKeys";
import { restaurantsApi } from "@/api/restaurants";

const PAGE_SIZE = 12;

/** Infinite, filter-aware restaurant listing. `filters` = { q, city, openOnly, pureVeg }. */
export function useRestaurantList(filters) {
  return useInfiniteQuery({
    queryKey: queryKeys.restaurants(filters),
    queryFn: ({ pageParam, signal }) =>
      restaurantsApi.list({ ...filters, page: pageParam, size: PAGE_SIZE }, { signal }),
    initialPageParam: 0,
    getNextPageParam: (last) => (last.hasNext ? last.page + 1 : undefined),
    placeholderData: keepPreviousData,
  });
}

export function useCities() {
  return useQuery({ queryKey: queryKeys.cities, queryFn: restaurantsApi.cities, staleTime: 5 * 60_000 });
}

export function useRestaurant(id) {
  return useQuery({ queryKey: queryKeys.restaurant(id), queryFn: () => restaurantsApi.get(id) });
}

export function useRestaurantMenu(id) {
  return useQuery({ queryKey: queryKeys.menu(id), queryFn: () => restaurantsApi.menu(id) });
}
