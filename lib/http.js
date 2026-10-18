import crypto from 'node:crypto';

export function send(res, status, data, headers = {}) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  for (const [k, v] of Object.entries(headers)) res.setHeader(k, v);
  res.end(JSON.stringify(data));
}

export function redirect(res, location, status = 302) {
  res.statusCode = status;
  res.setHeader('Location', location);
  res.setHeader('Cache-Control', 'no-store');
  res.end();
}

export function query(req) {
  return Object.fromEntries(new URL(req.url, 'http://localhost').searchParams);
}

export async function readRaw(req) {
  const chunks = [];
  for await (const c of req) chunks.push(typeof c === 'string' ? Buffer.from(c) : c);
  return Buffer.concat(chunks).toString('utf8');
}

/** Parsed JSON body, or null when missing or malformed. Works with and without Vercel's body helper. */
export async function readJson(req) {
  try {
    const pre = req.body;
    if (pre && typeof pre === 'object' && !Buffer.isBuffer(pre)) return pre;
    if (typeof pre === 'string' && pre) return JSON.parse(pre);
  } catch {
    return null;
  }
  try {
    const raw = await readRaw(req);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * CSRF protection for cookie-less JSON APIs: browsers cannot send a cross-site request with
 * Content-Type: application/json without a CORS preflight, which we never approve. We also
 * require the Origin (when present) to match this host.
 */
export function guardWrite(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    send(res, 405, { error: 'Method not allowed.' });
    return false;
  }
  const type = String(req.headers['content-type'] || '');
  if (!type.toLowerCase().startsWith('application/json')) {
    send(res, 415, { error: 'Unsupported content type.' });
    return false;
  }
  const origin = req.headers.origin;
  if (origin) {
    const host = req.headers['x-forwarded-host'] || req.headers.host;
    let originHost = '';
    try { originHost = new URL(origin).host; } catch { /* invalid origin */ }
    if (originHost !== host) {
      send(res, 403, { error: 'Cross-site requests are not allowed.' });
      return false;
    }
  }
  return true;
}

export const safeEqual = (a, b) => {
  const x = Buffer.from(String(a));
  const y = Buffer.from(String(b));
  return x.length === y.length && crypto.timingSafeEqual(x, y);
};

export const isProduction = () => process.env.VERCEL_ENV === 'production';

/** Public base URL used for payment-provider return URLs. */
export function appUrl(req) {
  if (process.env.APP_URL) return process.env.APP_URL.replace(/\/+$/, '');
  if (isProduction() && process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  const host = req.headers['x-forwarded-host'] || req.headers.host || 'localhost:3000';
  const proto = req.headers['x-forwarded-proto'] || (host.startsWith('localhost') ? 'http' : 'https');
  return `${proto}://${host}`;
}

/* ---- staff session: HMAC-signed, expiring, HttpOnly cookie ---- */
const secret = () => process.env.SESSION_SECRET || process.env.ADMIN_PASSWORD || '';
const sign = (payload) => crypto.createHmac('sha256', secret()).update(payload).digest('hex');

export function adminCookie(req, value, maxAge) {
  const secure = String(req.headers['x-forwarded-proto'] || '').startsWith('https') ? '; Secure' : '';
  return `kapi_admin=${value}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAge}${secure}`;
}

export function makeAdminToken() {
  const exp = String(Date.now() + 8 * 3600 * 1000);
  return `${exp}.${sign(exp)}`;
}

export function isAdmin(req) {
  if (!secret()) return false;
  const cookie = String(req.headers.cookie || '').split(/;\s*/).find((c) => c.startsWith('kapi_admin='));
  if (!cookie) return false;
  const [exp, sig] = cookie.slice('kapi_admin='.length).split('.');
  return Boolean(exp && sig && Number(exp) > Date.now() && safeEqual(sig, sign(exp)));
}
