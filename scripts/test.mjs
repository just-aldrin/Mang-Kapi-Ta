// End-to-end checks against a locally running dev server using the in-memory store.
// Usage: node scripts/test.mjs   (starts its own server on a spare port)
import { spawn } from 'node:child_process';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
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
let passed = 0;
const check = async (name, fn) => { await fn(); passed++; console.log(`ok  ${name}`); };

try {
  for (let i = 0; i < 40; i++) { try { await fetch(base); break; } catch { await new Promise((r) => setTimeout(r, 150)); } }

  await check('home page is served and the cart section follows the hero', async () => {
    const html = await (await fetch(base + '/')).text();
    assert.equal((html.match(/class="stamp-card"/g) || []).length, 7);
    // Stamps are view-only: the add button exists only inside the details popup.
    assert.equal((html.match(/data-add=/g) || []).length, 0);
    assert.equal((html.match(/data-d-add/g) || []).length, 1);
    assert.ok(html.includes("<dialog class=\"drink\""));
    assert.ok(html.indexOf('class="hero"') < html.indexOf('id="cart"'));
    assert.ok(html.indexOf('id="cart"') < html.indexOf('class="strip"'));
  });

  let redirect;
  await check('order is priced on the server, ignoring browser prices', async () => {
    const res = await json('/api/order', { ...goodOrder, items: [{ slug: 'kapi-migliore', qty: 2, price: 1 }, { slug: 'blk-sandwich', qty: 1 }] });
    assert.equal(res.status, 200);
    redirect = (await res.json()).redirect;
    const q = new URL(base + redirect).searchParams;
    const order = await (await fetch(`${base}/api/order?ref=${q.get('ref')}&k=${q.get('k')}`)).json();
    assert.equal(order.total, 44500); // 2 x 130 + 185 pesos
    assert.equal(order.status, 'pending');
    assert.equal(order.mode, 'sandbox');
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
    const o = await (await json('/api/order', { ...goodOrder, items: [{ slug: 'kapi-alsaha', qty: 1 }] })).json();
    const p = new URL(base + o.redirect).searchParams;
    await json('/api/sandbox', { ref: p.get('ref'), k: p.get('k'), action: 'decline' });
    assert.equal((await (await fetch(`${base}/api/order?ref=${p.get('ref')}&k=${p.get('k')}`)).json()).status, 'failed');
  });

  await check('validation rejects bad input', async () => {
    assert.equal((await json('/api/order', { ...goodOrder, phone: '123', items: [{ slug: 'kapi-alsaha', qty: 1 }] })).status, 422);
    assert.equal((await json('/api/order', { ...goodOrder, email: 'nope', items: [{ slug: 'kapi-alsaha', qty: 1 }] })).status, 422);
    assert.equal((await json('/api/order', { ...goodOrder, items: [{ slug: 'nope', qty: 1 }] })).status, 422);
    assert.equal((await json('/api/order', { ...goodOrder, items: [{ slug: 'kapi-alsaha', qty: 99 }] })).status, 422);
    assert.equal((await json('/api/order', { ...goodOrder, items: [] })).status, 422);
  });

  await check('cross-site and non-JSON writes are refused', async () => {
    assert.equal((await json('/api/order', { ...goodOrder, items: [{ slug: 'kapi-alsaha', qty: 1 }] }, { Origin: 'https://evil.example' })).status, 403);
    const form = await fetch(base + '/api/order', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'a=1' });
    assert.equal(form.status, 415);
    assert.equal((await fetch(base + '/api/order', { method: 'PUT' })).status, 405);
  });

  await check('inquiry and newsletter work and validate', async () => {
    const date = new Date(Date.now() + 30 * 864e5).toISOString().slice(0, 10);
    assert.equal((await json('/api/inquiry', { name: 'A', event_date: date, guests: '50 - 80 guests', contact: '0917 123 4567', venue: 'Hall' })).status, 200);
    assert.equal((await json('/api/inquiry', { name: 'A', event_date: '2020-01-01', guests: 'x', contact: '0917 123 4567', venue: 'Hall' })).status, 422);
    assert.equal((await json('/api/subscribe', { email: 'a@b.co' })).status, 200);
    assert.equal((await json('/api/subscribe', { email: 'bad' })).status, 422);
  });

  await check('staff area needs a password and lists orders after login', async () => {
    assert.equal((await fetch(base + '/api/admin')).status, 401);
    assert.equal((await json('/api/admin', { action: 'login', password: 'wrong' })).status, 401);
    const login = await json('/api/admin', { action: 'login', password: 'test-admin-pass' });
    assert.equal(login.status, 200);
    const cookie = login.headers.get('set-cookie').split(';')[0];
    const data = await (await fetch(base + '/api/admin', { headers: { Cookie: cookie } })).json();
    assert.ok(data.orders.length >= 2 && data.inquiries.length >= 1);
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
