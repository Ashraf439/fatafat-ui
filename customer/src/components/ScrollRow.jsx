import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * A titled, horizontally scrollable row with left/right arrow buttons that
 * disable at the ends — the "What's on your mind?" / restaurant-carousel
 * pattern. Just lay out children as a flex row; this handles the scrolling.
 */
export function ScrollRow({ title, action, children, className }) {
  const trackRef = useRef(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  const updateArrows = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 4);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    updateArrows();
    const el = trackRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateArrows, { passive: true });
    window.addEventListener("resize", updateArrows);
    return () => {
      el.removeEventListener("scroll", updateArrows);
      window.removeEventListener("resize", updateArrows);
    };
    // Re-measure whenever the row's content changes (e.g. skeletons -> real cards).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updateArrows, children]);

  const scrollBy = (dir) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: "smooth" });
  };

  return (
    <section className={className}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold">{title}</h2>
        <div className="flex items-center gap-2">
          {action}
          <div className="hidden items-center gap-1.5 sm:flex">
            <button
              type="button"
              onClick={() => scrollBy(-1)}
              disabled={!canLeft}
              aria-label="Scroll left"
              className="flex size-8 items-center justify-center rounded-full border bg-card text-muted-foreground transition-colors enabled:hover:bg-accent enabled:hover:text-foreground disabled:opacity-40"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => scrollBy(1)}
              disabled={!canRight}
              aria-label="Scroll right"
              className="flex size-8 items-center justify-center rounded-full border bg-card text-muted-foreground transition-colors enabled:hover:bg-accent enabled:hover:text-foreground disabled:opacity-40"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      </div>
      <div
        ref={trackRef}
        className={cn(
          "-mx-1 flex gap-4 overflow-x-auto scroll-smooth px-1 pb-1",
          "[scrollbar-none] [&::-webkit-scrollbar]:hidden",
        )}
      >
        {children}
      </div>
    </section>
  );
}