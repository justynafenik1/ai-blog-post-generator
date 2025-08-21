import { Page, expect } from "@playwright/test";
import { checkToast } from "../commons";
import { createBlogLocators } from "../locators/locators";
import { blogTexts } from "../texts";

export class PostActions {
  private locators: ReturnType<typeof createBlogLocators>;

  constructor(page: Page) {
    this.locators = createBlogLocators(page);
  }
  async expectPostUpdatedToastVisible() {
    await checkToast(this.locators.toastAdded, blogTexts.postUpdated);
  }

  async expectPostDeletedToastVisible() {
    await checkToast(this.locators.toastAdded, blogTexts.postDeleted);
  }
}
