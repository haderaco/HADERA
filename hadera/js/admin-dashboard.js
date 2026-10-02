document.addEventListener(
  'DOMContentLoaded',
  async () => {
    if (!requireAdminSession()) {
      return;
    }

    renderAdminShell('Dashboard');

    HADERA.initReveal();

    const chart =
      document.getElementById(
        'chart-bars'
      );

    const apptList =
      document.getElementById(
        'recent-appointments'
      );

    const ordersBody =
      document.querySelector(
        '#recent-orders-table tbody'
      );

    const totalProductsEl =
      document.getElementById(
        'stat-total-products'
      );

    const totalOrdersEl =
      document.getElementById(
        'stat-total-orders'
      );

    const pendingOrdersEl =
      document.getElementById(
        'stat-pending-orders'
      );

    const totalAppointmentsEl =
      document.getElementById(
        'stat-total-appointments'
      );

    const revenueEl =
      document.getElementById(
        'stat-revenue'
      );

    try {
      const result =
        await getDashboardStats();

      const dashboard =
        result?.dashboard ||
        result?.stats ||
        result ||
        {};

      const stats =
        dashboard.stats ||
        dashboard;

      const products =
        dashboard.products ||
        {};

      const orders =
        dashboard.orders ||
        {};

      const appointments =
        dashboard.appointments ||
        {};

      /* --------------------------------------------------
         STATS
         -------------------------------------------------- */

      const totalProducts =
        stats.totalProducts ??
        products.total ??
        0;

      const totalOrders =
        stats.totalOrders ??
        orders.total ??
        0;

      const pendingOrders =
        stats.pendingOrders ??
        orders.pending ??
        0;

      const totalAppointments =
        stats.totalAppointments ??
        appointments.total ??
        0;

      const revenue =
        stats.revenue ??
        dashboard.revenue ??
        0;

      if (totalProductsEl) {
        totalProductsEl.textContent =
          Number(
            totalProducts
          ).toLocaleString('en-NG');
      }

      if (totalOrdersEl) {
        totalOrdersEl.textContent =
          Number(
            totalOrders
          ).toLocaleString('en-NG');
      }

      if (pendingOrdersEl) {
        pendingOrdersEl.textContent =
          Number(
            pendingOrders
          ).toLocaleString('en-NG');
      }

      if (totalAppointmentsEl) {
        totalAppointmentsEl.textContent =
          Number(
            totalAppointments
          ).toLocaleString('en-NG');
      }

      if (revenueEl) {
        revenueEl.textContent =
          HADERA.formatNaira(
            revenue
          );
      }


      /* --------------------------------------------------
         SAVE BADGE COUNTS
         -------------------------------------------------- */

      const unseenOrders =
        Number(
          stats.unseenOrders ??
          orders.unseen ??
          0
        );

      const unseenAppointments =
        Number(
          stats.unseenAppointments ??
          appointments.unseen ??
          0
        );

      localStorage.setItem(
        'hadera_admin_badge_counts',
        JSON.stringify({
          orders: unseenOrders,
          appointments:
            unseenAppointments
        })
      );


      /* --------------------------------------------------
         ORDERS CHART
         -------------------------------------------------- */

      const days =
        dashboard.ordersByDay ||
        dashboard.chart ||
        [];

      if (
        chart &&
        Array.isArray(days) &&
        days.length
      ) {
        const max =
          Math.max(
            ...days.map(day =>
              Number(
                day.value ??
                day.v ??
                0
              )
            ),
            1
          );

        chart.innerHTML =
          days
            .map(day => {
              const value =
                Number(
                  day.value ??
                  day.v ??
                  0
                );

              const height =
                Math.max(
                  (value / max) * 100,
                  value > 0 ? 4 : 0
                );

              return `
                <div
                  class="chart-bar-col"
                >
                  <div
                    class="chart-bar"
                    style="height:${height}%"
                    title="${value} orders"
                  ></div>

                  <span
                    class="chart-bar-label"
                  >
                    ${day.label ||
                day.d ||
                ''
                }
                  </span>
                </div>
              `;
            })
            .join('');
      } else if (chart) {
        chart.innerHTML = `
          <div
            style="
              width:100%;
              text-align:center;
              color:var(--color-ink-faint);
              padding:2rem 0;
            "
          >
            No order data available yet.
          </div>
        `;
      }


      /* --------------------------------------------------
         RECENT APPOINTMENTS
         -------------------------------------------------- */

      const recentAppointments =
        Array.isArray(
          dashboard.recentAppointments
        )
          ? dashboard.recentAppointments
          : [];

      if (apptList) {
        if (
          !recentAppointments.length
        ) {
          apptList.innerHTML = `
            <li>
              <span>
                No appointment requests yet.
              </span>
            </li>
          `;
        } else {
          apptList.innerHTML =
            recentAppointments
              .map(
                appointment => {
                  const customerName =
                    appointment.name ||
                    appointment.customer
                      ?.fullName ||
                    appointment.customer
                      ?.name ||
                    appointment.customer ||
                    'Customer';

                  const service =
                    appointment.service ||
                    'Appointment';

                  return `
                    <li>
                      <span>
                        ${escapeHTML(
                    customerName
                  )}
                        —
                        ${escapeHTML(
                    service
                  )}
                      </span>

                      <span>
                        ${statusTagHTML(
                    appointment.status
                  )}
                      </span>
                    </li>
                  `;
                }
              )
              .join('');
        }
      }


      /* --------------------------------------------------
         RECENT ORDERS
         -------------------------------------------------- */

      const recentOrders =
        Array.isArray(
          dashboard.recentOrders
        )
          ? dashboard.recentOrders
          : [];

      if (ordersBody) {
        if (!recentOrders.length) {
          ordersBody.innerHTML = `
            <tr>
              <td
                colspan="6"
                style="text-align:center;"
              >
                No orders yet.
              </td>
            </tr>
          `;
        } else {
          ordersBody.innerHTML =
            recentOrders
              .slice(0, 5)
              .map(order => {
                const orderId =
                  order.orderId ||
                  order.id ||
                  '—';

                const customerName =
                  order.customer?.name ||
                  order.customer?.fullName ||
                  order.customer ||
                  '—';

                const productName =
                  order.product?.name ||
                  order.product ||
                  '—';

                const amount =
                  order.amount ??
                  order.totalAmount ??
                  0;

                const orderDate =
                  order.createdAt
                    ? new Date(
                      order.createdAt
                    ).toLocaleDateString(
                      'en-NG'
                    )
                    : order.date ||
                    '—';

                return `
                  <tr>
                    <td>
                      ${escapeHTML(
                  orderId
                )}
                    </td>

                    <td>
                      ${escapeHTML(
                  customerName
                )}
                    </td>

                    <td>
                      ${escapeHTML(
                  productName
                )}
                    </td>

                    <td>
                      ${HADERA.formatNaira(
                  amount
                )}
                    </td>

                    <td>
                      ${statusTagHTML(
                  order.orderStatus
                )}
                    </td>

                    <td>
                      ${orderDate}
                    </td>
                  </tr>
                `;
              })
              .join('');
        }
      }
    } catch (error) {
      console.error(
        'Dashboard loading failed:',
        error
      );

      HADERA.toast(
        error.message ||
        'Unable to load dashboard data.',
        'error'
      );
    }
  }
);


/* --------------------------------------------------------------------------
   HTML ESCAPE
   -------------------------------------------------------------------------- */

function escapeHTML(value) {
  return String(value ?? '')
    .replace(
      /&/g,
      '&amp;'
    )
    .replace(
      /</g,
      '&lt;'
    )
    .replace(
      />/g,
      '&gt;'
    )
    .replace(
      /"/g,
      '&quot;'
    )
    .replace(
      /'/g,
      '&#039;'
    );
}
