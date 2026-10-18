import * as db from '../lib/db.js';
import { guardWrite, readJson, safeEqual, send } from '../lib/http.js';
import { paymentsMode } from '../lib/payments.js';

/** Test-mode GCash approval. Only available when payments run in sandbox mode. */
export default async function handler(req, res) {
  if (!guardWrite(req, res)) return;
  if (paymentsMode() !== 'sandbox') return send(res, 404, { error: 'Not found.' });
  try {
    const { ref = '', k = '', action = '' } = (await readJson(req)) || {};
    const order = ref ? await db.getOrder(String(ref)) : null;
    if (!order || !safeEqual(order.access_key, String(k))) return send(res, 404, { error: 'Order not found.' });

    if (action === 'approve') await db.markPaid(order.ref);
    else await db.markFailed(order.ref);
    send(res, 200, { redirect: `/order?ref=${order.ref}&k=${order.access_key}` });
  } catch (err) {
    console.error('sandbox:', err);
    send(res, 500, { error: 'Something went wrong. Please try again.' });
  }
}
