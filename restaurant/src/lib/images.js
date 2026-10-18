export function optimizedImage(url, { width, height } = {}) {
  if (!url || !url.includes("/upload/")) return url ?? null;
  const parts = ["c_fill", "q_auto", "f_auto"];
  if (width) parts.push(`w_${width}`);
  if (height) parts.push(`h_${height}`);
  return url.replace("/upload/", `/upload/${parts.join(",")}/`);
}