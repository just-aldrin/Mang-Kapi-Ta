import * as db from '../lib/db.js';
import { guardWrite, readJson, safeEqual, send } from '../lib/http.js';
import { availableMethods, startGcash, startQrph } from '../lib/payments.js';

/**
 * Starts a payment for an order the caller holds the access key for.
 * method "gcash" answers with a redirect; method "qrph" answers with a QR code image to display.
 */
export default async function handler(req, res) {
  if (!guardWrite(req, res)) return;
  try {
    const { ref = '', k = '', method = '' } = (await readJson(req)) || {};
    const order = ref ? await db.getOrder(String(ref)) : null;
    if (!order || !safeEqual(order.access_key, String(k))) return send(res, 404, { error: 'Order not found.' });
    if (['paid', 'fulfilled'].includes(order.status)) {
      return send(res, 200, { redirect: `/order?ref=${order.ref}&k=${order.access_key}` });
    }

    const methods = await availableMethods();
    const chosen = String(method) || methods[0];
    if (!methods.includes(chosen)) return send(res, 422, { error: 'That payment method is not available.' });

    if (chosen === 'qrph') {
      const qr = await startQrph(order);
      return send(res, 200, { method: 'qrph', qr: qr.image, expiresAt: qr.expiresAt, total: order.total });
    }
    send(res, 200, { method: 'gcash', redirect: await startGcash(order, req) });
  } catch (err) {
    console.error('pay:', err);
    // Gateway messages (e.g. amount too small) are safe and useful to show; database errors are not.
    const message = String(err.message || '');
    send(res, 502, { error: message.startsWith('Database error') ? 'Something went wrong. Please try again.' : message || 'Payment could not be started.' });
  }
}
