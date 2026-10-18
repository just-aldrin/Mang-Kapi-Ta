/**
 * GCash payments.
 *
 * live    : PayMongo (a licensed Philippine gateway) creates the GCash checkout.
 *           Enabled when PAYMONGO_SECRET_KEY is set.
 * sandbox : a built-in simulator stands in for the GCash screens. It never moves real money.
 *           Off in production unless DEMO_PAYMENTS=true, so nobody can mark orders paid for free.
 * off     : production with no key and no demo flag; checkout reports that payments are unavailable.
 */
import crypto from 'node:crypto';
import * as db from './db.js';
import { appUrl, isProduction, safeEqual } from './http.js';

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
    description: `Mang KAPI Ta order ${order.ref}`,
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

/** Asks the gateway for the real payment status and updates the order. Returns the status. */
export async function verifyGcash(order) {
  if (['paid', 'fulfilled'].includes(order.status)) return order.status;
  if (order.provider !== 'paymongo' || !order.provider_ref) return order.status;

  const intent = await paymongo('GET', `/payment_intents/${order.provider_ref}`);
  const status = intent.attributes?.status;
  if (status === 'succeeded') {
    await db.markPaid(order.ref);
    return 'paid';
  }
  if (status === 'awaiting_payment_method') {
    await db.markFailed(order.ref); // customer came back without approving the payment
    return 'failed';
  }
  return order.status;
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
