import { formatClock } from "@/lib/format";

/** Human string for one day's shifts, e.g. "7:00 AM – 11:00 AM, 6:00 PM – 10:00 PM". */
export function hoursForDay(timings, day) {
  const slots = (timings ?? []).filter((t) => t.dayOfWeek === day);
  if (slots.length === 0) return null;
  return slots.map((t) => `${formatClock(t.openTime)} – ${formatClock(t.closeTime)}`).join(", ");
}
