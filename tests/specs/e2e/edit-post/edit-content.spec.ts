import { test } from "../../../fixtures/fixtures";
import { BlogPage } from "../../../fixtures/pages/blogPage";

test.describe("Editing content", () => {
  /**
   * Runs before each test to ensure the blog page is fully loaded.
   */

  test.beforeEach(async ({ blogPage }) => {
    await blogPage.pageIsLoaded();
  });
  /**
   * This test checks that updating the content of a generated post is successful
   * and the changes are saved and reflected correctly.
   */
  test.describe("TC-E2E-08: Edit post content", () => {
    let keyword = "soap";

    test.beforeEach(async ({ postGeneration }) => {
      await postGeneration.generatePostWithOptionalTags(keyword);

      await postGeneration.waitForPostLoaded();
      await postGeneration.expectPostAddedToastVisible();
    });

    test("should update post content successfully", async ({
      postEdit,
      postList,
    }) => {
      const updatedContent = `This is new content for '${keyword}' keyword!`;

      await postEdit.clickEditPost(keyword);
      await postEdit.editContent(updatedContent);
      await postEdit.clickSave();
      await postEdit.expectPostUpdatedToastVisible();
      await postList.verifyAddedPostData(keyword, [], {
        content: updatedContent,
      });
    });
  });
});
