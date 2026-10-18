// Checks your PayMongo key and, with --try, runs a real GCash payment in TEST mode end to end.
//
//   node --env-file=.env scripts/paymongo-check.mjs          verify the key and list enabled payment methods
//   node --env-file=.env scripts/paymongo-check.mjs --try    also create a PHP 50 test GCash payment
//
// The key is read from PAYMONGO_SECRET_KEY in .env and is never printed.

const key = process.env.PAYMONGO_SECRET_KEY;
if (!key) {
  console.error('PAYMONGO_SECRET_KEY is not set. Add it to your .env file (use the sk_test_... key first).');
  process.exit(1);
}
const live = key.startsWith('sk_live_');
console.log(`Key type: ${live ? 'LIVE (real money)' : 'TEST (no real money)'}`);
if (live && process.argv.includes('--try')) {
  console.error('Refusing to run --try with a live key. Use an sk_test_ key.');
  process.exit(1);
}

async function api(method, path, attributes) {
  const res = await fetch(`https://api.paymongo.com/v1${path}`, {
    method,
    headers: { Accept: 'application/json', 'Content-Type': 'application/json', Authorization: 'Basic ' + Buffer.from(`${key}:`).toString('base64') },
    body: attributes ? JSON.stringify({ data: { attributes } }) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`${res.status} ${json.errors?.map((e) => e.detail).join('; ') || 'request failed'}`);
  return json.data ?? json;
}

try {
  const methods = await api('GET', '/merchants/capabilities/payment_methods');
  const list = Array.isArray(methods) ? methods : [];
  console.log('Enabled payment methods:', list.length ? list.join(', ') : '(none reported)');
  console.log(list.includes('gcash') ? 'GCash: enabled' : 'GCash: NOT listed. In live mode request activation under Settings > Payment Methods.');
} catch (err) {
  console.error('Could not read payment methods:', err.message);
  if (/401|authent/i.test(err.message)) { console.error('The key was rejected. Check that you copied the full secret key.'); process.exit(1); }
}

if (process.argv.includes('--try')) {
  const base = (process.env.APP_URL || 'http://localhost:3000').replace(/\/+$/, '');
  const intent = await api('POST', '/payment_intents', {
    amount: 5000, currency: 'PHP', payment_method_allowed: ['gcash'], capture_type: 'automatic',
    description: 'Mang Kapi Ta test payment', statement_descriptor: 'MANG KAPI TA',
  });
  const method = await api('POST', '/payment_methods', { type: 'gcash', billing: { name: 'Test Buyer', email: 'test@example.com', phone: '09171234567' } });
  const attached = await api('POST', `/payment_intents/${intent.id}/attach`, {
    payment_method: method.id, client_key: intent.attributes.client_key, return_url: `${base}/`,
  });
  const url = attached.attributes?.next_action?.redirect?.url;
  console.log('\nOpen this link in your browser and press "Authorize Test Payment":\n');
  console.log(url, '\n');

  process.stdout.write('Waiting for the payment');
  for (let i = 0; i < 60; i++) {
    await new Promise((r) => setTimeout(r, 3000));
    const status = (await api('GET', `/payment_intents/${intent.id}`)).attributes.status;
    process.stdout.write('.');
    if (status === 'succeeded') { console.log('\nSUCCEEDED. GCash test payments work with this key.'); process.exit(0); }
  }
  console.log('\nNo authorization seen within 3 minutes.');
  process.exit(1);
}
