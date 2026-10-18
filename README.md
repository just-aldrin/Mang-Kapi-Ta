# Mang KAPI Ta

**Worth Every Sip.** A storefront for an artisanal coffee bar and mobile coffee cart service in Iloilo City, with online ordering and GCash payments.

![PHP](https://img.shields.io/badge/PHP-8.1%2B-777BB4?style=flat-square&logo=php&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-003B57?style=flat-square&logo=sqlite&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)
![GCash](https://img.shields.io/badge/Payments-GCash%20via%20PayMongo-0B62E4?style=flat-square)

---

## Overview

Mang KAPI Ta is a modern coffee brand with a brew bar at SM City Iloilo and turnkey mobile coffee carts for weddings, product debuts, and private events. This project is its website and ordering system: customers browse the menu, build an order, and pay with GCash, while event clients reserve a cart for their date.

## Features

| Area | Details |
| --- | --- |
| **Coffee cart showcase** | Featured directly below the hero. Presents the Hinoki Wood Mobile Station and an event inquiry form that stores date, guest count, contact, and venue. |
| **Postage-stamp menu** | Every menu item is a perforated postage stamp on an airmail-style postcard, with price denomination, postmark, category filter, and hover motion. |
| **Order cart** | A slide-out cart with quantity controls, persisted in the browser between visits. |
| **GCash payments** | Checkout, a payment portal, GCash redirect, return verification, and a signed webhook. |
| **Test mode** | Without a payment key, a simulated GCash screen lets the entire flow be tested without moving money. |
| **Staff view** | A password-protected page listing orders and event inquiries, with a "mark ready" action. |
| **Accessibility** | Skip link, keyboard-operable cart, visible focus states, labelled forms, and reduced-motion support. |

## Tech stack

- **Backend:** PHP 8.1+ with no framework
- **Database:** SQLite through PDO (created automatically on first run)
- **Frontend:** Vanilla JavaScript and CSS, with illustrations drawn as inline SVG
- **Payments:** GCash through PayMongo
- **Hosting target:** XAMPP (Apache) or any PHP host

## Getting started

1. Install [XAMPP](https://www.apachefriends.org/) and clone this repository into `htdocs`:

   ```
   git clone https://github.com/just-aldrin/Mang-Kapi-Ta.git C:\xampp\htdocs\Mang-Kapi-Ta
   ```

2. Start Apache from the XAMPP control panel.
3. Open <http://localhost/Mang-Kapi-Ta/>. The database and menu are created on the first request.

No build step or package install is required.

## Configuration

Copy `.env.example` to `.env` and set what you need. `.env` is git-ignored.

| Variable | Purpose |
| --- | --- |
| `PAYMONGO_SECRET_KEY` | Enables live GCash checkout. Leave blank for test mode. |
| `PAYMONGO_WEBHOOK_SECRET` | Verifies webhook signatures from PayMongo. |
| `APP_URL` | Public HTTPS address, used for GCash return URLs in production. |
| `ADMIN_PASSWORD` | Enables the staff page at `/admin/`. |
| `SHOP_PHONE`, `SHOP_EMAIL` | Contact details shown on the site. |

## GCash payment flow

GCash does not offer a public API for individual merchants, so payments run through PayMongo, a licensed Philippine gateway.

```
Menu -> Cart -> Checkout -> Payment portal -> GCash -> Return check -> Confirmation
                                                  \-> Webhook (payment.paid) ----/
```

1. Checkout creates a pending order. Item prices are read from the database, never from the browser.
2. The payment portal creates a PayMongo payment and redirects the customer to GCash.
3. An order is marked paid only after PayMongo confirms it, either when the customer returns or through the signed webhook, which also checks that the paid amount matches the order total.

To go live, create a PayMongo account, complete verification, use an `sk_test_` key first, and register `https://YOUR-DOMAIN/payment/webhook.php` for the `payment.paid` event. More detail is in [SETUP.md](SETUP.md).

## Project structure

```
index.php            Storefront (hero, coffee carts, menu, visit)
checkout.php         Customer details and order summary
pay.php              Payment portal
order.php            Confirmation and receipt
payment/             GCash return, webhook, and test-mode simulator
api/                 Order, inquiry, and newsletter endpoints
admin/               Staff view
inc/                 Bootstrap, database, payments, layout, illustrations
assets/              CSS and JavaScript
```

## Security notes

- CSRF tokens protect every form and API call.
- All database access uses prepared statements, and all output is escaped.
- Orders are visible only to the browser session that created them.
- `inc/`, `data/`, and `.env` are blocked from direct web access by `.htaccess`.
- Webhook signatures are verified with HMAC-SHA256 and a constant-time comparison.

## Author

Built by **Aldrin E. Bansuelo**, 4th year Information Systems student at West Visayas State University.

[LinkedIn](https://www.linkedin.com/in/aldrin-bansuelo-433869289/) | [GitHub](https://github.com/just-aldrin)
