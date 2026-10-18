(() => {
  'use strict';

  const MENU = window.KAPI_MENU || {};
  const STORE_KEY = 'kapi-cart-v1';
  const csrf = document.querySelector('meta[name="csrf-token"]')?.content || '';
  const base = document.querySelector('meta[name="base-path"]')?.content || '';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const peso = (c) => {
    const p = c / 100;
    return '₱' + p.toLocaleString('en-PH', { minimumFractionDigits: Number.isInteger(p) ? 0 : 2, maximumFractionDigits: 2 });
  };
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* ---------- cart state ---------- */
  const load = () => {
    try {
      const raw = JSON.parse(localStorage.getItem(STORE_KEY) || '{}');
      const clean = {};
      for (const [slug, qty] of Object.entries(raw)) {
        if (MENU[slug] && Number.isInteger(qty) && qty > 0) clean[slug] = Math.min(qty, 20);
      }
      return clean;
    } catch { return {}; }
  };
  let cart = load();
  const save = () => { try { localStorage.setItem(STORE_KEY, JSON.stringify(cart)); } catch { /* storage unavailable */ } };
  const count = () => Object.values(cart).reduce((a, b) => a + b, 0);
  const total = () => Object.entries(cart).reduce((a, [s, q]) => a + MENU[s].price * q, 0);

  const drawer = $('#cart-drawer');
  const scrim = $('.drawer-scrim');
  let lastFocus = null;

  function openDrawer() {
    lastFocus = document.activeElement;
    scrim.hidden = false;
    requestAnimationFrame(() => scrim.classList.add('show'));
    drawer.classList.add('open');
    drawer.setAttribute('aria-hidden', 'false');
    $('.icon-btn', drawer)?.focus();
  }
  function closeDrawer() {
    scrim.classList.remove('show');
    drawer.classList.remove('open');
    drawer.setAttribute('aria-hidden', 'true');
    setTimeout(() => { scrim.hidden = true; }, 250);
    lastFocus?.focus?.();
  }

  function render() {
    $$('[data-cart-count]').forEach((el) => { el.textContent = count(); });
    const lines = $('[data-cart-lines]');
    const entries = Object.entries(cart);
    if (lines) {
      lines.innerHTML = entries.length
        ? entries.map(([slug, qty]) => `
          <div class="line">
            <span class="line-name">${esc(MENU[slug].name)}</span>
            <span class="line-price">${peso(MENU[slug].price * qty)}</span>
            <span class="qty" role="group" aria-label="Quantity for ${esc(MENU[slug].name)}">
              <button type="button" data-dec="${esc(slug)}" aria-label="Decrease">&minus;</button>
              <span>${qty}</span>
              <button type="button" data-inc="${esc(slug)}" aria-label="Increase">+</button>
            </span>
            <button type="button" class="line-remove" data-remove="${esc(slug)}">Remove</button>
          </div>`).join('')
        : '<p class="drawer-empty">Your postcard is empty.<br>Affix a few stamps from the menu.</p>';
    }
    const t = $('[data-cart-total]');
    if (t) t.textContent = peso(total());
    const go = $('[data-cart-checkout]');
    if (go) go.classList.toggle('disabled', entries.length === 0);
    $$('[data-add]').forEach((b) => b.classList.toggle('added', !!cart[b.dataset.add]));
  }

  function change(slug, delta) {
    if (!MENU[slug]) return;
    const next = (cart[slug] || 0) + delta;
    if (next <= 0) delete cart[slug]; else cart[slug] = Math.min(next, 20);
    save();
    render();
  }

  document.addEventListener('click', (e) => {
    const t = e.target.closest('button, a');
    if (!t) return;
    if (t.matches('[data-add]')) {
      change(t.dataset.add, 1);
      const btn = $('.cart-btn');
      btn?.classList.remove('bump'); void btn?.offsetWidth; btn?.classList.add('bump');
      const label = t.textContent;
      t.textContent = 'Affixed';
      setTimeout(() => { t.textContent = label; }, 900);
    } else if (t.matches('[data-inc]')) change(t.dataset.inc, 1);
    else if (t.matches('[data-dec]')) change(t.dataset.dec, -1);
    else if (t.matches('[data-remove]')) change(t.dataset.remove, -Infinity);
    else if (t.matches('[data-cart-open]')) openDrawer();
    else if (t.matches('[data-cart-close]')) closeDrawer();
    else if (t.matches('[data-cart-checkout]') && !count()) e.preventDefault();
  });
  scrim?.addEventListener('click', closeDrawer);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && drawer?.classList.contains('open')) closeDrawer(); });

  /* ---------- menu filter ---------- */
  $$('.filter').forEach((btn) => btn.addEventListener('click', () => {
    $$('.filter').forEach((b) => { b.classList.toggle('is-active', b === btn); b.setAttribute('aria-selected', b === btn); });
    $$('.stamp-wrap').forEach((s) => { s.hidden = btn.dataset.filter !== 'all' && s.dataset.category !== btn.dataset.filter; });
  }));

  /* ---------- small form helper ---------- */
  async function postJSON(path, payload) {
    const res = await fetch(base + path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrf },
      body: JSON.stringify(payload),
    });
    let data = {};
    try { data = await res.json(); } catch { /* non-JSON error */ }
    if (!res.ok) throw new Error(data.error || 'Something went wrong. Please try again.');
    return data;
  }
  const say = (el, msg, ok) => { if (!el) return; el.textContent = msg; el.className = 'form-msg ' + (ok ? 'ok' : 'err'); };

  /* ---------- event inquiry ---------- */
  const inquiry = $('#inquiry-form');
  inquiry?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const msg = $('[data-inquiry-msg]');
    const btn = $('button[type=submit]', inquiry);
    const data = Object.fromEntries(new FormData(inquiry));
    btn.disabled = true;
    try {
      const out = await postJSON('/api/inquiry.php', data);
      say(msg, out.message, true);
      inquiry.reset();
    } catch (err) { say(msg, err.message, false); }
    btn.disabled = false;
  });

  /* ---------- newsletter ---------- */
  $('[data-subscribe]')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const msg = $('[data-subscribe-msg]', form);
    try {
      const out = await postJSON('/api/subscribe.php', { email: form.email.value });
      say(msg, out.message, true);
      form.reset();
    } catch (err) { say(msg, err.message, false); }
  });

  /* ---------- checkout page ---------- */
  const checkout = $('#checkout-form');
  if (checkout) {
    const list = $('[data-summary-lines]');
    const totalEl = $('[data-summary-total]');
    const empty = $('[data-checkout-empty]');
    const draw = () => {
      const entries = Object.entries(cart);
      list.innerHTML = entries.map(([slug, qty]) =>
        `<div class="summary-line"><span>${qty} &times; ${esc(MENU[slug].name)}</span><strong>${peso(MENU[slug].price * qty)}</strong></div>`).join('');
      totalEl.textContent = peso(total());
      empty.hidden = entries.length > 0;
      checkout.hidden = entries.length === 0;
    };
    draw();

    checkout.addEventListener('submit', async (e) => {
      e.preventDefault();
      const msg = $('[data-checkout-msg]');
      const btn = $('button[type=submit]', checkout);
      const fd = Object.fromEntries(new FormData(checkout));
      $$('input', checkout).forEach((i) => i.classList.remove('invalid'));
      btn.disabled = true;
      say(msg, 'Preparing your payment...', true);
      try {
        const out = await postJSON('/api/order.php', {
          ...fd,
          items: Object.entries(cart).map(([slug, qty]) => ({ slug, qty })),
        });
        window.location.href = out.redirect;
      } catch (err) {
        say(msg, err.message, false);
        btn.disabled = false;
      }
    });
  }

  /* ---------- order confirmed: empty the cart ---------- */
  if (document.body.dataset.clearCart === '1') { cart = {}; save(); }

  render();
})();
