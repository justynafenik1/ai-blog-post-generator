import { Page, expect } from "@playwright/test";
import { checkToast } from "../../commons";
import { createBlogLocators } from "../../locators/locators";

export class PostFilters {
  private locators: ReturnType<typeof createBlogLocators>;
  private page: Page;

  constructor(page: Page) {
    this.locators = createBlogLocators(page);
  }

  async sortPosts(order: "newest" | "oldest") {
    await this.locators.sortOrder.selectOption(order);
    const selectedOption = this.locators.sortOrder.locator("option:checked");
    await expect(selectedOption).toHaveText(
      order === "newest" ? "Newest" : "Oldest"
    );
  }

  async verifyPostOrder(expectedOrder: { title: string; timestamp: string }[]) {
    const postElements = this.locators.postContainer;
    const count = await postElements.count();

    expect(count).toBeGreaterThanOrEqual(expectedOrder.length);

    for (let i = 0; i < expectedOrder.length; i++) {
      const post = postElements.nth(i);

      const titleLocator = post.locator(this.locators.postTitle);
      const timestampLocator = post.locator(this.locators.postDate);

      const actualTitle = (await titleLocator.textContent())?.trim() ?? "";
      const actualTimestamp =
        (await timestampLocator.textContent())?.trim() ?? "";

      expect(actualTitle.toLowerCase()).toContain(
        expectedOrder[i].title.toLowerCase()
      );

      expect(actualTimestamp).toBe(expectedOrder[i].timestamp);
    }
  }
}
