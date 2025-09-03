import { test } from "../../../fixtures/fixtures";

test.describe("Editing title", () => {
  /**
   * Runs before each test to ensure the blog page is fully loaded.
   */

  test.beforeEach(async ({ blogPage }) => {
    await blogPage.pageIsLoaded();
  });

  /**
   * Edit the post title and verify the update is saved and reflected.
   */
  test.describe("TC-E2E-07: Edit post title", () => {
    let keyword = "actor";

    test.beforeEach(async ({ postGeneration }) => {
      await postGeneration.addPost(keyword);
    });

    test("should update post title successfully", async ({
      postEdit,
      postList,
    }) => {
      const updatedTitle = `This is new title for '${keyword}' keyword!`;

      await postEdit.clickEditPost(keyword);
      await postEdit.editTitle(updatedTitle);
      await postEdit.clickSave();
      await postEdit.expectPostUpdatedToastVisible();
      await postList.verifyAddedPostData(keyword, [], { title: updatedTitle });
    });
  });
});
