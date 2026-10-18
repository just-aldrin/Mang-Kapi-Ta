<?php
declare(strict_types=1);
require __DIR__ . '/inc/bootstrap.php';

$items = menu_items();
$categories = array_values(array_unique(array_column($items, 'category')));

render_head('Mang KAPI Ta | Worth Every Sip', 'home');
render_header();
?>
<main id="main">

  <!-- HERO -->
  <section class="hero">
    <div class="hero-steam" aria-hidden="true"><i></i><i></i><i></i></div>
    <div class="wrap hero-inner">
      <p class="eyebrow eyebrow-light">Artisanal coffee bar &middot; SM City Iloilo</p>
      <h1>Mang KAPI Ta.<span class="serif-italic">Worth Every Sip.</span></h1>
      <p class="lead">Rooted in the warm, everyday Ilonggo invitation, Ta, Mang KAPI Ta is a home-raised specialty coffee brand in Iloilo. Making your Kapi and experience, #Wortheverysip.</p>
      <div class="hero-actions">
        <a class="btn btn-light" href="#cart">Book a coffee cart</a>
        <a class="btn btn-ghost" href="#menu">Discover our menu</a>
      </div>
    </div>
  </section>

  <!-- COFFEE CART (highlighted directly after the hero) -->
  <section class="cart-section" id="cart" aria-labelledby="cart-title">
    <div class="wrap">
      <div class="cart-head">
        <div>
          <p class="eyebrow eyebrow-light">Event catering service</p>
          <h2 id="cart-title">Handcrafted <span class="serif-italic">mobile coffee carts.</span></h2>
        </div>
        <p class="cart-head-copy">Bring the warmth of Mang KAPI Ta to your weddings, product debuts, and private celebrations across Panay. Seamless commercial setups with certified baristas.</p>
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
              <!-- canopy -->
              <path d="M70 92 260 34l190 58z" fill="#e9dcc6" stroke="#2a1d14" stroke-width="3" stroke-linejoin="round"/>
              <path d="M70 92h380v22c-12 14-24 14-36 0-12 14-24 14-36 0-12 14-24 14-36 0-12 14-24 14-36 0-12 14-24 14-36 0-12 14-24 14-36 0-12 14-24 14-36 0-12 14-24 14-36 0-12 14-24 14-36 0-12 14-24 14-36 0z" fill="#8b5e4b" stroke="#2a1d14" stroke-width="3"/>
              <rect x="86" y="112" width="8" height="150" fill="#2a1d14"/><rect x="426" y="112" width="8" height="150" fill="#2a1d14"/>
              <!-- counter -->
              <rect x="70" y="190" width="380" height="96" rx="8" fill="url(#wood)" stroke="#2a1d14" stroke-width="3"/>
              <rect x="70" y="190" width="380" height="96" rx="8" fill="url(#grain)"/>
              <rect x="58" y="178" width="404" height="16" rx="6" fill="#d8b283" stroke="#2a1d14" stroke-width="3"/>
              <!-- sign -->
              <rect x="180" y="214" width="160" height="50" rx="6" fill="#1f2a1c" stroke="#2a1d14" stroke-width="3"/>
              <text x="260" y="246" text-anchor="middle" font-family="Fraunces, serif" font-style="italic" font-size="24" fill="#f5efe3">Mang KAPI Ta</text>
              <!-- espresso machine -->
              <rect x="136" y="126" width="120" height="52" rx="6" fill="#3b3330" stroke="#2a1d14" stroke-width="3"/>
              <rect x="146" y="136" width="100" height="10" rx="3" fill="#8a9a5b"/>
              <circle cx="168" cy="160" r="7" fill="#c9a27a"/><circle cx="200" cy="160" r="7" fill="#c9a27a"/><circle cx="232" cy="160" r="7" fill="#c9a27a"/>
              <!-- cups -->
              <g fill="#fbf4e6" stroke="#2a1d14" stroke-width="2.5"><path d="M300 150h26l-3 28h-20z"/><path d="M336 154h24l-3 24h-18z"/><path d="M372 150h26l-3 28h-20z"/></g>
              <!-- flowers -->
              <g><circle cx="94" cy="176" r="9" fill="#a8b57b"/><circle cx="110" cy="170" r="7" fill="#c9a27a"/><circle cx="426" cy="176" r="9" fill="#a8b57b"/><circle cx="410" cy="170" r="7" fill="#c9a27a"/></g>
              <!-- wheels -->
              <g fill="#2a1d14"><circle cx="130" cy="288" r="18"/><circle cx="390" cy="288" r="18"/></g>
              <g fill="#c9a27a"><circle cx="130" cy="288" r="7"/><circle cx="390" cy="288" r="7"/></g>
            </svg>
            <?= postmark('PANAY WIDE', 'EVENT CARTS') ?>
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
              <input type="date" name="event_date" required min="<?= e(date('Y-m-d')) ?>">
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
          <p class="fine inquiry-foot">Direct line: <?= e(brand('phone')) ?> &middot; <?= e(brand('email')) ?></p>
        </form>
      </div>
    </div>
  </section>

  <!-- TRUST STRIP -->
  <section class="strip">
    <div class="wrap strip-grid">
      <div><h3>Globally sourced. Locally crafted.</h3><p>Cupped, tested, developed, and roasted in small mindful batches in Iloilo for peak aromatic clarity.</p></div>
      <div><h3>Modern coffee. Holistic approach.</h3><p>Unhurried attention to detail, with artisanal slow-cooked mahaw pairings and regional provenance.</p></div>
      <div><h3>Turnkey barista carts.</h3><p>Handcrafted mobile espresso rigs designed to elevate weddings, private gatherings, and pop-ups.</p></div>
    </div>
  </section>

  <!-- PHILOSOPHY -->
  <section class="philosophy">
    <div class="wrap narrow">
      <p class="eyebrow">Philosophy of Mang KAPI Ta</p>
      <blockquote class="serif-italic">&ldquo;Worth Every Sip.&rdquo;</blockquote>
      <p>Born in Iloilo with a deep reverence for the morning ritual. We believe true coffee craftsmanship should not be rushed. From single-origin espresso pulls to slow-cured beef brisket sourdough melts, every element is created with mindful care.</p>
    </div>
  </section>

  <!-- MENU: postcard + stamps -->
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
            <?php foreach ($categories as $cat): ?>
              <button type="button" role="tab" class="filter" data-filter="<?= e($cat) ?>" aria-selected="false"><?= e($cat) ?></button>
            <?php endforeach; ?>
          </div>
        </div>

        <div class="stamps">
          <?php foreach ($items as $i => $p): ?>
            <article class="stamp-wrap" data-category="<?= e($p['category']) ?>" style="--tilt: <?= [-2.2, 1.6, -1.2, 2.2, -1.8, 1.2, -2.4][$i % 7] ?>deg">
              <div class="stamp">
                <div class="stamp-face">
                  <div class="stamp-top">
                    <span class="stamp-country">KAPI &middot; PH</span>
                    <span class="stamp-value"><?= e(peso((int) $p['price'])) ?></span>
                  </div>
                  <div class="stamp-art"><?= stamp_art($p['art']) ?></div>
                  <h3 class="stamp-name"><?= e($p['name']) ?></h3>
                  <p class="stamp-blurb"><?= e($p['blurb']) ?></p>
                  <div class="stamp-meta">
                    <span><?= e($p['serve']) ?></span>
                    <?php if ($p['tag']): ?><span class="stamp-tag"><?= e($p['tag']) ?></span><?php endif; ?>
                  </div>
                  <button class="btn btn-stamp" type="button" data-add="<?= e($p['slug']) ?>">Affix to order</button>
                </div>
              </div>
              <?= postmark() ?>
            </article>
          <?php endforeach; ?>
        </div>
      </div>
    </div>
  </section>

  <!-- VISIT -->
  <section class="visit" id="visit" aria-labelledby="visit-title">
    <div class="wrap visit-grid">
      <div>
        <p class="eyebrow">Physical location</p>
        <h2 id="visit-title">SM City Iloilo <span class="serif-italic">Brew Bar</span></h2>
        <p>Visit our quiet coffee sanctuary inside SM City Iloilo. Mindfully located along the Lower Ground Floor near the new escalator.</p>
        <ul class="visit-list">
          <li><strong>Address</strong><?= e(brand('address1')) ?><br><?= e(brand('address2')) ?></li>
          <li><strong>Opening hours</strong><?= e(brand('hours')) ?><br>Dine-in, slow drips, and takeaway orders</li>
        </ul>
        <a class="btn btn-dark" target="_blank" rel="noopener" href="https://www.google.com/maps/search/?api=1&amp;query=<?= urlencode('SM City Iloilo, Mandurriao, Iloilo City') ?>">Get directions</a>
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
</main>
<?php render_footer(); ?>
