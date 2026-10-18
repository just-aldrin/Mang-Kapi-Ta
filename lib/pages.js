import { MENU } from './menu.js';
import { stampArt, postmark } from './art.js';
import { brand, esc, page, peso, notFoundCard } from './layout.js';

const TILTS = [-2.2, 1.6, -1.2, 2.2, -1.8, 1.2, -2.4];

/* ----------------------------------- home ----------------------------------- */
export function home() {
  const categories = [...new Set(MENU.map((m) => m.category))];

  const stamps = MENU.map((p, i) => `
    <article class="stamp-wrap" data-category="${esc(p.category)}" style="--tilt: ${TILTS[i % TILTS.length]}deg">
      <div class="stamp">
        <div class="stamp-face">
          <div class="stamp-top"><span class="stamp-country">KAPI &middot; PH</span><span class="stamp-value">${esc(peso(p.price))}</span></div>
          <div class="stamp-art">${stampArt(p.art)}</div>
          <h3 class="stamp-name">${esc(p.name)}</h3>
          <p class="stamp-blurb">${esc(p.blurb)}</p>
          <div class="stamp-meta"><span>${esc(p.serve)}</span>${p.tag ? `<span class="stamp-tag">${esc(p.tag)}</span>` : ''}</div>
          <button class="btn btn-stamp" type="button" data-add="${esc(p.slug)}">Affix to order</button>
        </div>
      </div>
      ${postmark()}
    </article>`).join('');

  const filters = categories
    .map((c) => `<button type="button" role="tab" class="filter" data-filter="${esc(c)}" aria-selected="false">${esc(c)}</button>`)
    .join('');

  const body = `
<main id="main">

  <section class="hero">
    <div class="wrap hero-inner">
      <p class="eyebrow eyebrow-light">Artisanal coffee bar &middot; SM City Iloilo</p>
      <h1>Mang Kapi Ta.<span class="serif-italic">Worth Every Sip.</span></h1>
      <p class="lead">Cupped, tested, and pulled with unhurried craftsmanship. Single origins, layered signature brews, and warm artisanal brisket sourdough.</p>
      <div class="hero-actions">
        <a class="btn btn-light" href="#cart">Book a coffee cart</a>
        <a class="btn btn-ghost" href="#menu">Discover our menu</a>
      </div>
    </div>
  </section>

  <section class="cart-section" id="cart" aria-labelledby="cart-title">
    <div class="wrap">
      <div class="cart-head">
        <div>
          <p class="eyebrow eyebrow-light">Event catering service</p>
          <h2 id="cart-title">Handcrafted <span class="serif-italic">mobile coffee carts.</span></h2>
        </div>
        <p class="cart-head-copy">Bring the warmth of Mang Kapi Ta to your weddings, product debuts, and private celebrations across Panay. Seamless commercial setups with certified baristas.</p>
      </div>

      <div class="cart-grid">
        <article class="cart-feature">
          <div class="cart-art" aria-hidden="true">
            <svg viewBox="0 0 520 330" focusable="false">
              <defs>
                <linearGradient id="wood" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#c79a63"/><stop offset="1" stop-color="#9c6f41"/></linearGradient>
                <pattern id="grain" width="22" height="22" patternUnits="userSpaceOnUse"><path d="M0 11c6-4 10 4 22 0" stroke="#7d5530" stroke-width="1" fill="none" opacity=".45"/></pattern>
              </defs>
              <ellipse cx="260" cy="306" rx="210" ry="12" fill="#000" opacity=".28"/>
              <path d="M70 92 260 34l190 58z" fill="#e9dcc6" stroke="#2a1d14" stroke-width="3" stroke-linejoin="round"/>
              <path d="M70 92h380v22c-12 14-24 14-36 0-12 14-24 14-36 0-12 14-24 14-36 0-12 14-24 14-36 0-12 14-24 14-36 0-12 14-24 14-36 0-12 14-24 14-36 0-12 14-24 14-36 0-12 14-24 14-36 0-12 14-24 14-36 0z" fill="#8b5e4b" stroke="#2a1d14" stroke-width="3"/>
              <rect x="86" y="112" width="8" height="150" fill="#2a1d14"/><rect x="426" y="112" width="8" height="150" fill="#2a1d14"/>
              <rect x="70" y="190" width="380" height="96" rx="8" fill="url(#wood)" stroke="#2a1d14" stroke-width="3"/>
              <rect x="70" y="190" width="380" height="96" rx="8" fill="url(#grain)"/>
              <rect x="58" y="178" width="404" height="16" rx="6" fill="#d8b283" stroke="#2a1d14" stroke-width="3"/>
              <rect x="180" y="214" width="160" height="50" rx="6" fill="#1f2a1c" stroke="#2a1d14" stroke-width="3"/>
              <text x="260" y="246" text-anchor="middle" font-family="Fraunces, serif" font-style="italic" font-size="24" fill="#f5efe3">Mang Kapi Ta</text>
              <rect x="136" y="126" width="120" height="52" rx="6" fill="#3b3330" stroke="#2a1d14" stroke-width="3"/>
              <rect x="146" y="136" width="100" height="10" rx="3" fill="#8a9a5b"/>
              <circle cx="168" cy="160" r="7" fill="#c9a27a"/><circle cx="200" cy="160" r="7" fill="#c9a27a"/><circle cx="232" cy="160" r="7" fill="#c9a27a"/>
              <g fill="#fbf4e6" stroke="#2a1d14" stroke-width="2.5"><path d="M300 150h26l-3 28h-20z"/><path d="M336 154h24l-3 24h-18z"/><path d="M372 150h26l-3 28h-20z"/></g>
              <g><circle cx="94" cy="176" r="9" fill="#a8b57b"/><circle cx="110" cy="170" r="7" fill="#c9a27a"/><circle cx="426" cy="176" r="9" fill="#a8b57b"/><circle cx="410" cy="170" r="7" fill="#c9a27a"/></g>
              <g fill="#2a1d14"><circle cx="130" cy="288" r="18"/><circle cx="390" cy="288" r="18"/></g>
              <g fill="#c9a27a"><circle cx="130" cy="288" r="7"/><circle cx="390" cy="288" r="7"/></g>
            </svg>
            ${postmark('PANAY WIDE', 'EVENT CARTS')}
          </div>
          <div class="cart-feature-body">
            <p class="eyebrow">The Turnkey Barista Rig</p>
            <h3>Hinoki Wood Mobile Station</h3>
            <p>Dual-group Italian espresso machine, pour-over bar, customized cup stamps, and a professional barista crew.</p>
            <dl class="cart-stats">
              <div><dt>50 - 300+</dt><dd>Guests supported</dd></div>
              <div><dt>Custom</dt><dd>Event drink menu</dd></div>
              <div><dt>Iloilo City</dt><dd>&amp; Western Visayas</dd></div>
            </dl>
          </div>
        </article>

        <form class="inquiry" id="inquiry-form" novalidate>
          <h3>Inquire for your date</h3>
          <p class="fine">Dates fill up quickly for wedding weekends and holiday gatherings. Leave your event details below.</p>
          <label>Host name / organization
            <input type="text" name="name" placeholder="e.g. Sofia &amp; Mateo" required maxlength="120" autocomplete="name">
          </label>
          <div class="field-row">
            <label>Target date
              <input type="date" name="event_date" required data-min-today>
            </label>
            <label>Guest count
              <select name="guests" required>
                <option value="50 - 80 guests">50 - 80 guests</option>
                <option value="80 - 150 guests">80 - 150 guests</option>
                <option value="150 - 300 guests">150 - 300 guests</option>
                <option value="300+ guests">300+ guests</option>
              </select>
            </label>
          </div>
          <label>Email or mobile number
            <input type="text" name="contact" placeholder="0917-XXX-XXXX or name@email.com" required maxlength="120" autocomplete="email">
          </label>
          <label>Venue / event type
            <input type="text" name="venue" placeholder="e.g. Courtyard wedding, Mandurriao" required maxlength="160">
          </label>
          <button class="btn btn-dark btn-block" type="submit">Send cart reservation</button>
          <p class="form-msg" data-inquiry-msg role="status"></p>
          <p class="fine inquiry-foot">Direct line: ${esc(brand.phone)} &middot; ${esc(brand.email)}</p>
        </form>
      </div>
    </div>
  </section>

  <section class="strip">
    <div class="wrap strip-grid">
      <div><h3>Globally sourced. Locally crafted.</h3><p>Cupped, tested, developed, and roasted in small mindful batches in Iloilo for peak aromatic clarity.</p></div>
      <div><h3>Modern coffee. Holistic approach.</h3><p>Unhurried attention to detail, with artisanal slow-cooked mahaw pairings and regional provenance.</p></div>
      <div><h3>Turnkey barista carts.</h3><p>Handcrafted mobile espresso rigs designed to elevate weddings, private gatherings, and pop-ups.</p></div>
    </div>
  </section>

  <section class="philosophy">
    <div class="wrap narrow">
      <p class="eyebrow">Philosophy of Mang Kapi Ta</p>
      <blockquote class="serif-italic">&ldquo;Worth Every Sip.&rdquo;</blockquote>
      <p>Born in Iloilo with a deep reverence for the morning ritual. We believe true coffee craftsmanship should not be rushed. From single-origin espresso pulls to slow-cured beef brisket sourdough melts, every element is created with mindful care.</p>
    </div>
  </section>

  <section class="menu" id="menu" aria-labelledby="menu-title">
    <div class="wrap">
      <div class="menu-head">
        <div>
          <p class="eyebrow">Tasting flights</p>
          <h2 id="menu-title">Taste the <span class="serif-italic">ritual.</span></h2>
        </div>
        <p>Every item is a stamp on the postcard. Affix the ones you want, then settle up with GCash and collect at the bar.</p>
      </div>
      <div class="postcard">
        <div class="postcard-top">
          <span class="postcard-title serif-italic">Greetings from Iloilo</span>
          <div class="filters" role="tablist" aria-label="Menu category">
            <button type="button" role="tab" class="filter is-active" data-filter="all" aria-selected="true">All</button>
            ${filters}
          </div>
        </div>
        <div class="stamps">${stamps}</div>
      </div>
    </div>
  </section>

  <section class="visit" id="visit" aria-labelledby="visit-title">
    <div class="wrap visit-grid">
      <div>
        <p class="eyebrow">Physical location</p>
        <h2 id="visit-title">SM City Iloilo <span class="serif-italic">Brew Bar</span></h2>
        <p>Visit our quiet coffee sanctuary inside SM City Iloilo. Mindfully located along the Lower Ground Floor near the new escalator.</p>
        <ul class="visit-list">
          <li><strong>Address</strong>${esc(brand.address1)}<br>${esc(brand.address2)}</li>
          <li><strong>Opening hours</strong>${esc(brand.hours)}<br>Dine-in, slow drips, and takeaway orders</li>
        </ul>
        <a class="btn btn-dark" target="_blank" rel="noopener" href="https://www.google.com/maps/search/?api=1&amp;query=${encodeURIComponent('SM City Iloilo, Mandurriao, Iloilo City')}">Get directions</a>
      </div>
      <div class="visit-map" aria-hidden="true">
        <svg viewBox="0 0 480 340" focusable="false">
          <rect width="480" height="340" fill="#d8d2bf"/>
          <path d="M0 250c80-30 120 20 200-6s120-60 280-20v116H0z" fill="#a9b58a"/>
          <path d="M-10 60 160 110 320 70 490 130" stroke="#f3ecd8" stroke-width="14" fill="none"/>
          <path d="M120-10 170 350M330-10 290 350" stroke="#f3ecd8" stroke-width="10" fill="none"/>
          <path d="M-10 190 480 160" stroke="#f3ecd8" stroke-width="8" fill="none"/>
          <circle cx="238" cy="150" r="30" fill="#8b5e4b" opacity=".18"/>
          <circle cx="238" cy="150" r="9" fill="#8b5e4b"/><circle cx="238" cy="150" r="3.5" fill="#f5efe3"/>
        </svg>
        <div class="map-card"><strong>SM City Iloilo</strong><span>Gate 3, Lower Ground Floor</span><em>Open daily &middot; 10am - 9pm</em></div>
      </div>
    </div>
  </section>
</main>`;
  return page({ title: 'Mang Kapi Ta | Worth Every Sip', page: 'home', body });
}

/* ---------------------------------- checkout --------------------------------- */
export function checkout() {
  const body = `
<main id="main" class="page">
  <div class="wrap">
    <ol class="steps"><li class="on">1. Your details</li><li>2. Pay with GCash</li><li>3. Confirmation</li></ol>
    <h1>Checkout</h1>
    <p class="page-sub">Tell us who is collecting the order. You will pay with GCash on the next step.</p>

    <div class="panel" data-checkout-empty hidden>
      <h2>Your order is empty</h2>
      <p>Affix a few stamps from the menu first.</p>
      <a class="btn btn-dark" href="/#menu">Back to the menu</a>
    </div>

    <form id="checkout-form" class="checkout-grid" novalidate>
      <div class="panel">
        <h2>Pickup details</h2>
        <label>Full name
          <input type="text" name="name" required maxlength="100" autocomplete="name" placeholder="Juan Dela Cruz">
        </label>
        <div class="field-row">
          <label>GCash / mobile number
            <input type="tel" name="phone" required inputmode="tel" autocomplete="tel" placeholder="0917 123 4567">
          </label>
          <label>Email (for your receipt)
            <input type="email" name="email" required autocomplete="email" placeholder="you@email.com">
          </label>
        </div>
        <label>Order type
          <select name="order_type">
            <option value="pickup">Pickup at the Brew Bar</option>
            <option value="dine-in">Dine-in at the Brew Bar</option>
          </select>
        </label>
        <label>Notes for the barista (optional)
          <input type="text" name="notes" maxlength="300" placeholder="Less ice, no sugar, etc.">
        </label>
      </div>

      <div class="panel">
        <h2>Order summary</h2>
        <div data-summary-lines></div>
        <div class="summary-total"><span>Total</span><strong data-summary-total></strong></div>
        <div class="pay-methods">
          <div class="pay-method"><span class="gcash-badge">GCash</span><span>Pay securely with your GCash wallet</span></div>
        </div>
        <button class="btn btn-dark btn-block" type="submit">Continue to payment</button>
        <p class="form-msg" data-checkout-msg role="status"></p>
      </div>
    </form>
  </div>
</main>`;
  return page({ title: 'Checkout | Mang Kapi Ta', page: 'checkout', body });
}

/* -------------------------- pay / order / sandbox / admin -------------------------- */
// These pages are filled in by app.js from /api/order, so one static file serves every order.
export function pay() {
  const body = `
<main id="main" class="page">
  <div class="wrap">
    <ol class="steps"><li class="done">1. Your details</li><li class="on">2. Pay with GCash</li><li>3. Confirmation</li></ol>
    <h1>Pay with GCash</h1>
    <p class="page-sub" data-order-sub>Loading your order...</p>
    <div class="checkout-grid" data-pay-grid hidden>
      <div class="panel">
        <h2>Order summary</h2>
        <div data-summary-lines></div>
        <div class="summary-total"><span>Total due</span><strong data-summary-total></strong></div>
        <p class="fine" style="margin-top:14px">Collect at ${esc(brand.address1)}, SM City Iloilo. Show your order reference at the bar.</p>
      </div>
      <div class="panel">
        <h2>Payment</h2>
        <div class="pay-methods"><div class="pay-method"><span class="gcash-badge">GCash</span><span data-pay-note>You will be redirected to GCash to approve your payment.</span></div></div>
        <div class="notice" data-test-notice hidden><strong>Test mode.</strong> No payment key is configured, so you will see a simulated GCash screen. No real money moves.</div>
        <div class="notice err" data-pay-error role="alert" hidden></div>
        <button class="btn btn-dark btn-block" type="button" data-pay-button>Pay with GCash</button>
        <p class="fine" style="margin-top:14px;text-align:center">Your wallet details are never stored on this site.</p>
      </div>
    </div>
    <div class="panel" data-order-missing hidden>
      <h2>Order not found</h2>
      <p>This payment link is invalid or incomplete.</p>
      <a class="btn btn-dark" href="/">Back to the shop</a>
    </div>
  </div>
</main>`;
  return page({ title: 'Pay with GCash | Mang Kapi Ta', page: 'pay', body });
}

export function order() {
  const body = `
<main id="main" class="page">
  <div class="wrap">
    <ol class="steps"><li class="done">1. Your details</li><li class="done">2. Pay with GCash</li><li class="on">3. Confirmation</li></ol>
    <div class="panel status-card" data-order-card hidden>
      <div class="status-mark" data-status-mark aria-hidden="true"></div>
      <h1 data-status-title></h1>
      <p class="page-sub" data-status-text></p>
      <div class="ref" data-order-ref></div>
      <div class="notice" data-test-notice hidden><strong>Test payment.</strong> This order was paid in test mode. No real money moved.</div>
      <div class="receipt"><div data-summary-lines></div><div class="summary-total"><span data-total-label>Total</span><strong data-summary-total></strong></div></div>
      <p class="fine" data-pickup-note hidden>Collect at ${esc(brand.address1)}, SM City Iloilo. Show this reference at the bar.</p>
      <a class="btn btn-dark" data-order-action href="/#menu">Order something else</a>
    </div>
    <div class="panel status-card" data-order-missing hidden>
      <h1>Order not found</h1>
      <p>This order link is invalid or incomplete.</p>
      <a class="btn btn-dark" href="/">Back to the shop</a>
    </div>
  </div>
</main>`;
  return page({ title: 'Order | Mang Kapi Ta', page: 'order', body });
}

export function sandbox() {
  const body = `
<main id="main" class="page">
  <div class="wrap">
    <div class="sim-phone" data-sim hidden>
      <div class="sim-banner">TEST MODE &middot; SIMULATED GCASH SCREEN &middot; NO REAL MONEY</div>
      <div class="sim-top"><strong>GCash</strong>Confirm payment</div>
      <div class="sim-body">
        <p class="sim-merchant">Mang Kapi Ta Modern Coffee</p>
        <div class="sim-amount" data-sim-amount></div>
        <p class="sim-merchant" data-sim-ref></p>
        <button class="btn btn-blue btn-block" type="button" data-sim-action="approve">Pay</button><br>
        <button class="btn btn-outline btn-block" type="button" data-sim-action="decline">Cancel</button>
        <p class="form-msg" data-sim-msg role="status"></p>
      </div>
    </div>
    <div class="panel status-card" data-order-missing hidden>
      <h1>Not available</h1>
      <p>The test payment screen is unavailable for this order.</p>
      <a class="btn btn-dark" href="/">Back to the shop</a>
    </div>
  </div>
</main>`;
  return page({ title: 'GCash (test mode) | Mang Kapi Ta', page: 'sandbox', body, chrome: false });
}

export function admin() {
  const body = `
<main id="main" class="page">
  <div class="wrap">
    <div class="panel narrow" data-admin-login hidden>
      <h1>Staff sign in</h1>
      <form data-admin-form novalidate>
        <label>Password<input type="password" name="password" required autocomplete="current-password"></label>
        <button class="btn btn-dark" type="submit">Sign in</button>
        <p class="form-msg" data-admin-msg role="alert"></p>
      </form>
    </div>
    <div data-admin-panel hidden>
      <button class="btn btn-ghost" style="float:right;color:var(--forest);border-color:var(--forest)" type="button" data-admin-logout>Sign out</button>
      <h1>Orders</h1>
      <p class="page-sub" data-admin-mode></p>
      <div class="table-wrap"><table class="data"><thead><tr><th>Ref</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th><th>Created</th><th></th></tr></thead><tbody data-admin-orders></tbody></table></div>
      <h1 style="margin-top:48px">Cart inquiries</h1>
      <div class="table-wrap"><table class="data"><thead><tr><th>Host</th><th>Date</th><th>Guests</th><th>Contact</th><th>Venue</th><th>Received</th></tr></thead><tbody data-admin-inquiries></tbody></table></div>
    </div>
    <div class="panel narrow" data-admin-disabled hidden><h1>Admin is disabled</h1><p>Set ADMIN_PASSWORD in the environment to enable the staff page.</p></div>
  </div>
</main>`;
  return page({ title: 'Staff | Mang Kapi Ta', page: 'admin', body });
}

export const notFound = () =>
  page({ title: 'Page not found | Mang Kapi Ta', page: 'notfound', body: notFoundCard('Page not found', 'That page does not exist.') });
