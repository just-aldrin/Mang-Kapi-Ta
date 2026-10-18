/**
 * Data access. Production uses Supabase (Postgres) with the server-only service-role key.
 * For local development with no Supabase configured, an in-memory store is used so the whole
 * flow can be tried without any setup. It is refused on Vercel so orders can never be lost silently.
 */

const hasSupabase = Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);

export const dbMode = () => (hasSupabase ? 'supabase' : 'memory');

let _sb;
async function sb() {
  if (!_sb) {
    const { createClient } = await import('@supabase/supabase-js');
    _sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return _sb;
}

const fail = (error) => {
  throw new Error(`Database error: ${error.message}`);
};

/* ------------------------------ in-memory store ------------------------------ */
const mem = { orders: [], items: [], inquiries: [], subscribers: new Set(), seq: 0 };

function requireStore() {
  if (!hasSupabase && process.env.VERCEL) {
    throw new Error('Database is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
  }
}

const withItems = (o) => (o ? { ...o, items: mem.items.filter((i) => i.order_id === o.id) } : null);

/* --------------------------------- orders --------------------------------- */
export async function createOrder(order, items) {
  requireStore();
  if (!hasSupabase) {
    const id = ++mem.seq;
    mem.orders.push({ id, status: 'pending', provider: null, provider_ref: null, created_at: new Date().toISOString(), paid_at: null, ...order });
    items.forEach((i) => mem.items.push({ order_id: id, ...i }));
    return;
  }
  const c = await sb();
  const { data, error } = await c.from('orders').insert(order).select('id').single();
  if (error) fail(error);
  const { error: itemsError } = await c.from('order_items').insert(items.map((i) => ({ order_id: data.id, ...i })));
  if (itemsError) {
    await c.from('orders').delete().eq('id', data.id);
    fail(itemsError);
  }
}

export async function getOrder(ref) {
  requireStore();
  if (!hasSupabase) return withItems(mem.orders.find((o) => o.ref === ref));
  const { data, error } = await (await sb()).from('orders').select('*, items:order_items(*)').eq('ref', ref).maybeSingle();
  if (error) fail(error);
  return data;
}

export async function getOrderByIntent(intentId) {
  requireStore();
  if (!hasSupabase) return withItems(mem.orders.find((o) => o.provider === 'paymongo' && o.provider_ref === intentId));
  const { data, error } = await (await sb()).from('orders').select('*').eq('provider', 'paymongo').eq('provider_ref', intentId).maybeSingle();
  if (error) fail(error);
  return data;
}

export async function setProvider(ref, provider, providerRef = null) {
  requireStore();
  if (!hasSupabase) {
    const o = mem.orders.find((x) => x.ref === ref);
    if (o) Object.assign(o, { provider, provider_ref: providerRef });
    return;
  }
  const { error } = await (await sb()).from('orders').update({ provider, provider_ref: providerRef }).eq('ref', ref);
  if (error) fail(error);
}

/** Only moves an unpaid order to `status`; a paid order is never changed by this. */
async function transition(ref, status, extra = {}) {
  if (!hasSupabase) {
    const o = mem.orders.find((x) => x.ref === ref);
    if (o && ['pending', 'failed'].includes(o.status)) Object.assign(o, { status, ...extra });
    return;
  }
  const { error } = await (await sb()).from('orders').update({ status, ...extra }).eq('ref', ref).in('status', ['pending', 'failed']);
  if (error) fail(error);
}

export async function markPaid(ref) {
  requireStore();
  await transition(ref, 'paid', { paid_at: new Date().toISOString() });
}

export async function markFailed(ref) {
  requireStore();
  await transition(ref, 'failed');
}

export async function markFulfilled(ref) {
  requireStore();
  if (!hasSupabase) {
    const o = mem.orders.find((x) => x.ref === ref && x.status === 'paid');
    if (o) o.status = 'fulfilled';
    return;
  }
  const { error } = await (await sb()).from('orders').update({ status: 'fulfilled' }).eq('ref', ref).eq('status', 'paid');
  if (error) fail(error);
}

export async function listOrders(limit = 100) {
  requireStore();
  if (!hasSupabase) return [...mem.orders].reverse().slice(0, limit).map(withItems);
  const { data, error } = await (await sb()).from('orders').select('*, items:order_items(*)').order('id', { ascending: false }).limit(limit);
  if (error) fail(error);
  return data;
}

/* ------------------------- inquiries & subscribers ------------------------- */
export async function createInquiry(row) {
  requireStore();
  if (!hasSupabase) {
    mem.inquiries.push({ id: ++mem.seq, created_at: new Date().toISOString(), ...row });
    return;
  }
  const { error } = await (await sb()).from('inquiries').insert(row);
  if (error) fail(error);
}

export async function listInquiries(limit = 100) {
  requireStore();
  if (!hasSupabase) return [...mem.inquiries].reverse().slice(0, limit);
  const { data, error } = await (await sb()).from('inquiries').select('*').order('id', { ascending: false }).limit(limit);
  if (error) fail(error);
  return data;
}

export async function addSubscriber(email) {
  requireStore();
  if (!hasSupabase) {
    mem.subscribers.add(email);
    return;
  }
  const { error } = await (await sb()).from('subscribers').upsert({ email }, { onConflict: 'email', ignoreDuplicates: true });
  if (error) fail(error);
}
