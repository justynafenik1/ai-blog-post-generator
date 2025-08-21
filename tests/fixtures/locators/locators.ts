import { Page } from '@playwright/test';

export function createBlogLocators(page: Page) {
  return {
    // --- Header / Intro ---
    title: page.getByTestId('title'),
    description: page.getByTestId('description'),

    // --- Input section ---
    inputSection: page.getByTestId('input-section'),
    keywordInput: page.getByTestId('keyword-input'),
    generateButton: page.getByTestId('generate-button'), 
    loader: page.getByTestId('loader'),

    // --- Filters / Sorting ---
    tagFilter: page.getByTestId('tag-filter'),
    sortOrder: page.getByTestId('sort-order'),
    sortByNewest: page.getByTestId('newest'),
    sortByOldest: page.getByTestId('oldest'),

    // --- Toasts ---
    toast: page.getByTestId('toast'),
    toastAdded: page.getByTestId('toast-added'),
    toastUpdated: page.getByTestId('toast-updated'),
    toastDeleted: page.getByTestId('toast-deleted'),

    // --- Posts list ---
    posts: page.getByTestId('posts'),
    postEmpty: page.getByTestId('post-empty'),

    // --- Single post elements ---
    postContainer: page.getByTestId('post-container'),
    postTitle: page.getByTestId('post-title'),
    postDate: page.getByTestId('post-date'),
    postTag: page.getByTestId('post-tag'),
    postContent: page.getByTestId('post-content'),

    
    // --- Post actions ---
    btnEdit: page.getByTestId('btn-edit'),
    btnDelete: page.getByTestId('btn-delete'),

    // --- Edit mode ---
    editTextarea: page.getByTestId('edit-textarea'),
    editTagsInput: page.getByTestId('edit-tags-input'),
    btnEditSave: page.getByTestId('btn-edit-save'),
    btnEditCancel: page.getByTestId('btn-edit-cancel'),

    // --- Delete confirm modal ---
    deleteConfirmModal: page.getByTestId('delete-confirm-modal'),
    confirmOk: page.getByTestId('confirm-ok'),
    confirmCancel: page.getByTestId('confirm-cancel'),

    // --- Pagination ---
    pageInfo: page.getByTestId('page-info'),
    nextPage: page.getByTestId('next-page'),
    previousPage: page.getByTestId('previous-page'),

    // --- Errors ---
    tagError: page.getByTestId('tag-error'),
    keywordError: page.getByTestId('keyword-error'),
    generateError: page.getByTestId('generate-error'),
    editError: page.getByTestId('edit-error'),
    deleteError: page.getByTestId('delete-error'),
    cancelError: page.getByTestId('cancel-error'),
    confirmError: page.getByTestId('confirm-error'),
    pageError: page.getByTestId('page-error'),
    nextError: page.getByTestId('next-error'),
    previousError: page.getByTestId('previous-error'),

    // --- Tags ---
    tagsContainer: page.getByTestId('tags-container'),
    addTagsCheckbox: page.getByTestId('tags-checkbox'),
    addTagButton: page.getByTestId('add-tag-button'),
    tagInput: page.getByTestId('tag-input'),
    tagList: page.getByTestId('tag-list'),
    tagItem: page.getByTestId('tag-item'),
    tagItemDelete: page.getByTestId('tag-item-delete'),
    tagItemEdit: page.getByTestId('tag-item-edit'),
    tagItemSave: page.getByTestId('tag-item-save'),
    tagItemCancel: page.getByTestId('tag-item-cancel'),
    tagItemDeleteConfirm: page.getByTestId('tag-item-delete-confirm'),
    tagItemDeleteCancel: page.getByTestId('tag-item-delete-cancel'),
  };
}
