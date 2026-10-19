(() => {
  'use strict';

  const MENU = window.KAPI_MENU || {};
  const STORE_KEY = 'kapi-cart-v1';
  const PAGE = document.body.dataset.page;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const peso = (c) => {
    const p = c / 100;
    return '₱' + p.toLocaleString('en-PH', { minimumFractionDigits: Number.isInteger(p) ? 0 : 2, maximumFractionDigits: 2 });
  };
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const params = new URLSearchParams(location.search);

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
    if (!drawer) return;
    lastFocus = document.activeElement;
    scrim.hidden = false;
    requestAnimationFrame(() => scrim.classList.add('show'));
    drawer.classList.add('open');
    drawer.setAttribute('aria-hidden', 'false');
    $('.icon-btn', drawer)?.focus();
  }
  function closeDrawer() {
    if (!drawer) return;
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
    $('.stamp-card').forEach((s) => { s.hidden = btn.dataset.filter !== 'all' && s.dataset.category !== btn.dataset.filter; });
  }));

  /* ---------- drink overview popup ---------- */
  const dlg = $('#drink-dialog');
  let current = null;
  let qty = 1;
  const setQty = (n) => { qty = Math.max(1, Math.min(20, n)); $('[data-d-qty]', dlg).textContent = qty; };

  function openDrink(card) {
    if (!dlg) return;
    current = card.dataset.open;
    const d = card.dataset;
    $('[data-d-art]', dlg).innerHTML = card.querySelector('.stamp-art svg').outerHTML;
    $('[data-d-price]', dlg).textContent = d.price;
    $('[data-d-name-stamp]', dlg).textContent = d.name;
    $('[data-d-name]', dlg).textContent = d.name;
    $('[data-d-cat]', dlg).textContent = d.category;
    $('[data-d-blurb]', dlg).textContent = d.blurb;
    $('[data-d-serve]', dlg).textContent = d.serve;
    $('[data-d-price-text]', dlg).textContent = d.price;
    $('[data-d-tag]', dlg).textContent = d.tag;
    $('[data-d-tag-row]', dlg).hidden = !d.tag;
    const add = $('[data-d-add]', dlg);
    add.classList.remove('added');
    add.textContent = 'Add to order';
    setQty(1);
    document.body.style.overflow = 'hidden';
    if (typeof dlg.showModal === 'function') dlg.showModal(); else dlg.setAttribute('open', '');
  }
  function closeDrink() {
    if (!dlg) return;
    if (typeof dlg.close === 'function') dlg.close(); else dlg.removeAttribute('open');
    document.body.style.overflow = '';
  }
  dlg?.addEventListener('close', () => { document.body.style.overflow = ''; });
  dlg?.addEventListener('click', (e) => { if (e.target === dlg) closeDrink(); }); // click on the backdrop
  document.addEventListener('click', (e) => {
    const card = e.target.closest('[data-open]');
    if (card) return openDrink(card);
    if (!dlg?.open) return;
    if (e.target.closest('[data-d-close]')) closeDrink();
    else if (e.target.closest('[data-d-inc]')) setQty(qty + 1);
    else if (e.target.closest('[data-d-dec]')) setQty(qty - 1);
    else if (e.target.closest('[data-d-add]')) {
      const add = $('[data-d-add]', dlg);
      change(current, qty);
      add.classList.add('added');
      add.textContent = 'Added to your order';
      const btn = $('.cart-btn');
      btn?.classList.remove('bump'); void btn?.offsetWidth; btn?.classList.add('bump');
      setTimeout(closeDrink, 700);
    }
  });
  // Deep link: /#drink-kapi-alsaha opens that drink.
  if (location.hash.startsWith('#drink-')) {
    const card = $(`[data-open="${CSS.escape(location.hash.slice(7))}"]`);
    if (card) setTimeout(() => openDrink(card), 300);
  }

  /* ---------- API helpers ---------- */
  async function api(path, payload) {
    const res = await fetch('/api/' + path, payload === undefined
      ? { headers: { Accept: 'application/json' } }
      : { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    let data = {};
    try { data = await res.json(); } catch { /* non-JSON error */ }
    if (!res.ok) { const err = new Error(data.error || 'Something went wrong. Please try again.'); err.status = res.status; throw err; }
    return data;
  }
  const say = (el, msg, ok) => { if (!el) return; el.textContent = msg; el.className = 'form-msg ' + (ok ? 'ok' : 'err'); };
  const lineItems = (items) => items.map((i) =>
    `<div class="summary-line"><span>${i.qty} &times; ${esc(i.name)}</span><strong>${peso(i.price * i.qty)}</strong></div>`).join('');

  /* ---------- date input: no past dates ---------- */
  const today = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  $$('[data-min-today]').forEach((el) => { el.min = today; });

  /* ---------- event inquiry ---------- */
  const inquiry = $('#inquiry-form');
  inquiry?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const msg = $('[data-inquiry-msg]');
    const btn = $('button[type=submit]', inquiry);
    btn.disabled = true;
    try {
      const out = await api('inquiry', Object.fromEntries(new FormData(inquiry)));
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
      const out = await api('subscribe', { email: form.email.value });
      say(msg, out.message, true);
      form.reset();
    } catch (err) { say(msg, err.message, false); }
  });

  /* ---------- checkout ---------- */
  if (PAGE === 'checkout') {
    const form = $('#checkout-form');
    const list = $('[data-summary-lines]');
    const totalEl = $('[data-summary-total]');
    const empty = $('[data-checkout-empty]');
    const entries = Object.entries(cart);
    list.innerHTML = lineItems(entries.map(([slug, qty]) => ({ name: MENU[slug].name, price: MENU[slug].price, qty })));
    totalEl.textContent = peso(total());
    empty.hidden = entries.length > 0;
    form.hidden = entries.length === 0;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const msg = $('[data-checkout-msg]');
      const btn = $('button[type=submit]', form);
      btn.disabled = true;
      say(msg, 'Preparing your payment...', true);
      try {
        const out = await api('order', {
          ...Object.fromEntries(new FormData(form)),
          items: Object.entries(cart).map(([slug, qty]) => ({ slug, qty })),
        });
        location.href = out.redirect;
      } catch (err) {
        say(msg, err.message, false);
        btn.disabled = false;
      }
    });
  }

  /* ---------- order lookup shared by pay / order / sandbox ---------- */
  const ref = params.get('ref') || '';
  const key = params.get('k') || '';
  const fetchOrder = () => api(`order?ref=${encodeURIComponent(ref)}&k=${encodeURIComponent(key)}`);
  const missing = () => { $$('[data-order-missing]').forEach((el) => { el.hidden = false; }); };

  if (PAGE === 'pay') {
    const orderUrl = `/order?ref=${encodeURIComponent(ref)}&k=${encodeURIComponent(key)}`;
    const METHODS = {
      gcash: { label: (t) => `Pay ${t} with GCash`, hint: 'You will be sent to GCash to approve the payment.' },
      qrph: { label: (t) => `Pay ${t} with QR Ph`, hint: 'Scan with GCash, Maya, or any banking app.' },
    };

    (async () => {
      let order;
      try { order = await fetchOrder(); } catch { return missing(); }
      if (order.status === 'paid' || order.status === 'fulfilled') return location.replace(orderUrl);

      const total = peso(order.total);
      $('[data-order-sub]').innerHTML = `Order <strong>${esc(order.ref)}</strong> for ${esc(order.name)}.`;
      $('[data-summary-lines]').innerHTML = lineItems(order.items);
      $('[data-summary-total]').textContent = total;
      $('[data-test-notice]').hidden = order.mode !== 'sandbox';

      const list = $('[data-method-buttons]');
      const errBox = $('[data-pay-error]');
      const qrPanel = $('[data-qr-panel]');
      const setButtons = (disabled) => $$('[data-method]', list).forEach((b) => { b.disabled = disabled; });
      let countdown = null;
      let pollTimer = null;
      const stopWatching = () => { clearInterval(countdown); clearTimeout(pollTimer); };

      const methods = (order.methods || []).filter((m) => METHODS[m]);
      list.innerHTML = (methods.length ? methods : ['gcash']).map((m, i) => `
        <button class="btn ${i === 0 ? 'btn-dark' : 'btn-line'} btn-block" type="button" data-method="${m}">${esc(METHODS[m].label(total))}</button>
        <p class="method-hint">${esc(METHODS[m].hint)}</p>`).join('');
      $('[data-pay-grid]').hidden = false;

      const expire = () => {
        stopWatching();
        $('[data-qr-img]').classList.add('is-expired');
        $('[data-qr-live]').hidden = true;
        $('[data-qr-expired]').hidden = false;
      };

      function showQr(out) {
        const img = $('[data-qr-img]');
        img.src = out.qr;
        img.classList.remove('is-expired');
        $('[data-qr-amount]').textContent = total;
        $('[data-qr-live]').hidden = false;
        $('[data-qr-expired]').hidden = true;
        list.hidden = true;
        qrPanel.hidden = false;

        const timer = $('[data-qr-timer]');
        const tick = () => {
          const s = Math.max(0, Math.round((out.expiresAt - Date.now()) / 1000));
          timer.textContent = `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
          if (s === 0) expire();
        };
        tick();
        countdown = setInterval(tick, 1000);

        // Ask the server every 3 seconds; it checks with PayMongo and flips when the payment lands.
        const poll = async () => {
          try {
            const o = await fetchOrder();
            if (o.status === 'paid' || o.status === 'fulfilled') { stopWatching(); return (location.href = orderUrl); }
            if (o.status === 'failed') return expire();
          } catch { /* try again on the next tick */ }
          pollTimer = setTimeout(poll, 3000);
        };
        pollTimer = setTimeout(poll, 3000);
      }

      async function start(method) {
        errBox.hidden = true;
        stopWatching();
        setButtons(true);
        try {
          const out = await api('pay', { ref, k: key, method });
          if (out.redirect) { location.href = out.redirect; return; }
          showQr(out);
        } catch (err) {
          errBox.textContent = err.message;
          errBox.hidden = false;
          list.hidden = false;
          qrPanel.hidden = true;
          setButtons(false);
        }
      }

      list.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-method]');
        if (btn) start(btn.dataset.method);
      });
      $('[data-qr-new]').addEventListener('click', () => start('qrph'));
      $('[data-qr-back]').addEventListener('click', () => {
        stopWatching();
        qrPanel.hidden = true;
        list.hidden = false;
        setButtons(false);
      });
    })();
  }

  if (PAGE === 'order') {
    const paint = (order) => {
      const paid = order.status === 'paid' || order.status === 'fulfilled';
      const failed = order.status === 'failed';
      const mark = $('[data-status-mark]');
      mark.className = 'status-mark ' + (paid ? 'ok' : failed ? 'bad' : 'wait');
      mark.textContent = paid ? '✓' : failed ? '!' : '…';
      $('[data-status-title]').textContent = paid ? 'Payment received' : failed ? 'Payment not completed' : 'Confirming your payment';
      $('[data-status-text]').textContent = paid
        ? `Thank you, ${order.name}. Your order is being prepared.`
        : failed
          ? 'The payment was cancelled, expired, or did not go through. Nothing was charged.'
          : 'We are confirming your payment. This page updates by itself, so please keep it open.';
      $('[data-order-ref]').textContent = order.ref;
      $('[data-test-notice]').hidden = !(paid && order.provider === 'sandbox');
      $('[data-summary-lines]').innerHTML = lineItems(order.items);
      $('[data-summary-total]').textContent = peso(order.total);
      $('[data-total-label]').textContent = paid ? 'Total paid' : 'Total due';
      $('[data-pickup-note]').hidden = !paid;
      const action = $('[data-order-action]');
      if (paid) { action.textContent = 'Order something else'; action.href = '/#menu'; }
      else {
        action.textContent = failed ? 'Try paying again' : 'Back to payment';
        action.href = `/pay?ref=${encodeURIComponent(ref)}&k=${encodeURIComponent(key)}`;
      }
      if (paid) { cart = {}; save(); render(); }
      $('[data-order-card]').hidden = false;
    };

    (async () => {
      let order;
      try { order = await fetchOrder(); } catch { return missing(); }
      paint(order);
      // While the gateway is still deciding, re-check every 3 seconds for up to 2 minutes.
      for (let i = 0; order.status === 'pending' && i < 40; i++) {
        await new Promise((r) => setTimeout(r, 3000));
        try { order = await fetchOrder(); paint(order); } catch { /* try again on the next tick */ }
      }
    })();
  }

  if (PAGE === 'sandbox') {
    (async () => {
      let order;
      try { order = await fetchOrder(); } catch { return missing(); }
      if (order.mode !== 'sandbox' || ['paid', 'fulfilled'].includes(order.status)) return missing();
      $('[data-sim-amount]').textContent = peso(order.total);
      $('[data-sim-ref]').textContent = `Order ${order.ref}`;
      $('[data-sim-action="approve"]').textContent = `Pay ${peso(order.total)}`;
      $('[data-sim]').hidden = false;
      $$('[data-sim-action]').forEach((b) => b.addEventListener('click', async () => {
        $$('[data-sim-action]').forEach((x) => { x.disabled = true; });
        try {
          const out = await api('sandbox', { ref, k: key, action: b.dataset.simAction });
          location.href = out.redirect;
        } catch (err) {
          say($('[data-sim-msg]'), err.message, false);
          $$('[data-sim-action]').forEach((x) => { x.disabled = false; });
        }
      }));
    })();
  }

  /* ---------- staff page ---------- */
  if (PAGE === 'admin') {
    const showLogin = () => { $('[data-admin-panel]').hidden = true; $('[data-admin-login]').hidden = false; };
    const when = (iso) => (iso ? new Date(iso).toLocaleString('en-PH') : '');

    async function loadAdmin() {
      try {
        const data = await api('admin');
        $('[data-admin-login]').hidden = true;
        $('[data-admin-panel]').hidden = false;
        $('[data-admin-mode]').innerHTML = `Payments mode: <strong>${esc(data.mode)}</strong>`;
        $('[data-admin-orders]').innerHTML = data.orders.map((o) => `
          <tr>
            <td>${esc(o.ref)}</td>
            <td>${esc(o.name)}<br><small>${esc(o.phone)} &middot; ${esc(o.email)}</small></td>
            <td>${(o.items || []).map((i) => `${i.qty} &times; ${esc(i.name)}`).join('<br>')}</td>
            <td>${peso(o.total)}</td>
            <td><span class="pill ${esc(o.status)}">${esc(o.status)}</span>${o.provider === 'sandbox' ? '<br><small>test</small>' : ''}</td>
            <td>${esc(when(o.created_at))}</td>
            <td>${o.status === 'paid' ? `<button class="btn btn-dark" style="padding:8px 14px" data-fulfil="${esc(o.ref)}">Mark ready</button>` : ''}</td>
          </tr>`).join('') || '<tr><td colspan="7">No orders yet.</td></tr>';
        $('[data-admin-inquiries]').innerHTML = data.inquiries.map((q) => `
          <tr><td>${esc(q.name)}</td><td>${esc(q.event_date)}</td><td>${esc(q.guests)}</td><td>${esc(q.contact)}</td><td>${esc(q.venue)}</td><td>${esc(when(q.created_at))}</td></tr>`).join('')
          || '<tr><td colspan="6">No inquiries yet.</td></tr>';
      } catch (err) {
        if (err.status === 404) $('[data-admin-disabled]').hidden = false;
        else showLogin();
      }
    }

    $('[data-admin-form]').addEventListener('submit', async (e) => {
      e.preventDefault();
      const form = e.currentTarget; // e.currentTarget is cleared once the handler awaits
      try {
        await api('admin', { action: 'login', password: form.password.value });
        form.reset();
        loadAdmin();
      } catch (err) { say($('[data-admin-msg]'), err.message, false); }
    });
    $('[data-admin-logout]').addEventListener('click', async () => { await api('admin', { action: 'logout' }).catch(() => {}); showLogin(); });
    document.addEventListener('click', async (e) => {
      const b = e.target.closest('[data-fulfil]');
      if (!b) return;
      b.disabled = true;
      await api('admin', { action: 'fulfil', ref: b.dataset.fulfil }).catch(() => {});
      loadAdmin();
    });
    loadAdmin();
  }

  render();
})();
