/* ==========================================================================
   HADÉRA — admin.js
   Admin authentication guard and shared admin shell.
   ========================================================================== */

const ADMIN_NAV = [
  {
    href: 'dashboard.html',
    label: 'Dashboard',
    icon: 'grid'
  },
  {
    href: 'products.html',
    label: 'Products',
    icon: 'box'
  },
  {
    href: 'orders.html',
    label: 'Orders',
    icon: 'cart',
    badge: 'orders'
  },
  {
    href: 'appointments.html',
    label: 'Appointments',
    icon: 'calendar',
    badge: 'appointments'
  },
  {
    href: 'categories.html',
    label: 'Categories',
    icon: 'tag'
  },
  {
    href: 'settings.html',
    label: 'Settings',
    icon: 'settings'
  }
];

const ADMIN_ICONS = {
  grid: `
    <svg viewBox="0 0 20 20" fill="none">
      <rect x="2" y="2" width="6" height="6" rx="1" stroke="currentColor"/>
      <rect x="12" y="2" width="6" height="6" rx="1" stroke="currentColor"/>
      <rect x="2" y="12" width="6" height="6" rx="1" stroke="currentColor"/>
      <rect x="12" y="12" width="6" height="6" rx="1" stroke="currentColor"/>
    </svg>
  `,

  box: `
    <svg viewBox="0 0 20 20" fill="none">
      <path
        d="M3 6.5 10 3l7 3.5v7L10 17l-7-3.5v-7Z"
        stroke="currentColor"
      />
      <path
        d="m3 6.5 7 3.5 7-3.5M10 10v7"
        stroke="currentColor"
      />
    </svg>
  `,

  cart: `
    <svg viewBox="0 0 20 20" fill="none">
      <path
        d="M2 3h2l1.4 8.2a1 1 0 0 0 1 .8h8.8a1 1 0 0 0 1-.8L17 6H5"
        stroke="currentColor"
        stroke-linecap="round"
      />
      <circle cx="8" cy="15.5" r="1" fill="currentColor"/>
      <circle cx="15" cy="15.5" r="1" fill="currentColor"/>
    </svg>
  `,

  calendar: `
    <svg viewBox="0 0 20 20" fill="none">
      <rect
        x="2.5"
        y="4"
        width="15"
        height="13.5"
        rx="1.5"
        stroke="currentColor"
      />
      <path
        d="M6 2.5v3M14 2.5v3M2.5 8h15"
        stroke="currentColor"
      />
    </svg>
  `,

  tag: `
    <svg viewBox="0 0 20 20" fill="none">
      <path
        d="M3 3h6l8 8-6 6-8-8V3Z"
        stroke="currentColor"
      />
      <circle
        cx="6.5"
        cy="6.5"
        r="1"
        fill="currentColor"
      />
    </svg>
  `,

  settings: `
    <svg viewBox="0 0 20 20" fill="none">
      <circle
        cx="10"
        cy="10"
        r="3"
        stroke="currentColor"
      />
      <path
        d="m16 11 1.2 1-.9 1.6-1.5-.5a6.8 6.8 0 0 1-1.4.8l-.2 1.6h-1.8l-.2-1.6a6.8 6.8 0 0 1-1.4-.8l-1.5.5-.9-1.6 1.2-1a6.5 6.5 0 0 1 0-1.9l-1.2-1 .9-1.6 1.5.5a6.8 6.8 0 0 1 1.4-.8l.2-1.6h1.8l.2 1.6a6.8 6.8 0 0 1 1.4.8l1.5-.5.9 1.6-1.2 1a6.5 6.5 0 0 1 0 1.9Z"
        stroke="currentColor"
      />
    </svg>
  `
};


/* --------------------------------------------------------------------------
   CURRENT ADMIN PAGE
   -------------------------------------------------------------------------- */

function currentAdminPage() {
  return (
    window.location.pathname.split('/').pop() ||
    'dashboard.html'
  );
}


/* --------------------------------------------------------------------------
   BADGE HELPERS
   -------------------------------------------------------------------------- */

function getAdminBadgeCounts() {
  try {
    const raw = localStorage.getItem(
      'hadera_admin_badge_counts'
    );

    if (!raw) {
      return {
        orders: 0,
        appointments: 0
      };
    }

    const parsed = JSON.parse(raw);

    return {
      orders: Number(parsed.orders || 0),
      appointments: Number(parsed.appointments || 0)
    };
  } catch {
    return {
      orders: 0,
      appointments: 0
    };
  }
}

function saveAdminBadgeCounts(counts) {
  localStorage.setItem(
    'hadera_admin_badge_counts',
    JSON.stringify({
      orders: Number(counts.orders || 0),
      appointments: Number(counts.appointments || 0)
    })
  );
}


/* --------------------------------------------------------------------------
   ADMIN SHELL
   -------------------------------------------------------------------------- */

function renderAdminShell(pageTitle) {
  const active = currentAdminPage();

  const sidebarMount =
    document.getElementById('admin-sidebar');

  const topbarMount =
    document.getElementById('admin-topbar');

  if (!sidebarMount || !topbarMount) {
    return;
  }

  const badgeCounts =
    getAdminBadgeCounts();

  sidebarMount.innerHTML = `
    <div class="admin-brand">
      <a href="../index.html">HADÉRA</a>
    </div>

    <nav
      class="admin-nav"
      aria-label="Admin navigation"
    >
      ${ADMIN_NAV.map(item => {
    const badgeCount =
      item.badge
        ? Number(
          badgeCounts[item.badge] || 0
        )
        : 0;

    return `
          <a
            href="${item.href}"
            class="${item.href === active
        ? 'active'
        : ''
      }"
          >
            <span class="admin-nav-icon">
              ${ADMIN_ICONS[item.icon] || ''}
            </span>

            <span>
              ${item.label}
            </span>

            ${badgeCount > 0
        ? `
                  <span
                    class="admin-nav-badge"
                    aria-label="${badgeCount} new ${item.label
        }"
                  >
                    ${badgeCount > 99
          ? '99+'
          : badgeCount
        }
                  </span>
                `
        : ''
      }
          </a>
        `;
  }).join('')}
    </nav>

    <div class="admin-sidebar-bottom">
      <a
        href="../index.html"
        class="admin-storefront-link"
      >
        View storefront
      </a>

      <button
        type="button"
        id="admin-logout-link"
        class="admin-logout"
      >
        Log out
      </button>
    </div>
  `;

  topbarMount.innerHTML = `
    <div class="hstack gap-s">
      <button
        class="sidebar-burger"
        id="sidebar-burger"
        type="button"
        aria-label="Open menu"
        aria-expanded="false"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      <h1>${pageTitle}</h1>
    </div>

    <div class="admin-topbar-actions">
      <div class="admin-avatar">
        HA
      </div>
    </div>
  `;

  const sidebar =
    sidebarMount;

  const burger =
    document.getElementById(
      'sidebar-burger'
    );

  if (burger) {
    burger.addEventListener(
      'click',
      () => {
        const isOpen =
          sidebar.classList.toggle(
            'open'
          );

        burger.setAttribute(
          'aria-expanded',
          String(isOpen)
        );
      }
    );
  }

  sidebar
    .querySelectorAll('a')
    .forEach(link => {
      link.addEventListener(
        'click',
        () => {
          sidebar.classList.remove(
            'open'
          );

          if (burger) {
            burger.setAttribute(
              'aria-expanded',
              'false'
            );
          }
        }
      );
    });

  const logoutBtn =
    document.getElementById(
      'admin-logout-link'
    );

  if (logoutBtn) {
    logoutBtn.addEventListener(
      'click',
      async () => {
        logoutBtn.disabled = true;

        try {
          await logoutAdmin();
        } finally {
          window.location.replace(
            '../index.html'
          );
        }
      }
    );
  }
}


/* --------------------------------------------------------------------------
   STATUS TAG
   -------------------------------------------------------------------------- */

function statusTagHTML(status) {
  const labels = {
    pending: 'Pending',
    paid: 'Paid',
    failed: 'Failed',
    processing: 'Processing',
    confirmed: 'Confirmed',
    completed: 'Completed',
    cancelled: 'Cancelled',
    available: 'Available',
    reserved: 'Reserved',
    sold: 'Sold out'
  };

  const label =
    labels[status] ||
    String(status || '')
      .replace(/[-_]/g, ' ')
      .replace(
        /\b\w/g,
        char => char.toUpperCase()
      );

  return `
    <span
      class="status-tag status-${status || 'default'}"
    >
      ${label}
    </span>
  `;
}
