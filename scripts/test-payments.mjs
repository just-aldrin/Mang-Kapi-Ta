// Tests the live GCash code path against a stand-in for PayMongo's API.
// The stand-in follows PayMongo's documented request and response shapes, so this proves our logic
// (calls made, redirect handling, status mapping, webhook checks). It does not talk to PayMongo.
import assert from 'node:assert/strict';
import crypto from 'node:crypto';

process.env.PAYMONGO_SECRET_KEY = 'sk_test_fake_key';
process.env.PAYMONGO_WEBHOOK_SECRET = 'whsk_test_secret';
process.env.APP_URL = 'https://shop.example';
process.env.SUPABASE_URL = '';
process.env.SUPABASE_SERVICE_ROLE_KEY = '';
delete process.env.VERCEL;

const db = await import('../lib/db.js');
const { startGcash, verifyGcash, paymentsMode } = await import('../lib/payments.js');
const webhook = (await import('../api/webhook.js')).default;

// ---- stand-in for api.paymongo.com ----
let intentStatus = 'awaiting_next_action';
const calls = [];
globalThis.fetch = async (url, init = {}) => {
  const path = new URL(url).pathname.replace('/v1', '');
  const body = init.body ? JSON.parse(init.body).data.attributes : null;
  calls.push({ method: init.method, path, body, auth: init.headers?.Authorization });
  const reply = (data, status = 200) => ({ ok: status < 400, status, json: async () => ({ data }) });
  if (init.method === 'POST' && path === '/payment_intents') return reply({ id: 'pi_123', attributes: { client_key: 'pi_123_client_abc', status: 'awaiting_payment_method' } });
  if (init.method === 'POST' && path === '/payment_methods') return reply({ id: 'pm_123', attributes: { type: 'gcash' } });
  if (init.method === 'POST' && path === '/payment_intents/pi_123/attach') {
    return reply({ id: 'pi_123', attributes: { status: 'awaiting_next_action', next_action: { type: 'redirect', redirect: { url: 'https://test-sources.paymongo.com/gcash/authorize?id=src_1', return_url: body.return_url } } } });
  }
  if (init.method === 'GET' && path === '/payment_intents/pi_123') return reply({ id: 'pi_123', attributes: { status: intentStatus } });
  return { ok: false, status: 404, json: async () => ({ errors: [{ detail: 'unexpected call ' + path }] }) };
};

let n = 0;
const makeOrder = async (total = 44500) => {
  const ref = `KTA-TEST${++n}`;
  await db.createOrder(
    { ref, access_key: 'key' + n, name: 'Test Buyer', phone: '09171234567', email: 't@example.com', order_type: 'pickup', notes: '', total },
    [{ product_slug: 'kapi-migliore', name: 'Kapi Migliore', price: total, qty: 1 }],
  );
  return db.getOrder(ref);
};
const check = async (name, fn) => { await fn(); console.log(`ok  ${name}`); };

await check('live mode is selected when a PayMongo key is set', async () => {
  assert.equal(paymentsMode(), 'live');
});

const order = await makeOrder();
await check('startGcash makes the three documented calls and returns the GCash redirect', async () => {
  const url = await startGcash(order, { headers: { host: 'ignored' } });
  assert.equal(url, 'https://test-sources.paymongo.com/gcash/authorize?id=src_1');
  assert.deepEqual(calls.map((c) => `${c.method} ${c.path}`), ['POST /payment_intents', 'POST /payment_methods', 'POST /payment_intents/pi_123/attach']);

  const [intent, method, attach] = calls;
  assert.equal(intent.auth, 'Basic ' + Buffer.from('sk_test_fake_key:').toString('base64'));
  assert.equal(intent.body.amount, 44500);
  assert.equal(intent.body.currency, 'PHP');
  assert.deepEqual(intent.body.payment_method_allowed, ['gcash']);
  assert.equal(intent.body.metadata.order_ref, order.ref);
  assert.equal(method.body.type, 'gcash');
  assert.deepEqual(method.body.billing, { name: 'Test Buyer', email: 't@example.com', phone: '09171234567' });
  assert.equal(attach.body.payment_method, 'pm_123');
  assert.equal(attach.body.client_key, 'pi_123_client_abc');
  assert.equal(attach.body.return_url, `https://shop.example/api/payment-return?ref=${order.ref}&k=${order.access_key}`);
});

await check('the payment intent id is saved on the order', async () => {
  const saved = await db.getOrder(order.ref);
  assert.equal(saved.provider, 'paymongo');
  assert.equal(saved.provider_ref, 'pi_123');
});

await check('status mapping: processing waits, cancelled becomes failed, succeeded becomes paid', async () => {
  intentStatus = 'processing';
  assert.equal(await verifyGcash(await db.getOrder(order.ref)), 'pending');
  intentStatus = 'awaiting_next_action';
  assert.equal(await verifyGcash(await db.getOrder(order.ref)), 'pending');
  intentStatus = 'awaiting_payment_method';
  assert.equal(await verifyGcash(await db.getOrder(order.ref)), 'failed');
  intentStatus = 'succeeded';
  assert.equal(await verifyGcash(await db.getOrder(order.ref)), 'paid'); // a retry after a failure can still succeed
  assert.equal((await db.getOrder(order.ref)).status, 'paid');
});

await check('a paid order is never downgraded by a later check', async () => {
  intentStatus = 'awaiting_payment_method';
  assert.equal(await verifyGcash(await db.getOrder(order.ref)), 'paid');
});

// ---- webhook ----
const send = async (payload, signature) => {
  const req = Object.assign((async function* () { yield Buffer.from(payload); })(), { method: 'POST', headers: { 'paymongo-signature': signature } });
  const res = { statusCode: 0, setHeader() {}, end(b) { this.body = b; } };
  await webhook(req, res);
  return res.statusCode;
};
const sign = (payload) => {
  const t = String(Math.floor(Date.now() / 1000));
  return `t=${t},te=${crypto.createHmac('sha256', 'whsk_test_secret').update(`${t}.${payload}`).digest('hex')},li=`;
};
const paidEvent = (intent, amount) => JSON.stringify({ data: { id: 'evt_1', attributes: { type: 'payment.paid', data: { id: 'pay_1', attributes: { payment_intent_id: intent, amount } } } } });

await check('webhook: a signed payment.paid with the right amount marks the order paid', async () => {
  const o = await makeOrder(18000);
  await db.setProvider(o.ref, 'paymongo', 'pi_hook_ok');
  const payload = paidEvent('pi_hook_ok', 18000);
  assert.equal(await send(payload, sign(payload)), 200);
  assert.equal((await db.getOrder(o.ref)).status, 'paid');
});

await check('webhook: a wrong amount is ignored', async () => {
  const o = await makeOrder(18000);
  await db.setProvider(o.ref, 'paymongo', 'pi_hook_amount');
  const payload = paidEvent('pi_hook_amount', 100);
  assert.equal(await send(payload, sign(payload)), 200);
  assert.equal((await db.getOrder(o.ref)).status, 'pending');
});

await check('webhook: a bad signature is rejected and changes nothing', async () => {
  const o = await makeOrder(18000);
  await db.setProvider(o.ref, 'paymongo', 'pi_hook_bad');
  const payload = paidEvent('pi_hook_bad', 18000);
  assert.equal(await send(payload, 't=1700000000,te=deadbeef,li='), 400);
  assert.equal((await db.getOrder(o.ref)).status, 'pending');
});

console.log('\nall payment checks passed');
