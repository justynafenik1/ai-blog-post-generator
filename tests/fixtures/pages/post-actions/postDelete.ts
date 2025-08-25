import { Page, expect } from "@playwright/test";
import { checkToast } from "../../commons";
import { createBlogLocators } from "../../locators/locators";
import { blogTexts } from "../../texts";

export class PostDelete {
  private locators: ReturnType<typeof createBlogLocators>;

  constructor(page: Page) {
    this.locators = createBlogLocators(page);
  }

  async expectPostDeletedToastVisible() {
    await checkToast(this.locators.toastDeleted, blogTexts.postDeleted);
  }
}
