import { expect, Locator } from "@playwright/test";

export async function checkToast(toastLocator: Locator, expectedText: string) {
  await expect(toastLocator.filter({ hasText: expectedText })).toBeVisible();
}

/**
 * Formats a Date object into a string like "M/D/YYYY, h:mm:ss AM/PM".
 * @param date - The Date to format
 * @returns Formatted date string
 */
export async function formatDateForPost(date: Date): Promise<string> {
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: true,
  };
  return date.toLocaleString("en-US", options);
}
