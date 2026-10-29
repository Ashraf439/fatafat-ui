import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorState } from "@/components/States";
import { MenuItemCard } from "@/features/restaurants/MenuItemCard";
import { useWishlist } from "@/features/wishlist/queries";
import { WishlistButton } from "@/features/wishlist/WishlistButton";

export default function WishlistPage() {
  const wishlist = useWishlist();
  const items = wishlist.data ?? [];

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Wishlist</h1>
        <p className="text-sm text-muted-foreground">Dishes you've saved for later.</p>
      </div>

      {wishlist.isError ? (
        <ErrorState error={wishlist.error} onRetry={() => wishlist.refetch()} />
      ) : wishlist.isPending ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }, (_, i) => (
            <Skeleton key={i} className="aspect-square w-full rounded-xl" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="Nothing saved yet"
          description="Tap the heart on any dish to save it here for later."
          action={
            <Button asChild>
              <Link to="/">Browse restaurants</Link>
            </Button>
          }
        />
      ) : (
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {items.map((w) => {
              const item = {
                id: w.menuId,
                dishName: w.dishName,
                imageUrl: w.imageUrl,
                price: w.price,
                foodType: w.foodType,
              };
              const restaurant = { id: w.restaurantId, name: w.restaurantName };
              return (
                <div key={w.menuId} className="flex flex-col gap-2">
                  <MenuItemCard item={item} restaurant={restaurant} canOrder={w.restaurantOpen} />
                  <Link
                    to={`/restaurants/${w.restaurantId}`}
                    className="truncate text-xs font-medium text-muted-foreground hover:text-foreground hover:underline"
                  >
                    from {w.restaurantName}
                    {!w.restaurantOpen && " · currently closed"}
                  </Link>
                </div>
              );
            })}
          </div>
      )}
    </div>
  );
}