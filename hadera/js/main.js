/* ==========================================================================
   HADÉRA — main.js
   Shared storefront header, footer, navigation and responsive menu.
   ========================================================================== */

const NAV_LINKS = [
  { href: 'index.html', label: 'Home' },
  { href: 'products.html', label: 'Shop' },
  { href: 'appointment.html', label: 'Appointments' },
  { href: 'about.html', label: 'About' },
  { href: 'contact.html', label: 'Contact' },
];


/* ==========================================================================
   PATH HELPERS
   ========================================================================== */

function getPagePrefix() {
  const pathname = window.location.pathname;

  /*
    main.js is shared by:
      /index.html
      /products.html
      /account/dashboard.html
      /account/login.html
      /account/signup.html

    Root storefront pages need no prefix.
    Nested account/admin pages need ../
  */

  return /\/(account|admin)\//i.test(pathname)
    ? '../'
    : '';
}

function appPath(path) {
  return `${getPagePrefix()}${path}`;
}


/* ==========================================================================
   PAGE HELPERS
   ========================================================================== */

function currentPage() {
  const page =
    window.location.pathname
      .split('/')
      .pop()
      ?.split('?')[0]
      ?.split('#')[0];

  return page || 'index.html';
}

function hasAdminSession() {
  return Boolean(
    localStorage.getItem('hadera_admin_token') ||
    sessionStorage.getItem('hadera_admin_token')
  );
}

function getCustomerUser() {
  const raw =
    localStorage.getItem('hadera_customer_user') ||
    sessionStorage.getItem('hadera_customer_user');

  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function hasCustomerSession() {
  return Boolean(
    localStorage.getItem('hadera_customer_token') ||
    sessionStorage.getItem('hadera_customer_token')
  );
}

function getAdminUser() {
  const raw =
    localStorage.getItem('hadera_admin_user') ||
    sessionStorage.getItem('hadera_admin_user');

  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}


/* ==========================================================================
   INITIALS / ACCOUNT LINK
   ========================================================================== */

function getInitials(name, fallback = 'HA') {
  const value = String(name || '').trim();

  if (!value) return fallback;

  const parts = value
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 1) {
    return parts[0]
      .slice(0, 2)
      .toUpperCase();
  }

  return (
    parts[0].charAt(0) +
    parts[parts.length - 1].charAt(0)
  ).toUpperCase();
}

function getCustomerAccountLink() {
  return appPath(
    hasCustomerSession()
      ? 'account/dashboard.html'
      : 'login.html'
  );
}

function getLoggedInAccountHTML() {
  /*
    Admin takes priority if an admin session exists.
    Otherwise the customer account is used.
  */

  if (hasAdminSession()) {
    const admin = getAdminUser();

    const name =
      admin?.name ||
      admin?.email ||
      'HADÉRA Admin';

    const initials = getInitials(name, 'HA');

    return `
      <a
        href="${appPath('admin/dashboard.html')}"
        class="nav-account-avatar"
        aria-label="Admin dashboard"
        title="Admin dashboard"
      >
        ${initials}
      </a>
    `;
  }

  if (hasCustomerSession()) {
    const customer = getCustomerUser();

    const name =
      customer?.name ||
      customer?.email ||
      'My Account';

    const initials = getInitials(name, 'AC');

    return `
      <a
        href="${appPath('account/dashboard.html')}"
        class="nav-account-avatar"
        aria-label="My account"
        title="My account"
      >
        ${initials}
      </a>
    `;
  }

  return `
    <a
      href="${getCustomerAccountLink()}"
      class="nav-account-avatar nav-account-guest"
      aria-label="My account"
      title="My account"
    >
      <svg
        viewBox="0 0 24 24"
        width="20"
        height="20"
        fill="none"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="8" r="4"></circle>
        <path d="M4 21c0-4.2 3.4-7 8-7s8 2.8 8 7"></path>
      </svg>
    </a>
  `;
}


/* ==========================================================================
   HEADER
   ========================================================================== */

function navLinkHTML(link, activePage) {
  const isActive =
    link.href === activePage;

  return `
    <a
      href="${appPath(link.href)}"
      class="${isActive ? 'active' : ''}"
    >
      ${link.label}
    </a>
  `;
}

function renderHeader() {
  const mount =
    document.getElementById('site-header');

  if (!mount) return;

  const activePage = currentPage();

  mount.innerHTML = `
    <header class="site-header">
      <div class="container nav-wrap">

        <a
          href="${appPath('index.html')}"
          class="site-logo"
          aria-label="HADÉRA home"
        >
          HADÉRA
        </a>

        <nav
          class="nav-links"
          aria-label="Main navigation"
        >
          ${NAV_LINKS
      .map(link =>
        navLinkHTML(link, activePage)
      )
      .join('')}
        </nav>

        <div class="nav-actions">

          ${getLoggedInAccountHTML()}

          <button
            type="button"
            class="nav-burger"
            id="nav-burger"
            aria-label="Open navigation"
            aria-expanded="false"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>

        </div>

      </div>

      <div
        class="mobile-menu"
        id="mobile-menu"
        aria-hidden="true"
      >
        <div class="mobile-menu-inner">

          <div class="mobile-menu-header">
            <span>Menu</span>

            <button
              type="button"
              class="mobile-menu-close"
              id="mobile-menu-close"
              aria-label="Close menu"
            >
              &times;
            </button>
          </div>

          <nav
            class="mobile-nav-links"
            aria-label="Mobile navigation"
          >
            ${NAV_LINKS
      .map(link => `
                <a
                  href="${appPath(link.href)}"
                  class="${link.href === activePage ? 'active' : ''}"
                >
                  ${link.label}
                </a>
              `)
      .join('')}

            ${hasCustomerSession()
      ? `
                  <a href="${appPath('account/dashboard.html')}">
                    My Account
                  </a>
                `
      : `
                  <a href="${appPath('login.html')}">
                    Log in
                  </a>

                  <a href="${appPath('account/signup.html')}">
                    Create account
                  </a>
                `
    }

            ${hasAdminSession()
      ? `
                  <a href="${appPath('admin/dashboard.html')}">
                    Admin Dashboard
                  </a>
                `
      : ''
    }
          </nav>

        </div>
      </div>
    </header>
  `;

  const burger =
    document.getElementById('nav-burger');

  const mobileMenu =
    document.getElementById('mobile-menu');

  const closeButton =
    document.getElementById('mobile-menu-close');

  function openMenu() {
    if (!mobileMenu) return;

    mobileMenu.classList.add('open');
    mobileMenu.setAttribute(
      'aria-hidden',
      'false'
    );

    if (burger) {
      burger.setAttribute(
        'aria-expanded',
        'true'
      );
    }

    document.body.classList.add(
      'menu-open'
    );
  }

  function closeMenu() {
    if (!mobileMenu) return;

    mobileMenu.classList.remove('open');
    mobileMenu.setAttribute(
      'aria-hidden',
      'true'
    );

    if (burger) {
      burger.setAttribute(
        'aria-expanded',
        'false'
      );
    }

    document.body.classList.remove(
      'menu-open'
    );
  }

  if (burger) {
    burger.addEventListener(
      'click',
      openMenu
    );
  }

  if (closeButton) {
    closeButton.addEventListener(
      'click',
      closeMenu
    );
  }

  if (mobileMenu) {
    mobileMenu
      .querySelectorAll('a')
      .forEach(link => {
        link.addEventListener(
          'click',
          closeMenu
        );
      });
  }

  document.addEventListener(
    'keydown',
    event => {
      if (event.key === 'Escape') {
        closeMenu();
      }
    }
  );
}


/* ==========================================================================
   FOOTER
   ========================================================================== */

function renderFooter() {
  const mount =
    document.getElementById('site-footer');

  if (!mount) return;

  mount.innerHTML = `
    <footer class="site-footer">

      <div class="container footer-grid">

        <div class="footer-brand">
          <a
            href="${appPath('index.html')}"
            class="footer-logo"
          >
            HADÉRA
          </a>

          <p>
            Quality products, trusted service and
            a better way to shop.
          </p>
        </div>

        <div class="footer-column">
          <h3>Shop</h3>

          <a href="${appPath('products.html')}">
            Products
          </a>

          <a href="${appPath('appointment.html')}">
            Appointments
          </a>
        </div>

        <div class="footer-column">
          <h3>Company</h3>

          <a href="${appPath('about.html')}">
            About
          </a>

          <a href="${appPath('contact.html')}">
            Contact
          </a>
        </div>

        <div class="footer-column">
          <h3>Account</h3>

          <a href="${getCustomerAccountLink()}">
            ${hasCustomerSession()
      ? 'My Account'
      : 'Log in'
    }
          </a>

          ${!hasCustomerSession()
      ? `
                <a href="${appPath('account/signup.html')}">
                  Create account
                </a>
              `
      : ''
    }
        </div>

      </div>

      <div class="container footer-bottom">
        <p>
          &copy; ${new Date().getFullYear()} HADÉRA.
          All rights reserved.
        </p>
      </div>

    </footer>
  `;
}


/* ==========================================================================
   REVEAL ANIMATIONS
   ========================================================================== */

function initReveal() {
  const elements =
    document.querySelectorAll(
      '.reveal, .fade-up'
    );

  if (!elements.length) return;

  if (
    !('IntersectionObserver' in window)
  ) {
    elements.forEach(element => {
      element.classList.add('visible');
    });

    return;
  }

  const observer =
    new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) {
            return;
          }

          entry.target.classList.add(
            'visible'
          );

          observer.unobserve(
            entry.target
          );
        });
      },
      {
        threshold: 0.12
      }
    );

  elements.forEach(element => {
    observer.observe(element);
  });
}


/* ==========================================================================
   GLOBAL INIT
   ========================================================================== */

document.addEventListener(
  'DOMContentLoaded',
  () => {
    renderHeader();
    renderFooter();
    initReveal();
  }
);


/* ==========================================================================
   SHARED HELPERS (used by page scripts: HADERA.qs, HADERA.toast, ...)
   ========================================================================== */

function qs(selector, scope = document) {
  return scope.querySelector(selector);
}

function qsa(selector, scope = document) {
  return Array.from(scope.querySelectorAll(selector));
}

function formatNaira(amount) {
  const value = Number(amount);

  if (!Number.isFinite(value)) return '₦0';

  return '₦' + value.toLocaleString('en-NG', {
    maximumFractionDigits: 0
  });
}

function toast(message, type = 'info', duration = 3500) {
  let wrap = document.querySelector('.toast-wrap');

  if (!wrap) {
    wrap = document.createElement('div');
    wrap.className = 'toast-wrap';
    wrap.setAttribute('aria-live', 'polite');
    document.body.appendChild(wrap);
  }

  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.textContent = message;
  wrap.appendChild(el);

  window.setTimeout(() => {
    el.style.transition = 'opacity .3s ease';
    el.style.opacity = '0';
    window.setTimeout(() => el.remove(), 300);
  }, duration);
}


/* ==========================================================================
   PUBLIC API
   ========================================================================== */

window.HADERA = {
  qs,
  qsa,
  formatNaira,
  toast,
  appPath,
  getInitials,
  getCustomerAccountLink,
  hasCustomerSession,
  hasAdminSession,
  renderHeader,
  renderFooter,
  initReveal
};