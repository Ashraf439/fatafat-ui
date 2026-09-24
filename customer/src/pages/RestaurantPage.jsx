import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Clock, MapPin, Search, ShoppingBag, Star, Store, UtensilsCrossed, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { EmptyState, ErrorState } from "@/components/States";
import { FoodTypeMark } from "@/components/FoodTypeMark";
import { SmartImage } from "@/components/SmartImage";
import { useCart } from "@/features/cart/useCart";
import { HoursDialog } from "@/features/restaurants/HoursDialog";
import { hoursForDay } from "@/features/restaurants/hours";
import { MenuItemRow } from "@/features/restaurants/MenuItemRow";
import { useRestaurant, useRestaurantMenu } from "@/features/restaurants/queries";
import { dayOfWeekName, formatPrice, plural } from "@/lib/format";
import { cn } from "@/lib/utils";

function PageSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-56 w-full rounded-3xl" />
      <Skeleton className="h-8 w-1/2" />
      <Skeleton className="h-5 w-1/3" />
      <div className="space-y-4 pt-6">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-28 w-full" />
        ))}
      </div>
    </div>
  );
}

export default function RestaurantPage() {
  const { id } = useParams();
  const detail = useRestaurant(id);
  const menu = useRestaurantMenu(id);
  const { cart, count, subtotal, setOpen } = useCart();

  const [search, setSearch] = useState("");
  const [vegOnly, setVegOnly] = useState(false);

  const sections = useMemo(() => {
    const term = search.trim().toLowerCase();
    return Object.entries(menu.data?.categories ?? {})
      .map(([category, items]) => ({
        category,
        items: items.filter(
          (i) =>
            (!vegOnly || i.foodType === "VEG") &&
            (!term || i.dishName.toLowerCase().includes(term) || (i.description ?? "").toLowerCase().includes(term)),
        ),
      }))
      .filter((s) => s.items.length > 0);
  }, [menu.data, search, vegOnly]);

  if (detail.isPending || menu.isPending) return <PageSkeleton />;

  const failure = detail.error ?? menu.error;
  if (failure) {
    return failure.status === 404 ? (
      <EmptyState
        icon={Store}
        title="Restaurant not found"
        description="It may have been removed or isn't taking orders yet."
        action={
          <Button asChild>
            <Link to="/">Browse restaurants</Link>
          </Button>
        }
      />
    ) : (
      <ErrorState
        error={failure}
        title="Couldn't load this restaurant"
        onRetry={() => {
          detail.refetch();
          menu.refetch();
        }}
      />
    );
  }

  const r = detail.data;
  const canOrder = Boolean(r.isOpen);
  const restaurantRef = { id: r.id, name: r.name, imageUrl: r.imageUrl };
  const address = [r.street, r.landmark, r.city, r.pincode].filter(Boolean).join(", ");
  const todayHours = hoursForDay(r.timings, dayOfWeekName());
  const showCartBar = count > 0 && cart.restaurant?.id === r.id;
  const totalItems = Object.values(menu.data.categories).reduce((sum, items) => sum + items.length, 0);

  const scrollToCategory = (index) =>
    document.getElementById(`category-${index}`)?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <div className={cn("space-y-6", showCartBar && "pb-24")}>
      <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> All restaurants
      </Link>

      <header className="overflow-hidden rounded-3xl border bg-card shadow-xs">
        <div className="relative">
          <SmartImage
            src={r.imageUrl}
            name={r.name}
            width={1400}
            height={500}
            className="h-44 w-full sm:h-64"
            imgClassName={cn(!canOrder && "grayscale")}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-end justify-between gap-3 p-5 text-white sm:p-7">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl font-extrabold tracking-tight drop-shadow sm:text-4xl">{r.name}</h1>
              {r.rating != null && (
                <span className="flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 text-sm font-bold text-foreground shadow-sm">
                  <Star className="size-3.5 fill-warning text-warning" />
                  {r.rating.toFixed(1)}
                  {r.ratingCount != null && <span className="font-medium text-muted-foreground">({r.ratingCount})</span>}
                </span>
              )}
            </div>
            <Badge variant={canOrder ? "success" : "destructive"} className="text-sm">
              {canOrder ? "Open now" : "Closed"}
            </Badge>
          </div>
        </div>

        <div className="grid gap-3 p-5 text-sm sm:p-7">
          {address && (
            <p className="flex items-start gap-2 text-muted-foreground">
              <MapPin className="mt-0.5 size-4 shrink-0" /> {address}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            {r.startingPrice != null && (
              <span className="font-semibold">
                From <span className="text-primary">{formatPrice(r.startingPrice)}</span>
              </span>
            )}
            {r.avgPrepTimeMinutes != null && (
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Clock className="size-4" /> ~{r.avgPrepTimeMinutes} min
              </span>
            )}
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <UtensilsCrossed className="size-4" /> {plural(totalItems, "dish", "dishes")}
            </span>
            {r.pureVeg && (
              <Badge variant="success">
                <FoodTypeMark type="VEG" /> Pure veg
              </Badge>
            )}
          </div>
          {r.timings?.length > 0 && (
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="text-muted-foreground">
                Today: <span className="font-semibold text-foreground">{todayHours ?? "Closed"}</span>
              </span>
              <HoursDialog timings={r.timings} />
            </div>
          )}
        </div>
      </header>

      {!canOrder && (
        <div role="status" className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-medium text-amber-900">
          {r.name} is closed right now. You can browse the menu, but ordering is unavailable until it reopens.
        </div>
      )}

      <div className="sticky top-[var(--header-h)] z-30 -mx-4 space-y-3 border-b bg-background/90 px-4 py-3 backdrop-blur">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Search in ${r.name}`}
              aria-label="Search menu"
              className="pr-9 pl-9"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Clear search"
                className="absolute top-1/2 right-2.5 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Switch id="veg-only" checked={vegOnly} onCheckedChange={setVegOnly} />
            <Label htmlFor="veg-only" className="cursor-pointer">
              Veg only
            </Label>
          </div>
        </div>
        {sections.length > 1 && (
          <nav aria-label="Menu categories" className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1">
            {sections.map((s, index) => (
              <Button
                key={s.category}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => scrollToCategory(index)}
                className="h-8 shrink-0 rounded-full bg-card"
              >
                {s.category}
              </Button>
            ))}
          </nav>
        )}
      </div>

      {sections.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No dishes found"
          description={search || vegOnly ? "Try a different search or turn off the veg filter." : "This restaurant hasn't added its menu yet."}
          action={
            (search || vegOnly) && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearch("");
                  setVegOnly(false);
                }}
              >
                Reset filters
              </Button>
            )
          }
        />
      ) : (
        <div className="space-y-10">
          {sections.map((s, index) => (
            <section key={s.category} id={`category-${index}`} className="scroll-mt-44">
              <h2 className="mb-1 text-xl font-bold">
                {s.category} <span className="text-sm font-semibold text-muted-foreground">({s.items.length})</span>
              </h2>
              <div className="divide-y">
                {s.items.map((item) => (
                  <MenuItemRow key={item.id} item={item} restaurant={restaurantRef} canOrder={canOrder} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      {showCartBar && (
        <div className="fixed inset-x-0 bottom-0 z-40 p-3">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="mx-auto flex w-full max-w-2xl items-center justify-between rounded-2xl bg-primary px-5 py-4 text-primary-foreground shadow-xl transition-transform hover:scale-[1.01] active:scale-[0.99]"
          >
            <span className="flex items-center gap-2 font-bold">
              <ShoppingBag className="size-5" /> {plural(count, "item")}
            </span>
            <span className="font-bold">
              {formatPrice(subtotal)} · View cart
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
