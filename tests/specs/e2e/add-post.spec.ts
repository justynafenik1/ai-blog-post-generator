import { test } from "../../fixtures/fixtures";

test.describe("Adding posts", () => {
  /**
   * Runs before each test to ensure the blog page is fully loaded.
   */
  test.beforeEach(async ({ blogPage }) => {
    await blogPage.pageIsLoaded();
  });

  /**
   * Test that verifies a post can be added successfully without optional tags.
   * - Generates a post with the keyword without tags
   * - Waits for post generation to complete and verifies toast notification
   * - Verifies the added post contains expected title, content and correct date
   */
  test("adds post without optional tags successfully", async ({
    postGeneration,
    postList,
  }) => {
    const postGeneratedDate = await postGeneration.generatePostWithOptionalTags(
      "dogs"
    );
    await postGeneration.waitForPostLoaded();
    await postGeneration.expectPostAddedToastVisible();

    await postList.verifyAddedPostData("dogs", [], {
      title: "dogs",
      content: "dogs",
      timestamp: postGeneratedDate,
    });
  });

  /**
   * Test that verifies a post can be added successfully with optional tags.
   * - Generates a post with keyword and tags 
   * - Waits for post generation to complete and verifies toast notification
   * - Verifies the added post contains expected title, content, tags, and correct date
   */
  test("adds post with optional tags successfully", async ({
    postGeneration,
    postList,
  }) => {
    const postGeneratedDate = await postGeneration.generatePostWithOptionalTags(
      "watermelon",
      ["fruits", "food"]
    );

    await postGeneration.waitForPostLoaded();
    await postGeneration.expectPostAddedToastVisible();

    await postList.verifyAddedPostData("watermelon", ["fruits", "food"], {
      title: "watermelon",
      content: "watermelon",
      tags: ["fruits", "food"],
      timestamp: postGeneratedDate,
    });
    
  });
});
