// Utility functions to show/hide loader and toast messages
function showLoader() {
  document.getElementById('loader').classList.add('show');
}

function hideLoader() {
  document.getElementById('loader').classList.remove('show');
}

function showToast(message, qaId = "toast") {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.setAttribute("data-qa-id", qaId);
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
    toast.setAttribute("data-qa-id", "toast");
  }, 3000);
}

// Keyword input and error handling
const keywordInput = document.getElementById('keyword');
const keywordError = document.getElementById('keyword-error');

keywordInput.addEventListener('input', () => {
  keywordError.style.display = 'none';
  keywordError.textContent = '';
});

// Generate post button click handler
async function generate() {
  const kwEl = document.getElementById('keyword');
  const keywordError = document.getElementById('keyword-error');
  const tagsCheckbox = document.getElementById('tagsCheckbox');
  const tagsContainer = document.getElementById('tagsContainer');
  const tagsError = document.getElementById('tagsError');
  const tagInput = tagsContainer.querySelector('input[type="text"]');
  const addButton = tagsContainer.querySelector('button.add-tag-btn');

  const keyword = kwEl.value.trim();

  // Walidacja keyword
  if (keyword.length < 3) {
    keywordError.textContent = 'Keyword must be at least 3 characters long.';
    keywordError.style.display = 'block';
    return;
  }
  if (keyword.length > 20) {
    keywordError.textContent = 'Keyword must be at most 20 characters long.';
    keywordError.style.display = 'block';
    return;
  }
  if (/[^A-Za-z]/.test(keyword)) {
    keywordError.textContent = 'Only letters are allowed in the keyword.';
    keywordError.style.display = 'block';
    return;
  }

  keywordError.textContent = '';
  keywordError.style.display = 'none';

  // Additional validation for empty keyword (just in case)
  if (!keyword) {
    alert('Please enter a keyword');
    return;
  }

  // Handling hiding error when checkbox is unchecked
  tagsCheckbox.addEventListener('change', () => {
    if (!tagsCheckbox.checked) {
      tagsError.textContent = '';
      tagsError.style.display = 'none';
      if (tagInput) tagInput.disabled = false;
      if (addButton) addButton.disabled = false;
    }
  });

  // Get tags if checkbox is checked
  let tags = [];

  if (tagsCheckbox.checked && tagsEditor) {
    tags = tagsEditor.getTags();

    if (tags.length === 0) {
      tagsError.textContent = 'Please add at least one tag.';
      tagsError.style.display = 'block';
      return;
    } else {
      tagsError.textContent = '';
      tagsError.style.display = 'none';
    }

    if (tagInput) tagInput.disabled = true;
    if (addButton) addButton.disabled = true;
  } else {
    // Checkbox unchecked - hide error and enable input/button
    tagsError.textContent = '';
    tagsError.style.display = 'none';
    if (tagInput) tagInput.disabled = false;
    if (addButton) addButton.disabled = false;
  }

  kwEl.disabled = true;
  showLoader();

  try {
    const res = await fetch('/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ keyword, tags }),
    });
    if (!res.ok) throw new Error("Generation failed");

    kwEl.value = '';
    if (tagsEditor) tagsEditor.clearTags();

    await fetchPosts();
    showToast("Post added!", "toast-added");
  } catch (e) {
    alert('Generation failed.');
    console.error(e);
  } finally {
    kwEl.disabled = false;

    if (tagsCheckbox.checked) {
      if (tagInput) tagInput.disabled = false;
      if (addButton) addButton.disabled = false;
    }

    hideLoader();
  }
}


let currentPage = 1, pageSize = 3;

async function fetchPosts() {
  showLoader();
  try {
    const sort = document.getElementById('sortOrder').value;

    const tag = document.getElementById('tagFilter').value;
    const tagParam = tag ? `&tag=${encodeURIComponent(tag)}` : '';
    const res = await fetch(`/history?page=${currentPage}&pageSize=${pageSize}&sort=${sort}${tagParam}`);
    const data = await res.json();

    renderPosts(data);
    updatePageInfo(data);
    updateTagFilterOptions(data.items);

  } catch {
    alert('Failed to load posts.');
  } finally {
    hideLoader();
  }
}

function updateTagFilterOptions(posts) {
  const tagFilter = document.getElementById('tagFilter');
  const currentValue = tagFilter.value || '';

  const tagsSet = new Set();
  posts.forEach(post => {
    if (post.tags && Array.isArray(post.tags)) {
      post.tags.forEach(t => tagsSet.add(t));
    }
  });

  tagFilter.innerHTML = '<option value="">All</option>';

  Array.from(tagsSet).sort().forEach(t => {
    const option = document.createElement('option');
    option.value = t;
    option.textContent = t;
    tagFilter.appendChild(option);
  });

  if (currentValue && Array.from(tagsSet).includes(currentValue)) {
    tagFilter.value = currentValue;
  } else {
    tagFilter.value = '';
  }
}

function onTagFilterChange() {
  currentPage = 1;
  fetchPosts();
}

function updatePageInfo(data) {
  const totalPages = Math.ceil(data.total / data.pageSize);
  document.getElementById('pageInfo').textContent = `Page ${data.page} of ${totalPages}`;
  document.getElementById('prevPage').disabled = data.page <= 1;
  document.getElementById('nextPage').disabled = data.page >= totalPages;
}

function changePage(d) {
  currentPage += d;
  if (currentPage < 1) currentPage = 1;
  fetchPosts();
}

function generateTitle(k) { return `Top facts about ${k}`; }


function formatDateTime(isoString) {
  if (!isoString) return '';
  return new Date(isoString).toLocaleString("pl-PL", {
    hour12: false,
    timeZone: "Europe/Warsaw",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });
}




function truncate(t, max = 500) {
  return t.length <= max ? t : t.substr(0, max) + '...';
}

function renderPosts(data) {
  const ul = document.getElementById('posts');
  const posts = data.items || [];
  if (!posts.length) {
    ul.innerHTML = '<li data-qa-id="post-empty">No posts yet.</li>';
    return;
  }
  ul.innerHTML = posts.map(post => `
      <li class="post-container" data-id="${post.id}" data-qa-id="post-container">
        <div class="post-header">
          <div class="timestamp" data-qa-id="post-date">${formatDateTime(post.timestamp)}</div>
          <div class="title" data-qa-id="post-title">${post.title || generateTitle(post.keyword)}</div>
        </div>
        <ul class="tags">${post.tags.map(t => `<li data-qa-id="post-tag">${t}</li>`).join('')}</ul>
        <div class="content" data-qa-id="post-content">${post.blog}</div>
        <div class="actions">
          <button data-qa-id="btn-edit" onclick="startEdit('${post.id}')">Edit</button>
          <button class="delete" data-qa-id="btn-delete" onclick="deletePost('${post.id}')">Delete</button>
        </div>
      </li>
    `).join('');
}


const tagsContainer = document.getElementById('tagsContainer');
const tagsCheckbox = document.getElementById('tagsCheckbox');
const generateBtn = document.getElementById('generateBtn');

let tagsEditor = null;

tagsCheckbox.addEventListener('change', () => {
  if (tagsCheckbox.checked) {
    tagsContainer.style.display = 'block';
    if (!tagsEditor) {
      tagsEditor = createTagsEditor(tagsContainer, []);
    }
  } else {
    tagsContainer.style.display = 'none';
    if (tagsEditor) {
      tagsEditor.clearTags();
    }
  }
});

generateBtn.addEventListener('click', generate);

function createTagsEditor(container, initialTags = []) {
  container.innerHTML = `
      <ul class="tags-list" data-qa-id="tags-list"></ul>
      <div class="tag-input-container">
        <input type="text" placeholder="Add tag" aria-label="Add tag input" data-qa-id="tag-input" />
        <button type="button" class="add-tag-btn" data-qa-id="add-tag-button">Add</button>
      </div>
    `;

  const tagsList = container.querySelector('.tags-list');
  const input = container.querySelector('input[type="text"]');
  const addBtn = container.querySelector('.add-tag-btn');
  const errorDiv = document.getElementById('tagsError');

  function showTagError(message) {
    errorDiv.textContent = message;
    errorDiv.style.color = 'red';
    errorDiv.style.display = 'block';
  }

  function clearTagError() {
    errorDiv.textContent = '';
    errorDiv.style.display = 'none';
  }

  function isValidTag(tag) {
    return /^[A-Za-z]+$/.test(tag);
  }

  function addTag(tag) {
    clearTagError();

    if (!isValidTag(tag)) {
      showTagError("Tag must contain letters only.");
      return;
    }

    if (tag.length > 10) {
      showTagError("Tag must be at most 10 characters long.");
      return;
    }

    if ([...tagsList.children].some(li => li.textContent.trim() === tag)) {
      showTagError("This tag already exists.");
      return;
    }

    if (tagsList.children.length >= 5) {
      showTagError("Maximum 5 tags allowed.");
      return;
    }

    const li = document.createElement('li');
    li.textContent = tag + ' ';
    li.setAttribute('data-qa-id', 'tag-item');

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = '×';
    btn.className = 'remove-tag';
    btn.setAttribute('aria-label', 'Remove tag');
    btn.setAttribute('data-qa-id', 'remove-tag-button');
    btn.addEventListener('click', () => {
      li.remove();
      if (tagsList.children.length < 5) {
        clearTagError();
      }
    });
    li.appendChild(btn);
    tagsList.appendChild(li);
    clearTagError();

  }

  initialTags.forEach(addTag);

  addBtn.addEventListener('click', () => {
    const val = input.value.trim();
    if (val) {
      addTag(val);
      if (errorDiv.style.display === 'none') {
        input.value = '';
        input.focus();
      }
    }
  });

  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addBtn.click();
    }
  });

  return {
    getTags() {
      return [...tagsList.children].map(li => li.firstChild.textContent.trim());
    },
    clearTags() {
      tagsList.innerHTML = '';
      clearTagError();
    }
  };
}


// Edit post functions including content length validation
function startEdit(id) {
  const li = document.querySelector(`li[data-id="${id}"]`);
  if (!li) return;

  const titleDiv = li.querySelector('.title');
  const timestampDiv = li.querySelector('.timestamp');
  const tagsDiv = li.querySelector('.tags');
  const contentDiv = li.querySelector('.content');
  const actions = li.querySelector('.actions');

  // Hide original elements during editing
  titleDiv.style.display = 'none';
  tagsDiv.style.display = 'none';
  contentDiv.style.display = 'none';

  // Hide Edit and Delete buttons, remove any existing Save/Cancel buttons
  const editBtn = actions.querySelector('[data-qa-id="btn-edit"]');
  const deleteBtn = actions.querySelector('[data-qa-id="btn-delete"]');
  if (editBtn) editBtn.style.display = 'none';
  if (deleteBtn) deleteBtn.style.display = 'none';

  const saveBtnExisting = actions.querySelector('#edit-save-btn');
  const cancelBtnExisting = actions.querySelector('#edit-cancel-btn');
  if (saveBtnExisting) saveBtnExisting.remove();
  if (cancelBtnExisting) cancelBtnExisting.remove();

  // Add Save and Cancel buttons
  actions.insertAdjacentHTML('beforeend', `
    <button data-qa-id="btn-edit-save" id="edit-save-btn" style="margin-right: 10px;">Save</button>
    <button data-qa-id="btn-edit-cancel" id="edit-cancel-btn" class="delete">
      Cancel
    </button>
  `);


  actions.querySelector('#edit-save-btn').onclick = () => saveEdit(id);
  actions.querySelector('#edit-cancel-btn').onclick = () => cancelEdit(id);

  // Add Save and Cancel buttons
  let existingEditContainer = li.querySelector('#edit-container');
  if (existingEditContainer) existingEditContainer.remove();

  // Get current data
  const origTitle = titleDiv.textContent || '';
  const origTags = [...tagsDiv.querySelectorAll('li')].map(el => el.textContent.trim());
  const origContent = contentDiv.textContent || '';

  // Create edit container below the date
  const editContainer = document.createElement('div');
  editContainer.id = 'edit-container';
  editContainer.style.marginTop = '8px';
  editContainer.innerHTML = `
    <div>
      <label for="edit-title">Title:</label>
      <input type="text" id="edit-title" data-qa-id="edit-title" class="edit-title-input" value="${origTitle}"
        style="padding: 6px 10px; font-size: 16px; border-radius: 4px; border: 1px solid #cbd5e1;">
      <div id="edit-title-error" data-qa-id="edit-title-error" style="color: red; min-height: 18px; font-size: 14px;"></div>
    </div>

   <div style="margin-top: 12px;">
  <label>Tags:</label>
  <ul id="editable-tags" class="edit-tags-list" data-qa-id="edit-tags-list"></ul>
  <div class="tag-input-container">
    <input type="text" id="new-tag-input" data-qa-id="new-tag-input" class="tag-input" placeholder="Add tag" aria-label="Add tag input" />
    <button type="button" id="add-tag-edit-btn" data-qa-id="add-tag-edit-btn" class="add-tag-btn">Add Tag</button>
  </div>
  <div id="edit-tag-error" style="color: red; min-height: 18px; font-size: 14px; margin-top: 4px;"></div>
</div>



        <ul id="editable-tags" class="tags" style="
          margin-top: 0; margin-left: 12px; flex-grow: 1; display: flex; flex-wrap: wrap; gap: 6px; padding-left: 0; list-style: none;">
        </ul>
      </div>
    </div>

    <div style="margin-top: 12px;">
      <label for="edit-content">Content:</label>
      <textarea id="edit-content" data-qa-id="edit-content"
        style="width: 100%; height: 100px; font-size: 14px; padding: 6px 10px; border-radius: 6px; border: 1px solid #cbd5e1;">${origContent}</textarea>
      <div id="edit-content-error" data-qa-id="edit-content-error" style="color: red; min-height: 18px; font-size: 14px; margin-top: 4px;"></div>
    </div>
  `;

  timestampDiv.insertAdjacentElement('afterend', editContainer);

  // Initialize tag handling
  const editableTags = editContainer.querySelector('#editable-tags');
  const newTagInput = editContainer.querySelector('#new-tag-input');
  const tagErrorDiv = editContainer.querySelector('#edit-tag-error');

  function showTagError(msg) { tagErrorDiv.textContent = msg; }
  function clearTagError() { tagErrorDiv.textContent = ''; }



  function addTag(tag) {
    clearTagError();
    const lowerTag = tag.toLowerCase();
    if (!/^[A-Za-z]+$/.test(tag))
      return showTagError("Tag must contain letters only.");
    if ([...editableTags.children].some(li => li.textContent.trim().toLowerCase() === lowerTag))
      return showTagError("This tag already exists.");
    if (editableTags.children.length >= 5)
      return showTagError("Maximum 5 tags allowed.");
    if (tag.length > 10)
      return showTagError("Tag must be at most 10 characters long.");

    const liTag = document.createElement('li');
    liTag.textContent = tag + ' ';
    liTag.setAttribute('data-qa-id', 'tag-item');
    liTag.style.background = '#27ae60';
    liTag.style.color = 'white';
    liTag.style.fontWeight = '600';
    liTag.style.padding = '4px 10px';
    liTag.style.borderRadius = '8px';
    liTag.style.whiteSpace = 'nowrap';
    liTag.style.marginRight = '6px';
    liTag.style.display = 'inline-flex';
    liTag.style.alignItems = 'center';

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = '×';
    btn.className = 'remove-tag';
    btn.setAttribute('data-qa-id', 'remove-tag-button');
    btn.style.background = 'transparent';
    btn.style.border = 'none';
    btn.style.color = 'white';
    btn.style.fontWeight = 'bold';
    btn.style.cursor = 'pointer';
    btn.style.marginLeft = '6px';
    btn.style.fontSize = '16px';
    btn.addEventListener('click', () => {
      liTag.remove();
      if (editableTags.children.length < 5) clearTagError();
    });

    liTag.appendChild(btn);
    editableTags.appendChild(liTag);
  }
  origTags.forEach(t => addTag(t));

  newTagInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTagBtn.click();
    }
  });
  const addTagBtn = editContainer.querySelector('#add-tag-edit-btn');
  addTagBtn.addEventListener('click', () => {
    const val = newTagInput.value.trim();
    if (val) {
      addTag(val);
      if (!tagErrorDiv.textContent) {
        newTagInput.value = '';
        newTagInput.focus();
      }
    }
  });

  // Title and content validations
  const titleInput = editContainer.querySelector('#edit-title');
  const titleError = editContainer.querySelector('#edit-title-error');

  // Add validation during typing
  titleInput.addEventListener('input', () => {
    const len = titleInput.value.trim().length;
    if (len < 3) {
      titleError.textContent = "Title must be at least 3 characters long.";
    } else if (len > 50) {
      titleError.textContent = "Title must be at most 50 characters long.";
    } else {
      titleError.textContent = "";
    }
  });

  const contentTextarea = editContainer.querySelector('#edit-content');
  const contentError = editContainer.querySelector('#edit-content-error');
  contentTextarea.addEventListener('input', () => {
    if (contentTextarea.value.trim().length <= 600 && contentTextarea.value.trim().length > 0) {
      contentError.textContent = '';
    }
  });
}

async function saveEdit(id) {
  const li = document.querySelector(`li[data-id="${id}"]`);
  if (!li) return;

  const editContainer = li.querySelector('#edit-container');
  if (!editContainer) return;

  const titleInput = editContainer.querySelector('#edit-title');
  const titleError = editContainer.querySelector('#edit-title-error');
  const contentTextarea = editContainer.querySelector('#edit-content');
  const contentError = editContainer.querySelector('#edit-content-error');
  const editableTags = editContainer.querySelector('#editable-tags');

  // Reset errors
  titleError.textContent = '';
  contentError.textContent = '';

  // Validation
  if (!titleInput.value.trim() || titleInput.value.trim().length < 3) {
    titleError.textContent = "Title must be at least 3 characters long.";
    return;
  }
  if (titleInput.value.trim().length > 50) {
    titleError.textContent = "Title must be at most 50 characters long.";
    return;
  }


  if (!contentTextarea.value.trim()) {
    contentError.textContent = "Content cannot be empty.";
    return;
  }

  if (contentTextarea.value.trim().length > 600) {
    contentError.textContent = "Content must be at most 600 characters long.";
    return;
  }

  const updatedTags = [...editableTags.querySelectorAll('li')]
    .map(li => li.firstChild.textContent.trim())
    .filter(t => t.length > 0);

  try {
    const res = await fetch(`/history/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: titleInput.value.trim(),
        blog: contentTextarea.value.trim(),
        tags: updatedTags
      }),
    });
    if (!res.ok) throw new Error("Update failed");

    // Remove edit container and show original elements
    editContainer.remove();
    li.querySelector('.title').style.display = '';
    li.querySelector('.tags').style.display = '';
    li.querySelector('.content').style.display = '';

    await fetchPosts();
    showToast("Post updated!", "toast-updated");

  } catch (e) {
    alert("Failed to save changes.");
    console.error(e);
  }
}

function cancelEdit(id) {
  const li = document.querySelector(`li[data-id="${id}"]`);
  if (!li) return;

  const editContainer = li.querySelector('#edit-container');
  if (editContainer) editContainer.remove();

  li.querySelector('.title').style.display = '';
  li.querySelector('.tags').style.display = '';
  li.querySelector('.content').style.display = '';

  fetchPosts();
}

let deleteTargetId = null;
function deletePost(id) {
  deleteTargetId = id;
  document.getElementById('deleteConfirm').style.display = 'block';
}
async function confirmDelete(ok) {
  const modal = document.getElementById('deleteConfirm');
  modal.style.display = 'none';
  if (!ok || !deleteTargetId) return;
  try {
    const res = await fetch(`/history/${deleteTargetId}`, { method: 'DELETE' });
    if (!res.ok) throw Error();
    await fetchPosts();
    showToast("Post deleted!", "toast-deleted");
  } catch {
    alert("Failed delete");
  } finally {
    deleteTargetId = null;
  }
}

window.onload = () => {
  tagsCheckbox.checked = false;
  tagsContainer.style.display = 'none';
  keywordInput.value = '';
  fetchPosts();
};
