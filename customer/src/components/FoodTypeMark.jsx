import { cn } from "@/lib/utils";

const STYLES = {
  VEG: { color: "border-green-600", dot: "bg-green-600", label: "Vegetarian" },
  NON_VEG: { color: "border-red-700", dot: "bg-red-700", label: "Non-vegetarian" },
  EGG: { color: "border-amber-500", dot: "bg-amber-500", label: "Contains egg" },
};

/** The standard Indian food-type marker: a bordered square with a coloured dot. */
export function FoodTypeMark({ type, size = "sm", className }) {
  const style = STYLES[type];
  if (!style) return null;
  const dims = size === "sm" ? "size-4" : "size-4.5";
  const dot = size === "sm" ? "size-1.5" : "size-2";
  return (
    <span
      role="img"
      aria-label={style.label}
      title={style.label}
      className={cn("inline-flex shrink-0 items-center justify-center rounded-[3px] border-2 bg-white", dims, style.color, className)}
    >
      <span className={cn("rounded-full", dot, style.dot)} />
    </span>
  );
}
