import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/features/auth/useAuth";
import { useIsWishlisted, useToggleWishlist } from "./queries";

export function WishlistButton({ item, restaurant, className }) {
  const { isAuthenticated } = useAuth();
  const inWishlist = useIsWishlisted(item.id);
  const toggle = useToggleWishlist();

  if (!isAuthenticated) return null;

  return (
    <button
      type="button"
      aria-label={inWishlist ? `Remove ${item.dishName} from wishlist` : `Add ${item.dishName} to wishlist`}
      aria-pressed={inWishlist}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle.mutate({ menuId: item.id, inWishlist, item, restaurant });
      }}
      className={cn(
        "flex size-7 items-center justify-center rounded-full bg-card/90 shadow-sm backdrop-blur transition-transform active:scale-90",
        className,
      )}
    >
      <Heart className={cn("size-4", inWishlist ? "fill-destructive text-destructive" : "text-muted-foreground")} />
    </button>
  );
}