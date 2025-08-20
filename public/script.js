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
    const keyword = kwEl.value.trim();
  
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
  
    if (!keyword) {
      alert('Please enter a keyword');
      return;
    }
  
    kwEl.disabled = true;
  
    const tagsCheckbox = document.getElementById('tagsCheckbox');
    const tagsContainer = document.getElementById('tagsContainer');
    let tags = [];
    const tagInput = tagsContainer.querySelector('input[type="text"]');
    const addButton = tagsContainer.querySelector('button.add-tag-btn');
  
    if (tagsCheckbox.checked && tagsEditor) {
      tags = tagsEditor.getTags();
  
      if (tagInput) tagInput.disabled = true;
      if (addButton) addButton.disabled = true;
    }
  
    showLoader();
  
    try {
      const res = await fetch('/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword, tags }),
      });
  
      if (!res.ok) throw new Error("Generation failed");
  
      kwEl.value = '';
  
      if (tagsEditor) {
        tagsEditor.clearTags();
      }
  
      await fetchPosts();
      showToast("Post added!", "toast-added");
  
    } catch {
      alert('Generation failed.');
    } finally {
      kwEl.disabled = false;
  
      if (tagsCheckbox.checked) {
        if (tagInput) tagInput.disabled = false;
        if (addButton) addButton.disabled = false;
      }
  
      hideLoader();
    }
  }
  
  let currentPage = 1, pageSize = 2;
  
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
  
  function formatDateTime(s) {
    if (!s) return '';
    let d = new Date(s);
    return d.toLocaleString();
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
      <li data-id="${post.id}" data-qa-id="post-container">
        <div class="title" data-qa-id="post-title">${generateTitle(post.keyword)}</div>
        <ul class="tags">${post.tags.map(t => `<li data-qa-id="post-tag">${t}</li>`).join('')}</ul>
        <div class="timestamp" data-qa-id="post-date">${formatDateTime(post.timestamp)}</div>
        <div class="content" data-qa-id="post-content">${truncate(post.blog)}</div>
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
      <div class="tag-error" data-qa-id="tag-error" style="color: red; min-height: 18px; margin-top: 4px; font-size: 14px; display:none;"></div>
    `;
  
    const tagsList = container.querySelector('.tags-list');
    const input = container.querySelector('input[type="text"]');
    const addBtn = container.querySelector('.add-tag-btn');
    const errorDiv = container.querySelector('.tag-error');
  
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
  
      if (tag.length > 7) {
        showTagError("Tag must be at most 7 characters long.");
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
  
    const contentDiv = li.querySelector('.content');
    const original = contentDiv.textContent;
    contentDiv.innerHTML = `
      <textarea data-qa-id="edit-textarea">${original}</textarea>
      <div id="edit-content-error" style="color: red; min-height: 18px; margin-top: 4px; font-size: 14px;"></div>
    `;
  
    const textarea = contentDiv.querySelector('textarea');
    const errorDiv = contentDiv.querySelector('#edit-content-error');
    textarea.addEventListener('input', () => {
      if (textarea.value.trim().length <= 300 && textarea.value.trim().length > 0) {
        errorDiv.textContent = '';
      }
    });
  
    const tagsUl = li.querySelector('.tags');
    const currentTags = [...tagsUl.querySelectorAll('li')].map(el => el.textContent.trim());
  
    tagsUl.innerHTML = `
      <div style="display: flex; align-items: flex-start; gap: 12px;">
        <div style="display: flex; flex-direction: column; gap: 4px; width: 180px;">
          <input type="text" id="new-tag-input" placeholder="Add tag" aria-label="Add tag input"
            style="width: 100%; padding: 6px 10px; font-size: 14px; border-radius: 6px; border: 1px solid #cbd5e1; display: block;" />
          <div id="edit-tag-error" data-qa-id="edit-tag-error"
            style="color: red; min-height: 18px; margin: 0; font-size: 14px; display: block;"></div>
        </div>
        <ul id="editable-tags" class="tags" style="margin-top: 0; margin-left: 12px;"></ul>
      </div>
    `;
  
    const editableTags = li.querySelector('#editable-tags');
    const newTagInput = li.querySelector('#new-tag-input');
    const tagErrorDiv = li.querySelector('#edit-tag-error');
  
    function showTagError(message) {
      tagErrorDiv.textContent = message;
    }
  
    function clearTagError() {
      tagErrorDiv.textContent = '';
    }
  
    function addTag(tag) {
      clearTagError();
  
      if (!/^[A-Za-z]+$/.test(tag)) {
        showTagError("Tag must contain letters only.");
        return;
      }
  
      if ([...editableTags.children].some(li => li.firstChild.textContent.trim().toLowerCase() === tag.toLowerCase())) {
        showTagError("This tag already exists.");
        return;
      }
  
      if (editableTags.children.length >= 5) {
        showTagError("Maximum 5 tags allowed.");
        return;
      }

      if (tag.length > 7) {
        showTagError("Tag must be at most 7 characters long.");
        return;
      }
  
      const liTag = document.createElement('li');
      liTag.textContent = tag + ' ';
  
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = '×';
      btn.className = 'remove-tag';
      btn.setAttribute('aria-label', 'Remove tag');
  
      btn.addEventListener('click', () => {
        liTag.remove();
        if (editableTags.children.length < 5) {
          clearTagError();
        }
      });
  
      liTag.appendChild(btn);
      editableTags.appendChild(liTag);
    }
  
    currentTags.forEach(addTag);
  
    newTagInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const val = newTagInput.value.trim();
        if (val) {
          addTag(val);
          if (tagErrorDiv.textContent === '') {
            newTagInput.value = '';
          }
        }
      }
    });
  
    const actions = li.querySelector('.actions');
    actions.innerHTML = `
      <button data-qa-id="btn-edit-save" onclick="saveEdit('${id}')">Save</button>
      <button data-qa-id="btn-edit-cancel" onclick="cancelEdit('${id}')">Cancel</button>
    `;
  }
  
  async function saveEdit(id) {
    const li = document.querySelector(`li[data-id="${id}"]`);
    if (!li) return;
  
    const textarea = li.querySelector('textarea');
    const errorDiv = li.querySelector('#edit-content-error');
    errorDiv.textContent = '';
  
    if (!textarea.value.trim()) {
      errorDiv.textContent = "Content cannot be empty";
      return;
    }
  
    if (textarea.value.trim().length > 300) {
      errorDiv.textContent = "Content must be at most 300 characters long.";
      return;
    }
  
    const editableTags = li.querySelector('#editable-tags');
    if (!editableTags) {
      alert("Tags editor not found.");
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
          blog: textarea.value.trim(),
          tags: updatedTags
        }),
      });
      if (!res.ok) throw new Error("Update failed");
  
      await fetchPosts();
      showToast("Post updated!", "toast-updated");
    } catch {
      alert("Failed to save changes.");
    }
  }
  
  function cancelEdit() {
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
  