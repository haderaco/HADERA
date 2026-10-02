/* ==========================================================================
   HADÉRA — product-details.js
   ========================================================================== */

document.addEventListener('DOMContentLoaded', async () => {
  const { qs, formatNaira } = HADERA;

  const root = qs('#pd-content');
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');

  root.innerHTML = `
    <div>
      <div
        class="skeleton"
        style="aspect-ratio:4/3;border-radius:14px"
      ></div>
    </div>

    <div>
      <div
        class="skeleton"
        style="height:14px;width:30%;margin-bottom:14px"
      ></div>

      <div
        class="skeleton"
        style="height:32px;width:70%;margin-bottom:14px"
      ></div>

      <div
        class="skeleton"
        style="height:26px;width:40%"
      ></div>
    </div>
  `;

  const product = id ? await getProduct(id) : null;

  if (!product) {
    root.innerHTML = `
      <div
        class="state-msg"
        style="grid-column:1/-1"
      >
        <h3>Product not found</h3>

        <p>
          This listing may have been removed
          or the link is incorrect.
        </p>

        <a
          href="products.html"
          class="btn btn-primary mt-l"
        >
          Back to shop
        </a>
      </div>
    `;

    return;
  }

  const productId = product.id || product._id;

  /*
    MongoDB/Cloudinary images are stored as:

    {
      url: "...",
      publicId: "..."
    }

    This also supports older products where images
    may still be plain URL strings.
  */
  const images = (product.images || [])
    .map(getProductImageUrl)
    .filter(Boolean);

  const mainImage = images[0] || '';

  qs('#pd-crumb-name').textContent = product.name;
  document.title = `${product.name} — HADÉRA`;

  const statusLabelMap = {
    available: 'Available',
    reserved: 'Reserved',
    sold: 'Sold out'
  };

  root.innerHTML = `
    <div class="pd-gallery reveal">

      <div class="pd-gallery-main">

        ${
          mainImage
            ? `
              <img
                id="pd-main-img"
                src="${mainImage}"
                alt="${product.name || 'Product'}"
              >
            `
            : `
              <div
                class="product-image-placeholder"
                style="width:100%;height:100%"
                aria-label="No product image"
              ></div>
            `
        }

      </div>

      ${
        images.length > 1
          ? `
            <div
              class="pd-thumbs"
              id="pd-thumbs"
            >

              ${images.map((img, i) => `
                <div
                  class="pd-thumb ${i === 0 ? 'active' : ''}"
                  data-src="${img}"
                >
                  <img
                    src="${img}"
                    alt=""
                  >
                </div>
              `).join('')}

            </div>
          `
          : ''
      }

    </div>


    <div class="pd-info reveal">

      <span class="product-card-cat">
        ${product.category || ''}
      </span>

      <h1
        style="
          font-size:var(--step-3);
          margin-top:0.4rem
        "
      >
        ${product.name || 'Unnamed product'}
      </h1>

      <div class="pd-price">
        ${formatNaira(product.price || 0)}
      </div>

      <div class="pd-meta-row">

        ${
          product.location
            ? `<span class="pill">${product.location}</span>`
            : ''
        }

        <span class="pill">
          ${statusLabelMap[product.availability] || product.availability || ''}
        </span>

      </div>

      ${
        product.description
          ? `
            <p style="color:var(--color-ink-soft)">
              ${product.description}
            </p>
          `
          : ''
      }


      ${
        product.availability === 'available'
          ? `
            <div style="margin-top:1.5rem">

              <label
                style="
                  font-size:0.84rem;
                  font-weight:600;
                  display:block;
                  margin-bottom:0.6rem
                "
              >
                Quantity
              </label>

              <div class="qty-selector">

                <button
                  type="button"
                  id="qty-minus"
                  aria-label="Decrease quantity"
                >
                  −
                </button>

                <span id="qty-value">1</span>

                <button
                  type="button"
                  id="qty-plus"
                  aria-label="Increase quantity"
                >
                  +
                </button>

              </div>

            </div>
          `
          : ''
      }


      <div class="pd-cta-row">

        ${
          product.availability === 'available'
            ? `
              <a
                href="checkout.html?id=${encodeURIComponent(productId)}&qty=1"
                id="pd-order-btn"
                class="btn btn-primary"
              >
                Place order
              </a>
            `
            : `
              <button
                class="btn btn-primary"
                disabled
              >
                ${statusLabelMap[product.availability] || 'Unavailable'}
              </button>
            `
        }

        <a
          href="contact.html"
          class="btn btn-secondary"
        >
          Contact HADÉRA
        </a>

      </div>


      ${
        product.specifications &&
        Object.keys(product.specifications).length
          ? `
            <div class="pd-specs">

              <h3>Specifications</h3>

              ${Object.entries(product.specifications)
                .map(([key, value]) => `
                  <div class="spec-row">
                    <span>${key}</span>
                    <span>${value}</span>
                  </div>
                `)
                .join('')}

            </div>
          `
          : ''
      }

    </div>
  `;

  HADERA.initReveal();


  // -------------------------------------------------------------------------
  // Gallery
  // -------------------------------------------------------------------------

  const thumbs = qs('#pd-thumbs');
  const mainImg = qs('#pd-main-img');

  if (thumbs && mainImg) {
    thumbs.addEventListener('click', (event) => {
      const thumb = event.target.closest('.pd-thumb');

      if (!thumb) return;

      mainImg.src = thumb.dataset.src;

      HADERA.qsa('.pd-thumb').forEach((item) => {
        item.classList.remove('active');
      });

      thumb.classList.add('active');
    });
  }


  // -------------------------------------------------------------------------
  // Quantity selector
  // -------------------------------------------------------------------------

  let qty = 1;

  const qtyValue = qs('#qty-value');
  const minusBtn = qs('#qty-minus');
  const plusBtn = qs('#qty-plus');
  const orderBtn = qs('#pd-order-btn');

  function syncOrderLink() {
    if (!orderBtn) return;

    orderBtn.href =
      `checkout.html?id=${encodeURIComponent(productId)}&qty=${qty}`;
  }

  if (minusBtn) {
    minusBtn.addEventListener('click', () => {
      if (qty > 1) {
        qty--;

        qtyValue.textContent = qty;

        syncOrderLink();
      }
    });
  }

  if (plusBtn) {
    plusBtn.addEventListener('click', () => {
      qty++;

      qtyValue.textContent = qty;

      syncOrderLink();
    });
  }
});
