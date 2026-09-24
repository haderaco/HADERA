document.addEventListener('DOMContentLoaded', async () => {
    if (!requireAdminSession()) return;

    renderAdminShell('Dashboard');
    HADERA.initReveal();

    const chart = document.getElementById('chart-bars');
    const apptList =
        document.getElementById('recent-appointments');

    const ordersBody =
        document.querySelector(
            '#recent-orders-table tbody'
        );

    try {
        const dashboard = await getDashboardStats();

        const stats = dashboard.stats || dashboard;

        const statCards =
            document.querySelectorAll('.stat-card');

        if (statCards[0]) {
            statCards[0].querySelector('.value').textContent =
                stats.totalProducts ?? 0;
        }

        if (statCards[1]) {
            statCards[1].querySelector('.value').textContent =
                stats.totalOrders ?? 0;
        }

        if (statCards[2]) {
            statCards[2].querySelector('.value').textContent =
                stats.pendingOrders ?? 0;
        }

        if (statCards[3]) {
            statCards[3].querySelector('.value').textContent =
                HADERA.formatNaira(stats.revenue ?? 0);
        }

        const days =
            dashboard.ordersByDay ||
            dashboard.chart ||
            [];

        if (chart && days.length) {
            const max = Math.max(
                ...days.map(day => Number(day.value || day.v || 0)),
                1
            );

            chart.innerHTML = days.map(day => {
                const value =
                    Number(day.value || day.v || 0);

                return `
          <div class="chart-bar-col">
            <div
              class="chart-bar"
              style="height:${(value / max) * 100}%"
              title="${value} orders"
            ></div>

            <span class="chart-bar-label">
              ${day.label || day.d || ''}
            </span>
          </div>
        `;
            }).join('');
        }

        const appointments =
            dashboard.recentAppointments ||
            [];

        if (apptList) {
            apptList.innerHTML = appointments.length
                ? appointments.map(appointment => `
            <li>
              <span>
                ${appointment.customer?.fullName ||
                    appointment.customer ||
                    'Customer'
                    }
                —
                ${appointment.service || 'Appointment'}
              </span>

              <span>
                ${statusTagHTML(appointment.status)}
              </span>
            </li>
          `).join('')
                : `
          <li>
            <span>No appointment requests yet.</span>
          </li>
        `;
        }

        const orders =
            dashboard.recentOrders ||
            [];

        if (ordersBody) {
            ordersBody.innerHTML = orders
                .slice(0, 5)
                .map(order => `
          <tr>
            <td>${order.id || order.orderId}</td>

            <td>
              ${order.customer?.fullName ||
                    order.customer ||
                    '—'
                    }
            </td>

            <td>
              ${order.product?.name ||
                    order.product ||
                    '—'
                    }
            </td>

            <td>
              ${HADERA.formatNaira(
                        order.amount ||
                        order.totalAmount ||
                        0
                    )}
            </td>

            <td>
              ${statusTagHTML(order.orderStatus)}
            </td>

            <td>
              ${order.createdAt
                        ? new Date(
                            order.createdAt
                        ).toLocaleDateString('en-NG')
                        : order.date || '—'
                    }
            </td>
          </tr>
        `)
                .join('');
        }
    } catch (error) {
        HADERA.toast(
            error.message ||
            'Unable to load dashboard data.',
            'error'
        );
    }
});