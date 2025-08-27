import { Page, expect } from "@playwright/test";
import { checkToast } from "../../commons";
import { createBlogLocators } from "../../locators/locators";
import { blogTexts } from "../../texts";

export class PostDelete {
  private locators: ReturnType<typeof createBlogLocators>;

  constructor(page: Page) {
    this.locators = createBlogLocators(page);
  }

  async clickDeletePost(keyword: string) {
    await this.locators.postContainer
      .filter({ hasText: keyword })
      .locator(this.locators.btnDelete)
      .click();
  }

  async confirmDeleteOnPopup() {
    await this.locators.deleteConfirmModal
      .locator(this.locators.confirmOk)
      .click();
  }

  async cancelDeleteOnPopup() {
    await this.locators.deleteConfirmModal
      .locator(this.locators.confirmCancel)
      .click();
  }
  
  async expectPostDeletedToastVisible() {
    await checkToast(this.locators.toastDeleted, blogTexts.postDeleted);
  }
}
