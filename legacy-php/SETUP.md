# Mang KAPI Ta storefront: setup

PHP 8.1+ with SQLite (`pdo_sqlite`) and cURL. Both ship with XAMPP.

## Run locally
1. Start Apache in XAMPP.
2. Open `http://localhost/Mang-Kapi-Ta/`. The database (`data/kapi.sqlite`) and menu are created on the first request.

## GCash payments
GCash has no public API for individual merchants, so payments go through PayMongo, a licensed Philippine gateway that offers GCash as a payment method.

| Mode | When | What happens |
| --- | --- | --- |
| Test mode | `PAYMONGO_SECRET_KEY` is blank | A simulated GCash screen approves or declines the payment. No money moves. |
| Live | `PAYMONGO_SECRET_KEY` is set | The customer is redirected to the real GCash checkout. |

To go live:
1. Create a PayMongo account and complete business verification.
2. Copy `.env.example` to `.env` and set `PAYMONGO_SECRET_KEY` (use an `sk_test_` key first).
3. Set `APP_URL` to your public HTTPS address.
4. In the PayMongo dashboard, add a webhook for `payment.paid` pointing to `https://YOUR-DOMAIN/payment/webhook.php`, and put its secret in `PAYMONGO_WEBHOOK_SECRET`.

Order totals are always computed on the server from the database, and an order is marked paid only after the gateway confirms it (return page check or signed webhook).

## Staff view
Set `ADMIN_PASSWORD` in `.env`, then open `/admin/` to see orders and cart inquiries.

## Layout
- `index.php` storefront; `checkout.php`, `pay.php`, `order.php` purchase flow
- `payment/` GCash return, webhook, and test-mode simulator
- `api/` order, inquiry, and newsletter endpoints
- `inc/` bootstrap, database, payments, layout, and menu illustrations
- `assets/` CSS and JavaScript
