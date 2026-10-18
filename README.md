# Mang Kapi Ta

**Worth Every Sip.** A storefront for an artisanal coffee bar and mobile coffee cart service in Iloilo City, with online ordering and GCash payments.

![Node.js](https://img.shields.io/badge/Node.js-20%2B-339933?style=flat-square&logo=nodedotjs&logoColor=white)
![Vercel](https://img.shields.io/badge/Hosted%20on-Vercel-000000?style=flat-square&logo=vercel&logoColor=white)
![Supabase](https://img.shields.io/badge/Database-Supabase-3ECF8E?style=flat-square&logo=supabase&logoColor=white)
![GCash](https://img.shields.io/badge/Payments-GCash%20via%20PayMongo-0B62E4?style=flat-square)

---

## Overview

Mang Kapi Ta is a modern coffee brand with a brew bar at SM City Iloilo and turnkey mobile coffee carts for weddings, product debuts, and private events. This project is its website and ordering system: customers browse the menu, build an order, and pay with GCash, while event clients reserve a cart for their date.

## Features

| Area | Details |
| --- | --- |
| **Coffee cart showcase** | Featured directly below the hero. Presents the Hinoki Wood Mobile Station and an event inquiry form that stores date, guest count, contact, and venue. |
| **Postage-stamp menu** | Every menu item is a perforated postage stamp on an airmail-style postcard, with price denomination, postmark, category filter, and hover motion. |
| **Order cart** | A slide-out cart with quantity controls, persisted in the browser between visits. |
| **GCash payments** | Checkout, a payment portal, GCash redirect, return verification, and a signed webhook. |
| **Test mode** | Without a payment key, a simulated GCash screen lets the entire flow be tested without moving money. |
| **Staff view** | A password-protected page at `/admin` listing orders and event inquiries, with a "mark ready" action. |
| **Accessibility** | Skip link, keyboard-operable cart, visible focus states, labelled forms, and reduced-motion support. |

## Tech stack

- **Hosting:** Vercel (static pages plus serverless functions)
- **Backend:** Node.js serverless functions in `api/`, no framework
- **Database:** Supabase (Postgres), accessed only from the server
- **Frontend:** Static HTML generated at build time, vanilla JavaScript and CSS, inline SVG illustrations
- **Payments:** GCash through PayMongo

## Run locally

```
npm install
npm run dev
```

Open <http://localhost:3000>. With no Supabase variables set, an in-memory store is used so everything can be tried without setup (data resets when the server restarts, and this fallback is refused on Vercel). Run `npm test` for the end-to-end and payment checks.

## Deploy

Step-by-step instructions for Supabase, Vercel, and GCash are in [SETUP.md](SETUP.md).

## Configuration

Copy `.env.example` to `.env` locally. On Vercel, add the same names under Project Settings > Environment Variables.

| Variable | Purpose |
| --- | --- |
| `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | Database connection. The service-role key is server-only. |
| `PAYMONGO_SECRET_KEY` | Enables live GCash checkout. Leave blank for test mode. |
| `PAYMONGO_WEBHOOK_SECRET` | Verifies webhook signatures from PayMongo. |
| `DEMO_PAYMENTS` | Set to `true` to keep the test-mode GCash simulator on in production (portfolio demo). |
| `ADMIN_PASSWORD` | Enables the staff page at `/admin`. |
| `APP_URL` | Public URL, used for GCash return links (auto-detected on Vercel). |
| `SHOP_PHONE`, `SHOP_EMAIL` | Contact details shown on the site. |

## GCash payment flow

GCash does not offer a public API for individual merchants, so payments run through PayMongo, a licensed Philippine gateway.

```
Menu -> Cart -> Checkout -> Payment portal -> GCash -> Return check -> Confirmation
                                                  \-> Webhook (payment.paid) ----/
```

1. Checkout creates a pending order. Item prices are read from the server-side menu, never from the browser.
2. The payment portal creates a PayMongo payment and redirects the customer to GCash.
3. An order is marked paid only after PayMongo confirms it, either when the customer returns or through the signed webhook, which also checks that the paid amount matches the order total.

## Project structure

```
public/              Static assets; HTML pages are generated here by the build
  assets/            CSS and browser JavaScript
api/                 Serverless endpoints: order, pay, payment-return, webhook, sandbox, inquiry, subscribe, admin
lib/                 Menu, database layer, payments, page templates, illustrations, HTTP helpers
scripts/             build.mjs (page generator), dev.mjs (local server), test.mjs (end-to-end checks)
supabase/schema.sql  Database schema to run in your Supabase project
legacy-php/          The earlier PHP and SQLite version, kept for reference
```

## Security notes

- Each order has a secret access key in its link, so one customer cannot open another's order.
- Writes accept only same-origin JSON requests, which blocks cross-site request forgery without needing cookies.
- Database tables use row-level security with no public policies; only the server can read or write them.
- The staff session is an HMAC-signed, expiring, HttpOnly, SameSite=Strict cookie.
- Webhook signatures are verified with HMAC-SHA256 and a constant-time comparison.
- In production the test-mode payment simulator is off unless `DEMO_PAYMENTS=true`, so orders cannot be marked paid for free.

## Author

Built by **Aldrin E. Bansuelo**, 4th year Information Systems student at West Visayas State University.

[LinkedIn](https://www.linkedin.com/in/aldrin-bansuelo-433869289/) | [GitHub](https://github.com/just-aldrin)
