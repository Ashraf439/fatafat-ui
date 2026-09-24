import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useCart } from "./useCart";

/** Shown when the customer adds a dish from a different restaurant than the one in their cart. */
export function CartConflictDialog() {
  const { conflict, cart, resolveConflict } = useCart();

  return (
    <Dialog open={Boolean(conflict)} onOpenChange={(open) => !open && resolveConflict(false)}>
      <DialogContent showClose={false}>
        <DialogHeader>
          <DialogTitle>Start a new cart?</DialogTitle>
          <DialogDescription>
            Your cart has items from <strong>{cart.restaurant?.name}</strong>. Adding{" "}
            <strong>{conflict?.item.dishName}</strong> from <strong>{conflict?.restaurant.name}</strong> will clear it.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => resolveConflict(false)}>
            Keep current cart
          </Button>
          <Button onClick={() => resolveConflict(true)}>Start new cart</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
