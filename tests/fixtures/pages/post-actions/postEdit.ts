import { Page, expect } from "@playwright/test";
import { checkToast } from "../../commons";
import { createBlogLocators } from "../../locators/locators";
import { blogTexts } from "../../texts";

export class PostEdit {
  private locators: ReturnType<typeof createBlogLocators>;

  constructor(page: Page) {
    this.locators = createBlogLocators(page);
  }
  async expectPostUpdatedToastVisible() {
    await checkToast(this.locators.toastUpdated, blogTexts.postUpdated);
  }

  async clickEditPost(keyword: string) {
    await this.locators.postContainer
      .filter({ hasText: keyword })
      .locator(this.locators.btnEdit)
      .click();
  }
  async deleteTagFromPost(tag: string) {
    await this.locators.tagItem
      .filter({ hasText: tag })
      .locator(this.locators.removeTagButton)
      .click();
  }

  async addNewTag(tag: string) {
    await this.locators.newTagInput.fill(tag);
    await this.locators.addNewTagButton.click();
    expect(this.locators.editTagsList).toContainText(tag);
  }

  async editContent(newContent: string) {
    await this.locators.editContent.fill("");
    await this.locators.editContent.fill(newContent);
  }
  async editTitle(newTitle: string) {
    await this.locators.editTitle.fill("");
    await this.locators.editTitle.fill(newTitle);
  }

  async clickCancel() {
    await this.locators.btnEditCancel.click();
  }
  async clickSave() {
    await this.locators.btnEditSave.click();
  }
}
