import { test as base, expect as baseExpect  } from "@playwright/test";
import { BlogPage } from "./pages/blogPage";
import { createBlogLocators } from "./locators/locators";
import { PostDelete } from "./pages/post-actions/postDelete";
import { PostGeneration } from "./pages/post-actions/postGenerate";
import { PostList } from "./pages/post-actions/postList";
import { PostEdit } from "./pages/post-actions/postEdit";
import type { RequestInit, Response } from "node-fetch";
import { PostFilters } from "./pages/post-actions/postFilters";

const fetch = (...args: [string, RequestInit?]): Promise<Response> =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

type Fixtures = {
  locators: ReturnType<typeof createBlogLocators>;
  blogPage: BlogPage;
  postDelete: PostDelete;
  postEdit: PostEdit;
  postGeneration: PostGeneration;
  postList: PostList;
  postFilters: PostFilters;
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

  postFilters: async ({ page }, use) => {
    const postFilters = new PostFilters(page);
    await use(postFilters);
  },

  locators: async ({ page }, use) => {
    const locators = createBlogLocators(page);
    await use(locators);
  },
});

export { baseExpect as expect };

test.beforeEach(async ({ request }) => {
  await request.post('http://localhost:3000/test-reset');
  const res = await request.get('http://localhost:3000/history?page=1&pageSize=10');
  const data = await res.json();
  console.log('Items after reset:', data.items);
  baseExpect(data.total).toBe(0);
});