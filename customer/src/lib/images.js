/**
 * Adds Cloudinary delivery transformations (size, crop, auto quality/format) to an image URL.
 * Non-Cloudinary URLs are returned untouched, so it is always safe to call.
 */
export function optimizedImage(url, { width, height } = {}) {
  if (!url || !url.includes("/upload/")) return url ?? null;
  const parts = ["c_fill", "q_auto", "f_auto"];
  if (width) parts.push(`w_${width}`);
  if (height) parts.push(`h_${height}`);
  return url.replace("/upload/", `/upload/${parts.join(",")}/`);
}

/** Two-letter initials for placeholder tiles. */
export function initials(name = "") {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}
