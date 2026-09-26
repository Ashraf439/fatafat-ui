import { ScrollRow } from "@/components/ScrollRow";
import { RestaurantCard, RestaurantCardSkeleton } from "./RestaurantCard";
import { useRestaurantList } from "./queries";

/** filters: { q, city, openOnly, pureVeg }. Shows only the first page — this is a curated strip, not a full listing. */
export function RestaurantCarousel({ title, filters }) {
  const list = useRestaurantList(filters);
  const items = list.data?.pages[0]?.items ?? [];

  if (list.isError) return null;
  if (!list.isPending && items.length === 0) return null;

  return (
    <ScrollRow title={title}>
      {list.isPending
        ? Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="w-64 shrink-0 sm:w-72">
              <RestaurantCardSkeleton />
            </div>
          ))
        : items.map((r) => (
            <div key={r.id} className="w-64 shrink-0 sm:w-72">
              <RestaurantCard restaurant={r} />
            </div>
          ))}
    </ScrollRow>
  );
}