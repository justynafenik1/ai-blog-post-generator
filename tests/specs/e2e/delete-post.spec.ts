import { test, expect } from "../../fixtures/fixtures";

test.describe("Deleting post", () => {
  /**
   * Runs before each test to ensure the blog page is fully loaded and generate test post
   */
  let keyword = "letter";

  test.beforeEach(async ({ blogPage, postGeneration }) => {
    await blogPage.pageIsLoaded();
    await postGeneration.addPost(keyword);
  });

  /**
   * This test verifies that a post with a given keyword can be deleted successfully.
   */
  test("TC-E2E-09: Delete post successfully", async ({
    postList,
    postDelete,
  }) => {
    await postDelete.clickDeletePost(keyword);
    await postDelete.confirmDeleteOnPopup();
    await postDelete.expectPostDeletedToastVisible();

    const data = await postList.getPostsDataByKeyword(keyword);
    expect(data.length).toBe(0);
  });

  /**
   * This test checks that cancelling the delete action does not remove the post.
   */
  test("TC-E2E-10: Cancel deletion", async ({ postList, postDelete }) => {
    await postDelete.clickDeletePost(keyword);
    await postDelete.cancelDeleteOnPopup();
    await postList.verifyAddedPostData(keyword, []);
  });
});
