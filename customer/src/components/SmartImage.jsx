import { useState } from "react";
import { cn } from "@/lib/utils";
import { initials, optimizedImage } from "@/lib/images";

/**
 * <img> with Cloudinary optimisation, lazy loading, and a tinted initials tile when there is no
 * image or it fails to load. Fills its parent; size the parent.
 */
export function SmartImage({ src, alt, name, width, height, className, imgClassName }) {
  const [failedSrc, setFailedSrc] = useState(null);
  const optimized = optimizedImage(src, { width, height });
  const showFallback = !optimized || failedSrc === optimized;

  return (
    <div className={cn("relative overflow-hidden bg-secondary", className)}>
      {showFallback ? (
        <div className="flex size-full items-center justify-center bg-gradient-to-br from-accent to-secondary text-2xl font-extrabold text-primary/60">
          {initials(name ?? alt ?? "")}
        </div>
      ) : (
        <img
          src={optimized}
          alt={alt ?? name ?? ""}
          loading="lazy"
          decoding="async"
          onError={() => setFailedSrc(optimized)}
          className={cn("size-full object-cover", imgClassName)}
        />
      )}
    </div>
  );
}
