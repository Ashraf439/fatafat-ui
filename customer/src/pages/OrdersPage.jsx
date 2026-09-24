import { Link } from "react-router-dom";
import { ChevronRight, Loader2, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorState } from "@/components/States";
import { SmartImage } from "@/components/SmartImage";
import { StatusBadge } from "@/features/orders/StatusBadge";
import { useOrders } from "@/features/orders/queries";
import { formatDateTime, formatPrice, plural } from "@/lib/format";

export default function OrdersPage() {
  const orders = useOrders();
  const items = orders.data?.pages.flatMap((p) => p.items) ?? [];

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">My orders</h1>
        <p className="text-sm text-muted-foreground">Track current orders and revisit past ones.</p>
      </div>

      {orders.isError ? (
        <ErrorState error={orders.error} onRetry={() => orders.refetch()} />
      ) : orders.isPending ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="No orders yet"
          description="When you place an order it will show up here."
          action={
            <Button asChild>
              <Link to="/">Find something to eat</Link>
            </Button>
          }
        />
      ) : (
        <>
          <ul className="space-y-3">
            {items.map((o) => (
              <li key={o.id}>
                <Link
                  to={`/orders/${o.id}`}
                  className="block rounded-xl focus-visible:ring-[3px] focus-visible:ring-ring/40 focus-visible:outline-none"
                >
                  <Card className="flex items-center gap-4 p-4 transition-shadow hover:shadow-md">
                    <SmartImage src={o.restaurantImageUrl} name={o.restaurantName} width={160} height={160} className="size-16 shrink-0 rounded-xl" />
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="truncate font-bold">{o.restaurantName}</h2>
                        <StatusBadge status={o.status} />
                      </div>
                      <p className="line-clamp-1 text-sm text-muted-foreground">{o.itemsPreview.join(", ")}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDateTime(o.placedAt)} · {plural(o.itemCount, "item")}
                      </p>
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
          {orders.hasNextPage && (
            <div className="flex justify-center">
              <Button variant="outline" onClick={() => orders.fetchNextPage()} disabled={orders.isFetchingNextPage}>
                {orders.isFetchingNextPage && <Loader2 className="animate-spin" />} Load older orders
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
