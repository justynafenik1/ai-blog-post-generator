import { test } from "../../../fixtures/fixtures";

test.describe("Sorting posts", () => {
  let firstPostDate: string;
  let secondPostDate: string;
  let thirdPostDate: string;
  /**
   * Runs before each test to ensure the blog page is fully loaded.
   */
  test.beforeEach(async ({ request, blogPage, postGeneration }) => {
    await request.post("http://localhost:3000/test-reset");
    await blogPage.pageIsLoaded();
    firstPostDate = await postGeneration.addPost("pizza", ["food"]);

    secondPostDate = await postGeneration.addPost("dog", ["pet"]);

    thirdPostDate = await postGeneration.addPost("tree", ["forest"]);
  });

    /**
   * This test verifies that the blog posts are sorted in descending order by their timestamps when the "newest" sort option is selected. It ensures that the most recent posts appear first.
   */
  test("TC-E2E-11: Sort by newest  ", async ({ postFilters }) => {
    await postFilters.sortPosts("newest");

    const expectedOrderNewest = [
      { title: "tree", timestamp: thirdPostDate },
      { title: "dog", timestamp: secondPostDate },
      { title: "pizza", timestamp: firstPostDate },
    ];

    await postFilters.verifyPostOrder(expectedOrderNewest);
  });

    /**
   * This test verifies that the blog posts are sorted in ascending order by their timestamps when the "oldest" sort option is selected. It ensures that the oldest posts appear first.
   */
  test("TC-E2E-12: Sort by oldest   ", async ({ postFilters }) => {
    await postFilters.sortPosts("oldest");

    const expectedOrderOldest = [
      { title: "pizza", timestamp: firstPostDate },
      { title: "dog", timestamp: secondPostDate },
      { title: "tree", timestamp: thirdPostDate },
    ];

    await postFilters.verifyPostOrder(expectedOrderOldest);
  });
});
