import { expect } from "@playwright/test";
import { test } from "../../fixtures/fixtures";

test.describe("Adding posts", () => {
  /**
   * Runs before each test to ensure the blog page is fully loaded.
   */
  test.beforeEach(async ({ blogPage }) => {
    await blogPage.pageIsLoaded();
  });

  /**
   * Test that verifies a post can be added successfully with optional tags.
   * - Generates a post with keyword and tags
   * - Waits for post generation to complete and verifies toast notification
   * - Verifies the added post contains expected title, content, tags, and correct date
   */
  test("TC-E2E-01: adds post with optional tags successfully", async ({
    postGeneration,
    postList,
  }) => {
    const postGeneratedDate = await postGeneration.addPost("watermelon", [
      "fruits",
      "food",
    ]);
    await postList.verifyAddedPostData("watermelon", ["fruits", "food"], {
      title: "watermelon",
      content: "watermelon",
      tags: ["fruits", "food"],
      timestamp: postGeneratedDate,
    });
  });

  /**
   * Test that verifies a post can be added successfully without optional tags.
   * - Generates a post with the keyword without tags
   * - Waits for post generation to complete and verifies toast notification
   * - Verifies the added post contains expected title, content and correct date
   */
  test("TC-E2E-02: adds post without optional tags successfully", async ({
    postGeneration,
    postList,
  }) => {
    const postGeneratedDate = await postGeneration.addPost("dog");

    await postList.verifyAddedPostData("dog", [], {
      title: "dog",
      content: "dog",
      timestamp: postGeneratedDate,
    });
  });

  /**
   * Test that verifies two post with the same keyword can be added successfully with different titles and contents
   * - Generates 2 posts with the same keyword
   * - Verifies the added posts contain different titles and contents
   */
  test("TC-E2E-03:** adds two posts with the same keyword", async ({
    postGeneration,
    postList,
  }) => {
    const keyword = "potato";

    await postGeneration.addPost(keyword);
    await postGeneration.addPost(keyword);
    const data = await postList.getPostsDataByKeyword(keyword);
    expect(data.length).toBeGreaterThanOrEqual(2);

    expect(
      data[0].title !== data[1].title || data[0].content !== data[1].content
    ).toBe(true);
  });
});
