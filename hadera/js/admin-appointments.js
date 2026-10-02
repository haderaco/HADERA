document.addEventListener('DOMContentLoaded', async () => {
  if (!requireAdminSession()) return;

  renderAdminShell('Appointments');
  HADERA.initReveal();

  const tbody =
    document.getElementById('appointments-tbody');

  const searchInput =
    document.getElementById('a-search');

  const statusSelect =
    document.getElementById('a-status');

  const STATUS_OPTIONS = [
    'pending',
    'confirmed',
    'completed',
    'cancelled'
  ];

  let items = [];

  function getAppointmentId(item) {
    return (
      item?._id ||
      item?.id ||
      item?.appointmentId ||
      ''
    );
  }

  function getCustomerName(item) {
    return (
      item?.name ||
      item?.customer?.fullName ||
      item?.customer ||
      '—'
    );
  }

  function getCustomerPhone(item) {
    return (
      item?.phone ||
      item?.customer?.phone ||
      item?.contact ||
      '—'
    );
  }

  async function loadAppointments() {
    tbody.innerHTML = `
      <tr class="empty-row">
        <td colspan="8">
          Loading appointments…
        </td>
      </tr>
    `;

    try {
      items = await getAppointments();
      render();
    } catch (error) {
      console.error(
        'Unable to load appointments:',
        error
      );

      tbody.innerHTML = `
        <tr class="empty-row">
          <td colspan="8">
            ${error.message ||
        'Unable to load appointments.'
        }
          </td>
        </tr>
      `;
    }
  }

  function render() {
    const q =
      searchInput.value
        .trim()
        .toLowerCase();

    const selectedStatus =
      statusSelect.value;

    const filtered = items.filter((item) => {
      const customer =
        getCustomerName(item)
          .toLowerCase();

      return (
        (!q || customer.includes(q)) &&
        (
          !selectedStatus ||
          item.status === selectedStatus
        )
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

    tbody.innerHTML = filtered
      .map((item) => {
        const id =
          getAppointmentId(item);

        const customer =
          getCustomerName(item);

        const contact =
          getCustomerPhone(item);

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
            ? new Date(
              item.createdAt
            ).toLocaleDateString(
              'en-NG'
            )
            : item.requested || '—';

        return `
          <tr data-id="${id}">
            <td>${customer}</td>

            <td>${contact}</td>

            <td>${service}</td>

            <td>${date}</td>

            <td>${time}</td>

            <td>${requested}</td>

            <td>
              ${statusTagHTML(item.status)}
            </td>

            <td>
              <select
                class="status-update"
                data-id="${id}"
                style="
                  padding:0.4rem 0.6rem;
                  border:1px solid var(--color-line);
                  border-radius:6px;
                  font-size:0.8rem;
                "
                ${!id ? 'disabled' : ''}
              >
                ${STATUS_OPTIONS.map(
          (status) => `
                    <option
                      value="${status}"
                      ${status === item.status
              ? 'selected'
              : ''
            }
                    >
                      ${status
              .charAt(0)
              .toUpperCase() +
            status.slice(1)
            }
                    </option>
                  `
        ).join('')}
              </select>
            </td>
          </tr>
        `;
      })
      .join('');
  }

  searchInput.addEventListener(
    'input',
    render
  );

  statusSelect.addEventListener(
    'change',
    render
  );

  tbody.addEventListener(
    'change',
    async (event) => {
      const select =
        event.target.closest(
          '.status-update'
        );

      if (!select) return;

      const id =
        select.dataset.id;

      const newStatus =
        select.value;

      if (!id) {
        HADERA.toast(
          'Appointment ID is missing.',
          'error'
        );

        return;
      }

      const previousItem =
        items.find(
          (appointment) =>
            String(
              getAppointmentId(
                appointment
              )
            ) === String(id)
        );

      const previousStatus =
        previousItem?.status;

      select.disabled = true;

      try {
        await updateAppointmentStatus(
          id,
          newStatus
        );

        if (previousItem) {
          previousItem.status =
            newStatus;
        }

        render();

        HADERA.toast(
          'Appointment status updated.',
          'success'
        );
      } catch (error) {
        console.error(
          'Appointment status update failed:',
          error
        );

        if (previousItem) {
          previousItem.status =
            previousStatus;
        }

        render();

        HADERA.toast(
          error.message ||
          'Unable to update appointment.',
          'error'
        );
      }
    }
  );

  await loadAppointments();
});
