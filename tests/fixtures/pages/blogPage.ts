import { expect, Locator, Page } from "@playwright/test";
import { createBlogLocators } from "../locators";
import { blogTexts } from "../texts";
import { PostActions } from "./postActions";
import { PostGeneration } from "./postGenerate";

export class BlogPage {
  postActions: PostActions;
  postGeneration: PostGeneration;
  private locators;

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

