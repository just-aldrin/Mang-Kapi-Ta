import * as db from '../lib/db.js';
import { guardWrite, readJson, send } from '../lib/http.js';

export default async function handler(req, res) {
  if (!guardWrite(req, res)) return;
  try {
    const email = String(((await readJson(req)) || {}).email ?? '').trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 160) {
      return send(res, 422, { error: 'Please enter a valid email address.' });
    }
    await db.addSubscriber(email);
    send(res, 200, { ok: true, message: 'You are on the list. Thank you.' });
  } catch (err) {
    console.error('subscribe:', err);
    send(res, 500, { error: 'Something went wrong. Please try again.' });
  }
}
