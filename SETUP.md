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

## 3. Turn on real GCash payments (when ready)

GCash has no public API for individual merchants, so payments go through PayMongo.

1. Create a PayMongo account and complete business verification. Start with the **test** key.
2. In Vercel, add `PAYMONGO_SECRET_KEY` (an `sk_test_...` key first, later `sk_live_...`) and remove `DEMO_PAYMENTS`.
3. In the PayMongo dashboard, create a webhook for the `payment.paid` event pointing to `https://YOUR-DOMAIN/api/webhook`. Copy its secret into Vercel as `PAYMONGO_WEBHOOK_SECRET`.
4. Redeploy so the new variables take effect, then place a test order.

If you set neither `PAYMONGO_SECRET_KEY` nor `DEMO_PAYMENTS` in production, checkout reports that online payments are unavailable. This is deliberate: it stops anyone from marking orders as paid without paying.

## 4. Staff page

Open `/admin` and sign in with `ADMIN_PASSWORD` to see orders and event inquiries, and to mark paid orders as ready.

## Local development

```
npm install
npm run dev     # http://localhost:3000, in-memory data unless SUPABASE_* are set in .env
npm test        # end-to-end checks
```
