import * as db from '../lib/db.js';
import { query, redirect, safeEqual } from '../lib/http.js';
import { verifyPayment } from '../lib/payments.js';

/** GCash sends the customer back here. The URL is never trusted: we ask the gateway for the real status. */
export default async function handler(req, res) {
  const { ref = '', k = '' } = query(req);
  try {
    const order = ref ? await db.getOrder(ref) : null;
    if (!order || !safeEqual(order.access_key, k)) return redirect(res, '/');
    try {
      await verifyPayment(order);
    } catch (err) {
      console.error('payment-return verify:', err); // the order page shows the stored status; the webhook may still confirm it
    }
    redirect(res, `/order?ref=${encodeURIComponent(order.ref)}&k=${encodeURIComponent(order.access_key)}`);
  } catch (err) {
    console.error('payment-return:', err);
    redirect(res, '/');
  }
}
