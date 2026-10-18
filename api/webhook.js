import * as db from '../lib/db.js';
import { readRaw } from '../lib/http.js';
import { signatureValid } from '../lib/payments.js';

// The signature is computed over the exact raw bytes, so Vercel must not parse the body first.
export const config = { api: { bodyParser: false } };

/**
 * PayMongo webhook. Register https://YOUR-DOMAIN/api/webhook for the "payment.paid" event and set
 * the webhook secret as PAYMONGO_WEBHOOK_SECRET.
 */
export default async function handler(req, res) {
  const secret = process.env.PAYMONGO_WEBHOOK_SECRET;
  if (!secret) { res.statusCode = 503; return res.end('Webhook not configured'); }
  if (req.method !== 'POST') { res.statusCode = 405; return res.end('Method not allowed'); }

  try {
    const payload = await readRaw(req);
    if (!signatureValid(payload, req.headers['paymongo-signature'], secret)) {
      res.statusCode = 400;
      return res.end('Invalid signature');
    }

    const event = JSON.parse(payload);
    if (event?.data?.attributes?.type === 'payment.paid') {
      const payment = event.data.attributes.data?.attributes || {};
      const order = payment.payment_intent_id ? await db.getOrderByIntent(payment.payment_intent_id) : null;
      // Only accept the payment if the amount paid matches the order total.
      if (order && Number(payment.amount) === Number(order.total)) await db.markPaid(order.ref);
    }
    res.statusCode = 200;
    res.end('ok');
  } catch (err) {
    console.error('webhook:', err);
    res.statusCode = 500; // lets PayMongo retry
    res.end('error');
  }
}
