/* ==========================================================================
   HADÉRA — products-data.js
   Rendering helpers for products returned by the real API.
   ========================================================================== */

/*
  Product images can now come from MongoDB as:

  {
    url: "https://res.cloudinary.com/...",
    publicId: "hadera/products/..."
  }

  This helper also supports old string URLs.
*/
function getProductImageUrl(image) {
  if (!image) return '';

  if (typeof image === 'string') {
    return image;
  }

  return image.url || '';
}


/*
  Product status label.
*/
function statusLabel(status) {
  return {
    available: 'Available',
    reserved: 'Reserved',
    sold: 'Sold out'
  }[status] || status;
}


/*
  Product card.
*/
function productCardHTML(p) {
  const id = p.id || p._id;

  const image =
    getProductImageUrl(p.images?.[0]) ||
    p.image ||
    '';

  return `
    <article class="product-card reveal">

      <a
        href="product-details.html?id=${encodeURIComponent(id)}"
        class="product-card-media"
      >
        <span class="product-badge status-${p.availability}">
          ${statusLabel(p.availability)}
        </span>

        ${
          image
            ? `
              <img
                src="${image}"
                alt="${p.name || 'Product'}"
                loading="lazy"
              >
            `
            : `
              <div
                class="product-image-placeholder"
                aria-label="No product image"
              ></div>
            `
        }
      </a>

      <div class="product-card-body">

        <span class="product-card-cat">
          ${p.category || ''}
        </span>

        <h3 class="product-card-name">
          ${p.name || 'Unnamed product'}
        </h3>

        <span class="product-card-loc">
          ${p.location || ''}
        </span>

        <span class="product-card-price">
          ${HADERA.formatNaira(p.price || 0)}
        </span>

        <a
          href="product-details.html?id=${encodeURIComponent(id)}"
          class="product-card-cta"
        >
          View details
        </a>

      </div>
    </article>
  `;
}


/*
  Render product grid.
*/
function renderProductGrid(container, products) {
  if (!products.length) {
    container.innerHTML = `
      <div
        class="state-msg"
        style="grid-column:1/-1"
      >
        <h3>No products match your filters</h3>

        <p>
          Try adjusting your search, category
          or price range.
        </p>
      </div>
    `;

    return;
  }

  container.innerHTML =
    products
      .map(productCardHTML)
      .join('');

  HADERA.initReveal();
}


/*
  Loading skeleton.
*/
function renderSkeletonGrid(
  container,
  count = 8
) {
  container.innerHTML =
    Array.from({
      length: count
    })
      .map(() => `
        <div class="product-card">

          <div
            class="skeleton"
            style="aspect-ratio:4/3"
          ></div>

          <div
            style="padding:1.15rem 1.25rem"
          >

            <div
              class="skeleton"
              style="
                height:12px;
                width:40%;
                margin-bottom:10px
              "
            ></div>

            <div
              class="skeleton"
              style="
                height:18px;
                width:80%;
                margin-bottom:10px
              "
            ></div>

            <div
              class="skeleton"
              style="
                height:14px;
                width:55%
              "
            ></div>

          </div>
        </div>
      `)
      .join('');
}