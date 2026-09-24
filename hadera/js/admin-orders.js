document.addEventListener('DOMContentLoaded', async () => {
  if (!requireAdminSession()) return;

  renderAdminShell('Orders');
  HADERA.initReveal();

  const tbody = document.getElementById('orders-tbody');
  const searchInput = document.getElementById('o-search');
  const statusSelect = document.getElementById('o-status');

  let orders = [];
  let activeOrderId = null;

  async function loadOrders() {
    tbody.innerHTML = `
      <tr class="empty-row">
        <td colspan="8">Loading orders…</td>
      </tr>
    `;

    try {
      orders = await getOrders();
      renderTable();
    } catch (error) {
      tbody.innerHTML = `
        <tr class="empty-row">
          <td colspan="8">
            ${error.message || 'Unable to load orders.'}
          </td>
        </tr>
      `;
    }
  }

  function renderTable() {
    const q = searchInput.value.trim().toLowerCase();
    const status = statusSelect.value;

    const filtered = orders.filter(order => {
      const customer = String(
        order.customer?.fullName ||
        order.customer ||
        ''
      ).toLowerCase();

      const id = String(
        order.id ||
        order.orderId ||
        ''
      ).toLowerCase();

      return (
        (!q ||
          customer.includes(q) ||
          id.includes(q)) &&
        (!status || order.orderStatus === status)
      );
    });

    if (!filtered.length) {
      tbody.innerHTML = `
        <tr class="empty-row">
          <td colspan="8">No orders match your filters.</td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = filtered.map(order => {
      const id = order.id || order.orderId;

      const customer =
        order.customer?.fullName ||
        order.customer ||
        '—';

      const product =
        order.product?.name ||
        order.product ||
        '—';

      const amount =
        order.amount ??
        order.totalAmount ??
        0;

      const date =
        order.createdAt
          ? new Date(order.createdAt).toLocaleDateString('en-NG')
          : order.date || '—';

      return `
        <tr>
          <td>${id}</td>
          <td>${customer}</td>
          <td>${product}</td>
          <td>${HADERA.formatNaira(amount)}</td>
          <td>${statusTagHTML(order.paymentStatus)}</td>
          <td>${statusTagHTML(order.orderStatus)}</td>
          <td>${date}</td>
          <td>
            <button
              type="button"
              class="btn btn-secondary btn-sm view-order-btn"
              data-id="${id}"
            >
              View
            </button>
          </td>
        </tr>
      `;
    }).join('');
  }

  [searchInput, statusSelect].forEach(element => {
    element.addEventListener('input', renderTable);
    element.addEventListener('change', renderTable);
  });

  const backdrop =
    document.getElementById('order-modal-backdrop');

  const modal =
    document.getElementById('order-modal');

  const drawerBody =
    document.getElementById('order-drawer-body');

  const statusSelectDrawer =
    document.getElementById('order-status-select');

  function openModal() {
    backdrop.classList.add('open');
    modal.classList.add('open');
  }

  function closeModal() {
    backdrop.classList.remove('open');
    modal.classList.remove('open');
    activeOrderId = null;
  }

  document
    .getElementById('order-modal-close')
    .addEventListener('click', closeModal);

  backdrop.addEventListener('click', closeModal);

  tbody.addEventListener('click', e => {
    const btn = e.target.closest('.view-order-btn');

    if (!btn) return;

    const order = orders.find(
      item =>
        String(item.id || item.orderId) ===
        String(btn.dataset.id)
    );

    if (!order) return;

    activeOrderId = order.id || order.orderId;

    const customer =
      order.customer?.fullName ||
      order.customer ||
      '—';

    const email =
      order.customer?.email ||
      '—';

    const phone =
      order.customer?.phone ||
      '—';

    const address = [
      order.customer?.address,
      order.customer?.city,
      order.customer?.state,
    ]
      .filter(Boolean)
      .join(', ');

    const product =
      order.product?.name ||
      order.product ||
      '—';

    const amount =
      order.amount ??
      order.totalAmount ??
      0;

    drawerBody.innerHTML = `
      <div class="drawer-row">
        <span>Order ID</span>
        <span><strong>${activeOrderId}</strong></span>
      </div>

      <div class="drawer-row">
        <span>Customer</span>
        <span>${customer}</span>
      </div>

      <div class="drawer-row">
        <span>Email</span>
        <span>${email}</span>
      </div>

      <div class="drawer-row">
        <span>Phone</span>
        <span>${phone}</span>
      </div>

      <div class="drawer-row">
        <span>Address</span>
        <span>${address || '—'}</span>
      </div>

      <div class="drawer-row">
        <span>Product</span>
        <span>${product}</span>
      </div>

      <div class="drawer-row">
        <span>Quantity</span>
        <span>${order.quantity || 1}</span>
      </div>

      <div class="drawer-row">
        <span>Amount</span>
        <span>${HADERA.formatNaira(amount)}</span>
      </div>

      <div class="drawer-row">
        <span>Payment status</span>
        <span>${statusTagHTML(order.paymentStatus)}</span>
      </div>

      <div class="drawer-row">
        <span>Order status</span>
        <span>${statusTagHTML(order.orderStatus)}</span>
      </div>
    `;

    statusSelectDrawer.value =
      order.orderStatus || 'pending';

    openModal();
  });

  document
    .getElementById('order-status-save')
    .addEventListener('click', async () => {
      if (!activeOrderId) return;

      const button =
        document.getElementById('order-status-save');

      button.disabled = true;
      button.textContent = 'Saving…';

      try {
        await updateOrderStatus(
          activeOrderId,
          statusSelectDrawer.value
        );

        const order = orders.find(
          item =>
            String(item.id || item.orderId) ===
            String(activeOrderId)
        );

        if (order) {
          order.orderStatus =
            statusSelectDrawer.value;
        }

        renderTable();
        closeModal();

        HADERA.toast(
          'Order status updated.',
          'success'
        );
      } catch (error) {
        HADERA.toast(
          error.message ||
          'Unable to update order status.',
          'error'
        );
      } finally {
        button.disabled = false;
        button.textContent = 'Save status';
      }
    });

  await loadOrders();
});