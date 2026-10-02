/* ==========================================================================
   HADÉRA — checkout.js
   ========================================================================== */

document.addEventListener('DOMContentLoaded', async () => {
  const {
    qs,
    formatNaira,
    toast
  } = HADERA;

  const params =
    new URLSearchParams(window.location.search);

  const productId = params.get('id');

  const requestedQty = parseInt(
    params.get('qty') || '1',
    10
  );

  const qty = Number.isFinite(requestedQty)
    ? Math.max(1, requestedQty)
    : 1;

  const summaryEl = qs('#order-summary');
  const form = qs('#checkout-form');
  const submitBtn = qs('#submit-order-btn');

  if (!summaryEl || !form || !submitBtn) {
    return;
  }

  let product;

  /* ------------------------------------------------------------------------
     Load product
     ------------------------------------------------------------------------ */

  try {
    product = productId
      ? await getProduct(productId)
      : null;
  } catch (error) {
    console.error('Product loading error:', error);

    summaryEl.innerHTML = `
      <div class="state-msg">
        <h3>Unable to load product</h3>
        <p>Please try again.</p>

        <a
          href="products.html"
          class="btn btn-primary mt-l"
        >
          Browse products
        </a>
      </div>
    `;

    form.style.display = 'none';

    return;
  }

  if (!product) {
    summaryEl.innerHTML = `
      <div class="state-msg">
        <h3>No product selected</h3>

        <p>
          Choose a product before checking out.
        </p>

        <a
          href="products.html"
          class="btn btn-primary mt-l"
        >
          Browse products
        </a>
      </div>
    `;

    form.style.display = 'none';

    return;
  }

  /* ------------------------------------------------------------------------
     Product availability
     ------------------------------------------------------------------------ */

  if (product.availability !== 'available') {
    summaryEl.innerHTML = `
      <div class="state-msg">
        <h3>Product unavailable</h3>

        <p>
          This product is no longer available for purchase.
        </p>

        <a
          href="products.html"
          class="btn btn-primary mt-l"
        >
          Browse products
        </a>
      </div>
    `;

    form.style.display = 'none';

    return;
  }

  const productIdValue =
    product._id || product.id;

  const productImage =
    typeof product.images?.[0] === 'string'
      ? product.images[0]
      : product.images?.[0]?.url || '';

  const displayedTotal =
    Number(product.price) * qty;

  /* ------------------------------------------------------------------------
     Order summary
     ------------------------------------------------------------------------ */

  summaryEl.innerHTML = `
    <h3
      style="
        font-size:1.05rem;
        margin-bottom:1.2rem
      "
    >
      Order summary
    </h3>

    <div class="summary-product">
      ${productImage
      ? `
            <img
              src="${productImage}"
              alt="${product.name || 'Product'}"
            >
          `
      : `
            <div
              class="product-image-placeholder"
              style="
                width:76px;
                height:76px;
                border-radius:var(--radius-s)
              "
              aria-label="No product image"
            ></div>
          `
    }

      <div>
        <div
          style="
            font-family:var(--font-display);
            font-size:1.02rem
          "
        >
          ${product.name || 'Product'}
        </div>

        <div
          style="
            font-size:0.85rem;
            color:var(--color-ink-soft);
            margin-top:0.2rem
          "
        >
          ${product.category || ''}
          ${product.location ? ` · ${product.location}` : ''}
        </div>
      </div>
    </div>

    <div class="summary-row">
      <span>Unit price</span>
      <span>
        ${formatNaira(product.price)}
      </span>
    </div>

    <div class="summary-row">
      <span>Quantity</span>
      <span>${qty}</span>
    </div>

    <div class="summary-total">
      <span>Total</span>
      <span>
        ${formatNaira(displayedTotal)}
      </span>
    </div>
  `;

  /* ------------------------------------------------------------------------
     Validation
     ------------------------------------------------------------------------ */

  const requiredFields = [
    'fullName',
    'email',
    'phone',
    'state',
    'city',
    'address'
  ];

  function validate() {
    let valid = true;

    requiredFields.forEach(name => {
      const input = form.elements[name];

      if (!input) {
        return;
      }

      const field = input.closest('.field');

      let ok =
        input.value.trim().length > 0;

      /* Email */
      if (name === 'email' && ok) {
        ok =
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            .test(input.value.trim());
      }

      /* Phone */
      if (name === 'phone' && ok) {
        ok =
          input.value
            .trim()
            .replace(/\D/g, '')
            .length >= 10;
      }

      if (field) {
        field.classList.toggle(
          'error',
          !ok
        );
      }

      if (!ok) {
        valid = false;
      }
    });

    return valid;
  }

  requiredFields.forEach(name => {
    const input = form.elements[name];

    if (input) {
      input.addEventListener(
        'blur',
        validate
      );
    }
  });

  /* ------------------------------------------------------------------------
     Submit order
     ------------------------------------------------------------------------ */

  form.addEventListener(
    'submit',
    async e => {
      e.preventDefault();

      if (!validate()) {
        toast(
          'Please fix the highlighted fields.',
          'error'
        );

        return;
      }

      if (!productIdValue) {
        toast(
          'Unable to identify the selected product.',
          'error'
        );

        return;
      }

      submitBtn.disabled = true;

      submitBtn.textContent =
        'Placing order…';

      /*
        IMPORTANT:

        The backend expects the customer details
        at the top level of the request body.

        Do NOT nest them inside `customer`.
      */

      const orderData = {
        productId: productIdValue,

        quantity: qty,

        name:
          form.fullName.value.trim(),

        email:
          form.email.value.trim(),

        phone:
          form.phone.value.trim(),

        whatsapp:
          form.whatsapp?.value.trim() || '',

        state:
          form.state.value,

        city:
          form.city.value.trim(),

        address:
          form.address.value.trim(),

        notes:
          form.notes?.value.trim() || ''
      };

      console.log(
        'Submitting order:',
        orderData
      );

      try {
        /*
          The backend calculates the real price
          from productId + quantity.

          Never trust a price or amount supplied
          by the browser.
        */

        const order =
          await createOrder(orderData);

        const orderId =
          order.orderId ||
          order.order?.orderId ||
          order.order?.id ||
          order.id;

        if (!orderId) {
          throw new Error(
            'Order was created without an order reference.'
          );
        }

        /* ---------------------------------------------------------------
           Initialize payment
           --------------------------------------------------------------- */

        const payment =
          await initializePayment({
            orderId
          });

        const authorizationUrl =
          payment.checkoutUrl ||
          payment.authorizationUrl ||
          payment.authorization_url ||
          payment.paymentUrl ||
          payment.url;

        if (!authorizationUrl) {
          console.error(
            'Payment initialization response:',
            payment
          );

          throw new Error(
            'Payment gateway did not return a checkout URL.'
          );
        }

        window.location.href =
          authorizationUrl;

      } catch (error) {
        console.error(
          'Checkout error:',
          error
        );

        toast(
          error.message ||
          'Something went wrong placing your order. Please try again.',
          'error'
        );

        submitBtn.disabled = false;

        submitBtn.textContent =
          'Proceed to payment';
      }
    }
  );
});