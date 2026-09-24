const inr = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 });
const inrWhole = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

/** ₹1,234 for whole amounts, ₹1,234.50 otherwise. */
export function formatPrice(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "";
  return Number.isInteger(n) ? inrWhole.format(n) : inr.format(n);
}

/** Parses an ISO string or a [y, m, d, h, mi, s] array (Jackson's timestamp mode) into a Date. */
export function toDate(value) {
  if (!value) return null;
  if (Array.isArray(value)) {
    const [y, mo, d, h = 0, mi = 0, s = 0] = value;
    return new Date(y, mo - 1, d, h, mi, s);
  }
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function formatDateTime(value) {
  const d = toDate(value);
  if (!d) return "";
  return d.toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
}

export function formatTimeOfDay(value) {
  const d = toDate(value);
  if (!d) return "";
  return d.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });
}

/** Accepts "HH:mm[:ss]" or a [h, m] array (whichever the backend serializes) -> "6:30 PM". */
export function formatClock(value) {
  let h;
  let m;
  if (Array.isArray(value)) [h, m] = value;
  else if (typeof value === "string") [h, m] = value.split(":").map(Number);
  else return "";
  if (!Number.isFinite(h) || !Number.isFinite(m)) return "";
  const suffix = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${suffix}`;
}

export const DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];

export function dayLabel(day) {
  return day.charAt(0) + day.slice(1).toLowerCase();
}

/** Backend DayOfWeek name for a JS Date. */
export function dayOfWeekName(date = new Date()) {
  return DAYS[(date.getDay() + 6) % 7];
}

export function plural(count, one, many = `${one}s`) {
  return `${count} ${count === 1 ? one : many}`;
}
