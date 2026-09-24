/* ==========================================================================
   HADÉRA — main.js
   Shared chrome (header/footer), navigation, scroll reveal, toasts, helpers.
   Depends on nothing; safe to include on every customer-facing page.
   ========================================================================== */

const HADERA = (() => {

  /* ---------- helpers ---------- */
  function formatNaira(amount) {
    return '₦' + Number(amount).toLocaleString('en-NG');
  }

  function qs(sel, ctx = document) { return ctx.querySelector(sel); }
  function qsa(sel, ctx = document) { return Array.from(ctx.querySelectorAll(sel)); }

  function toast(message, type = 'default') {
    let wrap = qs('.toast-wrap');
    if (!wrap) {
      wrap = document.createElement('div');
      wrap.className = 'toast-wrap';
      document.body.appendChild(wrap);
    }
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    el.textContent = message;
    wrap.appendChild(el);
    setTimeout(() => {
      el.style.transition = 'opacity .3s ease';
      el.style.opacity = '0';
      setTimeout(() => el.remove(), 300);
    }, 3200);
  }

  function currentPage() {
    const path = window.location.pathname.split('/').pop() || 'index.html';
    return path;
  }

  /* ---------- header / footer markup ---------- */
  const NAV_LINKS = [
    { href: 'index.html', label: 'Home' },
    { href: 'products.html', label: 'Shop' },
    { href: 'products.html?category=cars', label: 'Cars' },
    { href: 'products.html?category=furniture', label: 'Furniture' },
    { href: 'about.html', label: 'About' },
    { href: 'contact.html', label: 'Contact' },
  ];

  function navLinkHTML(links, activeMatch) {
    return links.map(l => {
      const base = l.href.split('?')[0];
      const isActive = base === activeMatch ? ' class="active"' : '';
      return `<a href="${l.href}"${isActive}>${l.label}</a>`;
    }).join('');
  }

  function renderHeader() {
    const mount = qs('#site-header');
    if (!mount) return;
    const active = currentPage();

    mount.innerHTML = `
      <header class="site-header">
        <div class="container nav">
          <a href="index.html" class="nav-logo">HADÉRA</a>
          <nav class="nav-links" aria-label="Primary">
            ${navLinkHTML(NAV_LINKS, active)}
          </nav>
          <div class="nav-actions">
            <a href="signup.html" class="nav-icon-btn only-desktop" aria-label="Sign up">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7"/></svg>
            </a>
            <a href="appointment.html" class="btn btn-secondary btn-sm only-desktop">Book appointment</a>
            <button class="nav-icon-btn nav-burger" aria-label="Open menu" aria-expanded="false">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M2 5h16M2 10h16M2 15h16" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>
            </button>
          </div>
        </div>
      </header>
      <div class="mobile-menu" id="mobile-menu">
        <div class="mobile-menu-top">
          <span class="nav-logo">HADÉRA</span>
          <button class="nav-icon-btn" id="mobile-menu-close" aria-label="Close menu">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M2 2l14 14M16 2L2 16" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>
          </button>
        </div>
        <nav aria-label="Mobile">
          ${NAV_LINKS.map(l => `<a href="${l.href}">${l.label}</a>`).join('')}
          <a href="signup.html">Sign up</a>
        </nav>
        <a href="appointment.html" class="btn btn-primary btn-block">Book appointment</a>
      </div>
    `;

    const burger = qs('.nav-burger', mount);
    const menu = qs('#mobile-menu');
    const closeBtn = qs('#mobile-menu-close');
    const openMenu = () => { menu.classList.add('open'); burger.setAttribute('aria-expanded', 'true'); document.body.style.overflow = 'hidden'; };
    const closeMenu = () => { menu.classList.remove('open'); burger.setAttribute('aria-expanded', 'false'); document.body.style.overflow = ''; };
    burger.addEventListener('click', openMenu);
    closeBtn.addEventListener('click', closeMenu);
    qsa('a', menu).forEach(a => a.addEventListener('click', closeMenu));
  }

  function renderFooter() {
    const mount = qs('#site-footer');
    if (!mount) return;
    const year = new Date().getFullYear();
    mount.innerHTML = `
      <footer class="site-footer">
        <div class="container">
          <div class="footer-top">
            <div class="footer-brand">
              <h3>HADÉRA</h3>
              <p>Modern commerce. Quality products. Trusted service.</p>
              <div class="footer-social">
                <a href="#" aria-label="Instagram">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.3" cy="6.7" r="1"/></svg>
                </a>
                <a href="#" aria-label="TikTok">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M14 3v11.2a3.4 3.4 0 1 1-2.6-3.3M14 3a5 5 0 0 0 5 5"/></svg>
                </a>
                <a href="#" aria-label="Facebook">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M15 8h-2a2 2 0 0 0-2 2v10M9 13h6"/></svg>
                </a>
                <a href="https://wa.me/2340000000000" aria-label="WhatsApp">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M3 21l1.4-4.2A8 8 0 1 1 8 19.6L3 21z"/></svg>
                </a>
              </div>
            </div>
            <div class="footer-col">
              <h4>Shop</h4>
              <a href="products.html">All products</a>
              <a href="products.html?category=cars">Cars</a>
              <a href="products.html?category=furniture">Furniture</a>
            </div>
            <div class="footer-col">
              <h4>Company</h4>
              <a href="about.html">About HADÉRA</a>
              <a href="contact.html">Contact</a>
              <a href="appointment.html">Appointments</a>
            </div>
            <div class="footer-col">
              <h4>Get in touch</h4>
              <a href="tel:+2340000000000">+234 000 000 0000</a>
              <a href="mailto:hello@hadera.ng">hello@hadera.ng</a>
              <a href="contact.html">Abuja, Nigeria</a>
            </div>
          </div>
          <div class="footer-bottom">
            <span>© ${year} HADÉRA. All rights reserved.</span>
            <div class="legal">
              <a href="#">Privacy Policy</a>
              <a href="terms.html">Terms &amp; Conditions</a>
            </div>
          </div>
        </div>
      </footer>
      <a class="whatsapp-float only-mobile" href="https://wa.me/2340000000000" aria-label="Chat on WhatsApp">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.7"><path d="M3 21l1.4-4.2A8 8 0 1 1 8 19.6L3 21z"/></svg>
      </a>
    `;
  }

  /* ---------- scroll reveal ---------- */
  function initReveal() {
    const items = qsa('.reveal');
    if (!items.length) return;
    if (!('IntersectionObserver' in window)) { items.forEach(i => i.classList.add('in-view')); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('in-view'); io.unobserve(e.target); }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    items.forEach(i => io.observe(i));
  }

  function init() {
    renderHeader();
    renderFooter();
    initReveal();
  }

  document.addEventListener('DOMContentLoaded', init);

  return { formatNaira, qs, qsa, toast, initReveal };
})();
