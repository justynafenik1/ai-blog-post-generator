import { Page, expect } from "@playwright/test";
import { createBlogLocators } from "../locators/locators";
import { checkToast, formatDateForPost } from "../commons";
import { blogTexts } from "../texts";

export class PostGeneration {
  private locators: ReturnType<typeof createBlogLocators>;

  constructor(page: Page) {
    this.locators = createBlogLocators(page);
  }

  async fillKeyword(keyword: string): Promise<void> {
    await this.locators.keywordInput.fill(keyword);
  }

  async checkTagsCheckbox(): Promise<void> {
    await this.locators.addTagsCheckbox.check();
  }

  async addTags(tags: string[]): Promise<void> {
    for (const tag of tags) {
      await this.locators.tagInput.fill(tag);
      await this.locators.addTagButton.click();
    }
  }

  async clickGeneratePostButton(): Promise<void> {
    await this.locators.generateButton.click();
  }

  async waitForPostLoaded() {
    await expect(this.locators.loader).toBeHidden({ timeout: 10000 });
  }

  /**
   * Enters the keyword and optional tags, then clicks the generate post button
   */
  async generatePostWithOptionalTags(
    keyword: string,
    tags?: string[]
  ): Promise<string> {
    await this.fillKeyword(keyword);
    if (tags) {
      await this.checkTagsCheckbox();
      await this.addTags(tags);
    }
    await this.clickGeneratePostButton();
    const generatedDate = await formatDateForPost(new Date());
    return generatedDate;
  }

  /**
   * Waits for the loader to appear and disappear, then checks if the post-added toast is shown
   */
  async expectPostAddedToastVisible(): Promise<void> {
    await checkToast(this.locators.toastAdded, blogTexts.postAdded);
  }
}
