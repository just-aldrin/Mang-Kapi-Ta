import crypto from 'node:crypto';
import * as db from '../lib/db.js';
import { findItem } from '../lib/menu.js';
import { guardWrite, query, readJson, safeEqual, send } from '../lib/http.js';
import { paymentsMode } from '../lib/payments.js';

const peso = (c) => `₱${(c / 100).toLocaleString('en-PH')}`;

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') return await getOrder(req, res);
    return await createOrder(req, res);
  } catch (err) {
    console.error('order:', err);
    send(res, 500, { error: 'Something went wrong. Please try again.' });
  }
}

/** Returns an order to the browser that holds its secret access key. */
async function getOrder(req, res) {
  const { ref = '', k = '' } = query(req);
  const order = ref ? await db.getOrder(ref) : null;
  if (!order || !safeEqual(order.access_key, k)) return send(res, 404, { error: 'Order not found.' });

  send(res, 200, {
    ref: order.ref,
    name: order.name,
    status: order.status,
    total: order.total,
    provider: order.provider,
    mode: paymentsMode(),
    items: (order.items || []).map((i) => ({ name: i.name, price: i.price, qty: i.qty })),
  });
}

async function createOrder(req, res) {
  if (!guardWrite(req, res)) return;
  const input = await readJson(req);
  if (!input || typeof input !== 'object') return send(res, 400, { error: 'Invalid request.' });

  const name = String(input.name ?? '').trim();
  const email = String(input.email ?? '').trim();
  const phone = String(input.phone ?? '').replace(/[\s-]+/g, '');
  const orderType = ['pickup', 'dine-in'].includes(input.order_type) ? input.order_type : 'pickup';
  const notes = String(input.notes ?? '').trim().slice(0, 300);

  if (!name || name.length > 100) return send(res, 422, { error: 'Please enter your name.' });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 160) {
    return send(res, 422, { error: 'Please enter a valid email address.' });
  }
  // Philippine mobile: 09XXXXXXXXX or +639XXXXXXXXX
  if (!/^(?:\+63|0)9\d{9}$/.test(phone)) {
    return send(res, 422, { error: 'Please enter a valid mobile number, e.g. 0917 123 4567.' });
  }
  if (paymentsMode() === 'off') return send(res, 503, { error: 'Online ordering is not available right now.' });

  const lines = Array.isArray(input.items) ? input.items : [];
  if (!lines.length || lines.length > 30) return send(res, 422, { error: 'Your order is empty.' });

  // Prices always come from the server-side menu, never from the browser.
  const merged = new Map();
  for (const line of lines) {
    const item = findItem(String(line?.slug ?? ''));
    const qty = Number(line?.qty);
    if (!item) return send(res, 422, { error: 'An item in your order is no longer available.' });
    if (!Number.isInteger(qty) || qty < 1 || qty > 20) return send(res, 422, { error: 'Invalid quantity.' });
    merged.set(item.slug, Math.min((merged.get(item.slug) || 0) + qty, 20));
  }

  const items = [...merged].map(([slug, qty]) => {
    const item = findItem(slug);
    return { product_slug: slug, name: item.name, price: item.price, qty };
  });
  const total = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  if (total < 2000) return send(res, 422, { error: `The minimum order is ${peso(2000)}.` }); // GCash minimum is PHP 20

  const ref = 'KTA-' + crypto.randomBytes(5).toString('hex').toUpperCase();
  const accessKey = crypto.randomBytes(18).toString('hex');

  await db.createOrder(
    { ref, access_key: accessKey, name, phone, email, order_type: orderType, notes, total },
    items,
  );

  send(res, 200, { ok: true, redirect: `/pay?ref=${ref}&k=${accessKey}` });
}
