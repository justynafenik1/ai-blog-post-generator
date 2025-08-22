Test Cases for Post Generator
This document contains detailed test cases for the Post Generator feature, divided into  (E2E) and Functional tests. Each test case includes steps to perform and expected results to verify.


## E2E Test Cases


### -- Adding Posts --
**TC-E2E-01:** Add post with tags  
- Preconditions: User is on the post creation page.  
- Steps:
  1. Enter valid keyword.
  2. Check "add tags", enter up to 2 valid tags.
  3. Click "Generate Post".
- Expected: Loader appears. Toast "Post added!" displays. Post appears in list with entered tags.


**TC-E2E-02:** Add post without tags  
- Preconditions: User is on the post creation page.  
- Steps:
  1. Enter valid keyword, do not check "add tags".
  2. Click "Generate Post".
- Expected: Loader. Toast "Post added!" displays. Post appears with empty tags.


**TC-E2E-03:** Add two posts with the same keyword  
- Preconditions: User is on the post creation page.  
- Steps:
  1. Add a post with a keyword (e.g., "watermelon").
  2. Add another post with the same keyword.
- Expected: Loader and toast "Post added!" for each. Two posts appear with identical keywords but different content.



---


### -- Editing Posts --
**TC-E2E-04:** Edit: add tags to tagless post  
- Preconditions: At least one post without tags exists.  
- Steps:
  1. Open the post without tags for editing.  
  2. Add tags and save.  
- Expected: Toast "Post updated!", tags visible.


**TC-E2E-05:** Edit: remove tags from tagged post  
- Preconditions: At least one post with tags exists.  
- Steps:
  1. Open the post with tags for editing.  
  2. Remove all tags and save.  
- Expected: Toast "Post updated!", no tags visible.


**TC-E2E-06:** Edit: change tags  
- Preconditions: At least one post with tags exists.  
- Steps:
  1. Open the post with tags for editing.  
  2. Change tags and save.  
- Expected: Toast "Post updated!", updated tags visible.


**TC-E2E-07:** Edit post title  
- Preconditions: At least one post exists.  
- Steps:
  1. Open a post for editing.
  2. Edit title and save.  
- Expected: Updated title visible, toast "Post updated!"


**TC-E2E-08:** Edit post title with valid input  
- Preconditions: At least one post exists.  
- Steps:
  1. Open a post for editing.
  2. Change the title to a valid string between 3 and 50 characters and save.
- Expected: Updated title is displayed, toast "Post updated!" appears, no validation errors.


---


### -- Deleting Posts --
**TC-E2E-09:** Delete post successfully  
- Preconditions: At least one post exists.  
- Steps:
  1. Open a post.
  2. Click "Delete" and confirm deletion.  
- Expected: Modal appears, toast "Post deleted!", post removed.


**TC-E2E-10:** Cancel deletion  
- Preconditions: At least one post exists.  
- Steps:
  1. Open a post.
  2. Click "Delete" and cancel in modal.  
- Expected: Post remains visible.


---


### -- Filtering & Pagination --
**TC-E2E-11:** Sort by newest  
- Preconditions: Multiple posts exist with different dates.  
- Steps:
  1. Select "Newest" sort option.  
- Expected: List is sorted descending by date.


**TC-E2E-12:** Sort by oldest  
- Preconditions: Multiple posts exist with different dates.  
- Steps:
  1. Select "Oldest" sort option.  
- Expected: List is sorted ascending by date.


**TC-E2E-13:** Pagination  
- Preconditions: More than 6 posts exist.  
- Steps:
  1. Use pagination controls.  
- Expected: Page info and navigation update, posts displayed page-wise.


**TC-E2E-14:** Filter by special tag  
- Preconditions: Posts exist with multiple distinct tags.  
- Steps:
  1. Select a specific tag from filter dropdown.  
- Expected: Only posts with that tag shown.


**TC-E2E-15:** Filter by 'All'  
- Preconditions: Multiple posts exist.  
- Steps:
  1. Set filter to "All".  
- Expected: All posts visible.


---


## Functional Test Cases


### -- Input Validation (Keyword) --
**TC-FUNC-01:** Minimum keyword length  
- Preconditions: User is on post creation page.  
- Steps:
  1. Enter keyword shorter than 3 characters.
  2. Click "Generate Post".
- Expected: Error "Keyword must be at least 3 characters long."


**TC-FUNC-02:** Maximum keyword length  
- Preconditions: User is on post creation page.  
- Steps:
  1. Enter keyword longer than 20 characters.
  2. Click "Generate Post".
- Expected: Error "Keyword must be at most 20 characters long."


**TC-FUNC-03:** Non-letter keyword  
- Preconditions: User is on post creation page.  
- Steps:
  1. Enter special characters or numbers in keyword.
  2. Click "Generate Post".
- Expected: Error "Only letters are allowed in the keyword."


**TC-FUNC-04:** Empty keyword  
- Preconditions: User is on post creation page.  
- Steps:
  1. Leave keyword input blank.
  2. Click "Generate Post".
- Expected: Alert "Please enter a keyword".


---


### -- Input Validation (Tags) --
**TC-FUNC-05:** Max tags (adding)  
- Preconditions: User is on post creation page with "add tags" enabled.  
- Steps:
  1. Try to add more than 5 tags.
- Expected: Error "Maximum 5 tags allowed."


**TC-FUNC-06:** Max tags (editing)  
- Preconditions: User is editing a post.  
- Steps:
  1. Try to add more than 5 tags.
- Expected: Error "Maximum 5 tags allowed."


**TC-FUNC-07:** Special char in tag (add/edit)  
- Preconditions: User is on post creation page or editing a post.  
- Steps:
  1. Try to add/edit a tag with non-letter characters.
- Expected: Error "Tag must contain letters only."


**TC-FUNC-08:** Tag length >7 in adding/editing
- Preconditions: User is on post creation page or editing a post.  
- Steps:  
  1. Try to add/edit a tag longer than 7 characters.
- Expected: Error "Tag must be at most 7 characters long."


**TC-FUNC-09:** Duplicate tag  
- Preconditions: User is on post creation page or editing a post.  
- Steps:
  1. Try to add a tag that already exists.
- Expected: Error "This tag already exists."


---


### -- Validation (Post Content) --
**TC-FUNC-10:** Edit post with >300 chars 
- Preconditions: User is editing a post.  
- Steps: 
  1. Enter post content longer than 300 characters.
  2. Try to save changes.
- Expected: Error "Content must be at most 300 characters long."


**TC-FUNC-11:** Empty edit content  
- Preconditions: User is editing a post.  
- Steps:
  1. Clear content field completely.
  2. Try to save changes.
- Expected: Error "Content cannot be empty."


**TC-FUNC-12:** Edit post title with less than 3 characters  
- Preconditions: User is editing a post.  
- Steps:
  1. Enter title shorter than 3 characters.
  2. Try to save changes.
- Expected: Error message "Title must be at least 3 characters long." shown, save is blocked.


**TC-FUNC-13:** Edit post title exceeding 50 characters
- Preconditions: User is editing a post.  
- Steps:
  1. Enter title longer than 50 characters.
  2. Try to save changes.
- Expected: Error message "Title must be at most 50 characters long." shown, save is blocked.


**TC-FUNC-14:** Edit post title with empty input
- Preconditions: User is editing a post.  
- Steps:
  1. Clear title field completely.
  2. Try to save changes.
- Expected: Error message "Title must be at least 3 characters long." shown, save is blocked.
---
