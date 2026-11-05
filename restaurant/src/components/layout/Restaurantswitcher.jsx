import { useEffect, useState } from "react";
import { Check, ChevronsUpDown, Lock, Plus, Store } from "lucide-react";
import { NavLink } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { listMyRestaurants } from "../../api/restaurant";
import { getEntitlement } from "../../api/onboarding";
import { getSelectedRestaurantId, setSelectedRestaurantId } from "../../lib/restaurantSelection";
import { useAuth } from "../../context/AuthContext";

// Only true owners (role RESTAURANT) can own more than one restaurant — staff/managers
// are always scoped to the single restaurant they were added to.
export function RestaurantSwitcher() {
  const { account } = useAuth();
  const isOwner = Boolean(account?.roles?.includes("RESTAURANT"));

  const [restaurants, setRestaurants] = useState(null);
  const [entitlement, setEntitlement] = useState(null); // { paid, quota, used }

  useEffect(() => {
    if (!isOwner) return;
    listMyRestaurants()
      .then((list) => {
        setRestaurants(list);
        const current = getSelectedRestaurantId();
        if (list.length > 0 && !list.some((r) => r.id === current)) {
          // Nothing selected yet, or the stored pick no longer belongs to this account.
          setSelectedRestaurantId(list[0].id);
        }
      })
      .catch(() => setRestaurants([]));
    getEntitlement()
      .then(setEntitlement)
      .catch(() => setEntitlement(null));
  }, [isOwner]);

  if (!isOwner || restaurants === null) return null;

  const activeId = getSelectedRestaurantId();
  const active = restaurants.find((r) => r.id === activeId) || restaurants[0];
  const atLimit = entitlement ? entitlement.used >= entitlement.quota : false;

  function switchTo(id) {
    if (id === activeId) return;
    setSelectedRestaurantId(id);
    window.location.reload();
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
        >
          <Store className="size-4 text-muted-foreground" />
          <span className="max-w-28 truncate sm:max-w-44">{active?.name ?? "Restaurants"}</span>
          <ChevronsUpDown className="size-3.5 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        {restaurants.map((r) => (
          <DropdownMenuItem key={r.id} onClick={() => switchTo(r.id)} className="justify-between">
            <span className="truncate">
              {r.name}
              {r.city && <span className="ml-1 text-xs text-muted-foreground">· {r.city}</span>}
            </span>
            {r.id === activeId && <Check className="size-4 shrink-0 text-primary" />}
          </DropdownMenuItem>
        ))}
        {restaurants.length > 0 && <DropdownMenuSeparator />}

        {atLimit ? (
          <div className="flex items-center gap-2 px-2.5 py-2 text-xs text-muted-foreground">
            <Lock className="size-3.5 shrink-0" />
            Restaurant limit reached ({entitlement.used}/{entitlement.quota})
          </div>
        ) : (
          <DropdownMenuItem asChild>
            <NavLink to="/onboarding?new=1" className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-2">
                <Plus className="size-4" /> Add restaurant
              </span>
              {entitlement && (
                <span className="text-xs text-muted-foreground">
                  {entitlement.used}/{entitlement.quota}
                </span>
              )}
            </NavLink>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}