import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Utility functions for timezone-safe date operations
export function parseLocalDate(dateString: string): Date {
  // Parse date string in YYYY-MM-DD format as local date
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day); // month is 0-indexed
}

export function formatDateForDisplay(date: Date): string {
  // Format date as YYYY-MM-DD for consistent display
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function combineLocalDateTime(
  dateString: string,
  timeStr: string,
  timeFormat: "AM" | "PM"
): Date {
  const [hoursStr, minutesStr] = timeStr.split(":");
  let hours = Number.parseInt(hoursStr, 10);
  const minutes = Number.parseInt(minutesStr || "0", 10);

  if (timeFormat === "PM" && hours < 12) {
    hours += 12;
  } else if (timeFormat === "AM" && hours === 12) {
    hours = 0;
  }

  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day, hours, minutes, 0, 0);
}
