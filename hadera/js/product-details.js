/* ==========================================================================
   HADÉRA — product-details.js
   ========================================================================== */

document.addEventListener('DOMContentLoaded', async () => {
  const { qs, formatNaira, toast } = HADERA;
  const root = qs('#pd-content');
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');

  root.innerHTML = `
    <div><div class="skeleton" style="aspect-ratio:4/3;border-radius:14px"></div></div>
    <div>
      <div class="skeleton" style="height:14px;width:30%;margin-bottom:14px"></div>
      <div class="skeleton" style="height:32px;width:70%;margin-bottom:14px"></div>
      <div class="skeleton" style="height:26px;width:40%"></div>
    </div>`;

  const product = id ? await getProduct(id) : null;

  if (!product) {
    root.innerHTML = `
      <div class="state-msg" style="grid-column:1/-1">
        <h3>Product not found</h3>
        <p>This listing may have been removed or the link is incorrect.</p>
        <a href="products.html" class="btn btn-primary mt-l">Back to shop</a>
      </div>`;
    return;
  }

  qs('#pd-crumb-name').textContent = product.name;
  document.title = `${product.name} — HADÉRA`;

  const statusLabelMap = { available: 'Available', reserved: 'Reserved', sold: 'Sold out' };

  root.innerHTML = `
    <div class="pd-gallery reveal">
      <div class="pd-gallery-main"><img id="pd-main-img" src="${product.images[0]}" alt="${product.name}"></div>
      <div class="pd-thumbs" id="pd-thumbs">
        ${product.images.map((img, i) => `<div class="pd-thumb ${i === 0 ? 'active' : ''}" data-src="${img}"><img src="${img}" alt=""></div>`).join('')}
      </div>
    </div>
    <div class="pd-info reveal">
      <span class="product-card-cat">${product.category}</span>
      <h1 style="font-size:var(--step-3);margin-top:0.4rem">${product.name}</h1>
      <div class="pd-price">${formatNaira(product.price)}</div>
      <div class="pd-meta-row">
        <span class="pill">${product.location}</span>
        <span class="pill">${statusLabelMap[product.availability]}</span>
      </div>
      <p style="color:var(--color-ink-soft)">${product.description}</p>

      ${product.availability === 'available' ? `
      <div style="margin-top:1.5rem">
        <label style="font-size:0.84rem;font-weight:600;display:block;margin-bottom:0.6rem">Quantity</label>
        <div class="qty-selector">
          <button type="button" id="qty-minus" aria-label="Decrease quantity">−</button>
          <span id="qty-value">1</span>
          <button type="button" id="qty-plus" aria-label="Increase quantity">+</button>
        </div>
      </div>` : ''}

      <div class="pd-cta-row">
        ${product.availability === 'available'
          ? `<a href="checkout.html?id=${product.id}&qty=1" id="pd-order-btn" class="btn btn-primary">Place order</a>`
          : `<button class="btn btn-primary" disabled>${statusLabelMap[product.availability]}</button>`}
        <a href="contact.html" class="btn btn-secondary">Contact HADÉRA</a>
      </div>

      <div class="pd-specs">
        <h3>Specifications</h3>
        ${Object.entries(product.specifications).map(([k, v]) => `
          <div class="spec-row"><span>${k}</span><span>${v}</span></div>
        `).join('')}
      </div>
    </div>
  `;

  HADERA.initReveal();

  // gallery thumb switching
  qs('#pd-thumbs').addEventListener('click', (e) => {
    const thumb = e.target.closest('.pd-thumb');
    if (!thumb) return;
    qs('#pd-main-img').src = thumb.dataset.src;
    HADERA.qsa('.pd-thumb').forEach(t => t.classList.remove('active'));
    thumb.classList.add('active');
  });

  // quantity selector, kept in sync with the order link
  let qty = 1;
  const qtyValue = qs('#qty-value');
  const minusBtn = qs('#qty-minus');
  const plusBtn = qs('#qty-plus');
  const orderBtn = qs('#pd-order-btn');
  function syncOrderLink() { if (orderBtn) orderBtn.href = `checkout.html?id=${product.id}&qty=${qty}`; }
  if (minusBtn) minusBtn.addEventListener('click', () => { if (qty > 1) { qty--; qtyValue.textContent = qty; syncOrderLink(); } });
  if (plusBtn) plusBtn.addEventListener('click', () => { qty++; qtyValue.textContent = qty; syncOrderLink(); });
});
