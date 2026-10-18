import * as db from '../lib/db.js';
import { adminCookie, guardWrite, isAdmin, makeAdminToken, readJson, safeEqual, send } from '../lib/http.js';
import { paymentsMode } from '../lib/payments.js';

/** Staff API. Disabled until ADMIN_PASSWORD is set. GET lists data; POST handles login, logout, and fulfil. */
export default async function handler(req, res) {
  if (!process.env.ADMIN_PASSWORD) return send(res, 404, { error: 'Admin is disabled.' });

  try {
    if (req.method === 'GET') {
      if (!isAdmin(req)) return send(res, 401, { error: 'Sign in required.' });
      const [orders, inquiries] = await Promise.all([db.listOrders(), db.listInquiries()]);
      return send(res, 200, { mode: paymentsMode(), orders, inquiries });
    }

    if (!guardWrite(req, res)) return;
    const { action = '', password = '', ref = '' } = (await readJson(req)) || {};

    if (action === 'login') {
      if (!safeEqual(String(password), process.env.ADMIN_PASSWORD)) {
        await new Promise((r) => setTimeout(r, 600)); // slow down guessing
        return send(res, 401, { error: 'Incorrect password.' });
      }
      return send(res, 200, { ok: true }, { 'Set-Cookie': adminCookie(req, makeAdminToken(), 8 * 3600) });
    }
    if (action === 'logout') return send(res, 200, { ok: true }, { 'Set-Cookie': adminCookie(req, '', 0) });

    if (!isAdmin(req)) return send(res, 401, { error: 'Sign in required.' });
    if (action === 'fulfil') {
      await db.markFulfilled(String(ref));
      return send(res, 200, { ok: true });
    }
    send(res, 400, { error: 'Unknown action.' });
  } catch (err) {
    console.error('admin:', err);
    send(res, 500, { error: 'Something went wrong.' });
  }
}
