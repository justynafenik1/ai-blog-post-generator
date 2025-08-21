import { expect, Locator, Page } from "@playwright/test";
import { createBlogLocators } from "../locators/locators";

type postData = {
  title?: string;
  tags?: string[];
  content?: string;
  timestamp?: string;
};

export class PostList {
  private locators: ReturnType<typeof createBlogLocators>;

  constructor(page: Page) {
    this.locators = createBlogLocators(page);
  }

  /**
   * Helper to filtering posts by keyword and tags
   */
  private filterPostsByKeywordAndTags(
    keyword: string,
    tagsFilter: string[]
  ): Locator {
    let posts = this.locators.postContainer.filter({ hasText: keyword });
    if (tagsFilter.length > 0) {
      for (const tag of tagsFilter) {
        posts = posts.filter({
          has: this.locators.postTag.filter({ hasText: tag }),
        });
      }
    }
    return posts;
  }

  /**
   * Verify post fields based on keyword, filtered tags, and expected values.
   * @param keyword - text to filter posts
   * @param tagsFilter - tags to filter posts
   * @param filters - expected post field values (title, tags, content, time)
   */
  async verifyAddedPostData(
    keyword: string,
    tagsFilter: string[] = [],
    filters: postData
  ): Promise<void> {
    for (const key in filters) {
      const posts = this.filterPostsByKeywordAndTags(keyword, tagsFilter);

      const count = await posts.count();
      expect(
        count,
        `No posts found with keyword "${keyword}" and tags [${tagsFilter.join(
          ", "
        )}]`
      ).toBeGreaterThan(0);

      const expected = filters[key as keyof postData];
      if (expected === undefined || expected === null) continue;

      if (key === "tags") {
        const expectedTags = expected as string[];
        const match = await this.verifyTags(keyword, tagsFilter, expectedTags);
        expect(
          match,
          `Tags verification failed. Expected: [${expectedTags.join(", ")}]`
        ).toBe(true);
      } else {
        const found = await this.verifySingleField(
          keyword,
          tagsFilter,
          `.${key}`,
          expected as string
        );
        expect(
          found,
          `Field "${key}" verification failed. Expected: "${expected}"`
        ).toBe(true);
      }
    }
  }

  /**
   * Check if any filtered post contains expectedText in given field selector.
   */
  private async verifySingleField(
    keyword: string,
    tagsFilter: string[] = [],
    selector: string,
    expectedText: string
  ): Promise<boolean> {
    const posts = this.filterPostsByKeywordAndTags(keyword, tagsFilter);
    const count = await posts.count();
    for (let i = 0; i < count; i++) {
      const post = posts.nth(i);
      const text = (await post.locator(selector).textContent()) ?? "";
      if (text.includes(expectedText)) return true;
    }
    return false;
  }

  /**
   * Verify that filtered posts include all expected tags.
   */
  private async verifyTags(
    keyword: string,
    tagsFilter: string[] = [],
    expectedTags: string[]
  ): Promise<boolean> {
    const posts = this.filterPostsByKeywordAndTags(keyword, tagsFilter);
    const postCount = await posts.count();

    for (let i = 0; i < postCount; i++) {
      const post = posts.nth(i);
      const tagLocator = post.locator(this.locators.postTag);
      const tagCount = await tagLocator.count();

      const actualTags: string[] = [];
      for (let j = 0; j < tagCount; j++) {
        const tagElement = tagLocator.nth(j);
        const tagText =
          (await tagElement.textContent())?.trim().toLowerCase() ?? "";
        if (tagText) {
          actualTags.push(tagText);
        }
      }

      const allTagsMatch = expectedTags.every((expectedTag) =>
        actualTags.includes(expectedTag.toLowerCase())
      );

      if (allTagsMatch) {
        return true;
      }
    }
    return false;
  }
}
