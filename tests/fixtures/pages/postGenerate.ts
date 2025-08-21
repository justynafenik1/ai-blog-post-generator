import { Page, expect } from "@playwright/test";
import { createBlogLocators } from "../locators";
import { checkToast } from "../commons";
import { blogTexts } from "../texts";

export class PostGeneration {
  private locators;

  constructor(page: Page) {
    this.locators = createBlogLocators(page);
  }

  async fillKeyword(keyword: string): Promise<void> {
    await this.locators.keywordInput.fill(keyword);
  }

  async fillTags(tags: string): Promise<void> {
    await this.locators.tagsInput.fill(tags);
  }

  async clickGeneratePostButton(): Promise<void> {
    await this.locators.generateButton.click();
  }

  async loaderIsVisible(): Promise<void> {
    await expect(this.locators.loader).toBeVisible({ timeout: 5000 });
  }

  async loaderIsHidden(): Promise<void> {
    await expect(this.locators.loader).toBeHidden({ timeout: 10000 });
  }
/**
 * Enters the keyword and optional tags, then clicks the generate post button
   */
  async generatePost(keyword: string, tags?: string): Promise<void> {
    await this.fillKeyword(keyword);
    if (tags) {
      await this.fillTags(tags);
    }
    await this.clickGeneratePostButton();
  }
/**
 * Waits for the loader to appear and disappear, then checks if the post-added toast is shown
   */
  async expectPostAddedToastVisible(): Promise<void> {
    await this.loaderIsVisible();
    await this.loaderIsHidden();
    await checkToast(this.locators.toastAdded, blogTexts.postAdded);
  }
}
