import { Link } from "react-router-dom";
import { Clock, MapPin, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { FoodTypeMark } from "@/components/FoodTypeMark";
import { SmartImage } from "@/components/SmartImage";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

export function RestaurantCard({ restaurant }) {
  const { id, name, isOpen, street, city, imageUrl, startingPrice, avgPrepTimeMinutes, pureVeg } = restaurant;
  const location = [street, city].filter(Boolean).join(", ");

  return (
    <Link
      to={`/restaurants/${id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border bg-card shadow-xs transition-all hover:-translate-y-0.5 hover:shadow-lg focus-visible:ring-[3px] focus-visible:ring-ring/40 focus-visible:outline-none"
    >
      <div className="relative">
        <SmartImage
          src={imageUrl}
          name={name}
          width={640}
          height={400}
          className="aspect-[16/10] w-full"
          imgClassName={cn("transition-transform duration-500 group-hover:scale-105", !isOpen && "grayscale")}
        />
        {!isOpen && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <Badge variant="outline" className="border-white/40 bg-black/60 px-3 py-1 text-sm text-white">
              Closed right now
            </Badge>
          </div>
        )}
        {pureVeg && (
          <Badge variant="success" className="absolute top-3 left-3 shadow-sm">
            <FoodTypeMark type="VEG" /> Pure veg
          </Badge>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-center gap-2">
          <h3 className="line-clamp-1 text-lg font-bold leading-tight">{name}</h3>
          {restaurant.rating != null && (
            <span className="flex shrink-0 items-center gap-0.5 text-sm font-bold text-foreground">
              <Star className="size-3.5 fill-warning text-warning" />
              {restaurant.rating.toFixed(1)}
            </span>
          )}
        </div>
        {location && (
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="size-3.5 shrink-0" />
            <span className="line-clamp-1">{location}</span>
          </p>
        )}
        <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 pt-2 text-sm">
          {startingPrice != null && (
            <span className="font-semibold">
              From <span className="text-primary">{formatPrice(startingPrice)}</span>
            </span>
          )}
          {avgPrepTimeMinutes != null && (
            <span className="flex items-center gap-1 text-muted-foreground">
              <Clock className="size-3.5" />~{avgPrepTimeMinutes} min
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

export function RestaurantCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border bg-card">
      <Skeleton className="aspect-[16/10] w-full rounded-none" />
      <div className="space-y-3 p-4">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-1/3" />
      </div>
    </div>
  );
}
