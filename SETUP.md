# Deploying Mang Kapi Ta

This guide takes you from the GitHub repo to a live site on Vercel with a Supabase database and GCash payments.

## 1. Create the database (Supabase)

Use a **new, separate** Supabase project for this shop. Do not reuse another project's database.

1. In Supabase, choose **New project**, name it (for example `mang-kapi-ta`), and wait for it to finish provisioning.
2. Open **SQL Editor**, paste the contents of [supabase/schema.sql](supabase/schema.sql), and run it. This creates the tables and locks them so only the server can use them.
3. Open **Project Settings > API** and copy two values:
   - **Project URL** (becomes `SUPABASE_URL`)
   - **service_role** key (becomes `SUPABASE_SERVICE_ROLE_KEY`). Treat it like a password. Never put it in front-end code or commit it.

## 2. Deploy to Vercel

1. In Vercel, choose **Add New > Project** and import the `Mang-Kapi-Ta` GitHub repository.
2. Leave the framework preset as **Other**. The build command and output folder are already set in `vercel.json` (`npm run build`, `public`).
3. Before clicking Deploy, open **Environment Variables** and add:

| Name | Value |
| --- | --- |
| `SUPABASE_URL` | from step 1 |
| `SUPABASE_SERVICE_ROLE_KEY` | from step 1 |
| `ADMIN_PASSWORD` | a long random password for `/admin` |
| `DEMO_PAYMENTS` | `true` (portfolio demo, test-mode GCash). Remove this once real payments are on. |

4. Click **Deploy**. When it finishes, open your `.vercel.app` address, add items, and check out. In demo mode you will see a simulated GCash screen labelled TEST MODE.

## 3. Turn on real GCash payments

GCash has no public API for individual merchants, so payments go through PayMongo. The code is ready; you only need a PayMongo account and its keys.

### A. Try it in test mode first (no business verification needed)
1. Create a PayMongo account at paymongo.com and open **Developers > API Keys**.
2. Copy the **test secret key** (`sk_test_...`) into your local `.env` as `PAYMONGO_SECRET_KEY`.
3. Check the key and run a real test payment:
   ```
   node --env-file=.env scripts/paymongo-check.mjs --try
   ```
   It prints a link. Open it and press **Authorize Test Payment**. The script reports `SUCCEEDED` when it works.
4. In Vercel, add `PAYMONGO_SECRET_KEY` (the same `sk_test_...` key) and remove `DEMO_PAYMENTS`. Redeploy.
5. Register the webhook (PayMongo needs a public address, so use your Vercel URL):
   ```
   node --env-file=.env scripts/setup-webhook.mjs https://YOUR-SITE.vercel.app
   ```
   It prints a `PAYMONGO_WEBHOOK_SECRET`. Add it to Vercel and redeploy.
6. Place an order on the live site. You are sent to PayMongo's test page, press **Authorize**, and land on the "Payment received" page. The order shows as `paid` in Supabase and at `/admin`.

### B. Go live (real money)
GCash is not available on Individual PayMongo accounts. You need:
1. A registered business type and your business information completed under **Settings > Business Information**.
2. Identity verification passed.
3. **Settings > Payment Methods > Request Activation** next to GCash (account owner only). Review takes about 3 to 7 business days.
4. Then swap in the **live** secret key (`sk_live_...`), run `setup-webhook.mjs` again with the live key, update `PAYMONGO_WEBHOOK_SECRET`, and redeploy.

### How a payment is confirmed
The customer returns from GCash to the order page, which asks PayMongo for the real status every few seconds. The signed webhook is a second, independent confirmation. An order is marked paid only when PayMongo says so and the amount matches.

If production has neither `PAYMONGO_SECRET_KEY` nor `DEMO_PAYMENTS`, checkout reports that online payments are unavailable. This is deliberate: it stops anyone from marking orders as paid without paying.

## 4. Staff page

Open `/admin` and sign in with `ADMIN_PASSWORD` to see orders and event inquiries, and to mark paid orders as ready.

## Local development

```
npm install
npm run dev     # http://localhost:3000, in-memory data unless SUPABASE_* are set in .env
npm test        # end-to-end and payment checks
```
