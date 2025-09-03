import { expect, Locator, Page } from "@playwright/test";

export async function checkToast(toastLocator: Locator, expectedText: string) {
  await expect(toastLocator.filter({ hasText: expectedText })).toBeVisible();
}

/**
 * Formats a Date object into a string like "M/D/YYYY, h:mm:ss AM/PM".
 * @param date - The Date to format
 * @returns Formatted date string
 */
export async function formatDateForPost(
  dateInput: Date | string
): Promise<string> {
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: "Europe/Warsaw",
  };

  let date: Date;
  if (typeof dateInput === "string") {
    date = new Date(dateInput);
  } else {
    date = dateInput;
  }

  if (isNaN(date.getTime())) {
    return dateInput.toString();
  }

  return date.toLocaleString("pl-PL", options);
}

export function parsePostDate(dateStr: string): Date {
  const [datePart, timePart] = dateStr.split(', ');
  const [day, month, year] = datePart.split('.').map(Number);
  const [hour, minute, second] = timePart.split(':').map(Number);
  return new Date(year, month - 1, day, hour, minute, second);
}