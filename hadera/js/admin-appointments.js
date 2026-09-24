document.addEventListener('DOMContentLoaded', async () => {
    if (!requireAdminSession()) return;

    renderAdminShell('Appointments');
    HADERA.initReveal();

    const tbody = document.getElementById('appointments-tbody');
    const searchInput = document.getElementById('a-search');
    const statusSelect = document.getElementById('a-status');

    const STATUS_OPTIONS = [
        'pending',
        'confirmed',
        'completed',
        'cancelled',
    ];

    let items = [];

    async function loadAppointments() {
        tbody.innerHTML = `
      <tr class="empty-row">
        <td colspan="8">Loading appointments…</td>
      </tr>
    `;

        try {
            items = await getAppointments();
            render();
        } catch (error) {
            tbody.innerHTML = `
        <tr class="empty-row">
          <td colspan="8">
            ${error.message || 'Unable to load appointments.'}
          </td>
        </tr>
      `;
        }
    }

    function render() {
        const q = searchInput.value.trim().toLowerCase();
        const status = statusSelect.value;

        const filtered = items.filter(item => {
            const customer =
                String(
                    item.customer?.fullName ||
                    item.customer ||
                    ''
                ).toLowerCase();

            return (
                (!q || customer.includes(q)) &&
                (!status || item.status === status)
            );
        });

        if (!filtered.length) {
            tbody.innerHTML = `
        <tr class="empty-row">
          <td colspan="8">
            No appointments match your filters.
          </td>
        </tr>
      `;
            return;
        }

        tbody.innerHTML = filtered.map(item => {
            const customer =
                item.customer?.fullName ||
                item.customer ||
                '—';

            const contact =
                item.customer?.phone ||
                item.contact ||
                '—';

            const service =
                item.service || '—';

            const date =
                item.date ||
                item.preferredDate ||
                '—';

            const time =
                item.time ||
                item.preferredTime ||
                '—';

            const requested =
                item.createdAt
                    ? new Date(item.createdAt).toLocaleDateString('en-NG')
                    : item.requested || '—';

            const id =
                item.id ||
                item.appointmentId;

            return `
        <tr data-id="${id}">
          <td>${customer}</td>
          <td>${contact}</td>
          <td>${service}</td>
          <td>${date}</td>
          <td>${time}</td>
          <td>${requested}</td>
          <td>${statusTagHTML(item.status)}</td>
          <td>
            <select
              class="status-update"
              data-id="${id}"
              style="padding:0.4rem 0.6rem;border:1px solid var(--color-line);border-radius:6px;font-size:0.8rem"
            >
              ${STATUS_OPTIONS.map(status => `
                <option
                  value="${status}"
                  ${status === item.status ? 'selected' : ''}
                >
                  ${status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              `).join('')}
            </select>
          </td>
        </tr>
      `;
        }).join('');
    }

    searchInput.addEventListener('input', render);
    statusSelect.addEventListener('change', render);

    tbody.addEventListener('change', async e => {
        const select =
            e.target.closest('.status-update');

        if (!select) return;

        const id = select.dataset.id;
        const newStatus = select.value;

        select.disabled = true;

        try {
            await updateAppointmentStatus(
                id,
                newStatus
            );

            const item = items.find(
                appointment =>
                    String(
                        appointment.id ||
                        appointment.appointmentId
                    ) === String(id)
            );

            if (item) {
                item.status = newStatus;
            }

            render();

            HADERA.toast(
                'Appointment status updated.',
                'success'
            );
        } catch (error) {
            HADERA.toast(
                error.message ||
                'Unable to update appointment.',
                'error'
            );

            render();
        }
    });

    await loadAppointments();
});