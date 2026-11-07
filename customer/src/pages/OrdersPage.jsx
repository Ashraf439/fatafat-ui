import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Receipt } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorState } from "@/components/States";
import { SmartImage } from "@/components/SmartImage";
import { StatusBadge } from "@/features/orders/StatusBadge";
import { useOrders } from "@/features/orders/queries";
import { formatDateTime, formatPrice, plural } from "@/lib/format";
import { orderRef } from "@/lib/orderRef";

const DEFAULT_FILTERS = { sort: "date_desc", from: "", to: "" };

function pageItems(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i);
  const items = [0];
  const start = Math.max(1, current - 1);
  const end = Math.min(total - 2, current + 1);
  if (start > 1) items.push("gap-start");
  for (let i = start; i <= end; i++) items.push(i);
  if (end < total - 2) items.push("gap-end");
  items.push(total - 1);
  return items;
}

function Pagination({ page, totalPages, onChange }) {
  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-1">
      <Button variant="outline" size="sm" onClick={() => onChange(page - 1)} disabled={page <= 0} aria-label="Previous page">
        <ChevronLeft /> <span className="hidden sm:inline">Previous</span>
      </Button>
      {pageItems(page, totalPages).map((p) =>
        typeof p === "string" ? (
          <span key={p} className="px-1 text-sm text-muted-foreground" aria-hidden="true">…</span>
        ) : (
          <Button
            key={p}
            variant={p === page ? "default" : "outline"}
            size="sm"
            className={cn("min-w-8 px-2 tabular-nums", p !== page && "text-muted-foreground")}
            onClick={() => onChange(p)}
            aria-label={`Page ${p + 1}`}
            aria-current={p === page ? "page" : undefined}
          >
            {p + 1}
          </Button>
        ),
      )}
      <Button variant="outline" size="sm" onClick={() => onChange(page + 1)} disabled={page >= totalPages - 1} aria-label="Next page">
        <span className="hidden sm:inline">Next</span> <ChevronRight />
      </Button>
    </nav>
  );
}

export default function OrdersPage() {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [page, setPage] = useState(0);
  const orders = useOrders(filters, page);

  const items = orders.data?.items ?? [];
  const totalPages = orders.data?.totalPages ?? 0;
  const totalElements = orders.data?.totalElements ?? 0;
  const filtersActive = filters.sort !== "date_desc" || filters.from || filters.to;

  const updateFilters = (patch) => {
    setFilters((f) => ({ ...f, ...patch }));
    setPage(0);
  };
  const goToPage = (p) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const size = orders.data?.size ?? 10;
  const rangeStart = page * size + 1;
  const rangeEnd = page * size + items.length;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">My orders</h1>
        <p className="text-sm text-muted-foreground">Track current orders and revisit past ones.</p>
      </div>

      <div className="flex flex-wrap items-end gap-3 rounded-xl border bg-card p-3">
        <div className="flex flex-col gap-1">
          <label htmlFor="order-sort" className="text-xs font-medium text-muted-foreground">Sort by</label>
          <select id="order-sort" className="h-9 rounded-md border bg-background px-2 text-sm" value={filters.sort} onChange={(e) => updateFilters({ sort: e.target.value })}>
            <option value="date_desc">Newest first</option>
            <option value="date_asc">Oldest first</option>
            <option value="name_asc">Restaurant A–Z</option>
            <option value="name_desc">Restaurant Z–A</option>
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="order-from" className="text-xs font-medium text-muted-foreground">From</label>
          <input id="order-from" type="date" className="h-9 rounded-md border bg-background px-2 text-sm" value={filters.from} max={filters.to || undefined} onChange={(e) => updateFilters({ from: e.target.value })} />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="order-to" className="text-xs font-medium text-muted-foreground">To</label>
          <input id="order-to" type="date" className="h-9 rounded-md border bg-background px-2 text-sm" value={filters.to} min={filters.from || undefined} onChange={(e) => updateFilters({ to: e.target.value })} />
        </div>
        {filtersActive && (
          <Button variant="ghost" size="sm" onClick={() => updateFilters(DEFAULT_FILTERS)}>Reset</Button>
        )}
      </div>

      {orders.isError ? (
        <ErrorState error={orders.error} onRetry={() => orders.refetch()} />
      ) : orders.isPending ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }, (_, i) => (<Skeleton key={i} className="h-28 w-full" />))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="No orders yet"
          description="When you place an order it will show up here."
          action={<Button asChild><Link to="/">Find something to eat</Link></Button>}
        />
      ) : (
        <>
          <ul className={cn("space-y-3 transition-opacity", orders.isPlaceholderData && "opacity-60")}>
            {items.map((o) => (
              <li key={o.id}>
                <Link to={`/orders/${o.id}`} className="block rounded-xl focus-visible:ring-[3px] focus-visible:ring-ring/40 focus-visible:outline-none">
                  <Card className="flex items-center gap-4 p-4 transition-shadow hover:shadow-md">
                    <SmartImage src={o.restaurantImageUrl} name={o.restaurantName} width={160} height={160} className="size-16 shrink-0 rounded-xl" />
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="truncate font-bold">{o.restaurantName}</h2>
                        <StatusBadge status={o.status} />
                      </div>
                      <p className="font-mono text-xs font-medium text-muted-foreground">{orderRef(o)}</p>
                      <p className="line-clamp-1 text-sm text-muted-foreground">{o.itemsPreview.join(", ")}</p>
                      <p className="text-xs text-muted-foreground">{formatDateTime(o.placedAt)} · {plural(o.itemCount, "item")}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <span className="font-extrabold tabular-nums">{formatPrice(o.totalAmount)}</span>
                      <ChevronRight className="size-5 text-muted-foreground" />
                    </div>
                  </Card>
                </Link>
              </li>
            ))}
          </ul>
          {totalPages > 1 && (
            <div className="space-y-2">
              <Pagination page={page} totalPages={totalPages} onChange={goToPage} />
              <p className="text-center text-xs text-muted-foreground" aria-live="polite">
                Showing {rangeStart}–{rangeEnd} of {totalElements} orders
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}