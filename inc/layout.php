<?php
declare(strict_types=1);

function brand(string $key, string $default = ''): string
{
    $map = [
        'address1' => 'Gate 3, Lower Ground Floor, New Escalator',
        'address2' => 'SM City Iloilo, Benigno Aquino Jr. Ave, Mandurriao, Iloilo City 5000',
        'hours' => 'Mon - Sun, 10:00 AM - 9:00 PM',
        'phone' => env('SHOP_PHONE', '0917-000-0000'),
        'email' => env('SHOP_EMAIL', 'events@mangkapita.ph'),
        'instagram' => env('SHOP_INSTAGRAM', 'https://www.instagram.com/'),
    ];
    return $map[$key] ?? $default;
}

function render_head(string $title, string $bodyClass = '', string $bodyAttrs = ''): void
{
    ?>
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title><?= e($title) ?></title>
<meta name="description" content="Mang KAPI Ta. Artisanal coffee, sourdough mahaw, and handcrafted mobile coffee carts in Iloilo City.">
<meta name="csrf-token" content="<?= e(csrf_token()) ?>">
<meta name="base-path" content="<?= e(base_path()) ?>">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,500;0,9..144,700;1,9..144,400;1,9..144,500&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="<?= e(url('assets/css/style.css')) ?>">
</head>
<body class="<?= e($bodyClass) ?>" <?= $bodyAttrs ?>>
<a class="skip-link" href="#main">Skip to content</a>
<?php
}

function render_header(): void
{
    ?>
<div class="announce">Artisanal coffee &amp; sourdough mahaw &nbsp;&middot;&nbsp; Gate 3, SM City Iloilo &nbsp;&middot;&nbsp; Mobile coffee carts for events</div>
<header class="site-header">
  <div class="wrap header-row">
    <a class="logo" href="<?= e(url('')) ?>" aria-label="Mang KAPI Ta home">
      <span class="logo-bubble">KAPI</span><span class="logo-text">Mang KAPI Ta</span>
    </a>
    <nav class="nav" aria-label="Primary">
      <a href="<?= e(url('#cart')) ?>">Coffee Carts</a>
      <a href="<?= e(url('#menu')) ?>">Menu</a>
      <a href="<?= e(url('#visit')) ?>">Visit</a>
    </nav>
    <button class="cart-btn" type="button" data-cart-open aria-label="Open your order">
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 8h14l-1.2 11a2 2 0 0 1-2 1.8H8.2a2 2 0 0 1-2-1.8z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>
      <span>Order</span><span class="cart-count" data-cart-count>0</span>
    </button>
  </div>
</header>
<?php
}

function render_cart_drawer(): void
{
    ?>
<div class="drawer-scrim" data-cart-close hidden></div>
<aside class="drawer" id="cart-drawer" aria-label="Your order" aria-hidden="true">
  <div class="drawer-head">
    <h2>Your order</h2>
    <button type="button" class="icon-btn" data-cart-close aria-label="Close order">&times;</button>
  </div>
  <div class="drawer-body" data-cart-lines></div>
  <div class="drawer-foot">
    <div class="drawer-total"><span>Total</span><strong data-cart-total>&#8369;0</strong></div>
    <a class="btn btn-dark btn-block" href="<?= e(url('checkout.php')) ?>" data-cart-checkout>Checkout with GCash</a>
    <p class="fine">Pickup at the SM City Iloilo Brew Bar. Pay securely with GCash.</p>
  </div>
</aside>
<?php
}

function render_footer(bool $withScript = true): void
{
    ?>
<footer class="site-footer">
  <div class="wrap footer-grid">
    <div>
      <a class="logo logo-light" href="<?= e(url('')) ?>"><span class="logo-bubble">KAPI</span><span class="logo-text">Mang KAPI Ta</span></a>
      <p class="serif-italic footer-tag">Worth Every Sip.</p>
      <p class="fine">Modern coffee, local provenance, and slow-cooked brisket mahaw pairings.</p>
      <form class="subscribe" data-subscribe novalidate>
        <label class="sr-only" for="sub-email">Email address</label>
        <input id="sub-email" type="email" name="email" placeholder="Your email address" autocomplete="email" required>
        <button class="btn btn-light" type="submit">Join</button>
        <p class="form-msg" data-subscribe-msg role="status"></p>
      </form>
    </div>
    <div>
      <h3>Houses</h3>
      <ul>
        <li><a href="<?= e(url('#visit')) ?>">SM City Iloilo Brew Bar</a></li>
        <li><a href="<?= e(url('#cart')) ?>">Mobile Coffee Carts</a></li>
        <li><a href="<?= e(url('#menu')) ?>">Menu</a></li>
      </ul>
    </div>
    <div>
      <h3>Contact</h3>
      <ul>
        <li><?= e(brand('hours')) ?></li>
        <li><a href="mailto:<?= e(brand('email')) ?>"><?= e(brand('email')) ?></a></li>
        <li>Iloilo City, Philippines</li>
      </ul>
    </div>
  </div>
  <div class="wrap footer-base">
    <span>&copy; <?= date('Y') ?> Mang KAPI Ta Modern Coffee. All rights reserved.</span>
    <span>Payments by GCash</span>
  </div>
</footer>
<?php render_cart_drawer(); ?>
<?php if ($withScript): ?>
<script>window.KAPI_MENU = <?= json_encode(array_column(array_map(
    fn($p) => ['slug' => $p['slug'], 'name' => $p['name'], 'price' => (int) $p['price']],
    menu_items()
), null, 'slug'), JSON_UNESCAPED_UNICODE | JSON_HEX_TAG | JSON_HEX_AMP) ?>;</script>
<script src="<?= e(url('assets/js/app.js')) ?>" defer></script>
<?php endif; ?>
</body>
</html>
<?php
}
