(() => {
  'use strict';

  const MENU = window.KAPI_MENU || {};
  const STORE_KEY = 'kapi-cart-v2';
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
  const SIZES = window.KAPI_SIZES || {};
  const has = (obj, key) => Object.prototype.hasOwnProperty.call(obj || {}, key);

  // A cart line is one item in one size with one choice, stored as "slug~size~choice" ("-" when not applicable).
  const lineKey = (slug, size, choice) => `${slug}~${size || '-'}~${choice || '-'}`;
  function describe(key) {
    const [slug, rawSize, rawChoice] = String(key).split('~');
    const item = has(MENU, slug) ? MENU[slug] : null;
    if (!item) return null;
    const size = rawSize === '-' ? null : rawSize;
    const choice = rawChoice === '-' ? null : rawChoice;
    if (item.sizes ? !(size && has(item.sizes, size)) : size) return null;
    if (item.choice ? !(choice && item.choice.options.includes(choice)) : choice) return null;
    const detail = [item.sizes ? `${SIZES[size].label} ${SIZES[size].oz} oz` : null, choice].filter(Boolean).join(' · ');
    return { item, size, choice, detail, unit: item.sizes ? item.sizes[size] : item.price };
  }
  const fullName = (d) => d.item.name + (d.detail ? ` (${d.detail})` : '');

  const load = () => {
    try {
      const raw = JSON.parse(localStorage.getItem(STORE_KEY) || '{}');
      const clean = {};
      for (const [key, qty] of Object.entries(raw)) {
        if (describe(key) && Number.isInteger(qty) && qty > 0) clean[key] = Math.min(qty, 20);
      }
      return clean;
    } catch { return {}; }
  };
  let cart = load();
  const save = () => { try { localStorage.setItem(STORE_KEY, JSON.stringify(cart)); } catch { /* storage unavailable */ } };
  const count = () => Object.values(cart).reduce((a, b) => a + b, 0);
  const total = () => Object.entries(cart).reduce((sum, [key, qty]) => sum + describe(key).unit * qty, 0);

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
        ? entries.map(([key, qty]) => {
          const d = describe(key);
          return `
          <div class="line">
            <span class="line-name">${esc(d.item.name)}</span>
            <span class="line-price">${peso(d.unit * qty)}</span>
            ${d.detail ? `<span class="line-detail">${esc(d.detail)}</span>` : ''}
            <span class="qty" role="group" aria-label="Quantity for ${esc(fullName(d))}">
              <button type="button" data-dec="${esc(key)}" aria-label="Decrease">&minus;</button>
              <span>${qty}</span>
              <button type="button" data-inc="${esc(key)}" aria-label="Increase">+</button>
            </span>
            <button type="button" class="line-remove" data-remove="${esc(key)}">Remove</button>
          </div>`;
        }).join('')
        : '<p class="drawer-empty">Your postcard is empty.<br>Affix a few stamps from the menu.</p>';
    }
    const t = $('[data-cart-total]');
    if (t) t.textContent = peso(total());
    const go = $('[data-cart-checkout]');
    if (go) go.classList.toggle('disabled', entries.length === 0);
  }

  function change(key, delta) {
    if (!describe(key)) return;
    const next = (cart[key] || 0) + delta;
    if (next <= 0) delete cart[key]; else cart[key] = Math.min(next, 20);
    save();
    render();
  }

  const bumpCart = () => { const btn = $('.cart-btn'); btn?.classList.remove('bump'); void btn?.offsetWidth; btn?.classList.add('bump'); };

  document.addEventListener('click', (e) => {
    const t = e.target.closest('button, a');
    if (!t) return;
    if (t.matches('[data-inc]')) change(t.dataset.inc, 1);
    else if (t.matches('[data-dec]')) change(t.dataset.dec, -1);
    else if (t.matches('[data-remove]')) change(t.dataset.remove, -Infinity);
    else if (t.matches('[data-cart-open]')) openDrawer();
    else if (t.matches('[data-cart-close]')) closeDrawer();
    else if (t.matches('[data-cart-checkout]') && !count()) e.preventDefault();
  });
  scrim?.addEventListener('click', closeDrawer);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && drawer?.classList.contains('open')) closeDrawer(); });

  /* ---------- menu categories ---------- */
  $$('.filter').forEach((btn) => btn.addEventListener('click', () => {
    $$('.filter').forEach((b) => { b.classList.toggle('is-active', b === btn); b.setAttribute('aria-selected', String(b === btn)); });
    $$('.stamp-card').forEach((s) => { s.hidden = btn.dataset.filter !== 'all' && s.dataset.category !== btn.dataset.filter; });
  }));

  /* ---------- drink and dish popup: size, choice, quantity ---------- */
  const dlg = $('#drink-dialog');
  let current = null; // slug of the item being shown
  let qty = 1;

  const optionHtml = (name, value, title, price, checked) =>
    `<label class="opt"><input type="radio" name="${name}" value="${esc(value)}"${checked ? ' checked' : ''}><span class="opt-body"><b>${esc(title)}</b>${price == null ? '' : `<em>${peso(price)}</em>`}</span></label>`;
  const picked = (name) => $(`input[name="${name}"]:checked`, dlg)?.value || null;
  const unitNow = () => { const item = MENU[current]; return item.sizes ? item.sizes[picked('d-size')] : item.price; };
  function refreshAdd() {
    const add = $('[data-d-add]', dlg);
    if (!add.classList.contains('added')) add.textContent = `Add to order · ${peso(unitNow() * qty)}`;
  }
  const setQty = (n) => { qty = Math.max(1, Math.min(20, n)); $('[data-d-qty]', dlg).textContent = qty; refreshAdd(); };

  function openDrink(card) {
    if (!dlg) return;
    const item = has(MENU, card.dataset.open) ? MENU[card.dataset.open] : null;
    if (!item) return;
    current = item.slug;
    $('[data-d-art]', dlg).innerHTML = card.querySelector('.stamp-art svg').outerHTML;
    $('[data-d-price]', dlg).textContent = $('.stamp-denom', card).textContent;
    $('[data-d-name-stamp]', dlg).textContent = item.name;
    $('[data-d-name]', dlg).textContent = item.name;
    $('[data-d-cat]', dlg).textContent = item.category;
    const note = $('[data-d-note]', dlg);
    note.textContent = item.note || '';
    note.hidden = !item.note;
    $('[data-d-blurb]', dlg).textContent = item.blurb;

    $('[data-d-sizes-group]', dlg).hidden = !item.sizes;
    if (item.sizes) {
      $('[data-d-sizes]', dlg).innerHTML = Object.entries(item.sizes)
        .map(([k, p], i) => optionHtml('d-size', k, `${SIZES[k].label} · ${SIZES[k].oz} oz`, p, i === 0)).join('');
    }
    $('[data-d-choice-group]', dlg).hidden = !item.choice;
    if (item.choice) {
      $('[data-d-choice-legend]', dlg).textContent = item.choice.label;
      $('[data-d-choices]', dlg).innerHTML = item.choice.options.map((o, i) => optionHtml('d-choice', o, o, null, i === 0)).join('');
    }
    $('[data-d-add]', dlg).classList.remove('added');
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
  dlg?.addEventListener('change', (e) => { if (e.target.matches('input[type="radio"]')) refreshAdd(); });
  document.addEventListener('click', (e) => {
    const card = e.target.closest('[data-open]');
    if (card) return openDrink(card);
    if (!dlg?.open) return;
    if (e.target.closest('[data-d-close]')) closeDrink();
    else if (e.target.closest('[data-d-inc]')) setQty(qty + 1);
    else if (e.target.closest('[data-d-dec]')) setQty(qty - 1);
    else if (e.target.closest('[data-d-add]')) {
      const item = MENU[current];
      const add = $('[data-d-add]', dlg);
      change(lineKey(item.slug, item.sizes ? picked('d-size') : null, item.choice ? picked('d-choice') : null), qty);
      add.classList.add('added');
      add.textContent = 'Added to your order';
      bumpCart();
      setTimeout(closeDrink, 700);
    }
  });
  // Deep link: /#drink-kapi-alsaha opens that item (and its category).
  if (location.hash.startsWith('#drink-')) {
    const card = $(`[data-open="${CSS.escape(location.hash.slice(7))}"]`);
    if (card) {
      $(`.filter[data-filter="${CSS.escape(card.dataset.category)}"]`)?.click();
      setTimeout(() => openDrink(card), 300);
    }
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

  /* ---------- coffee cart packages: choosing one opens the reservation form inside it ---------- */
  const inquiry = $('#inquiry-form');
  const panel = $('[data-package-panel]');

  // Dates other customers already hold. The server makes the final decision; this only warns early.
  const DATE_TAKEN = 'That date is already reserved. Please choose another date.';
  let bookedDates = new Set();
  async function loadBookedDates() {
    try { bookedDates = new Set((await api('booked-dates')).dates || []); } catch { /* the server still checks on submit */ }
  }
  function checkDate() {
    const input = inquiry?.elements.event_date;
    const note = inquiry && $('[data-date-note]', inquiry);
    if (!input || !note) return true;
    const taken = Boolean(input.value) && bookedDates.has(input.value);
    note.textContent = taken ? DATE_TAKEN : '';
    input.classList.toggle('invalid', taken);
    input.setAttribute('aria-invalid', String(taken));
    return !taken;
  }
  inquiry?.elements.event_date.addEventListener('input', checkDate);
  inquiry?.elements.event_date.addEventListener('change', checkDate);

  if (panel && inquiry) {
    const cards = $$('.package', panel);
    const holder = $('[data-inquiry-holder]');
    const photo = $('.cart-main');
    let current = null;
    let token = 0;

    // The open form is never taller than the main photo; anything longer scrolls inside the card.
    if (photo && 'ResizeObserver' in window) {
      new ResizeObserver(() => panel.style.setProperty('--cart-main-h', photo.offsetHeight + 'px')).observe(photo);
    }

    function choose(id) {
      const card = cards.find((c) => c.dataset.package === id);
      if (!card) return;
      const mine = ++token;
      current = card;
      panel.classList.add('has-selection');
      cards.forEach((c) => {
        const on = c === card;
        c.classList.toggle('is-selected', on);
        $('[data-package-select]', c).setAttribute('aria-expanded', String(on));
        if (!on) { c.classList.add('is-leaving'); setTimeout(() => { if (token === mine) c.hidden = true; }, 220); }
      });
      $('[data-package-back]', card).hidden = false;
      inquiry.elements.package.value = id;
      $('[data-selected-label]', inquiry).textContent = `${card.dataset.name} selected`;
      $('[data-selected-includes]', inquiry).textContent = `This package includes ${card.dataset.includes}`;
      $('[data-inquiry-submit]', inquiry).textContent = `Send reservation for ${card.dataset.name}`;
      $('[data-package-form]', card).append(inquiry);
      say($('[data-inquiry-msg]', inquiry), '', true);
      loadBookedDates().then(checkDate);
      card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      setTimeout(() => { if (token === mine) $('input[name="name"]', inquiry).focus({ preventScroll: true }); }, 350);
    }

    function reset() {
      token++;
      const previous = current;
      current = null;
      panel.classList.remove('has-selection');
      cards.forEach((c) => {
        c.hidden = false;
        c.classList.remove('is-selected', 'is-leaving');
        $('[data-package-select]', c).setAttribute('aria-expanded', 'false');
        $('[data-package-back]', c).hidden = true;
      });
      holder.append(inquiry);
      inquiry.elements.package.value = '';
      previous?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      if (previous) $('[data-package-select]', previous).focus({ preventScroll: true });
    }

    panel.addEventListener('click', (e) => {
      const pick = e.target.closest('[data-package-select]');
      if (pick) choose(pick.dataset.packageSelect);
      else if (e.target.closest('[data-package-back]')) reset();
    });

    // Deep link: /#package-a opens that package's form.
    const wanted = location.hash.match(/^#package-([a-z]+)$/);
    if (wanted) setTimeout(() => choose(wanted[1]), 300);
  }

  inquiry?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const msg = $('[data-inquiry-msg]', inquiry);
    const btn = $('[data-inquiry-submit]', inquiry);
    const f = inquiry.elements;
    if (!checkDate()) { say(msg, DATE_TAKEN, false); return; }
    const payload = {
      name: f.name.value, event_date: f.event_date.value, guests: f.guests.value, contact: f.contact.value, venue: f.venue.value,
      package: f.package.value,
      addon_sticker: f.addon_sticker.checked,
      addon_signature: f.addon_signature.checked,
      extra_cups: Number(f.extra_cups.value) || 0,
    };
    btn.disabled = true;
    try {
      const out = await api('inquiry', payload);
      say(msg, out.message, true);
      const chosen = f.package.value;
      inquiry.reset();
      f.package.value = chosen; // stay on the chosen package
      await loadBookedDates(); // the date just sent is now held
      checkDate();
    } catch (err) {
      say(msg, err.message, false);
      if (err.status === 409) { await loadBookedDates(); checkDate(); } // someone took the date a moment ago
    }
    btn.disabled = false;
    msg.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); // the form scrolls inside its card
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
    list.innerHTML = lineItems(entries.map(([key, qty]) => { const d = describe(key); return { name: fullName(d), price: d.unit, qty }; }));
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
          items: Object.entries(cart).map(([key, qty]) => { const d = describe(key); return { slug: d.item.slug, size: d.size, choice: d.choice, qty }; }),
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
    // Confirm keeps a date; decline frees it for someone else.
    const inquiryActions = (q) => {
      if (q.status === 'declined') return '';
      const confirm = q.status === 'confirmed' ? '' : `<button class="btn btn-dark" style="padding:8px 14px" data-inq="${q.id}" data-to="confirmed">Confirm</button> `;
      return `${confirm}<button class="btn btn-line" style="padding:8px 14px" data-inq="${q.id}" data-to="declined">Decline</button>`;
    };

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
          <tr><td>${esc(q.name)}</td><td>${esc(q.event_date)}</td><td>${esc(q.guests)}</td><td>${esc(q.contact)}</td><td>${esc(q.venue)}</td><td>${esc(q.package_summary || '')}</td><td><span class="pill ${esc(q.status || 'new')}">${esc(q.status || 'new')}</span></td><td>${esc(when(q.created_at))}</td><td>${inquiryActions(q)}</td></tr>`).join('')
          || '<tr><td colspan="9">No inquiries yet.</td></tr>';
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
      const inq = e.target.closest('[data-inq]');
      if (inq) {
        inq.disabled = true;
        try { await api('admin', { action: 'inquiry-status', id: Number(inq.dataset.inq), status: inq.dataset.to }); }
        catch (err) { window.alert(err.message); }
        loadAdmin();
        return;
      }
      const b = e.target.closest('[data-fulfil]');
      if (!b) return;
      b.disabled = true;
      await api('admin', { action: 'fulfil', ref: b.dataset.fulfil }).catch(() => {});
      loadAdmin();
    });
    loadAdmin();
  }

  /* ---------- coffee cart photos: carousel and viewer ---------- */
  const viewerData = $('#gallery-data');
  const photos = viewerData ? JSON.parse(viewerData.textContent) : [];
  const lb = $('#lightbox');
  let lbIndex = 0;
  let lbFocus = null;

  function lbShow(i) {
    lbIndex = (i + photos.length) % photos.length;
    const p = photos[lbIndex];
    const img = $('[data-lb-img]', lb);
    img.width = p.w;
    img.height = p.h;
    img.alt = p.alt;
    img.src = p.src;
    $('[data-lb-caption]', lb).textContent = p.alt;
    $('[data-lb-count]', lb).textContent = `${lbIndex + 1} / ${photos.length}`;
    [lbIndex + 1, lbIndex - 1].forEach((n) => { new Image().src = photos[(n + photos.length) % photos.length].src; }); // warm the neighbours
  }
  function lbOpen(i) {
    if (!lb || !photos.length) return;
    lbFocus = document.activeElement;
    lbShow(i);
    document.body.style.overflow = 'hidden';
    if (typeof lb.showModal === 'function') lb.showModal(); else lb.setAttribute('open', '');
    $('[data-lb-close]', lb).focus({ preventScroll: true });
  }
  function lbClose() {
    if (typeof lb.close === 'function') lb.close(); else lb.removeAttribute('open');
  }
  lb?.addEventListener('close', () => {
    document.body.style.overflow = '';
    lbFocus?.focus?.({ preventScroll: true });
    // keep the carousel in step with the last photo viewed
    if (lbIndex > 0) document.dispatchEvent(new CustomEvent('gallery:show', { detail: lbIndex - 1 }));
  });
  lb?.addEventListener('click', (e) => { if (e.target === lb) lbClose(); }); // click outside the photo
  lb?.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { lbShow(lbIndex + 1); e.preventDefault(); }
    else if (e.key === 'ArrowLeft') { lbShow(lbIndex - 1); e.preventDefault(); }
  });
  // swipe left or right on the photo
  let swipeX = null;
  lb?.addEventListener('pointerdown', (e) => { if (e.target.closest('.lb-figure')) swipeX = e.clientX; });
  lb?.addEventListener('pointerup', (e) => {
    if (swipeX === null) return;
    const dx = e.clientX - swipeX;
    swipeX = null;
    if (Math.abs(dx) > 50) lbShow(lbIndex + (dx < 0 ? 1 : -1));
  });
  document.addEventListener('click', (e) => {
    const open = e.target.closest('[data-open-photo]');
    if (open) return lbOpen(Number(open.dataset.openPhoto));
    if (!lb?.open) return;
    if (e.target.closest('[data-lb-close]')) lbClose();
    else if (e.target.closest('[data-lb-next]')) lbShow(lbIndex + 1);
    else if (e.target.closest('[data-lb-prev]')) lbShow(lbIndex - 1);
  });

  // Deep link: /#photo-3 opens that photo in the viewer.
  const photoHash = location.hash.match(/^#photo-(\d+)$/);
  if (photoHash && photos[Number(photoHash[1])]) setTimeout(() => lbOpen(Number(photoHash[1])), 300);

  const gallery = $('[data-gallery]');
  if (gallery) {
    const track = $('[data-g-track]', gallery);
    const playBtn = $('[data-g-play]', gallery);
    const PLAY = '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>';
    const PAUSE = '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M7 5h4v14H7zM13 5h4v14h-4z"/></svg>';

    // Endless loop: three copies of the photos sit side by side and the middle copy is the real one.
    // Whenever the view drifts into the first or last copy, it is moved back by exactly one copy's width,
    // which looks identical, so the carousel can be dragged or scrolled in either direction forever.
    const originals = $$('.gallery-item', track);
    const copy = () => {
      const frag = document.createDocumentFragment();
      originals.forEach((el) => {
        const c = el.cloneNode(true);
        c.classList.add('is-clone');
        c.setAttribute('aria-hidden', 'true');
        $$('button', c).forEach((b) => { b.tabIndex = -1; });
        frag.appendChild(c);
      });
      return frag;
    };
    const firstOfBefore = (() => { const f = copy(); const first = f.firstElementChild; track.prepend(f); return first; })();
    track.append(copy());

    let setW = 0; // width of one copy of the photos
    let pos = 0; // scroll position, kept as a fraction because browsers round scrollLeft
    const measure = () => { setW = originals[0].offsetLeft - firstOfBefore.offsetLeft; };

    let smoothUntil = 0; // while a button-driven smooth scroll runs, do not re-wrap under it
    function wrap() {
      if (!setW || performance.now() < smoothUntil) return;
      if (pos >= 2 * setW) { pos -= setW; track.scrollLeft = pos; }
      else if (pos < setW) { pos += setW; track.scrollLeft = pos; }
    }
    function start() { measure(); pos = setW; track.scrollLeft = pos; }
    start();
    window.addEventListener('resize', () => { const into = (pos - setW) / (setW || 1); measure(); pos = setW + into * setW; track.scrollLeft = pos; });

    // Constant motion. It yields to the visitor: paused while hovering, pressing, focusing with the keyboard,
    // while a photo is open, off-screen, or in a hidden tab, and it resumes shortly after any manual scroll.
    const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const SPEED = 45; // pixels per second
    let userPaused = reduceMotion; // reduced-motion visitors start paused and can press play
    let hovering = false;
    let pressed = false;
    let visible = false;
    let resumeAt = 0;
    const holdOff = (ms = 1500) => { resumeAt = Math.max(resumeAt, performance.now() + ms); };

    function setPlayIcon() {
      playBtn.setAttribute('aria-label', userPaused ? 'Play automatic scrolling' : 'Pause automatic scrolling');
      playBtn.innerHTML = userPaused ? PLAY : PAUSE;
    }
    setPlayIcon();
    playBtn.addEventListener('click', () => { userPaused = !userPaused; setPlayIcon(); });

    let last = 0;
    function frame(t) {
      requestAnimationFrame(frame);
      const dt = Math.min(0.05, (t - (last || t)) / 1000);
      last = t;
      wrap();
      const run = !userPaused && !hovering && !pressed && visible && !document.hidden && !lb?.open && t >= resumeAt;
      if (run && setW) { pos += SPEED * dt; wrap(); track.scrollLeft = pos; }
    }
    requestAnimationFrame(frame);

    // Anything that moves the track other than our own animation counts as the visitor taking over.
    track.addEventListener('scroll', () => {
      const x = track.scrollLeft;
      if (Math.abs(x - pos) > 2) { pos = x; holdOff(); }
    }, { passive: true });

    new IntersectionObserver((entries) => { visible = entries[0].isIntersecting; }, { threshold: 0.2 }).observe(gallery);
    gallery.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') hovering = true; });
    gallery.addEventListener('pointerleave', () => { hovering = false; });
    // Keyboard users get a few quiet seconds after each key press or focus move (and they have the pause button).
    gallery.addEventListener('focusin', (e) => { if (e.target.matches(':focus-visible')) holdOff(5000); });
    gallery.addEventListener('keydown', () => holdOff(5000));

    // Buttons and keys: one step is about 80% of the visible width.
    function step(dir) {
      holdOff(2500);
      smoothUntil = performance.now() + 700;
      track.scrollTo({ left: track.scrollLeft + dir * track.clientWidth * 0.8, behavior: 'smooth' });
    }
    $('[data-g-prev]', gallery).addEventListener('click', () => step(-1));
    $('[data-g-next]', gallery).addEventListener('click', () => step(1));
    track.addEventListener('keydown', (e) => {
      const to = (x) => { holdOff(2500); smoothUntil = performance.now() + 700; track.scrollTo({ left: x, behavior: 'smooth' }); };
      const keys = {
        ArrowRight: () => step(1),
        ArrowLeft: () => step(-1),
        Home: () => to(setW),
        End: () => to(2 * setW - track.clientWidth),
      };
      if (keys[e.key]) { keys[e.key](); e.preventDefault(); }
    });
    track.addEventListener('wheel', () => holdOff(), { passive: true });
    track.addEventListener('touchstart', () => { pressed = true; }, { passive: true });
    const touchDone = () => { pressed = false; holdOff(2200); }; // leave time for the swipe to coast
    track.addEventListener('touchend', touchDone, { passive: true });
    track.addEventListener('touchcancel', touchDone, { passive: true });

    // Drag with the mouse (touch screens already scroll natively). A drag never counts as a click.
    let dragging = false;
    let lastX = 0;
    let moved = 0;
    let suppressClick = false;
    track.addEventListener('pointerdown', (e) => {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      dragging = true; pressed = true; moved = 0; lastX = e.clientX;
    });
    window.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      const dx = e.clientX - lastX;
      lastX = e.clientX;
      moved += Math.abs(dx);
      if (moved > 6) track.classList.add('dragging');
      track.scrollLeft -= dx;
      pos = track.scrollLeft;
      wrap();
    });
    window.addEventListener('pointerup', () => {
      if (!dragging) return;
      dragging = false;
      pressed = false;
      holdOff(1800);
      track.classList.remove('dragging');
      suppressClick = moved > 6;
      setTimeout(() => { suppressClick = false; }, 60);
    });
    track.addEventListener('click', (e) => { if (suppressClick) { e.stopPropagation(); e.preventDefault(); suppressClick = false; } }, true);

    // After closing the photo viewer, bring that photo back into the middle of the carousel.
    document.addEventListener('gallery:show', (e) => {
      const item = originals[e.detail];
      if (!item) return;
      const pad = parseFloat(getComputedStyle(track).paddingLeft) || 0;
      pos = pad + (item.offsetLeft - originals[0].offsetLeft) + setW - (track.clientWidth - item.offsetWidth) / 2;
      track.scrollLeft = pos;
      holdOff(2500);
    });
  }

  /* ---------- hero typewriter ---------- */
  const tw = $('[data-typewriter] .tw');
  if (tw) {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      tw.classList.add('tw-ready'); // show the text as is
    } else {
      const text = tw.textContent;
      tw.textContent = '';
      const chars = [];
      text.split(/(\s+)/).forEach((part) => {
        if (!part) return;
        if (/^\s+$/.test(part)) { tw.appendChild(document.createTextNode(' ')); return; }
        const word = document.createElement('span');
        word.className = 'w';
        for (const ch of part) {
          const c = document.createElement('span');
          c.className = 'tw-c';
          c.textContent = ch;
          word.appendChild(c);
          chars.push(c);
        }
        tw.appendChild(word);
      });
      tw.classList.add('tw-ready');

      const caret = document.createElement('span');
      caret.className = 'tw-caret';
      const host = tw.closest('[data-typewriter]');
      // Milliseconds per letter (a short line reads better a little slower), and how long the finished line stays up.
      const speed = Number(host?.dataset.typewriterSpeed) || 38;
      const HOLD = 3600;
      let i = 0;
      let onScreen = true;
      if ('IntersectionObserver' in window) new IntersectionObserver((e) => { onScreen = e[0].isIntersecting; }).observe(host);
      // The loop waits while the hero is scrolled out of view or the tab is in the background.
      const later = (fn, ms) => setTimeout(() => (onScreen && !document.hidden ? fn() : later(fn, 400)), ms);

      // Type the line, hold it for a few seconds, rub it out letter by letter, then start over, so nobody misses it.
      function type() {
        if (i >= chars.length) { later(erase, HOLD); return; }
        const c = chars[i++];
        c.classList.add('on');
        c.after(caret);
        const ch = c.textContent;
        const last = i === chars.length;
        later(type, !last && ',;'.includes(ch) ? speed * 6 : !last && '.!?'.includes(ch) ? speed * 10 : speed);
      }
      function erase() {
        if (i <= 0) { later(type, 800); return; }
        chars[--i].classList.remove('on');
        if (i > 0) chars[i - 1].after(caret); else chars[0].before(caret);
        later(erase, Math.max(22, speed * 0.4));
      }
      later(type, 600);
    }
  }

  render();
})();
