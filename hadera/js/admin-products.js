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

  /*
    MongoDB uses _id.
    The frontend may use id depending on the API response.
  */
  function getProductId(product) {
    return product.id || product._id;
  }

  /*
    Cloudinary images are now stored as:
    {
      url,
      publicId
    }

    This also supports old string URLs.
  */
  function getImageUrl(image) {
    if (!image) return '';

    if (typeof image === 'string') {
      return image;
    }

    return image.url || '';
  }

  async function loadProducts() {
    tbody.innerHTML = `
      <tr class="empty-row">
        <td colspan="6">Loading products…</td>
      </tr>
    `;

    try {
      workingSet = await getAdminProducts();

      /*
        Some API implementations return:
        { products: [...] }

        while others return the array directly.
      */
      if (!Array.isArray(workingSet)) {
        workingSet = workingSet?.products || [];
      }

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
      const name = String(
        product.name || ''
      ).toLowerCase();

      return (
        (!q || name.includes(q)) &&
        (!cat || product.category === cat) &&
        (!status || product.availability === status)
      );
    });

    if (!filtered.length) {
      tbody.innerHTML = `
        <tr class="empty-row">
          <td colspan="6">
            No products match your filters.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = filtered
      .map(product => {
        const id = getProductId(product);

        const image = getImageUrl(
          product.images?.[0]
        );

        return `
          <tr data-id="${id}">
            <td>
              <div class="name-cell">
                ${
                  image
                    ? `
                      <img
                        class="product-thumb"
                        src="${image}"
                        alt="${product.name || 'Product'}"
                      >
                    `
                    : ''
                }

                <span>${product.name || 'Unnamed product'}</span>
              </div>
            </td>

            <td style="text-transform:capitalize">
              ${product.category || '—'}
            </td>

            <td>
              ${HADERA.formatNaira(product.price || 0)}
            </td>

            <td>
              ${product.location || '—'}
            </td>

            <td>
              ${statusTagHTML(
                product.availability || 'available'
              )}
            </td>

            <td>
              <div class="hstack gap-xs">
                <button
                  type="button"
                  class="btn btn-secondary btn-sm edit-btn"
                  data-id="${id}"
                >
                  Edit
                </button>

                <button
                  type="button"
                  class="btn btn-danger btn-sm delete-btn"
                  data-id="${id}"
                >
                  Delete
                </button>
              </div>
            </td>
          </tr>
        `;
      })
      .join('');
  }

  [searchInput, categorySelect, statusSelect]
    .forEach(element => {
      if (!element) return;

      element.addEventListener(
        'input',
        renderTable
      );

      element.addEventListener(
        'change',
        renderTable
      );
    });

  const backdrop = document.getElementById(
    'product-modal-backdrop'
  );

  const modal = document.getElementById(
    'product-modal'
  );

  const form = document.getElementById(
    'product-form'
  );

  const modalTitle = document.getElementById(
    'product-modal-title'
  );

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
    .addEventListener(
      'click',
      closeModal
    );

  backdrop.addEventListener(
    'click',
    closeModal
  );

  /*
    Edit / Delete buttons
  */
  tbody.addEventListener(
    'click',
    async e => {
      const editBtn =
        e.target.closest('.edit-btn');

      const deleteBtn =
        e.target.closest('.delete-btn');

      /*
        EDIT
      */
      if (editBtn) {
        const product = workingSet.find(
          item =>
            String(getProductId(item)) ===
            String(editBtn.dataset.id)
        );

        if (!product) return;

        editingId = getProductId(product);

        modalTitle.textContent =
          'Edit product';

        form.name.value =
          product.name || '';

        form.category.value =
          product.category || '';

        form.price.value =
          product.price ?? '';

        form.location.value =
          product.location || '';

        form.quantity.value =
          product.quantity ?? 1;

        form.availability.value =
          product.availability ||
          'available';

        form.description.value =
          product.description || '';

        /*
          Don't clear the existing images here.

          If the admin chooses new files,
          the backend adds them to the
          existing Cloudinary images.
        */

        openModal();
      }

      /*
        DELETE
      */
      if (deleteBtn) {
        const id = deleteBtn.dataset.id;

        const confirmed = confirm(
          'Remove this product? This cannot be undone.'
        );

        if (!confirmed) {
          return;
        }

        deleteBtn.disabled = true;

        try {
          await deleteAdminProduct(id);

          workingSet =
            workingSet.filter(
              product =>
                String(
                  getProductId(product)
                ) !== String(id)
            );

          renderTable();

          HADERA.toast(
            'Product removed.',
            'success'
          );
        } catch (error) {
          HADERA.toast(
            error.message ||
              'Unable to delete product.',
            'error'
          );

          deleteBtn.disabled = false;
        }
      }
    }
  );

  /*
    CREATE / EDIT
  */
  form.addEventListener(
    'submit',
    async e => {
      e.preventDefault();

      const submitBtn =
        form.querySelector(
          'button[type="submit"]'
        );

      submitBtn.disabled = true;

      submitBtn.textContent =
        editingId
          ? 'Updating…'
          : 'Saving…';

      try {
        const formData =
          new FormData();

        formData.append(
          'name',
          form.name.value.trim()
        );

        formData.append(
          'category',
          form.category.value
        );

        formData.append(
          'price',
          form.price.value
        );

        formData.append(
          'location',
          form.location.value.trim()
        );

        formData.append(
          'quantity',
          form.quantity.value || '1'
        );

        formData.append(
          'availability',
          form.availability.value
        );

        formData.append(
          'description',
          form.description.value.trim()
        );

        const imageInput =
          document.getElementById(
            'pf-images'
          );

        if (
          imageInput?.files?.length
        ) {
          Array.from(
            imageInput.files
          ).forEach(file => {
            formData.append(
              'images',
              file
            );
          });
        }

        let result;

        if (editingId) {
          result =
            await updateAdminProduct(
              editingId,
              formData
            );
        } else {
          result =
            await createAdminProduct(
              formData
            );
        }

        const savedProduct =
          result?.product ||
          result?.data ||
          result;

        if (!savedProduct) {
          await loadProducts();

          HADERA.toast(
            'Product saved.',
            'success'
          );

          closeModal();

          return;
        }

        /*
          Update local state.
        */
        const savedId =
          getProductId(savedProduct);

        if (editingId) {
          const index =
            workingSet.findIndex(
              product =>
                String(
                  getProductId(product)
                ) ===
                String(editingId)
            );

          if (index !== -1) {
            workingSet[index] =
              savedProduct;
          }

          HADERA.toast(
            'Product updated.',
            'success'
          );
        } else {
          workingSet.unshift(
            savedProduct
          );

          HADERA.toast(
            'Product added.',
            'success'
          );
        }

        renderTable();

        closeModal();
      } catch (error) {
        HADERA.toast(
          error.message ||
            'Unable to save product.',
          'error'
        );
      } finally {
        submitBtn.disabled = false;

        submitBtn.textContent =
          'Save product';
      }
    }
  );

  await loadProducts();
});