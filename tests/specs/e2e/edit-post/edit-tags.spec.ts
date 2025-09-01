import { test } from "../../../fixtures/fixtures";
import { BlogPage } from "../../../fixtures/pages/blogPage";

test.describe("Editing tags", () => {
  /**
   * Runs before each test to ensure the blog page is fully loaded.
   */

  test.beforeEach(async ({ blogPage }) => {
    await blogPage.pageIsLoaded();
  });

  test.describe("TC-E2E-04: Add tag to tagless post", () => {
    test.beforeEach(async ({ postGeneration }) => {

      await postGeneration.addPost("chair");

    });

    test("should add a tag to a post without tags", async ({
      postEdit,
      postList,
    }) => {
      await postEdit.clickEditPost("chair");
      await postEdit.addNewTag("furniture");
      await postEdit.clickSave();
      await postEdit.expectPostUpdatedToastVisible();
      await postList.verifyAddedPostData("chair", ["furniture"]);
    });
  });

  test.describe("TC-E2E-05: Remove tag from tagged post", () => {
    test.beforeEach(async ({ postGeneration }) => {
      await postGeneration.addPost("woman", ["human"]);

    });

    test("should remove tag from post", async ({ postEdit, postList }) => {
      await postEdit.clickEditPost("woman");
      await postEdit.deleteTagFromPost("human");
      await postEdit.clickSave();
      await postEdit.expectPostUpdatedToastVisible();
      await postList.verifyAddedPostData("woman", []);
    });
  });

  test.describe("TC-E2E-06: Add tag to tagged post", () => {
    test.beforeEach(async ({ postGeneration }) => {
      await postGeneration.addPost("pizza", ["food"]);

    });

    test("should add another tag to post", async ({ postEdit, postList }) => {
      await postEdit.clickEditPost("pizza");
      await postEdit.addNewTag("fastfood");
      await postEdit.clickSave();
      await postEdit.expectPostUpdatedToastVisible();
      await postList.verifyAddedPostData("pizza", ["food", "fastfood"]);
    });
  });
});
