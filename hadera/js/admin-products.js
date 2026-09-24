document.addEventListener('DOMContentLoaded', async () => {
  if (!requireAdminSession()) return;

  renderAdminShell('Products');
  HADERA.initReveal();

  const tbody = document.getElementById('products-tbody');
  const searchInput = document.getElementById('p-search');
  const categorySelect = document.getElementById('p-category');
  const statusSelect = document.getElementById('p-status');

  let workingSet = [];
  let editingId = null;

  async function loadProducts() {
    tbody.innerHTML = `
      <tr class="empty-row">
        <td colspan="6">Loading products…</td>
      </tr>
    `;

    try {
      workingSet = await getAdminProducts();
      renderTable();
    } catch (error) {
      tbody.innerHTML = `
        <tr class="empty-row">
          <td colspan="6">
            ${error.message || 'Unable to load products.'}
          </td>
        </tr>
      `;
    }
  }

  function renderTable() {
    const q = searchInput.value.trim().toLowerCase();
    const cat = categorySelect.value;
    const status = statusSelect.value;

    const filtered = workingSet.filter(product => {
      const name = String(product.name || '').toLowerCase();

      return (
        (!q || name.includes(q)) &&
        (!cat || product.category === cat) &&
        (!status || product.availability === status)
      );
    });

    if (!filtered.length) {
      tbody.innerHTML = `
        <tr class="empty-row">
          <td colspan="6">No products match your filters.</td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = filtered.map(product => {
      const image =
        product.images?.[0] ||
        product.image ||
        '';

      return `
        <tr data-id="${product.id}">
          <td>
            <div class="name-cell">
              ${image
          ? `<img
                      class="product-thumb"
                      src="${image}"
                      alt="${product.name}"
                    >`
          : ''
        }
              <span>${product.name}</span>
            </div>
          </td>

          <td style="text-transform:capitalize">
            ${product.category}
          </td>

          <td>
            ${HADERA.formatNaira(product.price)}
          </td>

          <td>
            ${product.location || '—'}
          </td>

          <td>
            ${statusTagHTML(product.availability)}
          </td>

          <td>
            <div class="hstack gap-xs">
              <button
                type="button"
                class="btn btn-secondary btn-sm edit-btn"
                data-id="${product.id}"
              >
                Edit
              </button>

              <button
                type="button"
                class="btn btn-danger btn-sm delete-btn"
                data-id="${product.id}"
              >
                Delete
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  [searchInput, categorySelect, statusSelect].forEach(element => {
    element.addEventListener('input', renderTable);
    element.addEventListener('change', renderTable);
  });

  const backdrop = document.getElementById('product-modal-backdrop');
  const modal = document.getElementById('product-modal');
  const form = document.getElementById('product-form');
  const modalTitle = document.getElementById('product-modal-title');

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
    .getElementById('add-product-btn')
    .addEventListener('click', () => {
      editingId = null;
      modalTitle.textContent = 'Add product';
      form.reset();

      if (form.quantity) {
        form.quantity.value = 1;
      }

      openModal();
    });

  document
    .getElementById('product-modal-close')
    .addEventListener('click', closeModal);

  backdrop.addEventListener('click', closeModal);

  tbody.addEventListener('click', async e => {
    const editBtn = e.target.closest('.edit-btn');
    const deleteBtn = e.target.closest('.delete-btn');

    if (editBtn) {
      const product = workingSet.find(
        item => String(item.id) === String(editBtn.dataset.id)
      );

      if (!product) return;

      editingId = product.id;
      modalTitle.textContent = 'Edit product';

      form.name.value = product.name || '';
      form.category.value = product.category || '';
      form.price.value = product.price ?? '';
      form.location.value = product.location || '';
      form.quantity.value = product.quantity ?? 1;
      form.availability.value = product.availability || 'available';
      form.description.value = product.description || '';

      openModal();
    }

    if (deleteBtn) {
      const id = deleteBtn.dataset.id;

      if (!confirm('Remove this product? This cannot be undone.')) {
        return;
      }

      deleteBtn.disabled = true;

      try {
        await deleteAdminProduct(id);

        workingSet = workingSet.filter(
          product => String(product.id) !== String(id)
        );

        renderTable();
        HADERA.toast('Product removed.', 'success');
      } catch (error) {
        HADERA.toast(
          error.message || 'Unable to delete product.',
          'error'
        );

        deleteBtn.disabled = false;
      }
    }
  });

  form.addEventListener('submit', async e => {
    e.preventDefault();

    const submitBtn = form.querySelector('button[type="submit"]');

    submitBtn.disabled = true;
    submitBtn.textContent = editingId
      ? 'Updating…'
      : 'Saving…';

    try {
      const formData = new FormData();

      formData.append('name', form.name.value.trim());
      formData.append('category', form.category.value);
      formData.append('price', form.price.value);
      formData.append('location', form.location.value.trim());
      formData.append('quantity', form.quantity.value || '1');
      formData.append('availability', form.availability.value);
      formData.append('description', form.description.value.trim());

      const imageInput = document.getElementById('pf-images');

      if (imageInput?.files?.length) {
        Array.from(imageInput.files).forEach(file => {
          formData.append('images', file);
        });
      }

      let result;

      if (editingId) {
        result = await updateAdminProduct(
          editingId,
          formData
        );
      } else {
        result = await createAdminProduct(formData);
      }

      const savedProduct =
        result.product ||
        result.data ||
        result;

      if (editingId) {
        const index = workingSet.findIndex(
          product =>
            String(product.id) === String(editingId)
        );

        if (index !== -1 && savedProduct) {
          workingSet[index] = savedProduct;
        }

        HADERA.toast('Product updated.', 'success');
      } else if (savedProduct) {
        workingSet.unshift(savedProduct);
        HADERA.toast('Product added.', 'success');
      } else {
        await loadProducts();
        HADERA.toast('Product saved.', 'success');
      }

      renderTable();
      closeModal();
    } catch (error) {
      HADERA.toast(
        error.message || 'Unable to save product.',
        'error'
      );
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Save product';
    }
  });

  await loadProducts();
});