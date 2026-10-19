/**
 * Payments through PayMongo (a licensed Philippine gateway).
 *
 * Methods:  gcash  redirects the customer to GCash to approve the payment.
 *           qrph   shows a dynamic QR Ph code (the national QR standard) that any bank or e-wallet app,
 *                  including GCash, can scan.
 *
 * Modes:    live     a PayMongo key is set (sk_test_ keys use PayMongo's test mode, sk_live_ real money).
 *           sandbox  a built-in GCash simulator that never moves money. Off in production unless
 *                    DEMO_PAYMENTS=true, so nobody can mark orders paid for free.
 *           off      production with no key and no demo flag; checkout reports payments unavailable.
 */
import crypto from 'node:crypto';
import * as db from './db.js';
import { appUrl, isProduction, safeEqual } from './http.js';

export const QR_EXPIRY_MINUTES = 30; // PayMongo's default lifetime for a dynamic QR Ph code

export function paymentsMode() {
  if (process.env.PAYMONGO_SECRET_KEY) return 'live';
  if (!isProduction() || process.env.DEMO_PAYMENTS === 'true') return 'sandbox';
  return 'off';
}

async function paymongo(method, path, attributes) {
  const res = await fetch(`https://api.paymongo.com/v1${path}`, {
    method,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: 'Basic ' + Buffer.from(`${process.env.PAYMONGO_SECRET_KEY}:`).toString('base64'),
    },
    body: attributes ? JSON.stringify({ data: { attributes } }) : undefined,
    signal: AbortSignal.timeout(20000),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.errors?.[0]?.detail || 'Payment gateway error');
  return json.data || {};
}

/* ------------------------- which methods can be offered ------------------------- */
const ORDER = ['gcash', 'qrph'];
let cache = { at: 0, methods: null };

/**
 * Methods the PayMongo account has switched on, so the checkout never offers one that would fail.
 * If PayMongo cannot tell us (for example with some test keys), both are offered and any real
 * problem is reported when the customer picks one.
 */
export async function availableMethods({ fresh = false } = {}) {
  const mode = paymentsMode();
  if (mode === 'sandbox') return ['gcash'];
  if (mode !== 'live') return [];
  if (!fresh && cache.methods && Date.now() - cache.at < 5 * 60 * 1000) return cache.methods;

  let methods = ORDER;
  try {
    const listed = await paymongo('GET', '/merchants/capabilities/payment_methods');
    const enabled = ORDER.filter((m) => Array.isArray(listed) && listed.includes(m));
    if (enabled.length) methods = enabled;
  } catch (err) {
    console.error('capabilities:', err.message);
  }
  cache = { at: Date.now(), methods };
  return methods;
}

/* ---------------------------------- GCash ---------------------------------- */
/** Starts a GCash payment and returns the URL to send the customer to. */
export async function startGcash(order, req) {
  const mode = paymentsMode();
  if (mode === 'off') throw new Error('Online payments are not available right now.');

  const key = encodeURIComponent(order.access_key);
  const ref = encodeURIComponent(order.ref);

  if (mode === 'sandbox') {
    await db.setProvider(order.ref, 'sandbox');
    return `/sandbox?ref=${ref}&k=${key}`;
  }

  const intent = await paymongo('POST', '/payment_intents', {
    amount: order.total,
    currency: 'PHP',
    payment_method_allowed: ['gcash'],
    capture_type: 'automatic',
    description: `Mang Kapi Ta order ${order.ref}`,
    statement_descriptor: 'MANG KAPI TA',
    metadata: { order_ref: order.ref },
  });
  const method = await paymongo('POST', '/payment_methods', {
    type: 'gcash',
    billing: { name: order.name, email: order.email, phone: order.phone },
  });
  const attached = await paymongo('POST', `/payment_intents/${intent.id}/attach`, {
    payment_method: method.id,
    client_key: intent.attributes.client_key,
    return_url: `${appUrl(req)}/api/payment-return?ref=${ref}&k=${key}`,
  });

  const redirectUrl = attached.attributes?.next_action?.redirect?.url;
  if (!redirectUrl) throw new Error('GCash did not return a checkout link. Please try again.');
  await db.setProvider(order.ref, 'paymongo', intent.id);
  return redirectUrl;
}

/* ---------------------------------- QR Ph ---------------------------------- */
/** Only ever hand the browser an image we recognise, never arbitrary text from a third party. */
export function safeQrImage(value) {
  if (typeof value !== 'string') return null;
  const v = value.trim();
  if (/^data:image\/(png|jpeg|gif|webp);base64,[A-Za-z0-9+/=]+$/.test(v)) return v;
  if (/^[A-Za-z0-9+/=]{100,}$/.test(v)) return `data:image/png;base64,${v}`; // raw Base64 PNG
  return null;
}

/** Creates a single-use QR Ph code for the exact order total. */
export async function startQrph(order) {
  if (paymentsMode() !== 'live') throw new Error('QR Ph payments are not available right now.');

  const intent = await paymongo('POST', '/payment_intents', {
    amount: order.total,
    currency: 'PHP',
    payment_method_allowed: ['qrph'],
    description: `Mang Kapi Ta order ${order.ref}`,
    metadata: { order_ref: order.ref },
  });
  const method = await paymongo('POST', '/payment_methods', { type: 'qrph' });
  const attached = await paymongo('POST', `/payment_intents/${intent.id}/attach`, {
    payment_method: method.id,
    client_key: intent.attributes.client_key,
  });

  const image = safeQrImage(attached.attributes?.next_action?.code?.image_url);
  if (!image) throw new Error('The QR code could not be generated. Please try again.');
  await db.setProvider(order.ref, 'paymongo', intent.id);
  return { image, expiresAt: Date.now() + QR_EXPIRY_MINUTES * 60 * 1000 };
}

/* ------------------------------ confirming payment ------------------------------ */
/** Asks the gateway for the real payment status and updates the order. Returns the status. */
export async function verifyPayment(order) {
  if (['paid', 'fulfilled'].includes(order.status)) return order.status;
  if (order.provider !== 'paymongo' || !order.provider_ref) return order.status;

  const intent = await paymongo('GET', `/payment_intents/${order.provider_ref}`);
  const status = intent.attributes?.status;
  if (status === 'succeeded') {
    await db.markPaid(order.ref);
    return 'paid';
  }
  if (status === 'awaiting_payment_method') {
    // Back at the start: the customer cancelled, the payment failed, or the QR code expired.
    await db.markFailed(order.ref);
    return 'failed';
  }
  return order.status; // awaiting_next_action and processing are still in progress
}

/** Verifies a PayMongo webhook signature header: t=timestamp,te=test signature,li=live signature. */
export function signatureValid(payload, header, secret) {
  const parts = Object.fromEntries(
    String(header || '').split(',').map((p) => { const i = p.indexOf('='); return [p.slice(0, i).trim(), p.slice(i + 1)]; }),
  );
  if (!parts.t) return false;
  const expected = crypto.createHmac('sha256', secret).update(`${parts.t}.${payload}`).digest('hex');
  return ['te', 'li'].some((k) => parts[k] && safeEqual(expected, parts[k]));
}
