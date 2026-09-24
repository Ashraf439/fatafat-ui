import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Leaf, Loader2, Search, SearchX, Store, Timer, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmptyState, ErrorState } from "@/components/States";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { RestaurantCard, RestaurantCardSkeleton } from "@/features/restaurants/RestaurantCard";
import { useCities, useRestaurantList } from "@/features/restaurants/queries";
import { cn } from "@/lib/utils";

const ALL_CITIES = "all";

function FilterChip({ active, onClick, icon: Icon, children }) {
  return (
    <Button
      type="button"
      size="sm"
      variant={active ? "default" : "outline"}
      aria-pressed={active}
      onClick={onClick}
      className={cn("h-9 rounded-full px-4", !active && "bg-card")}
    >
      <Icon /> {children}
    </Button>
  );
}

export default function HomePage() {
  const [params, setParams] = useSearchParams();
  const urlQuery = params.get("q") ?? "";
  const city = params.get("city") ?? "";
  const openOnly = params.get("open") === "1";
  const pureVeg = params.get("veg") === "1";

  const [search, setSearch] = useState(urlQuery);
  const debouncedSearch = useDebouncedValue(search.trim(), 350);

  const updateParams = (patch) => {
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        for (const [key, value] of Object.entries(patch)) {
          if (value) next.set(key, value);
          else next.delete(key);
        }
        return next;
      },
      { replace: true },
    );
  };

  // Push the debounced search text into the URL so results are shareable and survive refresh.
  useEffect(() => {
    if (debouncedSearch !== urlQuery) {
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (debouncedSearch) next.set("q", debouncedSearch);
          else next.delete("q");
          return next;
        },
        { replace: true },
      );
    }
  }, [debouncedSearch, urlQuery, setParams]);

  const filters = { q: urlQuery, city, openOnly, pureVeg };
  const list = useRestaurantList(filters);
  const cities = useCities();

  const restaurants = list.data?.pages.flatMap((p) => p.items) ?? [];
  const total = list.data?.pages[0]?.totalElements ?? 0;
  const hasFilters = Boolean(urlQuery || city || openOnly || pureVeg);

  const clearFilters = () => {
    setSearch("");
    setParams({}, { replace: true });
  };

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-[#8f0000] px-6 py-10 text-primary-foreground shadow-lg sm:px-12 sm:py-14">
        <div aria-hidden className="pointer-events-none absolute -top-16 -right-10 size-64 rounded-full bg-white/10 blur-2xl" />
        <div aria-hidden className="pointer-events-none absolute -bottom-20 left-1/3 size-72 rounded-full bg-black/15 blur-3xl" />
        <div className="relative max-w-2xl space-y-5">
          <h1 className="text-3xl font-extrabold leading-tight tracking-tight sm:text-5xl">
            Hungry? Get it <span className="text-amber-200">fatafat.</span>
          </h1>
          <p className="text-base text-white/85 sm:text-lg">Fresh food from your favourite local kitchens, delivered to your door.</p>

          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute top-1/2 left-3.5 size-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search restaurants…"
                aria-label="Search restaurants"
                className="h-12 rounded-xl border-0 pr-10 pl-11 text-base text-foreground shadow-md"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  aria-label="Clear search"
                  className="absolute top-1/2 right-3 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:text-foreground"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>
            <Select value={city || ALL_CITIES} onValueChange={(v) => updateParams({ city: v === ALL_CITIES ? "" : v })}>
              <SelectTrigger aria-label="City" className="h-12 rounded-xl border-0 text-foreground shadow-md sm:w-48">
                <SelectValue placeholder="All cities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_CITIES}>All cities</SelectItem>
                {(cities.data ?? []).map((c) => (
                  <SelectItem key={c} value={c.toLowerCase()}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      <section className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <FilterChip active={openOnly} onClick={() => updateParams({ open: openOnly ? "" : "1" })} icon={Timer}>
              Open now
            </FilterChip>
            <FilterChip active={pureVeg} onClick={() => updateParams({ veg: pureVeg ? "" : "1" })} icon={Leaf}>
              Pure veg
            </FilterChip>
            {hasFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground">
                <X /> Clear all
              </Button>
            )}
          </div>
          {list.isSuccess && (
            <p className="text-sm font-medium text-muted-foreground" aria-live="polite">
              {total} {total === 1 ? "restaurant" : "restaurants"}
            </p>
          )}
        </div>

        {list.isError ? (
          <ErrorState error={list.error} onRetry={() => list.refetch()} title="Couldn't load restaurants" />
        ) : list.isPending ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 9 }, (_, i) => (
              <RestaurantCardSkeleton key={i} />
            ))}
          </div>
        ) : restaurants.length === 0 ? (
          <EmptyState
            icon={hasFilters ? SearchX : Store}
            title={hasFilters ? "No restaurants match your search" : "No restaurants yet"}
            description={hasFilters ? "Try a different name or remove some filters." : "Check back soon — new kitchens are joining every day."}
            action={hasFilters && <Button onClick={clearFilters}>Clear filters</Button>}
          />
        ) : (
          <>
            <div className={cn("grid gap-5 sm:grid-cols-2 lg:grid-cols-3", list.isPlaceholderData && "opacity-60 transition-opacity")}>
              {restaurants.map((r) => (
                <RestaurantCard key={r.id} restaurant={r} />
              ))}
            </div>
            {list.hasNextPage && (
              <div className="flex justify-center pt-2">
                <Button variant="outline" size="lg" onClick={() => list.fetchNextPage()} disabled={list.isFetchingNextPage}>
                  {list.isFetchingNextPage && <Loader2 className="animate-spin" />}
                  Show more restaurants
                </Button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
