document.addEventListener('DOMContentLoaded', async () => {
  if (!requireAdminSession()) return;

  renderAdminShell('Categories');
  HADERA.initReveal();

  const grid = document.getElementById('cat-grid');
  const backdrop =
    document.getElementById('cat-modal-backdrop');
  const modal =
    document.getElementById('cat-modal');
  const form =
    document.getElementById('cat-form');

  const modalTitle =
    document.getElementById('cat-modal-title');

  let categories = [];
  let editingId = null;

  async function loadCategories() {
    grid.innerHTML = `
      <div class="state-msg">
        <p>Loading categories…</p>
      </div>
    `;

    try {
      categories = await getCategories();
      render();
    } catch (error) {
      grid.innerHTML = `
        <div class="state-msg">
          <p>
            ${error.message || 'Unable to load categories.'}
          </p>
        </div>
      `;
    }
  }

  function render() {
    grid.innerHTML = categories.map(category => `
      <div class="cat-card">
        <img
          src="${category.image || category.imageUrl || ''}"
          alt="${category.name}"
        >

        <div class="cat-card-body">
          <h3>${category.name}</h3>

          <p style="font-size:0.85rem;color:var(--color-ink-soft);margin-top:0.4rem">
            ${category.description || ''}
          </p>

          <div class="cat-card-actions">
            <button
              type="button"
              class="btn btn-secondary btn-sm edit-cat-btn"
              data-id="${category.id}"
              style="flex:1"
            >
              Edit
            </button>

            <button
              type="button"
              class="btn btn-danger btn-sm delete-cat-btn"
              data-id="${category.id}"
              style="flex:1"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    `).join('') + `
      <div class="add-cat-card" id="add-cat-trigger">
        <span style="font-size:1.8rem">+</span>
        <span>Add category</span>
      </div>
    `;
  }

  function openModal() {
    backdrop.classList.add('open');
    modal.classList.add('open');
  }

  function closeModal() {
    backdrop.classList.remove('open');
    modal.classList.remove('open');
    form.reset();
    editingId = null;
  }

  document
    .getElementById('cat-modal-close')
    .addEventListener('click', closeModal);

  backdrop.addEventListener('click', closeModal);

  grid.addEventListener('click', async e => {
    if (e.target.closest('#add-cat-trigger')) {
      editingId = null;
      modalTitle.textContent = 'Add category';
      form.reset();
      openModal();
      return;
    }

    const editBtn =
      e.target.closest('.edit-cat-btn');

    if (editBtn) {
      const category = categories.find(
        item =>
          String(item.id) ===
          String(editBtn.dataset.id)
      );

      if (!category) return;

      editingId = category.id;

      modalTitle.textContent = 'Edit category';

      form.name.value = category.name || '';
      form.description.value =
        category.description || '';

      openModal();
      return;
    }

    const deleteBtn =
      e.target.closest('.delete-cat-btn');

    if (deleteBtn) {
      const id = deleteBtn.dataset.id;

      if (!confirm('Delete this category?')) {
        return;
      }

      deleteBtn.disabled = true;

      try {
        await deleteCategory(id);

        categories = categories.filter(
          category =>
            String(category.id) !== String(id)
        );

        render();

        HADERA.toast(
          'Category deleted.',
          'success'
        );
      } catch (error) {
        HADERA.toast(
          error.message ||
          'Unable to delete category.',
          'error'
        );

        deleteBtn.disabled = false;
      }
    }
  });

  form.addEventListener('submit', async e => {
    e.preventDefault();

    const submitBtn =
      form.querySelector('button[type="submit"]');

    submitBtn.disabled = true;
    submitBtn.textContent = 'Saving…';

    try {
      const formData = new FormData();

      formData.append(
        'name',
        form.name.value.trim()
      );

      formData.append(
        'description',
        form.description.value.trim()
      );

      const imageInput =
        document.getElementById('cf-image');

      if (imageInput?.files?.length) {
        formData.append(
          'image',
          imageInput.files[0]
        );
      }

      if (editingId) {
        await updateCategory(
          editingId,
          formData
        );

        HADERA.toast(
          'Category updated.',
          'success'
        );
      } else {
        await createCategory(formData);

        HADERA.toast(
          'Category added.',
          'success'
        );
      }

      await loadCategories();
      closeModal();
    } catch (error) {
      HADERA.toast(
        error.message ||
        'Unable to save category.',
        'error'
      );
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Save category';
    }
  });

  await loadCategories();
});