import { test as base } from "@playwright/test";
import { BlogPage } from "./pages/blogPage";
import { createBlogLocators } from "./locators";
import { PostActions } from "./pages/postActions";
import { PostGeneration } from "./pages/postGenerate";

type Fixtures = {
  locators: ReturnType<typeof createBlogLocators>;
  blogPage: BlogPage;
  postActions: PostActions;
  postGeneration: PostGeneration;
};

export const test = base.extend<Fixtures>({
  blogPage: async ({ page }, use) => {
    const blogPage = new BlogPage(page);
    await blogPage.navigate();
    await use(blogPage);
  },


  postActions: async ({ page }, use) => {
    const postActions = new PostActions(page);
    await use(postActions);
  },

 
  postGeneration: async ({ page }, use) => {
    const postGeneration = new PostGeneration(page);
    await use(postGeneration);
  },

  locators: async ({ page }, use) => {
    const locators = createBlogLocators(page);
    await use(locators);
  },
});
