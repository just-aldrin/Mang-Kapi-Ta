import * as db from '../lib/db.js';
import { guardWrite, readJson, send } from '../lib/http.js';
import { quote } from '../lib/packages.js';

export default async function handler(req, res) {
  if (!guardWrite(req, res)) return;
  try {
    const input = await readJson(req);
    if (!input || typeof input !== 'object') return send(res, 400, { error: 'Invalid request.' });

    const name = String(input.name ?? '').trim();
    const eventDate = String(input.event_date ?? '').trim();
    const guests = String(input.guests ?? '').trim();
    const contact = String(input.contact ?? '').trim();
    const venue = String(input.venue ?? '').trim();

    if (!name || !guests || !contact || !venue) return send(res, 422, { error: 'Please complete every field.' });

    const date = /^\d{4}-\d{2}-\d{2}$/.test(eventDate) ? new Date(`${eventDate}T00:00:00Z`) : null;
    const today = new Date(new Date().toISOString().slice(0, 10) + 'T00:00:00Z');
    if (!date || Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== eventDate || date < today) {
      return send(res, 422, { error: 'Please choose a valid upcoming date.' });
    }

    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact);
    const isPhone = /^(?:\+63|0)9\d{9}$/.test(contact.replace(/[\s-]+/g, ''));
    if (!isEmail && !isPhone) return send(res, 422, { error: 'Enter a valid email or Philippine mobile number.' });

    // A package is optional, but if one is named it must be real. The price is worked out here, never trusted from the browser.
    const packageId = String(input.package ?? '').trim();
    let priced = null;
    if (packageId) {
      priced = quote(packageId, { sticker: input.addon_sticker === true, signature: input.addon_signature === true, extraCups: input.extra_cups });
      if (!priced) return send(res, 422, { error: 'Please choose one of the listed packages.' });
    }

    await db.createInquiry({
      name: name.slice(0, 120),
      event_date: eventDate,
      guests: guests.slice(0, 40),
      contact: contact.slice(0, 120),
      venue: venue.slice(0, 160),
      package_summary: priced ? priced.summary : null,
    });
    send(res, 200, {
      ok: true,
      message: priced
        ? `Thank you. We have your request for ${priced.pkg.name} and will reach out within one business day.`
        : 'Thank you. We have your date and will reach out within one business day.',
    });
  } catch (err) {
    console.error('inquiry:', err);
    send(res, 500, { error: 'Something went wrong. Please try again.' });
  }
}
