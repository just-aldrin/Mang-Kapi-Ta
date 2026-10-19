// End-to-end checks against a locally running dev server using the in-memory store.
// Usage: node scripts/test.mjs   (starts its own server on a spare port)
import { spawn } from 'node:child_process';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import { MENU, CATEGORIES, SIZES } from '../lib/menu.js';
import { signatureValid } from '../lib/payments.js';

const PORT = 3917;
const base = `http://localhost:${PORT}`;
const server = spawn(process.execPath, ['scripts/dev.mjs'], {
  env: { ...process.env, PORT: String(PORT), ADMIN_PASSWORD: 'test-admin-pass', SUPABASE_URL: '', SUPABASE_SERVICE_ROLE_KEY: '', PAYMONGO_SECRET_KEY: '', PAYMONGO_WEBHOOK_SECRET: 'whsec_test' },
  stdio: 'ignore',
});

const json = (path, body, headers = {}) =>
  fetch(base + path, { method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body: JSON.stringify(body) });

const goodOrder = { name: 'Test Buyer', email: 't@example.com', phone: '0917 123 4567', order_type: 'pickup', notes: '' };
const day = (n) => new Date(Date.now() + n * 864e5).toISOString().slice(0, 10); // YYYY-MM-DD, n days from now
let passed = 0;
const check = async (name, fn) => { await fn(); passed++; console.log(`ok  ${name}`); };

try {
  for (let i = 0; i < 40; i++) { try { await fetch(base); break; } catch { await new Promise((r) => setTimeout(r, 150)); } }

  await check('home page is served and the cart section follows the hero', async () => {
    const html = await (await fetch(base + '/')).text();
    assert.equal((html.match(/class="stamp-card"/g) || []).length, 36);
    assert.equal((html.match(/class="stamp-card"[^>]*\shidden/g) || []).length, 30); // only Kapi Picks (6) shows first
    for (const c of CATEGORIES) assert.ok(html.includes(`data-filter="${c.replace('&', '&amp;')}"`), `tab for ${c}`);
    assert.ok(html.includes('data-filter="all"') && html.includes('Handymax (Hx) 12 oz'));
    // Stamps are view-only: the add button exists only inside the details popup.
    assert.equal((html.match(/data-add=/g) || []).length, 0);
    assert.equal((html.match(/data-d-add/g) || []).length, 1);
    assert.ok(html.includes("<dialog class=\"drink\""));
    // The typewriter sentence is also present as plain text for screen readers and no-script visitors.
    assert.match(html, /<p class="lead" data-typewriter><span class="sr-only">Rooted in the warm/);
    // Hero: the logo replaces the written title (its words live in the image's alt text).
    assert.ok(html.includes('src="/assets/images/main-hero-logo.png"'));
    assert.ok(!html.includes('<h1>Mang Kapi Ta.'));
    // Coffee cart: two package cards beside the main photo; the reservation form waits in a hidden holder.
    assert.equal((html.match(/class="package"/g) || []).length, 2);
    assert.match(html, /<div class="inquiry-holder" data-inquiry-holder hidden>/);
    // No package prices or fee note on the cards, and no "Birthday coffee cart" label.
    assert.ok(!html.includes('Birthday coffee cart'));
    assert.ok(!html.includes('class="package-price"'));
    assert.ok(!html.includes('Add-ons:') && !html.includes('fee is charged'));
    // No intro sentence under the heading and no contact line in the package panel.
    assert.ok(!html.includes('Pick a package') && !html.includes('For inquiries and reservations'));
    assert.ok(html.indexOf('data-package-panel') < html.indexOf('id="inquiry-form"'));
    // Coffee cart section: main photo, a 12-photo carousel, a viewer with 13 photos, and every image file exists.
    assert.equal((html.match(/class="gallery-item"/g) || []).length, 12);
    assert.ok(html.includes("cart/main.jpg"));
    assert.ok(html.indexOf('data-package-panel') < html.indexOf('data-gallery')); // packages come before the carousel
    const data = JSON.parse(html.match(/<script type="application\/json" id="gallery-data">([^<]+)<\/script>/)[1]);
    assert.equal(data.length, 13);
    assert.ok(html.includes('id="lightbox"'));
    const images = new Set(html.match(/\/assets\/images\/cart\/[A-Za-z0-9-]+\.jpg/g) || []);
    for (const entry of data) images.add(entry.src);
    assert.ok(images.size >= 25);
    for (const src of images) assert.equal((await fetch(base + src)).status, 200, src + " should exist");
    assert.ok(html.indexOf('class="hero"') < html.indexOf('id="cart"'));
    assert.ok(html.indexOf('id="cart"') < html.indexOf('class="strip"'));
  });

  let redirect;
  await check('order is priced on the server, ignoring browser prices', async () => {
    const res = await json('/api/order', { ...goodOrder, items: [{ slug: 'kapi-migliore', size: 'px', qty: 2, price: 1 }, { slug: 'blt-sandwich', qty: 1 }] });
    assert.equal(res.status, 200);
    redirect = (await res.json()).redirect;
    const q = new URL(base + redirect).searchParams;
    const order = await (await fetch(`${base}/api/order?ref=${q.get('ref')}&k=${q.get('k')}`)).json();
    assert.equal(order.total, 60500); // 2 x Kapi Migliore Panamax 200 + BLT 205 = 605 pesos, whatever the browser claimed
    assert.deepEqual(order.items.map((i) => i.name).sort(), ['BLT Sandwich', 'Kapi Migliore (Panamax 16 oz)']);
    assert.equal(order.status, 'pending');
    assert.equal(order.mode, 'sandbox');
    assert.deepEqual(order.methods, ['gcash']); // the simulator offers GCash only
  });

  const q = () => new URL(base + redirect).searchParams;
  const orderUrl = () => `${base}/api/order?ref=${q().get('ref')}&k=${q().get('k')}`;

  await check('wrong access key cannot read an order', async () => {
    const res = await fetch(`${base}/api/order?ref=${q().get('ref')}&k=wrong`);
    assert.equal(res.status, 404);
  });

  await check('pay starts the sandbox GCash screen', async () => {
    const res = await json('/api/pay', { ref: q().get('ref'), k: q().get('k') });
    assert.equal(res.status, 200);
    assert.match((await res.json()).redirect, /^\/sandbox\?ref=/);
  });

  await check('sandbox approval marks the order paid, and it cannot be un-paid', async () => {
    const approve = await json('/api/sandbox', { ref: q().get('ref'), k: q().get('k'), action: 'approve' });
    assert.equal(approve.status, 200);
    assert.equal((await (await fetch(orderUrl())).json()).status, 'paid');
    await json('/api/sandbox', { ref: q().get('ref'), k: q().get('k'), action: 'decline' });
    assert.equal((await (await fetch(orderUrl())).json()).status, 'paid');
  });

  await check('declined payment shows failed', async () => {
    const o = await (await json('/api/order', { ...goodOrder, items: [{ slug: 'kapi-alsaha', size: 'px', qty: 1 }] })).json();
    const p = new URL(base + o.redirect).searchParams;
    await json('/api/sandbox', { ref: p.get('ref'), k: p.get('k'), action: 'decline' });
    assert.equal((await (await fetch(`${base}/api/order?ref=${p.get('ref')}&k=${p.get('k')}`)).json()).status, 'failed');
  });

  await check('validation rejects bad input', async () => {
    assert.equal((await json('/api/order', { ...goodOrder, phone: '123', items: [{ slug: 'kapi-alsaha', qty: 1 }] })).status, 422);
    assert.equal((await json('/api/order', { ...goodOrder, email: 'nope', items: [{ slug: 'kapi-alsaha', qty: 1 }] })).status, 422);
    assert.equal((await json('/api/order', { ...goodOrder, items: [{ slug: 'nope', qty: 1 }] })).status, 422);
    assert.equal((await json('/api/order', { ...goodOrder, items: [{ slug: 'kapi-alsaha', size: 'px', qty: 99 }] })).status, 422);
    assert.equal((await json('/api/order', { ...goodOrder, items: [] })).status, 422);
  });

  await check('sizes, choices, merging and the payment cap are enforced on the server', async () => {
    const post = (items) => json('/api/order', { ...goodOrder, items });
    const read = async (res) => { const q = new URL(base + (await res.json()).redirect).searchParams; return (await fetch(`${base}/api/order?ref=${q.get('ref')}&k=${q.get('k')}`)).json(); };
    // a drink needs a real size
    assert.equal((await post([{ slug: 'americano', qty: 1 }])).status, 422);
    assert.equal((await post([{ slug: 'americano', size: 'zz', qty: 1 }])).status, 422);
    assert.equal((await post([{ slug: 'americano', size: 'constructor', qty: 1 }])).status, 422); // not a size just because it exists on every object
    assert.equal((await post([{ slug: 'kapi-alsaha', size: 'hx', qty: 1 }])).status, 422); // Panamax only
    assert.equal((await post([{ slug: 'reuben-sandwich', size: 'px', qty: 1 }])).status, 422); // food has no sizes
    // each size has its own price
    assert.equal((await read(await post([{ slug: 'americano', size: 'hx', qty: 1 }]))).total, 13500);
    assert.equal((await read(await post([{ slug: 'americano', size: 'px', qty: 1 }]))).total, 15000);
    assert.equal((await read(await post([{ slug: 'reuben-sandwich', qty: 1 }]))).total, 25000);
    assert.equal((await read(await post([{ slug: 'kapi-alsaha', size: 'px', qty: 1 }]))).total, 24000);
    // Kapi Mocha needs a chocolate
    assert.equal((await post([{ slug: 'kapi-mocha', size: 'hx', qty: 1 }])).status, 422);
    assert.equal((await post([{ slug: 'kapi-mocha', size: 'hx', choice: 'Purple', qty: 1 }])).status, 422);
    const mocha = await read(await post([{ slug: 'kapi-mocha', size: 'hx', choice: 'Dark', qty: 1 }, { slug: 'kapi-mocha', size: 'hx', choice: 'White', qty: 2 }]));
    assert.equal(mocha.total, 51000); // 3 x 170
    assert.deepEqual(mocha.items.map((i) => i.name).sort(), ['Kapi Mocha (Handymax 12 oz, Dark)', 'Kapi Mocha (Handymax 12 oz, White)']);
    // the same line twice is one line with the quantities added
    const merged = await read(await post([{ slug: 'pika', size: 'px', qty: 2 }, { slug: 'pika', size: 'px', qty: 3 }]));
    assert.equal(merged.items.length, 1);
    assert.equal(merged.items[0].qty, 5);
    assert.equal(merged.total, 87500); // 5 x 175
    // GCash and QR Ph stop at PHP 100,000, so a bigger order is refused up front
    const huge = MENU.slice(0, 30).map((m) => ({ slug: m.slug, ...(m.sizes ? { size: Object.keys(m.sizes).at(-1) } : {}), ...(m.choice ? { choice: m.choice.options[0] } : {}), qty: 20 }));
    const tooBig = await post(huge);
    assert.equal(tooBig.status, 422);
    assert.match((await tooBig.json()).error, /100,000/);
  });

  await check('the menu data is consistent', async () => {
    assert.equal(MENU.length, 36);
    assert.equal(new Set(MENU.map((m) => m.slug)).size, MENU.length);
    for (const m of MENU) {
      assert.ok(CATEGORIES.includes(m.category), m.slug + ' category');
      assert.ok(m.art, m.slug + ' has an illustration');
      if (m.sizes) {
        assert.ok(Object.keys(m.sizes).every((k) => k in SIZES), m.slug + ' sizes');
        assert.ok(Object.values(m.sizes).every((p) => Number.isInteger(p) && p >= 10000), m.slug + ' size prices');
        if (m.sizes.hx) assert.ok(m.sizes.hx < m.sizes.px, m.slug + ': Handymax costs less than Panamax');
      } else {
        assert.ok(Number.isInteger(m.price) && m.price >= 10000, m.slug + ' price');
      }
    }
    // The Hiligaynon lines stay exactly as printed, with no English reading added beside them.
    const text = (slug) => MENU.find((x) => x.slug === slug);
    assert.equal(text('kapi-migliore').note, 'Tam-is nga medyo isog');
    assert.equal(text('kapi-freddo').note, 'Isog nga medyo tam-is');
    assert.equal(text('kakaw-kapi').note, 'Salted cacao nga may kapi');
    for (const slug of ['kapi-migliore', 'kapi-freddo', 'kakaw-kapi']) assert.ok(!/strength|sweetness|with coffee|sweet,|strong,/i.test(text(slug).blurb), slug + ' blurb must not translate the Hiligaynon line');
    // spot checks against the printed menu boards
    const price = (slug, size) => { const m = MENU.find((x) => x.slug === slug); return (size ? m.sizes[size] : m.price) / 100; };
    assert.equal(price('kapi-migliore', 'hx'), 180); assert.equal(price('kapi-migliore', 'px'), 200);
    assert.equal(price('kapi-alsaha', 'px'), 240); assert.equal(price('matcha-tiramisu', 'px'), 230);
    assert.equal(price('ube-cloud', 'hx'), 175); assert.equal(price('sparkling-chee', 'px'), 180);
    assert.equal(price('reuben-sandwich'), 250); assert.equal(price('seafood-marinara'), 280);
  });

  await check('cross-site and non-JSON writes are refused', async () => {
    assert.equal((await json('/api/order', { ...goodOrder, items: [{ slug: 'kapi-alsaha', size: 'px', qty: 1 }] }, { Origin: 'https://evil.example' })).status, 403);
    const form = await fetch(base + '/api/order', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'a=1' });
    assert.equal(form.status, 415);
    assert.equal((await fetch(base + '/api/order', { method: 'PUT' })).status, 405);
  });

  await check('inquiry and newsletter work and validate', async () => {
    const date = day(30);
    const dateB = day(31);
    assert.equal((await json('/api/inquiry', { name: 'A', event_date: date, guests: '50 - 80 guests', contact: '0917 123 4567', venue: 'Hall' })).status, 200);
    assert.equal((await json('/api/inquiry', { name: 'A', event_date: '2020-01-01', guests: 'x', contact: '0917 123 4567', venue: 'Hall' })).status, 422);
    // With a package: the server prices it (Package B 18,750 + sticker 250 + 20 extra cups at 150 + 1,000 transport = 23,000).
    const withPackage = await json('/api/inquiry', { name: 'Pkg Host', event_date: dateB, guests: '80 - 150 guests', contact: '0917 123 4567', venue: 'Garden', package: 'b', addon_sticker: true, addon_signature: false, extra_cups: 20, price: 1 });
    assert.equal(withPackage.status, 200);
    assert.match((await withPackage.json()).message, /Package B/);
    assert.equal((await json('/api/inquiry', { name: 'A', event_date: date, guests: 'x', contact: '0917 123 4567', venue: 'Hall', package: 'nonsense' })).status, 422);
    // One event per day: a date that is already held is refused, no matter who asks or which package they pick.
    const again = await json('/api/inquiry', { name: 'Someone Else', event_date: date, guests: '50 - 80 guests', contact: '0918 765 4321', venue: 'Elsewhere', package: 'a' });
    assert.equal(again.status, 409);
    assert.match((await again.json()).error, /already reserved/);
    assert.equal((await json('/api/inquiry', { name: 'Someone Else', event_date: dateB, guests: '50 - 80 guests', contact: '0918 765 4321', venue: 'Elsewhere' })).status, 409);
    // The public list shows dates only (never names), so the form can warn before sending.
    const listed = await (await fetch(base + '/api/booked-dates')).json();
    assert.ok(listed.dates.includes(date) && listed.dates.includes(dateB));
    assert.ok(!listed.dates.includes(day(60)));
    assert.ok(!JSON.stringify(listed).includes('Pkg Host'));
    assert.equal((await fetch(base + '/api/booked-dates', { method: 'POST' })).status, 405);
    assert.equal((await json('/api/subscribe', { email: 'a@b.co' })).status, 200);
    assert.equal((await json('/api/subscribe', { email: 'bad' })).status, 422);
  });

  await check('staff can confirm or decline an inquiry, and declining frees the date', async () => {
    const login = await json('/api/admin', { action: 'login', password: 'test-admin-pass' });
    const cookie = login.headers.get('set-cookie').split(';')[0];
    const staff = (body) => json('/api/admin', body, { Cookie: cookie });
    const list = async () => (await (await fetch(base + '/api/admin', { headers: { Cookie: cookie } })).json()).inquiries;
    const first = (await list()).find((q) => q.event_date === day(30));
    assert.equal(first.status, 'new');
    assert.equal((await staff({ action: 'inquiry-status', id: first.id, status: 'nonsense' })).status, 400);
    assert.equal((await json('/api/admin', { action: 'inquiry-status', id: first.id, status: 'declined' })).status, 401); // not signed in
    // Confirming keeps the date taken.
    assert.equal((await staff({ action: 'inquiry-status', id: first.id, status: 'confirmed' })).status, 200);
    assert.equal((await list()).find((q) => q.id === first.id).status, 'confirmed');
    assert.ok((await (await fetch(base + '/api/booked-dates')).json()).dates.includes(day(30)));
    // Declining frees it, and someone else can then take it.
    assert.equal((await staff({ action: 'inquiry-status', id: first.id, status: 'declined' })).status, 200);
    assert.ok(!(await (await fetch(base + '/api/booked-dates')).json()).dates.includes(day(30)));
    assert.equal((await json('/api/inquiry', { name: 'Next Host', event_date: day(30), guests: '50 - 80 guests', contact: '0918 765 4321', venue: 'Elsewhere' })).status, 200);
    assert.equal((await staff({ action: 'inquiry-status', id: 999999, status: 'confirmed' })).status, 404);
  });

  await check('staff area needs a password and lists orders after login', async () => {
    assert.equal((await fetch(base + '/api/admin')).status, 401);
    assert.equal((await json('/api/admin', { action: 'login', password: 'wrong' })).status, 401);
    const login = await json('/api/admin', { action: 'login', password: 'test-admin-pass' });
    assert.equal(login.status, 200);
    const cookie = login.headers.get('set-cookie').split(';')[0];
    const data = await (await fetch(base + '/api/admin', { headers: { Cookie: cookie } })).json();
    assert.ok(data.orders.length >= 2 && data.inquiries.length >= 1);
    const packaged = data.inquiries.find((q) => /Package B/.test(q.package_summary || ''));
    assert.ok(packaged, 'the package inquiry should appear on the staff page');
    assert.match(packaged.package_summary, /estimated total PHP 23,000/);
    assert.equal((await fetch(base + '/api/admin', { headers: { Cookie: 'kapi_admin=1.deadbeef' } })).status, 401);
  });

  await check('webhook rejects bad signatures and accepts valid ones', async () => {
    const payload = JSON.stringify({ data: { attributes: { type: 'ping' } } });
    assert.equal((await fetch(base + '/api/webhook', { method: 'POST', body: payload, headers: { 'paymongo-signature': 't=1,te=bad,li=' } })).status, 400);
    const t = '1700000000';
    const sig = crypto.createHmac('sha256', 'whsec_test').update(`${t}.${payload}`).digest('hex');
    assert.equal((await fetch(base + '/api/webhook', { method: 'POST', body: payload, headers: { 'paymongo-signature': `t=${t},te=${sig},li=` } })).status, 200);
    assert.equal(signatureValid(payload, `t=${t},te=${sig},li=`, 'whsec_test'), true);
    assert.equal(signatureValid(payload, '', 'whsec_test'), false);
  });

  console.log(`\n${passed} checks passed`);
} catch (err) {
  console.error('\nFAILED:', err.message);
  process.exitCode = 1;
} finally {
  server.kill();
}
