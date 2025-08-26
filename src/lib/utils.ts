import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Timezone helpers for Asia/Kolkata (IST, UTC+05:30)
export const IST_TIMEZONE = "Asia/Kolkata";

// Format a Date (or date string) in Asia/Kolkata using Intl.DateTimeFormat
export function formatInIST(
  date: Date | string,
  options: Intl.DateTimeFormatOptions
): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: IST_TIMEZONE,
    ...options,
  }).format(d);
}

// Convert a YYYY-MM-DD string to a Date object at midnight IST.
// We build an ISO string with explicit +05:30 offset to avoid local/UTC drift.
export function istDateFromYMD(ymd: string): Date {
  // Validate simple pattern
  // eslint-disable-next-line no-useless-escape
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ymd);
  if (!m) return new Date(ymd);
  const iso = `${m[1]}-${m[2]}-${m[3]}T00:00:00+05:30`;
  return new Date(iso);
}

// Convert a Date to YYYY-MM-DD string representing the calendar date in IST
export function ymdInIST(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: IST_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
    .formatToParts(d)
    .reduce<Record<string, string>>((acc, p) => {
      if (p.type !== "literal") acc[p.type] = p.value;
      return acc;
    }, {});
  return `${parts.year}-${parts.month}-${parts.day}`;
}

// Combine a YYYY-MM-DD date string and a 12-hour time string with AM/PM
// into a precise UTC Date that represents the intended IST wall-clock time.
export function combineISTDateTimeToUTC(
  ymd: string,
  timeStr: string,
  timeFormat: "AM" | "PM"
): Date {
  const [hStr, mStr] = (timeStr || "0:0").split(":");
  let hours = Number.parseInt(hStr || "0", 10);
  const minutes = Number.parseInt(mStr || "0", 10);

  if (timeFormat === "PM" && hours < 12) hours += 12;
  if (timeFormat === "AM" && hours === 12) hours = 0;

  const hh = hours.toString().padStart(2, "0");
  const mm = minutes.toString().padStart(2, "0");

  // Build ISO string with explicit IST offset so JS constructs the correct UTC instant
  const isoWithIST = `${ymd}T${hh}:${mm}:00+05:30`;
  return new Date(isoWithIST);
}

// Convenience formatters commonly used in the app
export function formatISTDateLabel(date: Date | string): string {
  return formatInIST(date, { day: "2-digit", month: "short", year: "numeric" });
}

export function formatISTTimeLabel(date: Date | string): string {
  return formatInIST(date, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}
