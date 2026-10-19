import * as db from '../lib/db.js';
import { send } from '../lib/http.js';

/** Dates that are already reserved, so the form can warn early. Only dates are returned, never who holds them. */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return send(res, 405, { error: 'Method not allowed.' });
  }
  try {
    const today = new Date().toISOString().slice(0, 10);
    send(res, 200, { dates: await db.bookedDates(today) });
  } catch (err) {
    console.error('booked-dates:', err);
    send(res, 500, { error: 'Something went wrong.' });
  }
}
