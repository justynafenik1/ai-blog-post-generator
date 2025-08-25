import { expect, Locator, Page } from "@playwright/test";
import { createBlogLocators } from "../locators/locators";
import { blogTexts } from "../texts";
import { PostDelete } from "./post-actions/postDelete";
import { PostGeneration } from "./post-actions/postGenerate";
import { PostList } from "./post-actions/postList";
import { PostEdit } from "./post-actions/postEdit";

export class BlogPage {
  postDelete: PostDelete;
  postGeneration: PostGeneration;
  postList: PostList;
  postEdit: PostEdit;

  private locators: ReturnType<typeof createBlogLocators>;

  constructor(private page: Page) {
    this.locators = createBlogLocators(page);
    this.postGeneration = new PostGeneration(page);
  }

  async navigate() {
    await this.page.goto("/");
  }

  async pageIsLoaded() {
    await expect(
      this.locators.title.filter({ hasText: blogTexts.title })
    ).toBeVisible();
  }
}
