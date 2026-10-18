import { MENU } from './menu.js';

export const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export const peso = (centavos) => {
  const p = centavos / 100;
  return '₱' + p.toLocaleString('en-PH', { minimumFractionDigits: Number.isInteger(p) ? 0 : 2, maximumFractionDigits: 2 });
};

export const brand = {
  address1: 'Gate 3, Lower Ground Floor, New Escalator',
  address2: 'SM City Iloilo, Benigno Aquino Jr. Ave, Mandurriao, Iloilo City 5000',
  hours: 'Mon - Sun, 10:00 AM - 9:00 PM',
  phone: process.env.SHOP_PHONE || '0917-000-0000',
  email: process.env.SHOP_EMAIL || 'events@mangkapita.ph',
};

const menuJson = JSON.stringify(
  Object.fromEntries(MENU.map((m) => [m.slug, { slug: m.slug, name: m.name, price: m.price }])),
).replace(/</g, '\\u003c');

const header = `
<div class="announce">Artisanal coffee &amp; sourdough mahaw &nbsp;&middot;&nbsp; Gate 3, SM City Iloilo &nbsp;&middot;&nbsp; Mobile coffee carts for events</div>
<header class="site-header">
  <div class="wrap header-row">
    <a class="logo" href="/" aria-label="Mang KAPI Ta home"><span class="logo-bubble">KAPI</span><span class="logo-text">Mang KAPI Ta</span></a>
    <nav class="nav" aria-label="Primary">
      <a href="/#cart">Coffee Carts</a>
      <a href="/#menu">Menu</a>
      <a href="/#visit">Visit</a>
    </nav>
    <button class="cart-btn" type="button" data-cart-open aria-label="Open your order">
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 8h14l-1.2 11a2 2 0 0 1-2 1.8H8.2a2 2 0 0 1-2-1.8z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>
      <span>Order</span><span class="cart-count" data-cart-count>0</span>
    </button>
  </div>
</header>`;

const drawer = `
<div class="drawer-scrim" data-cart-close hidden></div>
<aside class="drawer" id="cart-drawer" aria-label="Your order" aria-hidden="true">
  <div class="drawer-head"><h2>Your order</h2><button type="button" class="icon-btn" data-cart-close aria-label="Close order">&times;</button></div>
  <div class="drawer-body" data-cart-lines></div>
  <div class="drawer-foot">
    <div class="drawer-total"><span>Total</span><strong data-cart-total>&#8369;0</strong></div>
    <a class="btn btn-dark btn-block" href="/checkout" data-cart-checkout>Checkout with GCash</a>
    <p class="fine">Pickup at the SM City Iloilo Brew Bar. Pay securely with GCash.</p>
  </div>
</aside>`;

const footer = `
<footer class="site-footer">
  <div class="wrap footer-grid">
    <div>
      <a class="logo logo-light" href="/"><span class="logo-bubble">KAPI</span><span class="logo-text">Mang KAPI Ta</span></a>
      <p class="serif-italic footer-tag">Worth Every Sip.</p>
      <p class="fine">Modern coffee, local provenance, and slow-cooked brisket mahaw pairings.</p>
      <form class="subscribe" data-subscribe novalidate>
        <label class="sr-only" for="sub-email">Email address</label>
        <input id="sub-email" type="email" name="email" placeholder="Your email address" autocomplete="email" required>
        <button class="btn btn-light" type="submit">Join</button>
        <p class="form-msg" data-subscribe-msg role="status"></p>
      </form>
    </div>
    <div><h3>Houses</h3><ul><li><a href="/#visit">SM City Iloilo Brew Bar</a></li><li><a href="/#cart">Mobile Coffee Carts</a></li><li><a href="/#menu">Menu</a></li></ul></div>
    <div><h3>Contact</h3><ul><li>${esc(brand.hours)}</li><li><a href="mailto:${esc(brand.email)}">${esc(brand.email)}</a></li><li>Iloilo City, Philippines</li></ul></div>
  </div>
  <div class="wrap footer-base"><span>&copy; ${new Date().getFullYear()} Mang KAPI Ta Modern Coffee. All rights reserved.</span><span>Payments by GCash</span></div>
</footer>`;

/** Wraps page content in the shared document, header, cart drawer, footer, and script. */
export function page({ title, page: name, body, chrome = true }) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="Mang KAPI Ta. Artisanal coffee, sourdough mahaw, and handcrafted mobile coffee carts in Iloilo City.">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,500;0,9..144,700;1,9..144,400;1,9..144,500&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/assets/css/style.css">
</head>
<body data-page="${esc(name)}">
<a class="skip-link" href="#main">Skip to content</a>
${chrome ? header : ''}
${body}
${chrome ? footer + drawer : ''}
<script>window.KAPI_MENU = ${menuJson};</script>
<script src="/assets/js/app.js" defer></script>
</body>
</html>
`;
}

export const notFoundCard = (heading, text) =>
  `<main id="main" class="page"><div class="wrap narrow"><div class="panel status-card"><h1>${esc(heading)}</h1><p>${esc(text)}</p><a class="btn btn-dark" href="/">Back to the shop</a></div></div></main>`;
