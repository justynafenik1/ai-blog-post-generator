import { expect, Locator} from "@playwright/test";

export async function checkToast(toastLocator: Locator, expectedText: string) {
    await expect(toastLocator.filter({ hasText: expectedText })).toBeVisible()
 

}
