// Generates the static HTML pages into public/. Runs on Vercel via `npm run build`.
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as pages from '../lib/pages.js';

const out = join(dirname(fileURLToPath(import.meta.url)), '..', 'public');
mkdirSync(out, { recursive: true });

const files = {
  'index.html': pages.home(),
  'checkout.html': pages.checkout(),
  'pay.html': pages.pay(),
  'order.html': pages.order(),
  'sandbox.html': pages.sandbox(),
  'admin.html': pages.admin(),
  '404.html': pages.notFound(),
};

for (const [name, html] of Object.entries(files)) writeFileSync(join(out, name), html);
console.log(`Built ${Object.keys(files).length} pages into public/`);
