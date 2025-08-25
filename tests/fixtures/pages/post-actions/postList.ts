import { expect, Locator, Page } from "@playwright/test";
import { createBlogLocators } from "../../locators/locators";

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
   * Verifies that posts matching the keyword contain the expected fields and tags.
   * Skips undefined or null expected values.
   * Uses exact tag verification and substring match for other fields.
   *
   * @param keyword - Keyword to filter posts.
   * @param tagsFilter - Tags used in tag verification.
   * @param filters - Expected post data fields to verify.
   */
  async verifyAddedPostData(
    keyword: string,
    tagsFilter: string[] = [],
    filters?: Partial<postData>
  ): Promise<void> {
    const posts = await this.getPostsDataByKeyword(keyword);
    expect(posts.length).toBeGreaterThan(0);

    if (!filters) return; // jeśli filters nie jest podane, pomijamy dalszą weryfikację

    for (const key in filters) {
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
        const found = posts.some((post) => {
          const val = (post as any)[key];
          return (
            val !== undefined &&
            val.toLowerCase().includes((expected as string).toLowerCase())
          );
        });
        expect(
          found,
          `Field "${key}" verification failed. Expected to include: "${expected}"`
        ).toBe(true);
      }
    }
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

    if (expectedTags.length === 0) {
      for (let i = 0; i < postCount; i++) {
        const post = posts.nth(i);
        const tagLocator = post.locator(this.locators.postTag);
        const tagCount = await tagLocator.count();
        if (tagCount > 0) {
          return false;
        }
      }
      return true;
    }

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

  /**
   * Retrieves post data filtered by keyword.
   * Extracts title, content, and optionally timestamp if present.
   *
   * @param keyword - Keyword to filter posts.
   * @returns Array of posts with title, content, and optional timestamp.
   */
  async getPostsDataByKeyword(
    keyword: string
  ): Promise<{ title: string; content: string; timestamp?: string }[]> {
    const posts = this.filterPostsByKeywordAndTags(keyword, []);
    const count = await posts.count();
    const data: { title: string; content: string; timestamp?: string }[] = [];

    for (let i = 0; i < count; i++) {
      const post = posts.nth(i);
      const title = (await post.locator(".title").textContent()) ?? "";
      const content = (await post.locator(".content").textContent()) ?? "";

      let timestamp: string | undefined;
      const timestampLocator = post.locator(".timestamp");
      if ((await timestampLocator.count()) > 0) {
        timestamp = (await timestampLocator.textContent())?.trim() ?? undefined;
      }

      data.push({ title, content, ...(timestamp ? { timestamp } : {}) });
    }
    return data;
  }
}
