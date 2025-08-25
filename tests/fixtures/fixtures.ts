import { test as base } from "@playwright/test";
import { BlogPage } from "./pages/blogPage";
import { createBlogLocators } from "./locators/locators";
import { PostDelete } from "./pages/post-actions/postDelete";
import { PostGeneration } from "./pages/post-actions/postGenerate";
import { PostList } from "./pages/post-actions/postList";
import { PostEdit } from "./pages/post-actions/postEdit";

type Fixtures = {
  locators: ReturnType<typeof createBlogLocators>;
  blogPage: BlogPage;
  postDelete: PostDelete;
  postEdit: PostEdit;
  postGeneration: PostGeneration;
  postList: PostList;
};

export const test = base.extend<Fixtures>({
  blogPage: async ({ page }, use) => {
    const blogPage = new BlogPage(page);
    await blogPage.navigate();
    await use(blogPage);
  },

  postDelete: async ({ page }, use) => {
    const postDelete = new PostDelete(page);
    await use(postDelete);
  },

  postEdit: async ({ page }, use) => {
    const postEdit = new PostEdit(page);
    await use(postEdit);
  },

  postGeneration: async ({ page }, use) => {
    const postGeneration = new PostGeneration(page);
    await use(postGeneration);
  },

  postList: async ({ page }, use) => {
    const postList = new PostList(page);
    await use(postList);
  },

  locators: async ({ page }, use) => {
    const locators = createBlogLocators(page);
    await use(locators);
  },
});
