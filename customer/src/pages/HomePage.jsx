import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Leaf, Loader2, Search, SearchX, Store, Timer, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState, ErrorState } from "@/components/States";
import { ScrollRow } from "@/components/ScrollRow";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { RestaurantCard, RestaurantCardSkeleton } from "@/features/restaurants/RestaurantCard";
import { RestaurantCarousel } from "@/features/restaurants/RestaurantCarousel";
import { useRestaurantList } from "@/features/restaurants/queries";
import { getSavedCity } from "@/lib/cityPref";
import { cn } from "@/lib/utils";

// Reuses the existing text search under the hood — clicking a category just
// searches for its label, same as typing it. No separate cuisine field exists
// on the restaurant API yet, so this piggybacks on whatever the backend's `q`
// search already matches (restaurant/dish names) rather than a real cuisine filter.
//
// `image` is intentionally left blank rather than hot-linked to scraped/stock
// photos (copyright + Google's thumbnail cache expires). Drop a real photo's
// path in here later — e.g. `image: "/categories/pizza.jpg"` — and it'll be
// used automatically; the emoji stays as an offline/broken-image fallback.
const CATEGORIES = [
  { label: "South Indian", emoji: "🥘", image: null },
  { label: "North Indian", emoji: "🍲", image: null },
  { label: "Pizza", emoji: "🍕", image: null },
  { label: "Burgers", emoji: "🍔", image: null },
  { label: "Chinese", emoji: "🥡", image: null },
  { label: "Desserts", emoji: "🍰", image: null },
  { label: "Beverages", emoji: "🥤", image: null },
];

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

function CategoryTile({ category, active, onClick }) {
  const [imgFailed, setImgFailed] = useState(false);
  const showImage = category.image && !imgFailed;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className="flex shrink-0 flex-col items-center gap-2 rounded-2xl px-1 py-1"
    >
      <span
        className={cn(
          "flex size-16 items-center justify-center overflow-hidden rounded-full bg-card text-2xl shadow-sm ring-2 transition-all",
          active ? "ring-primary" : "ring-transparent",
        )}
      >
        {showImage ? (
          <img
            src={category.image}
            alt=""
            onError={() => setImgFailed(true)}
            className="size-full object-cover"
          />
        ) : (
          category.emoji
        )}
      </span>
      <span className={cn("text-xs font-semibold", active ? "text-primary" : "text-foreground/80")}>{category.label}</span>
    </button>
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

  // If we arrived at "/" with no city in the URL (e.g. a fresh tab, not via
  // the header's picker), fall back to whatever city was last chosen there.
  useEffect(() => {
    if (!params.get("city")) {
      const saved = getSavedCity();
      if (saved) updateParams({ city: saved });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const searchActive = Boolean(urlQuery);
  const baseFilters = { city, openOnly, pureVeg };
  const filters = { ...baseFilters, q: urlQuery };

  const list = useRestaurantList(filters);
  const restaurants = list.data?.pages.flatMap((p) => p.items) ?? [];
  const total = list.data?.pages[0]?.totalElements ?? 0;
  const hasFilters = Boolean(urlQuery || city || openOnly || pureVeg);

  // Auto-load the next page once the sentinel below the grid scrolls into view,
  // instead of making the person click a "Show more" button every time.
  const sentinelRef = useRef(null);
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && list.hasNextPage && !list.isFetchingNextPage) {
          list.fetchNextPage();
        }
      },
      { rootMargin: "600px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [list.hasNextPage, list.isFetchingNextPage, list.fetchNextPage]);

  const clearFilters = () => {
    setSearch("");
    setParams({}, { replace: true });
  };

  return (
    <div className="space-y-10">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-[#8f0000] px-6 py-10 text-primary-foreground shadow-lg sm:px-12 sm:py-14">
        <div aria-hidden className="pointer-events-none absolute -top-16 -right-10 size-64 rounded-full bg-white/10 blur-2xl" />
        <div aria-hidden className="pointer-events-none absolute -bottom-20 left-1/3 size-72 rounded-full bg-black/15 blur-3xl" />

        {/* Decorative accents: a wandering line plus a few floating food bubbles,
            echoing that "cutout photography + squiggle" brand-hero style without
            needing (or copying) actual product photography. */}
        <svg
          aria-hidden
          viewBox="0 0 800 400"
          preserveAspectRatio="none"
          className="pointer-events-none absolute inset-0 size-full opacity-20"
        >
          <path
            d="M -20 60 C 120 10, 160 140, 40 170 S -40 260, 90 300 S 260 200, 340 260"
            fill="none"
            stroke="#fde68a"
            strokeWidth="2"
          />
          <path
            d="M 560 20 C 700 60, 640 160, 760 190 S 640 320, 720 380"
            fill="none"
            stroke="#fde68a"
            strokeWidth="2"
          />
        </svg>
        <span aria-hidden className="pointer-events-none absolute top-6 right-10 hidden rotate-6 text-4xl drop-shadow-lg sm:block">
          🥟
        </span>
        <span aria-hidden className="pointer-events-none absolute right-24 bottom-8 hidden -rotate-12 text-4xl drop-shadow-lg sm:block">
          🍕
        </span>
        <span aria-hidden className="pointer-events-none absolute top-10 left-[38%] hidden -rotate-6 text-2xl opacity-70 sm:block">
          🌿
        </span>

        <div className="relative max-w-2xl space-y-5">
          <h1 className="text-3xl font-extrabold leading-tight tracking-tight sm:text-5xl">
            Hungry? Get it <span className="text-amber-200">fatafat.</span>
          </h1>
          <p className="text-base text-white/85 sm:text-lg">Fresh food from your favourite local kitchens, delivered to your door.</p>

          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3.5 size-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search restaurants, dishes…"
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
        </div>
      </section>

      <ScrollRow title="What's on your mind?">
        {CATEGORIES.map((c) => {
          const active = search.trim().toLowerCase() === c.label.toLowerCase();
          return (
            <CategoryTile key={c.label} category={c} active={active} onClick={() => setSearch(active ? "" : c.label)} />
          );
        })}
      </ScrollRow>

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
          {searchActive && list.isSuccess && (
            <p className="text-sm font-medium text-muted-foreground" aria-live="polite">
              {total} {total === 1 ? "restaurant" : "restaurants"}
            </p>
          )}
        </div>

        {!searchActive && <RestaurantCarousel title={city ? `Restaurants near you in ${city}` : "Restaurants near you"} filters={baseFilters} />}

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
            {!searchActive && <h2 className="text-lg font-bold">All restaurants</h2>}
            <div className={cn("grid gap-5 sm:grid-cols-2 lg:grid-cols-3", list.isPlaceholderData && "opacity-60 transition-opacity")}>
              {restaurants.map((r) => (
                <RestaurantCard key={r.id} restaurant={r} />
              ))}
            </div>
            {/* Invisible sentinel — scrolling it into view triggers the next page automatically. */}
            <div ref={sentinelRef} aria-hidden className="h-px" />
            {list.isFetchingNextPage && (
              <div className="flex justify-center py-2">
                <Loader2 className="size-5 animate-spin text-muted-foreground" />
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}