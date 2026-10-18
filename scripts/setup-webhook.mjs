// Registers the payment webhook with PayMongo and prints the signing secret to copy into Vercel.
//
//   node --env-file=.env scripts/setup-webhook.mjs https://YOUR-SITE.vercel.app
//
// Run it once for the test key and once for the live key. The secret is shown only once.

const key = process.env.PAYMONGO_SECRET_KEY;
const site = (process.argv[2] || '').replace(/\/+$/, '');
if (!key) { console.error('PAYMONGO_SECRET_KEY is not set in .env.'); process.exit(1); }
if (!/^https:\/\/.+/.test(site)) { console.error('Give your public https address, e.g. https://mang-kapi-ta.vercel.app'); process.exit(1); }

const res = await fetch('https://api.paymongo.com/v1/webhooks', {
  method: 'POST',
  headers: { Accept: 'application/json', 'Content-Type': 'application/json', Authorization: 'Basic ' + Buffer.from(`${key}:`).toString('base64') },
  body: JSON.stringify({ data: { attributes: { url: `${site}/api/webhook`, events: ['payment.paid'] } } }),
});
const json = await res.json().catch(() => ({}));
if (!res.ok) {
  console.error(`Failed (${res.status}):`, json.errors?.map((e) => e.detail).join('; ') || 'unknown error');
  process.exit(1);
}

const hook = json.data;
console.log(`Webhook created for ${hook.attributes.url} (${key.startsWith('sk_live_') ? 'LIVE' : 'TEST'} mode).`);
console.log('\nAdd this to Vercel > Settings > Environment Variables, then redeploy:\n');
console.log(`  PAYMONGO_WEBHOOK_SECRET = ${hook.attributes.secret_key}\n`);
